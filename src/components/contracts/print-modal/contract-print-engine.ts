import { escapeHtml } from '@/lib/security/xss';
import type { Contract, PhysicalDocumentAttachment } from '@/types/contract';

export type DocumentViewType = 'CONTRACT' | 'POA' | 'FOLDER_COVER';

interface PrintDocumentOptions {
  contract: Contract;
  docType: DocumentViewType;
  locale: string;
  hasActiveCustomPdf: boolean;
  viewCustomPdf: boolean;
  activeCustomDoc?: PhysicalDocumentAttachment;
}

export function executeCopyText(elementId: string): boolean {
  const printableArea = document.getElementById(elementId);
  const text = printableArea ? (printableArea as HTMLElement).innerText : '';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export function executePrintDocument({
  contract,
  docType,
  locale,
  hasActiveCustomPdf,
  viewCustomPdf,
  activeCustomDoc,
}: PrintDocumentOptions): void {
  // If viewing an active custom PDF, print the PDF directly with safety checks
  if (
    hasActiveCustomPdf &&
    viewCustomPdf &&
    activeCustomDoc?.fileDataUrl &&
    (activeCustomDoc.fileDataUrl.startsWith('data:application/pdf') ||
      activeCustomDoc.fileDataUrl.startsWith('blob:'))
  ) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;'
    );
    iframe.src = activeCustomDoc.fileDataUrl;
    document.body.appendChild(iframe);

    const cleanup = () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.open(activeCustomDoc.fileDataUrl, '_blank')?.print();
      }
      setTimeout(cleanup, 2000);
    };
    setTimeout(cleanup, 5000);
    return;
  }

  const printableArea = document.getElementById('contract-printable-sheet');
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
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
    window.print();
    return;
  }

  // Capture active CSS styles and link tags from page
  const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((tag) => tag.outerHTML)
    .join('\n');

  const docTitle =
    locale === 'en-US'
      ? docType === 'CONTRACT'
        ? `Legal Fee Agreement - ${escapeHtml(contract.clientName)} - ${escapeHtml(contract.contractNumber)}`
        : docType === 'POA'
        ? `Power of Attorney - ${escapeHtml(contract.clientName)}`
        : `Physical Folder Cover - ${escapeHtml(contract.clientName)}`
      : docType === 'CONTRACT'
      ? `Contrato de Honorários - ${escapeHtml(contract.clientName)} - ${escapeHtml(contract.contractNumber)}`
      : docType === 'POA'
      ? `Procuração Ad Judicia - ${escapeHtml(contract.clientName)}`
      : `Capa de Pasta Física - ${escapeHtml(contract.clientName)}`;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="${locale === 'en-US' ? 'en-US' : 'pt-BR'}">
      <head>
        <meta charset="utf-8" />
        <title>${docTitle}</title>
        ${styleTags}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            background: #FFFFFF !important;
            color: #0F172A !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 10pt !important;
            line-height: 1.5 !important;
          }
          .a4-print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            box-shadow: none !important;
            border: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div class="a4-print-container">
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
    }, 1200);
  }, 300);
}
