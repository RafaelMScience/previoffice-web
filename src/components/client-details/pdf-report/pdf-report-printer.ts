import { escapeHtml } from '@/lib/security/xss';

export interface ReportPrintOptions {
  clientFullName: string;
  isEn: boolean;
  printableElementId?: string;
}

/**
 * Isolated iframe print engine for client report sheets:
 * Guarantees that ONLY the clean A4 sheet is sent to the browser print dialog,
 * completely preventing web dashboard/sidebar leakage.
 */
export function executeReportPrint({
  clientFullName,
  isEn,
  printableElementId = 'client-pdf-printable-area',
}: ReportPrintOptions): void {
  if (typeof window === 'undefined') return;

  const printableArea = document.getElementById(printableElementId);
  if (!printableArea) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute(
    'style',
    'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;'
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Capture active application styles and CSS links
  const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((tag) => tag.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="${isEn ? 'en-US' : 'pt-BR'}">
      <head>
        <meta charset="utf-8" />
        <title>${isEn ? 'Client Record' : 'Ficha do Cliente'} - ${escapeHtml(clientFullName)}</title>
        ${styleTags}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            background: #FFFFFF !important;
            color: #0B192E !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif !important;
          }
          .a4-print-sheet {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #FFFFFF !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div class="a4-print-sheet">
          ${printableArea.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 250);
}
