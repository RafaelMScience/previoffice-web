/**
 * Utilitários padronizados de formatação para localização Brasileira (pt-BR).
 * Funções puras, determinísticas e compatíveis com SSR / React 19.
 */

/**
 * Formata um valor numérico para Moeda Brasileira (BRL - R$).
 * Exemplo: 1250.5 -> "R$ 1.250,50"
 */
export function formatMoneyBRL(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(val)
    .replace(/\s+/g, ' ');
}

/**
 * Formata uma data ISO (YYYY-MM-DD ou ISO string) para formato brasileiro DD/MM/AAAA.
 * Exemplo: "2026-11-24" -> "24/11/2026"
 */
export function formatDatePtBR(isoDate?: string | null): string {
  if (!isoDate) return 'Não informada';
  const cleanDate = isoDate.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return 'Data inválida';
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para DD/MM/AAAA às HH:mm.
 */
export function formatDateTimePtBR(isoDate?: string | null): string {
  if (!isoDate) return 'Não informada';
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return 'Data inválida';
  
  const datePart = dateObj.toLocaleDateString('pt-BR');
  const timePart = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} às ${timePart}`;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto Bancário',
  BANK_SLIP: 'Boleto Bancário',
  CASH: 'Dinheiro em Espécie',
  CREDIT_CARD: 'Cartão de Crédito',
  BANK_TRANSFER: 'Transferência Bancária',
  RPV_PRECATORIO_RETENTION: 'Retenção de RPV / Precatório',
};

/**
 * Traduz os métodos de pagamento do padrão de enums para o vocabulário jurídico brasileiro.
 */
export function formatPaymentMethod(method?: string | null): string {
  if (!method) return 'PIX';
  return PAYMENT_METHOD_LABELS[method] || method;
}

/**
 * Traduz e formata status de atendimento / processo para rótulos amigáveis.
 */
export function formatProcessStatus(status?: string | null): { label: string; badgeClass: string } {
  switch (status?.toUpperCase()) {
    case 'PENDING':
    case 'EM_ANDAMENTO':
    case 'IN_PROGRESS':
      return {
        label: 'Em Andamento',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'COMPLETED':
    case 'CONCLUIDO':
    case 'DEFERIDO':
      return {
        label: 'Concluído',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'CANCELLED':
    case 'CANCELADO':
    case 'INDEFERIDO':
      return {
        label: 'Cancelado',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'WAITING_DOCUMENT':
    case 'AGUARDANDO_DOCUMENTO':
      return {
        label: 'Aguardando Documentos',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      };
    default:
      return {
        label: status || 'Não Definido',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}
