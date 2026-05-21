import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { QuickLink } from '../types';
import { loadLinks, addLink as addLinkToStorage, updateLink as updateLinkInStorage, deleteLink as deleteLinkFromStorage } from '../services/storage';
import { generateId } from '../utils/validators';
import { useHaptics } from '../utils/haptics';

interface LinkContextType {
  links: QuickLink[];
  loading: boolean;
  addLink: (data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLink: (link: QuickLink) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  getLinkById: (id: string) => QuickLink | undefined;
  verifyPassword: (linkId: string, password: string) => boolean;
}

const LinkContext = createContext<LinkContextType | undefined>(undefined);

export function LinkProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { light } = useHaptics();

  useEffect(() => {
    loadLinks().then(data => {
      setLinks(data);
      setLoading(false);
    });
  }, []);

  const addLinkHandler = useCallback(async (
    data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newLink: QuickLink = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedLinks = await addLinkToStorage(newLink);
    setLinks(updatedLinks);
    light();
  }, [light]);

  const updateLinkHandler = useCallback(async (link: QuickLink) => {
    const updatedLinks = await updateLinkInStorage(link);
    setLinks(updatedLinks);
    light();
  }, [light]);

  const deleteLinkHandler = useCallback(async (id: string) => {
    const updatedLinks = await deleteLinkFromStorage(id);
    setLinks(updatedLinks);
    light();
  }, [light]);

  const getLinkById = useCallback(
    (id: string) => links.find(l => l.id === id),
    [links]
  );

  const verifyPassword = useCallback(
    (linkId: string, password: string): boolean => {
      const link = links.find(l => l.id === linkId);
      if (!link || !link.password) return true;
      return link.password === password;
    },
    [links]
  );

  return (
    <LinkContext.Provider
      value={{
        links,
        loading,
        addLink: addLinkHandler,
        updateLink: updateLinkHandler,
        deleteLink: deleteLinkHandler,
        getLinkById,
        verifyPassword,
      }}
    >
      {children}
    </LinkContext.Provider>
  );
}

export function useLinks(): LinkContextType {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error('useLinks must be used within a LinkProvider');
  }
  return context;
}
