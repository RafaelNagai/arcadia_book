import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3001/api/v1'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function getToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    ...(init.body != null ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (res.status === 204) return undefined as T

  const json = await res.json()
  if (!res.ok) {
    const msg = json?.error?.message ?? 'Erro desconhecido'
    throw new Error(msg)
  }
  return json as T
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    signUp: (email: string, password: string) =>
      apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),

    signIn: (email: string, password: string) =>
      apiFetch<{ access_token: string; refresh_token: string; user: unknown }>(
        '/auth/signin',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      ),

    signOut: () => apiFetch('/auth/signout', { method: 'POST' }),

    forgotPassword: (email: string) =>
      apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

    me: () => apiFetch<{ user: unknown }>('/auth/me'),
  },

  // ── Characters ──────────────────────────────────────────────────────────────

  characters: {
    list: () => apiFetch<{ characters: unknown[] }>('/characters'),

    get: (id: string) => apiFetch<{ character: unknown }>(`/characters/${id}`),

    create: (data: unknown) =>
      apiFetch<{ character: unknown }>('/characters', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: unknown) =>
      apiFetch<{ character: unknown }>(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateCurrentValues: (id: string, values: { current_hp?: number; current_sanidade?: number }) =>
      apiFetch<{ character: unknown }>(`/characters/${id}/current-values`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      }),

    setVisibility: (id: string, isPublic: boolean) =>
      apiFetch<{ character: unknown }>(`/characters/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ is_public: isPublic }),
      }),

    delete: (id: string) => apiFetch(`/characters/${id}`, { method: 'DELETE' }),
  },

  // ── Inventory ───────────────────────────────────────────────────────────────

  inventory: {
    get: (characterId: string) =>
      apiFetch<{ bags: unknown[]; items: unknown[] }>(`/characters/${characterId}/inventory`),

    createItem: (characterId: string, data: unknown) =>
      apiFetch(`/characters/${characterId}/inventory/items`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateItem: (characterId: string, itemId: string, data: unknown) =>
      apiFetch(`/characters/${characterId}/inventory/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteItem: (characterId: string, itemId: string) =>
      apiFetch(`/characters/${characterId}/inventory/items/${itemId}`, { method: 'DELETE' }),

    reorderItems: (
      characterId: string,
      items: Array<{ id: string; sort_order: number; bag_id?: string | null }>,
    ) =>
      apiFetch(`/characters/${characterId}/inventory/items/reorder`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),

    createBag: (characterId: string, data: unknown) =>
      apiFetch(`/characters/${characterId}/inventory/bags`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateBag: (characterId: string, bagId: string, data: unknown) =>
      apiFetch(`/characters/${characterId}/inventory/bags/${bagId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteBag: (characterId: string, bagId: string) =>
      apiFetch(`/characters/${characterId}/inventory/bags/${bagId}`, { method: 'DELETE' }),
  },

  // ── State ───────────────────────────────────────────────────────────────────

  state: {
    get: (characterId: string) =>
      apiFetch<{ state: unknown }>(`/characters/${characterId}/state`),

    updatePeChecks: (characterId: string, peChecks: Record<string, boolean[]>) =>
      apiFetch(`/characters/${characterId}/state/pe-checks`, {
        method: 'PATCH',
        body: JSON.stringify({ pe_checks: peChecks }),
      }),

    updateSkillModifiers: (characterId: string, modifiers: Record<string, number>) =>
      apiFetch(`/characters/${characterId}/state/skill-modifiers`, {
        method: 'PATCH',
        body: JSON.stringify({ skill_modifiers: modifiers }),
      }),

    updateDefenseModifiers: (
      characterId: string,
      modifiers: { daBase: number; daBonus: number; dpBonus: number },
    ) =>
      apiFetch(`/characters/${characterId}/state/defense-modifiers`, {
        method: 'PATCH',
        body: JSON.stringify({ defense_modifiers: modifiers }),
      }),

    appendDiceLog: (characterId: string, entry: unknown) =>
      apiFetch(`/characters/${characterId}/state/dice-log`, {
        method: 'POST',
        body: JSON.stringify({ entry }),
      }),

    clearDiceLog: (characterId: string) =>
      apiFetch(`/characters/${characterId}/state/dice-log`, { method: 'DELETE' }),
  },

  // ── Upload ──────────────────────────────────────────────────────────────────

  upload: {
    characterImage: async (characterId: string, file: File): Promise<{ url: string }> => {
      const token = await getToken()
      const form = new FormData()
      form.append('file', file)
      form.append('characterId', characterId)

      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/upload/character-image`, {
        method: 'POST',
        headers,
        body: form,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? 'Erro no upload')
      return json as { url: string }
    },

    deleteCharacterImage: (path: string) =>
      apiFetch('/upload/character-image', {
        method: 'DELETE',
        body: JSON.stringify({ path }),
      }),
  },
}
