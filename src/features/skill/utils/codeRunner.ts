export interface RunResult {
  logs: Array<{ type: 'log' | 'error' | 'warn' | 'info'; message: string }>;
  error: string | null;
}

/**
 * Format any argument passed to console methods into a readable string representation.
 */
function formatLogArg(arg: any): string {
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

/**
 * Safely executes JavaScript code in an isolated scope and captures console outputs.
 * Employs a sandboxed iframe with strict permissions in the browser,
 * and a safe fallback in non-browser/headless environments.
 */
export function runJavaScriptSandbox(code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const logs: RunResult['logs'] = [];

    // Headless / non-browser fallback (e.g. Node.js tsx testing environment)
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      try {
        const consoleProxy = {
          log: (...args: any[]) => logs.push({ type: 'log', message: args.map(formatLogArg).join(' ') }),
          error: (...args: any[]) => logs.push({ type: 'error', message: args.map(formatLogArg).join(' ') }),
          warn: (...args: any[]) => logs.push({ type: 'warn', message: args.map(formatLogArg).join(' ') }),
          info: (...args: any[]) => logs.push({ type: 'info', message: args.map(formatLogArg).join(' ') }),
        };
        const fn = new Function('console', code);
        fn(consoleProxy);
        resolve({ logs, error: null });
      } catch (err: any) {
        resolve({ logs, error: err?.message || 'Execution error' });
      }
      return;
    }

    // In-browser: create isolated sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts');
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    if (!win) {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      resolve({ logs: [], error: 'Could not initialize isolated environment.' });
      return;
    }

    // Intercept console inside sandbox
    const consoleProxy = {
      log: (...args: any[]) => logs.push({ type: 'log', message: args.map(formatLogArg).join(' ') }),
      error: (...args: any[]) => logs.push({ type: 'error', message: args.map(formatLogArg).join(' ') }),
      warn: (...args: any[]) => logs.push({ type: 'warn', message: args.map(formatLogArg).join(' ') }),
      info: (...args: any[]) => logs.push({ type: 'info', message: args.map(formatLogArg).join(' ') }),
    };

    try {
      (win as any).console = consoleProxy;

      // Wrap code execution in an IIFE to capture synchronous evaluation
      const script = win.document.createElement('script');
      script.textContent = `
        try {
          ${code}
        } catch (err) {
          console.error(err && err.message ? err.message : String(err));
        }
      `;
      win.document.body.appendChild(script);

      // Short tick to ensure async microtasks/macrotasks log
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        } catch {}
        resolve({ logs, error: null });
      }, 50);
    } catch (err: any) {
      try {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      } catch {}
      resolve({ logs, error: err?.message || 'Execution error' });
    }
  });
}

/**
 * Builds a clean HTML document string with modern reset and dark-mode defaults.
 */
export function buildHtmlPreviewSrc(htmlContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #0b0f19;
        color: #f1f5f9;
      }
    </style>
  </head>
  <body>
    ${htmlContent}
  </body>
</html>`;
}
