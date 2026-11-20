'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { securityStore } from '@/lib/data/mock-security';
import type { Database } from '@/types/database';
import type { MemberType, TeamMember, TeamPermissions } from '@/types/settings';
import type { User } from '@supabase/supabase-js';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  currentUser: TeamMember | null;
  authUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: TeamPermissions | null;
  isAdmin: boolean;
  switchUser: (id: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

function mapProfileToTeamMember(profile: ProfileRow, user?: User | null): TeamMember {
  const role = profile.role || 'MANAGING_LAWYER';
  const isAdmin = role === 'MANAGING_LAWYER';
  const memberType: MemberType =
    (user?.user_metadata?.member_type as MemberType) ||
    (role === 'RECEPTIONIST' || role === 'ASSISTANT'
      ? 'ASSISTANT'
      : role === 'INTERN'
      ? 'INTERN'
      : 'LAWYER');

  const userPerms = user?.user_metadata?.permissions as TeamPermissions | undefined;
  const permissions =
    userPerms ||
    (role === 'MANAGING_LAWYER'
      ? ADMIN_PERMISSIONS
      : role === 'ASSOCIATE_LAWYER'
      ? LAWYER_PERMISSIONS
      : RECEPTIONIST_PERMISSIONS);

  const mustChangePassword =
    user?.user_metadata?.must_change_password === true;

  return {
    id: profile.id,
    tenantId: profile.tenant_id,
    fullName: profile.full_name || (user?.user_metadata?.full_name as string) || user?.email || 'Advogado Administrador',
    email: profile.email || user?.email || '',
    phone: profile.phone || (user?.user_metadata?.phone as string) || '',
    oabNumber: profile.oab_number || (user?.user_metadata?.oab_number as string) || '',
    avatarUrl: profile.avatar_url || (user?.user_metadata?.avatar_url as string) || '',
    memberType,
    isAdminLawyer: isAdmin,
    active: profile.is_active ?? true,
    lastLoginAt: profile.last_login_at || user?.last_sign_in_at || undefined,
    mustChangePassword,
    permissions,
    createdAt: profile.created_at || new Date().toISOString(),
    updatedAt: profile.updated_at || new Date().toISOString(),
  };
}

function buildFallbackMember(user: User): TeamMember {
  const role = (user.app_metadata?.role as string) || 'MANAGING_LAWYER';
  const memberType: MemberType =
    (user.user_metadata?.member_type as MemberType) ||
    (role === 'RECEPTIONIST' || role === 'ASSISTANT'
      ? 'ASSISTANT'
      : role === 'INTERN'
      ? 'INTERN'
      : 'LAWYER');

  const permissions =
    (user.user_metadata?.permissions as TeamPermissions) ||
    (role === 'MANAGING_LAWYER'
      ? ADMIN_PERMISSIONS
      : role === 'ASSOCIATE_LAWYER'
      ? LAWYER_PERMISSIONS
      : RECEPTIONIST_PERMISSIONS);

  return {
    id: user.id,
    tenantId:
      (user.app_metadata?.tenant_id as string) ||
      'tenant-default',
    fullName:
      (user.user_metadata?.full_name as string) ||
      user.email?.split('@')[0] ||
      'Administrador',
    email: user.email || '',
    phone: (user.user_metadata?.phone as string) || '',
    oabNumber: (user.user_metadata?.oab_number as string) || '',
    avatarUrl: (user.user_metadata?.avatar_url as string) || '',
    memberType,
    isAdminLawyer: role === 'MANAGING_LAWYER',
    active: true,
    lastLoginAt: user.last_sign_in_at || undefined,
    mustChangePassword: user.user_metadata?.must_change_password === true,
    permissions,
    createdAt: user.created_at,
    updatedAt: user.created_at,
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
            const fallbackMember = buildFallbackMember(session.user);
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
          const fallbackMember = buildFallbackMember(session.user);
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

  const refreshUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setAuthUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const member = mapProfileToTeamMember(profile, user);
        setCurrentUser(member);
        setAvailableUsers([member]);
      } else {
        const fallbackMember = buildFallbackMember(user);
        setCurrentUser(fallbackMember);
        setAvailableUsers([fallbackMember]);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
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
        refreshUser,
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
