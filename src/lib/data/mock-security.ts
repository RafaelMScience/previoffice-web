import type {
  ActiveSession,
  AuditLogEntry,
  LgpdConsentRecord,
  SecurityStats,
} from '@/types/security';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    tenantId: 'tenant-001',
    actorId: 'usr-001',
    actorName: 'Dr. Alexandre Pontes',
    actorRole: 'Advogado Sócio Titular',
    action: 'DISCHARGE_FEE',
    actionDescription: 'Registrou baixa de honorários (R$ 400,00) com emissão de recibo digital',
    targetResource: 'Contrato CONT-2026-001 (Cliente: Maria das Dores)',
    clientId: 'cli-001',
    ipAddress: '189.124.45.102',
    userAgent: 'Chrome 122.0.0 (Windows 11)',
    timestamp: '2026-11-18T10:45:12Z',
    severity: 'INFO',
    integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'log-002',
    tenantId: 'tenant-001',
    actorId: 'usr-004',
    actorName: 'Juliana Ribeiro',
    actorRole: 'Assistente de Atendimento',
    action: 'CREATE_CLIENT',
    actionDescription: 'Realizou check-in rápido de balcão e vinculou atendimento ao Dr. Alexandre Pontes',
    targetResource: 'Cliente: Raimundo Nonato Ferreira (Aposentadoria Rural)',
    clientId: 'cli-004',
    ipAddress: '192.168.1.45',
    userAgent: 'Edge 121.0.0 (Windows 10)',
    timestamp: '2026-11-18T09:30:40Z',
    severity: 'INFO',
    integrityHash: 'f4b3a12588bc2d259aeaf5c7886fa91316ad32e3538a823ba384880a6741a744',
  },
  {
    id: 'log-003',
    tenantId: 'tenant-001',
    actorId: 'usr-002',
    actorName: 'Dra. Camila Santos',
    actorRole: 'Advogada Associada',
    action: 'VIEW_INSS_PASSWORD',
    actionDescription: 'Acessou e copiou senha do portal Meu INSS para protocolo de recurso administrativo',
    targetResource: 'Cliente: João Silva Santos (CPF: 123.***.***-00)',
    clientId: 'cli-002',
    ipAddress: '189.124.45.105',
    userAgent: 'Firefox 123.0 (macOS Sonoma)',
    timestamp: '2026-11-18T08:15:22Z',
    severity: 'WARNING',
    integrityHash: 'a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
  },
  {
    id: 'log-004',
    tenantId: 'tenant-001',
    actorId: 'usr-001',
    actorName: 'Dr. Alexandre Pontes',
    actorRole: 'Advogado Sócio Titular',
    action: 'PRINT_CONTRACT',
    actionDescription: 'Gerou impressão de Contrato de Honorários e Procuração Ad Judicia OAB padrão',
    targetResource: 'Cliente: Francisca Oliveira (Dossiê Aposentadoria Idade)',
    clientId: 'cli-003',
    ipAddress: '189.124.45.102',
    userAgent: 'Chrome 122.0.0 (Windows 11)',
    timestamp: '2026-11-17T16:50:00Z',
    severity: 'INFO',
    integrityHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
  },
  {
    id: 'log-005',
    tenantId: 'tenant-001',
    actorId: 'usr-005',
    actorName: 'Lucas Bezerra',
    actorRole: 'Estagiário de Direito',
    action: 'EDIT_CLIENT',
    actionDescription: 'Anexou cópia física do PPP (Perfil Profissiográfico Previdenciário) na pasta Armário 2',
    targetResource: 'Cliente: Carlos Eduardo Lima',
    clientId: 'cli-005',
    ipAddress: '192.168.1.52',
    userAgent: 'Chrome 122.0.0 (Ubuntu Linux)',
    timestamp: '2026-11-17T14:22:10Z',
    severity: 'INFO',
    integrityHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
  },
  {
    id: 'log-006',
    tenantId: 'tenant-001',
    actorId: 'unknown',
    actorName: 'Tentativa Não Identificada',
    actorRole: 'Desconhecido',
    action: 'LOGIN_FAILED',
    actionDescription: 'Tentativa de autenticação com credenciais inválidas para o e-mail admin@pontes.adv.br',
    targetResource: 'Portal de Login PreviOffice',
    ipAddress: '45.182.201.14',
    userAgent: 'Python-Requests/2.31.0',
    timestamp: '2026-11-17T03:12:45Z',
    severity: 'CRITICAL',
    integrityHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
  },
  {
    id: 'log-007',
    tenantId: 'tenant-001',
    actorId: 'usr-001',
    actorName: 'Dr. Alexandre Pontes',
    actorRole: 'Advogado Sócio Titular',
    action: 'UPDATE_PERMISSIONS',
    actionDescription: 'Concedeu autorização de Auditoria & Segurança para a Dra. Camila Santos',
    targetResource: 'Colaborador: Dra. Camila Santos (OAB/PB 22.100)',
    ipAddress: '189.124.45.102',
    userAgent: 'Chrome 122.0.0 (Windows 11)',
    timestamp: '2026-11-16T11:05:00Z',
    severity: 'WARNING',
    integrityHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
  },
];

export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-001',
    userId: 'usr-001',
    userName: 'Dr. Alexandre Pontes',
    userRole: 'Advogado Sócio Titular',
    ipAddress: '189.124.45.102 (João Pessoa / PB)',
    device: 'Desktop Windows 11',
    browser: 'Google Chrome 122',
    location: 'Sede Principal - Sala Master',
    startedAt: '2026-11-18T06:15:00Z',
    lastActivity: 'Há 2 minutos',
    isCurrent: true,
  },
  {
    id: 'sess-002',
    userId: 'usr-002',
    userName: 'Dra. Camila Santos',
    userRole: 'Advogada Associada',
    ipAddress: '189.124.45.105 (João Pessoa / PB)',
    device: 'MacBook Pro macOS',
    browser: 'Mozilla Firefox 123',
    location: 'Sede Principal - Gabinete 2',
    startedAt: '2026-11-18T08:00:00Z',
    lastActivity: 'Há 14 minutos',
    isCurrent: false,
  },
  {
    id: 'sess-003',
    userId: 'usr-004',
    userName: 'Juliana Ribeiro',
    userRole: 'Assistente de Atendimento',
    ipAddress: '192.168.1.45 (Rede Interna Escritório)',
    device: 'Terminal Recepção 01',
    browser: 'Microsoft Edge 121',
    location: 'Balcão de Atendimento / Fila',
    startedAt: '2026-11-18T07:45:00Z',
    lastActivity: 'Há 5 minutos',
    isCurrent: false,
  },
];

export const INITIAL_LGPD_CONSENTS: LgpdConsentRecord[] = [
  {
    id: 'lgpd-001',
    clientId: 'cli-001',
    clientName: 'Maria das Dores',
    cpf: '345.***.***-12',
    consentType: 'PREVIDENCIARIO_REPRESENTATION',
    signedAt: '2026-03-12T10:00:00Z',
    status: 'ACTIVE',
    physicalDocumentLocation: 'Armário A • Gaveta 1 • Pasta 14',
  },
  {
    id: 'lgpd-002',
    clientId: 'cli-002',
    clientName: 'João Silva Santos',
    cpf: '123.***.***-00',
    consentType: 'DATA_PROCESSING',
    signedAt: '2026-05-20T14:30:00Z',
    status: 'ACTIVE',
    physicalDocumentLocation: 'Armário B • Gaveta 3 • Pasta 02',
  },
  {
    id: 'lgpd-003',
    clientId: 'cli-003',
    clientName: 'Francisca Oliveira',
    cpf: '876.***.***-45',
    consentType: 'PREVIDENCIARIO_REPRESENTATION',
    signedAt: '2026-08-04T09:15:00Z',
    status: 'ACTIVE',
    physicalDocumentLocation: 'Armário A • Gaveta 2 • Pasta 88',
  },
];

class SecurityStore {
  private auditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
  private activeSessions: ActiveSession[] = [...INITIAL_ACTIVE_SESSIONS];
  private lgpdConsents: LgpdConsentRecord[] = [...INITIAL_LGPD_CONSENTS];

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public getActiveSessions(): ActiveSession[] {
    return [...this.activeSessions];
  }

  public getLgpdConsents(): LgpdConsentRecord[] {
    return [...this.lgpdConsents];
  }

  public getStats(): SecurityStats {
    const sensitive = this.auditLogs.filter(
      (l) => l.action === 'VIEW_INSS_PASSWORD' || l.action === 'EXPORT_REPORT'
    ).length;
    const alerts = this.auditLogs.filter((l) => l.severity === 'CRITICAL' || l.severity === 'WARNING').length;

    return {
      totalLogsToday: this.auditLogs.length,
      activeSessionsCount: this.activeSessions.length,
      sensitiveDataAccessCount: sensitive,
      securityAlertsCount: alerts,
      integritySealStatus: 'VERIFIED',
    };
  }

  public logEvent(entry: Omit<AuditLogEntry, 'id' | 'tenantId' | 'timestamp' | 'integrityHash'>): AuditLogEntry {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      tenantId: 'tenant-001',
      timestamp: new Date().toISOString(),
      integrityHash: Math.random().toString(36).substring(2) + Date.now().toString(16),
    };
    this.auditLogs = [newLog, ...this.auditLogs];
    return newLog;
  }

  public terminateSession(sessionId: string): boolean {
    const initialLen = this.activeSessions.length;
    this.activeSessions = this.activeSessions.filter((s) => s.id !== sessionId);
    return this.activeSessions.length < initialLen;
  }
}

export const securityStore = new SecurityStore();
