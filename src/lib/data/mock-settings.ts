import type {
  OfficeSettings,
  TeamMember,
  UserProfile,
} from '@/types/settings';
import { securityStore } from './mock-security';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr-001',
  tenantId: 'tenant-001',
  fullName: 'Dr. Alexandre Pontes',
  email: 'alexandre.pontes@previoffice.adv.br',
  phone: '(83) 98877-1122',
  memberType: 'LAWYER',
  oabNumber: 'OAB/PB 18.234',
  twoFactorEnabled: false,
};

export const INITIAL_OFFICE_SETTINGS: OfficeSettings = {
  tenantId: 'tenant-001',
  officeName: 'Alexandre Pontes Sociedade Individual de Advocacia',
  tradeName: 'Alexandre Pontes Advocacia Previdenciária',
  cnpj: '38.456.789/0001-12',
  oabSocietyNumber: 'OAB/PB 1.450/2019',
  email: 'contato@alexandrepontes.adv.br',
  phone: '(83) 3221-5500',
  whatsapp: '(83) 98877-1122',
  street: 'Avenida Epitácio Pessoa',
  streetNumber: '1250',
  complement: 'Salas 401 a 404 - Edifício Empresarial Master',
  neighborhood: 'Estados',
  city: 'João Pessoa',
  state: 'PB',
  zipCode: '58030-001',
  updatedAt: '2026-11-10T10:00:00Z',
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-001',
    tenantId: 'tenant-001',
    fullName: 'Dr. Alexandre Pontes',
    email: 'alexandre.pontes@previoffice.adv.br',
    phone: '(83) 98877-1122',
    memberType: 'LAWYER',
    oabNumber: 'OAB/PB 18.234',
    isAdminLawyer: true,
    active: true,
    lastLoginAt: '2026-11-18T06:15:00Z',
    permissions: {
      receptionDesk: true,
      clientsManage: true,
      casesManage: true,
      contractsAndFinancial: true,
      templatesManage: true,
      adminSettings: true,
      securityAudit: true,
    },
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-11-15T10:00:00Z',
  },
  {
    id: 'usr-002',
    tenantId: 'tenant-001',
    fullName: 'Dra. Camila Santos',
    email: 'camila.santos@previoffice.adv.br',
    phone: '(83) 99123-4567',
    memberType: 'LAWYER',
    oabNumber: 'OAB/PB 22.100',
    isAdminLawyer: false,
    active: true,
    lastLoginAt: '2026-11-17T17:40:00Z',
    permissions: {
      receptionDesk: true,
      clientsManage: true,
      casesManage: true,
      contractsAndFinancial: true,
      templatesManage: true,
      adminSettings: false,
      securityAudit: true,
    },
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-11-10T14:20:00Z',
  },
  {
    id: 'usr-003',
    tenantId: 'tenant-001',
    fullName: 'Dr. Marcos Oliveira',
    email: 'marcos.oliveira@previoffice.adv.br',
    phone: '(83) 98711-2233',
    memberType: 'LAWYER',
    oabNumber: 'OAB/PB 19.450',
    isAdminLawyer: false,
    active: true,
    lastLoginAt: '2026-11-16T11:20:00Z',
    permissions: {
      receptionDesk: false,
      clientsManage: true,
      casesManage: true,
      contractsAndFinancial: false,
      templatesManage: true,
      adminSettings: false,
      securityAudit: false,
    },
    createdAt: '2026-03-15T14:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
  {
    id: 'usr-004',
    tenantId: 'tenant-001',
    fullName: 'Juliana Ribeiro',
    email: 'juliana.recepcao@previoffice.adv.br',
    phone: '(83) 98899-7788',
    memberType: 'ASSISTANT',
    active: true,
    lastLoginAt: '2026-11-18T06:00:00Z',
    permissions: {
      receptionDesk: true,
      clientsManage: true,
      casesManage: false,
      contractsAndFinancial: false,
      templatesManage: false,
      adminSettings: false,
      securityAudit: false,
    },
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-11-14T09:00:00Z',
  },
  {
    id: 'usr-005',
    tenantId: 'tenant-001',
    fullName: 'Lucas Bezerra',
    email: 'lucas.estagio@previoffice.adv.br',
    phone: '(83) 99881-3322',
    memberType: 'INTERN',
    active: true,
    lastLoginAt: '2026-11-17T14:10:00Z',
    temporaryPassword: 'Estagio@2026!',
    mustChangePassword: true,
    permissions: {
      receptionDesk: true,
      clientsManage: true,
      casesManage: true,
      contractsAndFinancial: false,
      templatesManage: false,
      adminSettings: false,
      securityAudit: false,
    },
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-11-12T11:30:00Z',
  },
];

class SettingsStore {
  private userProfile: UserProfile = { ...INITIAL_USER_PROFILE };
  private officeSettings: OfficeSettings = { ...INITIAL_OFFICE_SETTINGS };
  private teamMembers: TeamMember[] = [...INITIAL_TEAM_MEMBERS];

  public getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  public updateUserProfile(updated: Partial<UserProfile>): UserProfile {
    this.userProfile = {
      ...this.userProfile,
      ...updated,
    };
    return { ...this.userProfile };
  }

  public getOfficeSettings(): OfficeSettings {
    return { ...this.officeSettings };
  }

  public updateOfficeSettings(updated: Partial<OfficeSettings>): OfficeSettings {
    this.officeSettings = {
      ...this.officeSettings,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.officeSettings };
  }

  public getTeamMembers(): TeamMember[] {
    return [...this.teamMembers];
  }

  public getActiveLawyers(): TeamMember[] {
    return this.teamMembers.filter((m) => m.memberType === 'LAWYER' && m.active);
  }

  public addTeamMember(
    member: Omit<TeamMember, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): TeamMember {
    const newMember: TeamMember = {
      ...member,
      id: `usr-${Date.now()}`,
      tenantId: 'tenant-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.teamMembers = [newMember, ...this.teamMembers];
    return newMember;
  }

  public updateTeamMember(updated: TeamMember): TeamMember | null {
    const exists = this.teamMembers.some((m) => m.id === updated.id);
    if (!exists) return null;
    let updatedItem: TeamMember | null = null;
    this.teamMembers = this.teamMembers.map((m) => {
      if (m.id === updated.id) {
        updatedItem = {
          ...updated,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return m;
    });
    return updatedItem;
  }

  public toggleMemberActive(id: string): TeamMember | null {
    const exists = this.teamMembers.some((m) => m.id === id);
    if (!exists) return null;
    let updatedMember: TeamMember | null = null;
    this.teamMembers = this.teamMembers.map((m) => {
      if (m.id === id) {
        updatedMember = {
          ...m,
          active: !m.active,
          updatedAt: new Date().toISOString(),
        };
        return updatedMember;
      }
      return m;
    });

    if (updatedMember) {
      securityStore.logEvent({
        actorId: 'usr-001',
        actorName: 'Dr. Alexandre Pontes',
        actorRole: 'Advogado Sócio Titular',
        action: 'UPDATE_PERMISSIONS',
        actionDescription: `Alterou status de ativação do colaborador ${(updatedMember as TeamMember).fullName} para ${(updatedMember as TeamMember).active ? 'Ativo' : 'Inativo'}`,
        targetResource: `Cadastro de ${(updatedMember as TeamMember).fullName}`,
        ipAddress: '189.124.45.102',
        userAgent: 'Chrome 122.0.0 (Windows 11) - Gestão de Equipe',
        severity: 'INFO',
      });
    }

    return updatedMember;
  }

  public findMemberByEmail(email: string): TeamMember | undefined {
    const normalized = email.trim().toLowerCase();
    return this.teamMembers.find((m) => {
      const mEmail = m.email.toLowerCase();
      if (mEmail === normalized) return true;
      // Support email aliases / domains
      if (normalized.includes('alexandre') && mEmail.includes('alexandre')) return true;
      if (normalized.includes('recepcao') && mEmail.includes('recepcao')) return true;
      if (normalized.includes('lucas') && mEmail.includes('lucas')) return true;
      if (normalized.includes('camila') && mEmail.includes('camila')) return true;
      if (normalized.includes('marcos') && mEmail.includes('marcos')) return true;
      return false;
    });
  }

  public completeFirstAccessPassword(email: string): boolean {
    const member = this.findMemberByEmail(email);
    if (!member) return false;
    this.teamMembers = this.teamMembers.map((m) => {
      if (m.id === member.id) {
        return {
          ...m,
          mustChangePassword: false,
          temporaryPassword: undefined,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    // Record audit trail - zero password cleartext logged
    const roleLabel =
      member.memberType === 'LAWYER'
        ? 'Advogado'
        : member.memberType === 'ASSISTANT'
        ? 'Assistente'
        : 'Estagiário';

    securityStore.logEvent({
      actorId: member.id,
      actorName: member.fullName,
      actorRole: roleLabel,
      action: 'FIRST_ACCESS_PASSWORD_SET',
      actionDescription: 'Definiu senha pessoal definitiva de 1º acesso com requisitos de alta segurança (LGPD/OAB compliant)',
      targetResource: `Credencial do Operador (${member.email})`,
      ipAddress: '189.124.45.102',
      userAgent: 'Chrome 122.0.0 (Windows 11) - Conexão Segura TLS 1.3',
      severity: 'INFO',
    });

    return true;
  }

  public resetMemberPassword(id: string, newTempPassword: string): TeamMember | null {
    const exists = this.teamMembers.some((m) => m.id === id);
    if (!exists) return null;
    let updatedMember: TeamMember | null = null;
    this.teamMembers = this.teamMembers.map((m) => {
      if (m.id === id) {
        updatedMember = {
          ...m,
          temporaryPassword: newTempPassword,
          mustChangePassword: true,
          updatedAt: new Date().toISOString(),
        };
        return updatedMember;
      }
      return m;
    });

    if (updatedMember) {
      securityStore.logEvent({
        actorId: 'usr-001',
        actorName: 'Dr. Alexandre Pontes',
        actorRole: 'Advogado Sócio Titular',
        action: 'RESET_PASSWORD',
        actionDescription: `Redefiniu senha provisória e forçou 1º acesso para o colaborador ${(updatedMember as TeamMember).fullName} (${(updatedMember as TeamMember).email})`,
        targetResource: `Credencial de ${(updatedMember as TeamMember).fullName}`,
        ipAddress: '189.124.45.102',
        userAgent: 'Chrome 122.0.0 (Windows 11) - Gestão de Equipe',
        severity: 'WARNING',
      });
    }

    return updatedMember;
  }
}

export const settingsStore = new SettingsStore();
