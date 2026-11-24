'use client';

import React from 'react';
import type { TeamPermissions } from '@/types/settings';

interface TeamPermissionsMatrixProps {
  permissions: TeamPermissions;
  isAdminLawyer: boolean;
  onTogglePermission: (key: keyof TeamPermissions) => void;
  locale: string;
}

export function TeamPermissionsMatrix({
  permissions,
  isAdminLawyer,
  onTogglePermission,
  locale,
}: TeamPermissionsMatrixProps) {
  const isEn = locale === 'en-US';

  const items: {
    key: keyof TeamPermissions;
    title: string;
    desc: string;
  }[] = [
    {
      key: 'receptionDesk',
      title: isEn ? 'Reception & Fast Triage' : 'Balcão de Recepção',
      desc: isEn ? 'Access to counter intake and initial client check-in' : 'Acesso à recepção física e triagem rápida de segurados',
    },
    {
      key: 'clientsManage',
      title: isEn ? 'Client Database' : 'Gestão de Clientes',
      desc: isEn ? 'Register, view and update client records and encrypted vaults' : 'Cadastrar, visualizar e editar fichas e cofres de segurados',
    },
    {
      key: 'casesManage',
      title: isEn ? 'Cases & Benefit Claims' : 'Processos e Requerimentos',
      desc: isEn ? 'Follow administrative INSS and judicial lawsuits' : 'Acompanhar andamento de requerimentos administrativos e judiciais',
    },
    {
      key: 'contractsAndFinancial',
      title: isEn ? 'Contracts & Fee Regimes' : 'Honorários e Contratos',
      desc: isEn ? 'Create OAB fee contracts, view quotas and installments' : 'Emitir contratos advocatícios, regimes ad exitum e parcelas',
    },
    {
      key: 'templatesManage',
      title: isEn ? 'Legal Document Templates' : 'Minutas e Modelos',
      desc: isEn ? 'Manage dynamic legal documents, POAs and templates' : 'Editar e criar minutas contratuais e procurações da banca',
    },
    {
      key: 'adminSettings',
      title: isEn ? 'Administration & Team' : 'Configurações e Equipe',
      desc: isEn ? 'Manage office preferences and team accounts' : 'Acesso total às preferências do escritório e colaboradores',
    },
    {
      key: 'securityAudit',
      title: isEn ? 'LGPD & Security Audit Logs' : 'Auditoria e Segurança (LGPD)',
      desc: isEn ? 'Track immutable system logs and data compliance' : 'Visualizar logs de segurança, acessos ao cofre e termos LGPD',
    },
  ];

  return (
    <div className="pt-2 border-t border-slate-100">
      <h4 className="text-xs font-bold text-slate-900 mb-1">
        {isEn ? 'Granular Module Permissions' : 'Permissões Granulares por Módulo'}
      </h4>
      <p className="text-[11px] text-slate-500 mb-3">
        {isAdminLawyer
          ? isEn
            ? 'As a Managing Partner, this user has full and unrestricted access to all modules.'
            : 'Como Sócio / Administrador, este usuário possui permissão total e irrestrita a todos os módulos.'
          : isEn
          ? 'Check the modules and capabilities this team member is authorized to access:'
          : 'Marque os módulos e funções que este colaborador está autorizado a acessar:'}
      </p>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
          isAdminLawyer ? 'opacity-50 pointer-events-none select-none' : ''
        }`}
      >
        {items.map((item) => (
          <label
            key={item.key}
            className={`flex items-start gap-3 p-3 rounded-xl border border-slate-200 transition-all ${
              isAdminLawyer
                ? 'bg-slate-100/80 cursor-not-allowed'
                : 'hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              disabled={isAdminLawyer}
              checked={isAdminLawyer || Boolean(permissions[item.key])}
              onChange={() => onTogglePermission(item.key)}
              className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4 disabled:opacity-75"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">{item.title}</div>
              <div className="text-[10px] text-slate-500">{item.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
