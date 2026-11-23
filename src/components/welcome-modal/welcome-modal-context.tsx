'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { WelcomeModal } from './welcome-modal';

interface WelcomeModalContextType {
  isWelcomeOpen: boolean;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
}

const WelcomeModalContext = createContext<WelcomeModalContextType | null>(null);

export function WelcomeModalProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const checkedUserRef = useRef<string | null>(null);

  // Auto-launch for new users on initial login if not previously dismissed
  // Tracks current user ID to re-evaluate if operator switcher alternates profiles
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;
    if (checkedUserRef.current === currentUser.id) return;

    checkedUserRef.current = currentUser.id;
    const dismissedKey = `previoffice_welcome_dismissed_${currentUser.id}`;
    const wasDismissed = typeof window !== 'undefined' ? localStorage.getItem(dismissedKey) : null;

    if (!wasDismissed) {
      const timer = setTimeout(() => {
        setIsWelcomeOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentUser?.id]);

  const openWelcomeModal = () => setIsWelcomeOpen(true);
  const closeWelcomeModal = () => setIsWelcomeOpen(false);

  return (
    <WelcomeModalContext.Provider
      value={{
        isWelcomeOpen,
        openWelcomeModal,
        closeWelcomeModal,
      }}
    >
      {children}
      {isAuthenticated && currentUser && (
        <WelcomeModal isOpen={isWelcomeOpen} onClose={closeWelcomeModal} />
      )}
    </WelcomeModalContext.Provider>
  );
}

export function useWelcomeModal() {
  const context = useContext(WelcomeModalContext);
  if (!context) {
    throw new Error('useWelcomeModal must be used within a WelcomeModalProvider');
  }
  return context;
}
