/**
 * Utilitário de impressão invisível via iframe para documentos jurídicos A4.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface PrintDocumentPayload {
  title: string;
  content: string;
}

export interface PrintSignaturesConfig {
  officeName: string;
  officeOab: string;
  clientFullName: string;
  lawyerName: string;
  lawyerOab: string;
}

function buildDocumentPageHtml(doc: PrintDocumentPayload, sig: PrintSignaturesConfig, isLastPage: boolean): string {
  return `
    <div style="${!isLastPage ? 'page-break-after: always;' : ''} padding: 10px;">
      <div class="header">
        <h3>${escapeHtml(sig.officeName)}</h3>
        <p>Sociedade de Advogados inscrita sob a ${escapeHtml(sig.officeOab)} • Advocacia Previdenciária</p>
      </div>
      <div class="content">${escapeHtml(doc.content)}</div>
      <div class="signatures">
        <div>
          <div class="sig-line"></div>
          <strong>${escapeHtml(sig.clientFullName)}</strong><br/>
          <span>OUTORGANTE / CONTRATANTE</span>
        </div>
        <div>
          <div class="sig-line"></div>
          <strong>${escapeHtml(sig.lawyerName)}</strong><br/>
          <span>${escapeHtml(sig.lawyerOab)} • ADVOGADO(A)</span>
        </div>
      </div>
    </div>
  `;
}

function executeIframePrint(title: string, bodyContent: string): void {
  if (typeof window === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          <style>
            @page { size: A4; margin: 20mm 15mm; }
            body { font-family: serif; font-size: 13px; line-height: 1.6; color: #111; margin: 0; padding: 0; }
            .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 20px; }
            .header h3 { font-size: 15px; margin: 0; text-transform: uppercase; font-weight: bold; }
            .header p { font-size: 11px; margin: 4px 0 0 0; color: #555; }
            .content { white-space: pre-line; text-align: justify; }
            .signatures { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
            .sig-line { width: 220px; border-top: 1px solid #333; margin: 0 auto 6px auto; padding-top: 4px; }
          </style>
        </head>
        <body>
          ${bodyContent}
        </body>
      </html>
    `);
    doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  }
}

export function printSingleContract(
  doc: PrintDocumentPayload,
  signatures: PrintSignaturesConfig
): void {
  const pageHtml = buildDocumentPageHtml(doc, signatures, true);
  executeIframePrint(`${doc.title} - ${signatures.clientFullName}`, pageHtml);
}

export function printBatchContracts(
  docs: PrintDocumentPayload[],
  signatures: PrintSignaturesConfig
): void {
  if (docs.length === 0) return;
  const pagesHtml = docs
    .map((d, idx) => buildDocumentPageHtml(d, signatures, idx === docs.length - 1))
    .join('');
  executeIframePrint(`Kit Jurídico - ${signatures.clientFullName}`, pagesHtml);
}
