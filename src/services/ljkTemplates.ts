// Auto Template store: saves recognized LJK layouts to localStorage so the
// same LJK model can be re-analyzed faster and more stably on later scans.

export interface SavedLayoutTemplate {
  id: string;
  name: string;
  detectedType: string;
  detectedTotalQuestions: number;
  detectedOptionCount: number;
  columns?: number;
  orientation?: string;
  region?: {
    answerRegion?: string;
    identityRegion?: string;
  };
  signature: string;
  createdAt: string;
  source: string;
}

const STORAGE_KEY = 'ai_ljk_saved_templates';

function getStore(): SavedLayoutTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read LJK templates:', e);
  }
  return [];
}

function setStore(list: SavedLayoutTemplate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save LJK templates:', e);
  }
}

export function buildSignature(type: string | undefined, questions: number, options: number): string {
  return `${type || 'UNKNOWN'}|${questions}|${options}`;
}

export function getSavedTemplates(): SavedLayoutTemplate[] {
  return getStore();
}

export function findTemplateBySignature(signature: string): SavedLayoutTemplate | undefined {
  return getStore().find((t) => t.signature === signature);
}

export function findMatchingTemplate(type: string | undefined, questions: number, options: number): SavedLayoutTemplate | undefined {
  return findTemplateBySignature(buildSignature(type, questions, options));
}

// For reuse hinting we often only know question/option counts up front.
export function findTemplateByCounts(questions: number, options: number): SavedLayoutTemplate | undefined {
  return getStore().find((t) => t.detectedTotalQuestions === questions && t.detectedOptionCount === options);
}

export function saveTemplate(template: Omit<SavedLayoutTemplate, 'id' | 'createdAt'>): SavedLayoutTemplate {
  const list = getStore();
  const existing = list.find((t) => t.signature === template.signature);
  const newTemplate: SavedLayoutTemplate = {
    ...template,
    id: existing ? existing.id : `tpl-${Date.now()}`,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  if (existing) {
    const idx = list.findIndex((t) => t.signature === template.signature);
    list[idx] = newTemplate;
  } else {
    list.push(newTemplate);
  }
  setStore(list);
  return newTemplate;
}

export function removeTemplate(id: string) {
  setStore(getStore().filter((t) => t.id !== id));
}

export function clearTemplates() {
  setStore([]);
}
