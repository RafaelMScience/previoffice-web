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
    defaultTitle: 'Parâmetros Incompletos ou Inválidos',
    defaultDescription:
      'A requisição enviada ao servidor contém parâmetros corrompidos, ausentes ou formato inconsistente com as regras do sistema.',
    iconType: 'alert',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  404: {
    badge: '404 • Não Encontrado',
    defaultTitle: 'Página ou Registro Não Encontrado',
    defaultDescription:
      'O endereço acessado não existe, foi movido ou pertence a outro escritório com isolamento de acesso ativo.',
    iconType: 'file-question',
    iconBg: 'bg-sky-50',
    iconColor: 'text-[#082A52]',
    badgeStyle: 'bg-sky-50 text-[#082A52] border-sky-200',
  },
  500: {
    badge: '500 • Instabilidade no Servidor',
    defaultTitle: 'Instabilidade Momentânea de Processamento',
    defaultDescription:
      'Ocorreu uma falha inesperada durante a execução da operação. Seus dados continuam seguros e protegidos no banco de dados.',
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
