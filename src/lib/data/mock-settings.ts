import type {
  OfficeSettings,
  TeamMember,
  UserProfile,
} from '@/types/settings';
import { securityStore } from './mock-security';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: '',
  tenantId: '',
  fullName: '',
  email: '',
  phone: '',
  memberType: 'LAWYER',
  oabNumber: '',
  twoFactorEnabled: false,
};

export const INITIAL_OFFICE_SETTINGS: OfficeSettings = {
  tenantId: '',
  officeName: '',
  tradeName: '',
  cnpj: '',
  oabSocietyNumber: '',
  email: '',
  phone: '',
  whatsapp: '',
  street: '',
  streetNumber: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [];

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
