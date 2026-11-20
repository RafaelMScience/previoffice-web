'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsStore } from '@/lib/data/mock-settings';
import { securityStore } from '@/lib/data/mock-security';
import type { TeamMember, TeamPermissions } from '@/types/settings';

interface AuthContextType {
  currentUser: TeamMember | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: TeamPermissions | null;
  isAdmin: boolean;
  switchUser: (id: string) => void;
  logout: () => void;
  availableUsers: TeamMember[];
  canAccess: (permission: keyof TeamPermissions) => boolean;
}

const STORAGE_KEY = 'previoffice_active_user_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => settingsStore.getTeamMembers());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Read saved user from localStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && teamMembers.some((m) => m.id === saved)) {
      setCurrentUserId(saved);
    } else {
      setCurrentUserId(null);
    }
    setIsLoading(false);
  }, [teamMembers]);

  const switchUser = (id: string) => {
    const exists = teamMembers.some((m) => m.id === id);
    if (!exists) return;
    setCurrentUserId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  const logout = () => {
    const userLoggingOut = currentUserId
      ? teamMembers.find((m) => m.id === currentUserId) || teamMembers[0]
      : teamMembers[0];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.clear();
    }
    securityStore.logEvent({
      actorId: userLoggingOut.id,
      actorName: userLoggingOut.fullName,
      actorRole: userLoggingOut.memberType,
      action: 'LOGOUT',
      actionDescription: `Encerrou a sessão do operador ${userLoggingOut.fullName}`,
      targetResource: `Sessão PreviOffice Web`,
      ipAddress: '127.0.0.1 (Local)',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
      severity: 'INFO',
    });
    setCurrentUserId(null);
  };

  const currentUser = currentUserId ? teamMembers.find((m) => m.id === currentUserId) || null : null;
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
        isAuthenticated,
        isLoading,
        permissions,
        isAdmin,
        switchUser,
        logout,
        availableUsers: teamMembers,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
