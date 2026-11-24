export type ErrorStatusCode = 400 | 404 | 500 | number;

export type ErrorIconType = 'alert' | 'file-question' | 'server-crash';

export interface StatusConfig {
  badge: string;
  defaultTitle: string;
  defaultDescription: string;
  iconType: ErrorIconType;
  iconBg: string;
  iconColor: string;
  badgeStyle: string;
}

export const STATUS_CONFIGS: Record<number, StatusConfig> = {
  400: {
    badge: '400 • Requisição Inválida',
    defaultTitle: 'Requisição Inválida',
    defaultDescription:
      'Não foi possível processar a solicitação com os parâmetros fornecidos.',
    iconType: 'alert',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  404: {
    badge: '404 • Não Encontrado',
    defaultTitle: 'Página Não Encontrada',
    defaultDescription:
      'O endereço acessado não existe ou foi removido.',
    iconType: 'file-question',
    iconBg: 'bg-sky-50',
    iconColor: 'text-[#082A52]',
    badgeStyle: 'bg-sky-50 text-[#082A52] border-sky-200',
  },
  500: {
    badge: '500 • Instabilidade no Servidor',
    defaultTitle: 'Instabilidade no Servidor',
    defaultDescription:
      'Ocorreu uma instabilidade temporária. Por favor, tente novamente em instantes.',
    iconType: 'server-crash',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export function getErrorConfig(code: number): StatusConfig {
  return (
    STATUS_CONFIGS[code] || {
      badge: `${code} • Ocorrência do Sistema`,
      defaultTitle: 'Não Foi Possível Concluir a Operação',
      defaultDescription:
        'O sistema encontrou uma condição inesperada ao tentar processar esta solicitação.',
      iconType: 'alert',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
      badgeStyle: 'bg-slate-100 text-slate-800 border-slate-200',
    }
  );
}
