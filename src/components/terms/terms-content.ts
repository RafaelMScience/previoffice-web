/**
 * PreviOffice - Termo de Responsabilidade e Consentimento LGPD
 * Versão Oficial 1.0 (Conformidade Lei 13.709/2018 e Estatuto da OAB)
 */

export const CURRENT_TERMS_VERSION = '1.0';

export interface LegalClause {
  id: string;
  badge: string;
  title: string;
  legalBasis: string;
  description: string;
  highlights: string[];
}

export const TERMS_OF_RESPONSIBILITY: LegalClause[] = [
  {
    id: 'passwords',
    badge: 'Segurança de Acesso',
    title: 'Guarda Pessoal e Sigilo de Senhas Individuais',
    legalBasis: 'LGPD Art. 6º, VII e X / Guia ANPD de Segurança da Informação',
    description:
      'As credenciais de login, senhas e códigos de autenticação são estritamente individuais, pessoais e intransferíveis. O colaborador assume integral responsabilidade pela guarda segura de suas senhas, sendo expressamente proibido o compartilhamento, empréstimo ou anotação visível de credenciais.',
    highlights: [
      'Proibição absoluta de compartilhamento de login entre operadores.',
      'Rastreabilidade total: cada ação no sistema é vinculada nominalmente ao operador na Auditoria Forense.',
      'Obrigatoriedade de uso de senhas fortes e comunicação imediata de qualquer suspeita de vazamento.',
    ],
  },
  {
    id: 'sensitive_data',
    badge: 'Sigilo Profissional',
    title: 'Tratamento de Dados Pessoais Previdenciários Sensíveis',
    legalBasis: 'LGPD Art. 5º, II e Art. 11 / Estatuto da OAB (Lei 8.906/94, Art. 34, VII)',
    description:
      'O PreviOffice processa dados de alta sensibilidade de segurados, incluindo laudos médicos, perícias do INSS, dados de vulnerabilidade social e informações financeiras. O operador compromete-se com o dever legal de sigilo profissional eterno e estrita confidencialidade.',
    highlights: [
      'Vedada a cópia, fotografia ou extração não autorizada de dados dos segurados.',
      'Acesso limitado estritamente à finalidade da prestação de serviços jurídicos e previdenciários.',
      'A violação do sigilo acarretará sanções disciplinares, administrativas e responsabilização civil e penal.',
    ],
  },
  {
    id: 'station_lock',
    badge: 'Proteção Física',
    title: 'Segurança da Estação de Trabalho e Bloqueio por Inatividade',
    legalBasis: 'LGPD Art. 46 / Recomendações de Segurança da ANPD',
    description:
      'Ao se ausentar do computador ou terminal de atendimento, o operador deve bloquear a tela. Para garantir conformidade com o Art. 46 da LGPD, o sistema aciona automaticamente uma Tela de Bloqueio fosca após 45 minutos de inatividade, preservando os formulários em andamento sem perda de dados.',
    highlights: [
      'Bloqueio automático protetivo aos 45 minutos de inatividade contínua.',
      'Preservação total de dados digitados e formulários abertos na memória.',
      'Desbloqueio rápido em 1 clique pelo próprio operador ao retornar à estação.',
    ],
  },
  {
    id: 'cookies',
    badge: 'Privacidade & Cookies',
    title: 'Política de Cookies Estritamente Necessários',
    legalBasis: 'LGPD Art. 6º, VI (Transparência) / Guia Orientativo de Cookies da ANPD',
    description:
      'O PreviOffice utiliza exclusivamente cookies essenciais e criptografados de sessão (flags HttpOnly, Secure e SameSite), necessários para autenticação segura, integridade da comunicação e prevenção contra ataques CSRF. Não são utilizados cookies de marketing, publicidade ou rastreamento de terceiros.',
    highlights: [
      'Uso 100% restrito a cookies de segurança e sustentação de sessão autenticada.',
      'Zero rastreamento comercial ou compartilhamento de telemetria externa.',
      'Armazenamento protegido com criptografia de ponta a ponta via Supabase SSR.',
    ],
  },
];
