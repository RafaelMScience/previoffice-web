'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsStore } from '@/lib/data/mock-settings';
import type { TeamMember, TeamPermissions } from '@/types/settings';

interface AuthContextType {
  currentUser: TeamMember;
  permissions: TeamPermissions;
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
  const [currentUserId, setCurrentUserId] = useState<string>('usr-001');

  useEffect(() => {
    // Read saved user or default to Dr. Alexandre Pontes
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && teamMembers.some((m) => m.id === saved)) {
      setCurrentUserId(saved);
    }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('previoffice_first_access_email');
    }
    setCurrentUserId('usr-001');
  };

  const currentUser = teamMembers.find((m) => m.id === currentUserId) || teamMembers[0];
  const permissions = currentUser.permissions;
  const isAdmin = Boolean(currentUser.isAdminLawyer || currentUser.permissions.adminSettings);

  const canAccess = (permission: keyof TeamPermissions): boolean => {
    if (isAdmin) return true;
    return Boolean(permissions[permission]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
