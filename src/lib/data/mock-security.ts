import type {
  ActiveSession,
  AuditLogEntry,
  LgpdConsentRecord,
  SecurityStats,
} from '@/types/security';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [];
export const INITIAL_LGPD_CONSENTS: LgpdConsentRecord[] = [];

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
