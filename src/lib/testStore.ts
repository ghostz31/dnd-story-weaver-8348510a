const STORAGE_KEY = 'besace-test-characters'

interface TestCharacter {
  id: string
  data: Record<string, any>
}

function load(): TestCharacter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(chars: TestCharacter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chars))
}

export const testStore = {
  getAll(): TestCharacter[] {
    return load()
  },

  getById(id: string): TestCharacter | undefined {
    return load().find(c => c.id === id)
  },

  add(id: string, data: Record<string, any>): void {
    const chars = load().filter(c => c.id !== id)
    chars.push({ id, data })
    save(chars)
  },

  update(id: string, data: Record<string, any>): void {
    const chars = load()
    const idx = chars.findIndex(c => c.id === id)
    if (idx >= 0) {
      chars[idx] = { id, data: { ...chars[idx].data, ...data } }
    } else {
      chars.push({ id, data })
    }
    save(chars)
  },

  delete(id: string): void {
    save(load().filter(c => c.id !== id))
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },

  count(): number {
    return load().length
  },
}
