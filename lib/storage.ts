// Storage layer backed by SQLite via Next.js API routes.

export interface Command {
  id: string
  name: string
  command: string
  description: string
  is_multi_step: boolean
  created_at: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface User {
  username: string
  password: string
}

export interface Placeholder {
  id: string
  name: string
  created_at: string
}

export interface PlaceholderSet {
  id: string
  name: string
  created_at: string
}

export interface PlaceholderValue {
  id: string
  set_id: string
  placeholder_name: string
  default_value: string
  created_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  created_at: string
  tags?: Tag[]
}

export interface CommandStep {
  id: string
  command_id: string
  step_number: number
  command: string
  comment: string
  created_at: string
}

const STORAGE_KEYS = {
  SESSION: "pentester_session",
}

// No-op now: seeding is handled in the server-side SQLite layer.
export function initializeStorage() {
  return
}

// Helpers for API calls
async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    throw new Error(`API error ${res.status}`)
  }
  return (await res.json()) as T
}

// Commands
export async function getCommands(): Promise<Command[]> {
  return api<Command[]>("/api/commands")
}

export async function addCommand(command: Omit<Command, "id" | "created_at">): Promise<Command> {
  return api<Command>("/api/commands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command),
  })
}

export async function updateCommand(id: string, updates: Partial<Command>): Promise<void> {
  await api(`/api/commands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

export async function deleteCommand(id: string): Promise<void> {
  await api(`/api/commands/${id}`, {
    method: "DELETE",
  })
}

// Tags
export async function getTags(): Promise<Tag[]> {
  return api<Tag[]>("/api/tags")
}

export async function addTag(tag: Omit<Tag, "id" | "created_at">): Promise<Tag> {
  return api<Tag>("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  })
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<void> {
  await api(`/api/tags/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

export async function deleteTag(id: string): Promise<void> {
  await api(`/api/tags/${id}`, {
    method: "DELETE",
  })
}

export async function updateCommandTags(commandId: string, tagIds: string[]): Promise<void> {
  await api(`/api/commands/${commandId}/tags`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagIds }),
  })
}

// Placeholders
export async function getPlaceholders(): Promise<Placeholder[]> {
  return api<Placeholder[]>("/api/placeholders")
}

export async function addPlaceholder(name: string): Promise<Placeholder> {
  return api<Placeholder>("/api/placeholders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
}

export async function updatePlaceholder(id: string, updates: { name?: string }): Promise<void> {
  await api(`/api/placeholders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

export async function deletePlaceholder(id: string): Promise<void> {
  await api(`/api/placeholders/${id}`, {
    method: "DELETE",
  })
}

// Placeholder Sets
export async function getPlaceholderSets(): Promise<PlaceholderSet[]> {
  return api<PlaceholderSet[]>("/api/placeholder-sets")
}

export async function addPlaceholderSet(name: string): Promise<PlaceholderSet> {
  return api<PlaceholderSet>("/api/placeholder-sets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
}

export async function updatePlaceholderSet(id: string, updates: { name?: string }): Promise<void> {
  await api(`/api/placeholder-sets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

export async function deletePlaceholderSet(id: string): Promise<void> {
  await api(`/api/placeholder-sets/${id}`, {
    method: "DELETE",
  })
}

// Placeholder Values
export async function getPlaceholderValues(setId: string): Promise<PlaceholderValue[]> {
  return api<PlaceholderValue[]>(`/api/placeholder-values?set_id=${setId}`)
}

export async function addPlaceholderValue(setId: string, placeholderName: string, defaultValue: string): Promise<PlaceholderValue> {
  return api<PlaceholderValue>("/api/placeholder-values", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_id: setId, placeholder_name: placeholderName, default_value: defaultValue }),
  })
}

export async function updatePlaceholderValue(setId: string, placeholderName: string, defaultValue: string): Promise<void> {
  await api("/api/placeholder-values", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_id: setId, placeholder_name: placeholderName, default_value: defaultValue }),
  })
}

export async function deletePlaceholderValue(id: string): Promise<void> {
  await api(`/api/placeholder-values/${id}`, {
    method: "DELETE",
  })
}

// Notes
export async function getNotes(): Promise<Note[]> {
  return api<Note[]>("/api/notes")
}

export async function addNote(title: string, content: string): Promise<Note> {
  return api<Note>("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  })
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  await api(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

export async function deleteNote(id: string): Promise<void> {
  await api(`/api/notes/${id}`, {
    method: "DELETE",
  })
}

export async function updateNoteTags(noteId: string, tagIds: string[]): Promise<void> {
  await api(`/api/notes/${noteId}/tags`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagIds }),
  })
}

// Command Steps
export async function getCommandSteps(commandId: string): Promise<CommandStep[]> {
  return api<CommandStep[]>(`/api/command-steps?command_id=${commandId}`)
}

export async function addCommandStep(commandId: string, stepNumber: number, command: string, comment: string = ''): Promise<CommandStep> {
  return api<CommandStep>("/api/command-steps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command_id: commandId, step_number: stepNumber, command, comment }),
  })
}

export async function updateCommandStep(id: string, updates: { command?: string; comment?: string }): Promise<void> {
  await api(`/api/command-steps/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

export async function deleteCommandStep(id: string): Promise<void> {
  await api(`/api/command-steps/${id}`, {
    method: "DELETE",
  })
}

export async function updateCommandSteps(commandId: string, steps: Array<{ step_number: number; command: string; comment: string }>): Promise<void> {
  await api(`/api/command-steps/batch/${commandId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ steps }),
  })
}

// Authentication (uses SQLite via /api/login, but keeps client-side session flag)
export async function verifyUser(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    return res.ok
  } catch {
    return false
  }
}

export function setSession(isLoggedIn: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(isLoggedIn))
}

export function getSession(): boolean {
  if (typeof window === "undefined") return false
  const session = localStorage.getItem(STORAGE_KEYS.SESSION)
  return session ? JSON.parse(session) : false
}

export function clearSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.SESSION)
}
