/**
 * Browser firmware flasher (esptool-js + Web Serial).
 * One primary action: Flash firmware (connect → download/verify → write).
 */
import { ESPLoader, Transport } from 'esptool-js';

export type FlasherConfig = {
  version: string;
  mergedUrl: string;
  sha256sumsUrl: string;
  expectedSha256: string;
  releaseUrl: string;
};

type Els = {
  root: HTMLElement;
  status: HTMLElement;
  log: HTMLElement;
  progress: HTMLProgressElement;
  progressWrap: HTMLElement;
  btnPick: HTMLButtonElement;
  fileInput: HTMLInputElement;
  btnFlash: HTMLButtonElement;
  supportNote: HTMLElement;
  busyBadge: HTMLElement;
  doneBadge: HTMLElement;
};

function hexSha256(buf: ArrayBuffer): Promise<string> {
  return crypto.subtle.digest('SHA-256', buf).then((hash) =>
    Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
  );
}

/** esptool-js writeFlash expects a binary string, not Uint8Array. */
function ui8ToBinaryString(u8: Uint8Array): string {
  const chunk = 0x2000;
  let out = '';
  for (let i = 0; i < u8.length; i += chunk) {
    const slice = u8.subarray(i, Math.min(i + chunk, u8.length));
    out += String.fromCharCode(...slice);
  }
  return out;
}

function serialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

/** Round human estimate for a compressed 16MB merged write over USB serial. */
const WRITE_TIME_HINT = 'about 2 minutes';

export function mountFirmwareFlasher(root: HTMLElement, cfg: FlasherConfig) {
  const els: Els = {
    root,
    status: root.querySelector('[data-fw-status]')!,
    log: root.querySelector('[data-fw-log]')!,
    progress: root.querySelector('[data-fw-progress]')!,
    progressWrap: root.querySelector('[data-fw-progress-wrap]')!,
    btnPick: root.querySelector('[data-fw-pick]')!,
    fileInput: root.querySelector('[data-fw-file]')!,
    btnFlash: root.querySelector('[data-fw-flash]')!,
    supportNote: root.querySelector('[data-fw-support]')!,
    busyBadge: root.querySelector('[data-fw-busy]')!,
    doneBadge: root.querySelector('[data-fw-done]')!,
  };

  let localOverride: Uint8Array | null = null;
  let busy = false;

  const setStatus = (msg: string, kind: 'idle' | 'ok' | 'warn' | 'err' = 'idle') => {
    els.status.textContent = msg;
    els.status.dataset.kind = kind;
  };

  const appendLog = (line: string) => {
    els.log.textContent += (els.log.textContent ? '\n' : '') + line;
    els.log.scrollTop = els.log.scrollHeight;
  };

  const setBusy = (v: boolean) => {
    busy = v;
    els.btnFlash.disabled = v || !serialSupported();
    els.btnPick.disabled = v;
    els.busyBadge.hidden = !v;
    if (v) els.doneBadge.hidden = true;
    els.root.classList.toggle('is-busy', v);
  };

  if (!serialSupported()) {
    els.supportNote.hidden = false;
    els.btnFlash.disabled = true;
  } else {
    els.supportNote.hidden = true;
    setStatus(`Ready — plug in your board, then Flash firmware (${cfg.version}).`, 'idle');
  }

  els.btnPick.addEventListener('click', () => els.fileInput.click());

  els.fileInput.addEventListener('change', async () => {
    const file = els.fileInput.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      setStatus('Reading local file…', 'idle');
      const buf = await file.arrayBuffer();
      const sha = await hexSha256(buf);
      localOverride = new Uint8Array(buf);
      const ok = sha.toLowerCase() === cfg.expectedSha256.toLowerCase();
      appendLog(`Local file: ${file.name} (${localOverride.byteLength} bytes)`);
      if (ok) {
        setStatus(`Local ${cfg.version} image ready. Click Flash firmware.`, 'ok');
        appendLog(`SHA-256 OK: ${sha}`);
      } else {
        setStatus(`Local file loaded, but hash ≠ ${cfg.version}. Flash at your own risk.`, 'warn');
        appendLog(`SHA-256 got:  ${sha}`);
        appendLog(`SHA-256 want: ${cfg.expectedSha256}`);
      }
    } catch (e) {
      localOverride = null;
      setStatus(e instanceof Error ? e.message : 'Failed to read file.', 'err');
    } finally {
      setBusy(false);
    }
  });

  async function loadOfficialImage(): Promise<Uint8Array> {
    setStatus(`Downloading firmware ${cfg.version}…`, 'idle');
    appendLog(`Fetching ${cfg.version} merged image…`);
    const res = await fetch(cfg.mergedUrl, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error(`Download failed (${res.status}). Try again, or use a local .bin file.`);
    }
    const buf = await res.arrayBuffer();
    const sha = await hexSha256(buf);
    if (sha.toLowerCase() !== cfg.expectedSha256.toLowerCase()) {
      throw new Error(`Downloaded file hash does not match ${cfg.version}. Aborting.`);
    }
    appendLog(`SHA-256 OK (${buf.byteLength} bytes)`);
    return new Uint8Array(buf);
  }

  els.btnFlash.addEventListener('click', async () => {
    if (!serialSupported() || busy) return;
    let transport: Transport | undefined;
    try {
      setBusy(true);
      els.progressWrap.hidden = false;
      els.progress.value = 0;
      els.log.textContent = '';

      // Request port first while we still have the user gesture.
      setStatus('Select the USB serial port…', 'idle');
      const serial = (navigator as Navigator & { serial: Serial }).serial;
      const port = await serial.requestPort();

      let image = localOverride;
      if (!image) {
        image = await loadOfficialImage();
      } else {
        appendLog('Using local .bin file');
      }

      transport = new Transport(port, true);
      const terminal = {
        clean() {
          els.log.textContent = '';
        },
        writeLine(data: string) {
          appendLog(data);
        },
        write(data: string) {
          els.log.textContent += data;
          els.log.scrollTop = els.log.scrollHeight;
        },
      };

      const loader = new ESPLoader({
        transport,
        baudrate: 921600,
        romBaudrate: 115200,
        terminal,
      });

      setStatus('Connecting…', 'idle');
      const chip = await loader.main();
      appendLog(`Chip: ${chip}`);

      setStatus(`Writing ${cfg.version}… ${WRITE_TIME_HINT}`, 'idle');
      appendLog(`Flash in progress — ${WRITE_TIME_HINT}. Keep this tab open and the board plugged in.`);
      const dataStr = ui8ToBinaryString(image);
      await loader.writeFlash({
        fileArray: [{ data: dataStr, address: 0x0 }],
        flashMode: 'qio',
        flashFreq: '80m',
        flashSize: '16MB',
        eraseAll: false,
        compress: true,
        reportProgress: (_i, written, total) => {
          const pct = total ? Math.round((written / total) * 100) : 0;
          els.progress.value = pct;
          setStatus(`Writing ${cfg.version}… ${pct}% · ${WRITE_TIME_HINT}`, 'idle');
        },
      });

      setStatus('Finishing…', 'idle');
      appendLog('Write finished.');
      await loader.after('hard_reset');
      els.progress.value = 100;
      els.doneBadge.hidden = false;
      setStatus('Click the “Reboot” button on your board (the middle one).', 'ok');
      appendLog('Finished — press the middle Reboot button on the board.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(msg, 'err');
      appendLog(msg);
      if (/download failed|Failed to fetch|NetworkError|CORS|Load failed/i.test(msg)) {
        setStatus(`${msg} — you can also use a local .bin file.`, 'err');
      }
    } finally {
      try {
        await transport?.disconnect();
      } catch {
        /* ignore */
      }
      setBusy(false);
    }
  });
}
