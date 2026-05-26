import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { QuickLink, StorageError } from '../types';
import {
  loadLinks,
  addLink as addLinkToStorage,
  updateLink as updateLinkInStorage,
  deleteLink as deleteLinkFromStorage,
} from '../services/storage';
import { generateId } from '../utils/validators';
import { useHaptics } from '../hooks/useHaptics';
import { useToast } from '../hooks/useToast';

interface LinkContextType {
  links: QuickLink[];
  loading: boolean;
  addLink: (data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLink: (link: QuickLink) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  getLinkById: (id: string) => QuickLink | undefined;
  /** 验证链接密码，无密码保护时始终返回 true */
  verifyPassword: (linkId: string, password: string) => boolean;
  /** 获取所有已使用的分类（去重、排序） */
  getCategories: () => string[];
}

const LinkContext = createContext<LinkContextType | undefined>(undefined);

export function LinkProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { light } = useHaptics();
  const toast = useToast();

  useEffect(() => {
    loadLinks()
      .then(data => setLinks(data))
      .catch((e: StorageError) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addLinkHandler = useCallback(
    async (data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newLink: QuickLink = {
        ...data,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      try {
        const updated = await addLinkToStorage(newLink);
        setLinks(updated);
        light();
      } catch (e) {
        toast.error(e instanceof StorageError ? e.message : '添加链接失败');
        throw e;
      }
    },
    [light, toast],
  );

  const updateLinkHandler = useCallback(
    async (link: QuickLink) => {
      try {
        const updated = await updateLinkInStorage(link);
        setLinks(updated);
        light();
      } catch (e) {
        toast.error(e instanceof StorageError ? e.message : '更新链接失败');
        throw e;
      }
    },
    [light, toast],
  );

  const deleteLinkHandler = useCallback(
    async (id: string) => {
      try {
        const updated = await deleteLinkFromStorage(id);
        setLinks(updated);
        light();
      } catch (e) {
        toast.error(e instanceof StorageError ? e.message : '删除链接失败');
        throw e;
      }
    },
    [light, toast],
  );

  const getLinkById = useCallback(
    (id: string) => links.find(l => l.id === id),
    [links],
  );

  const verifyPassword = useCallback(
    (linkId: string, password: string): boolean => {
      const link = links.find(l => l.id === linkId);
      if (!link || !link.password) return true;
      return link.password === password;
    },
    [links],
  );

  const getCategories = useCallback((): string[] => {
    const cats = links
      .map(l => l.category)
      .filter((c): c is string => !!c);
    return [...new Set(cats)].sort();
  }, [links]);

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
        getCategories,
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
