import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'meus_templates_v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persist(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useTemplates() {
  const [templates, setTemplates] = useState(load);

  const addTemplate = useCallback((data) => {
    const item = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => {
      const next = [item, ...prev];
      persist(next);
      return next;
    });
    return item;
  }, []);

  const updateTemplate = useCallback((id, data) => {
    setTemplates((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      );
      persist(next);
      return next;
    });
  }, []);

  const deleteTemplate = useCallback((id) => {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const duplicateTemplate = useCallback((id) => {
    setTemplates((prev) => {
      const original = prev.find((t) => t.id === id);
      if (!original) return prev;
      const copy = {
        ...original,
        id: uuidv4(),
        name: original.name + ' (cópia)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const next = [copy, ...prev];
      persist(next);
      return next;
    });
  }, []);

  // Mescla templates importados, evitando duplicatas por ID
  const importTemplates = useCallback((incoming) => {
    setTemplates((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const toAdd = incoming.filter((t) => !existingIds.has(t.id));
      const next = [...prev, ...toAdd];
      persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setTemplates([]);
    persist([]);
  }, []);

  const categories = [...new Set(templates.map((t) => t.category).filter(Boolean))].sort();

  return {
    templates,
    categories,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    importTemplates,
    clearAll,
  };
}
