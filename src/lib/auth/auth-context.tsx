'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { securityStore } from '@/lib/data/mock-security';
import type { TeamMember, TeamPermissions } from '@/types/settings';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: TeamMember | null;
  authUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: TeamPermissions | null;
  isAdmin: boolean;
  switchUser: (id: string) => void;
  logout: () => Promise<void>;
  availableUsers: TeamMember[];
  canAccess: (permission: keyof TeamPermissions) => boolean;
}

const STORAGE_KEY = 'previoffice_active_user_id';

const ADMIN_PERMISSIONS: TeamPermissions = {
  receptionDesk: true,
  clientsManage: true,
  casesManage: true,
  contractsAndFinancial: true,
  templatesManage: true,
  adminSettings: true,
  securityAudit: true,
};

const LAWYER_PERMISSIONS: TeamPermissions = {
  receptionDesk: true,
  clientsManage: true,
  casesManage: true,
  contractsAndFinancial: true,
  templatesManage: true,
  adminSettings: false,
  securityAudit: false,
};

const RECEPTIONIST_PERMISSIONS: TeamPermissions = {
  receptionDesk: true,
  clientsManage: true,
  casesManage: false,
  contractsAndFinancial: false,
  templatesManage: false,
  adminSettings: false,
  securityAudit: false,
};

function mapProfileToTeamMember(profile: any, user?: User | null): TeamMember {
  const role = profile.role || 'MANAGING_LAWYER';
  const isAdmin = role === 'MANAGING_LAWYER';
  const memberType = role === 'RECEPTIONIST' ? 'ASSISTANT' : 'LAWYER';
  const permissions =
    role === 'MANAGING_LAWYER'
      ? ADMIN_PERMISSIONS
      : role === 'ASSOCIATE_LAWYER'
      ? LAWYER_PERMISSIONS
      : RECEPTIONIST_PERMISSIONS;

  return {
    id: profile.id,
    tenantId: profile.tenant_id,
    fullName: profile.full_name || user?.email || 'Advogado Administrador',
    email: profile.email || user?.email || '',
    memberType,
    isAdminLawyer: isAdmin,
    active: profile.is_active ?? true,
    permissions,
    createdAt: profile.created_at || new Date().toISOString(),
    updatedAt: profile.updated_at || new Date().toISOString(),
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (!isMounted) return;
          setAuthUser(session.user);

          // Fetch profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            const member = mapProfileToTeamMember(profile, session.user);
            setCurrentUser(member);
            setAvailableUsers([member]);
          } else {
            // Default admin member from authenticated user
            const fallbackMember: TeamMember = {
              id: session.user.id,
              tenantId:
                (session.user.app_metadata?.tenant_id as string) ||
                'tenant-default',
              fullName:
                (session.user.user_metadata?.full_name as string) ||
                session.user.email?.split('@')[0] ||
                'Administrador',
              email: session.user.email || '',
              memberType: 'LAWYER',
              isAdminLawyer: true,
              active: true,
              permissions: ADMIN_PERMISSIONS,
              createdAt: session.user.created_at,
              updatedAt: session.user.created_at,
            };
            setCurrentUser(fallbackMember);
            setAvailableUsers([fallbackMember]);
          }
        } else {
          setCurrentUser(null);
          setAuthUser(null);
          setAvailableUsers([]);
        }
      } catch (err) {
        console.error('Failed to initialize Supabase session:', err);
        setCurrentUser(null);
        setAuthUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeAuth();

    // Listen to real-time auth changes (LOGIN, LOGOUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          const member = mapProfileToTeamMember(profile, session.user);
          setCurrentUser(member);
          setAvailableUsers([member]);
        } else {
          const fallbackMember: TeamMember = {
            id: session.user.id,
            tenantId:
              (session.user.app_metadata?.tenant_id as string) ||
              'tenant-default',
            fullName:
              (session.user.user_metadata?.full_name as string) ||
              session.user.email?.split('@')[0] ||
              'Administrador',
            email: session.user.email || '',
            memberType: 'LAWYER',
            isAdminLawyer: true,
            active: true,
            permissions: ADMIN_PERMISSIONS,
            createdAt: session.user.created_at,
            updatedAt: session.user.created_at,
          };
          setCurrentUser(fallbackMember);
          setAvailableUsers([fallbackMember]);
        }
      } else {
        setCurrentUser(null);
        setAuthUser(null);
        setAvailableUsers([]);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const switchUser = (id: string) => {
    const target = availableUsers.find((u) => u.id === id);
    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, id);
      }
    }
  };

  const logout = async () => {
    const actorName = currentUser?.fullName || 'Operador';
    const actorId = currentUser?.id || 'unknown';
    const actorRole = currentUser?.memberType || 'LAWYER';

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during Supabase signOut:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.clear();
    }

    securityStore.logEvent({
      actorId,
      actorName,
      actorRole,
      action: 'LOGOUT',
      actionDescription: `Encerrou a sessão do operador ${actorName}`,
      targetResource: `Sessão PreviOffice Web`,
      ipAddress: '127.0.0.1 (Local)',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
      severity: 'INFO',
    });

    setCurrentUser(null);
    setAuthUser(null);
  };

  const isAuthenticated = Boolean(currentUser && !currentUser.mustChangePassword);
  const permissions = currentUser?.permissions || null;
  const isAdmin = Boolean(currentUser?.isAdminLawyer || permissions?.adminSettings);

  const canAccess = (permission: keyof TeamPermissions): boolean => {
    if (!currentUser || !permissions) return false;
    if (isAdmin) return true;
    return Boolean(permissions[permission]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authUser,
        isAuthenticated,
        isLoading,
        permissions,
        isAdmin,
        switchUser,
        logout,
        availableUsers,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
