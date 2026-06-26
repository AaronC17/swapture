/**
 * Tipos y utilidades compartidas para el menú de los clientes.
 *
 * El menú se almacena como JSON dentro de `Client.customNotes`.
 * Para soportar borrado lógico (archivado) y edición de imagen sin
 * romper la estructura existente, se extienden los items con campos
 * opcionales: `id`, `image`, `archived`, `archivedAt`.
 */

export interface MenuItem {
  name: string
  desc: string
  price: number
  /** Imagen personalizada (URL o ruta pública). Sobreescribe el map estático. */
  image?: string
  /** Borrado lógico: el item no se muestra en el sitio público. */
  archived?: boolean
  archivedAt?: string
  /** Identificador estable para editar/archivar/restaurar. */
  id?: string
}

export interface MenuCategory {
  name: string
  emoji: string
  items: MenuItem[]
  id?: string
}

export interface MenuLocation {
  name: string
  phone?: string
  phone2?: string
  whatsapp?: string
  hours?: string
  categories: MenuCategory[]
}

export interface MenuData {
  categories?: MenuCategory[]
  hours?: string
  locations?: Record<string, MenuLocation>
  style?: string
}

/** Devuelve true si el item está archivado (borrado lógico). */
export function isItemArchived(item: MenuItem): boolean {
  return Boolean(item && item.archived)
}

/** Filtra solo los items activos (no archivados). */
export function activeItems(items: MenuItem[] | undefined): MenuItem[] {
  if (!Array.isArray(items)) return []
  return items.filter((i) => !isItemArchived(i))
}

/** Devuelve una copia de la categoría con solo items activos. */
export function categoryWithActiveItems(cat: MenuCategory): MenuCategory {
  return { ...cat, items: activeItems(cat.items) }
}

/**
 * Devuelve una copia del MenuData con los items archivados removidos.
 * Usa en el render público (server-side) para que nunca lleguen al cliente.
 */
export function filterArchived(menu: MenuData | null | undefined): MenuData | null {
  if (!menu) return null

  const result: MenuData = { ...menu }

  if (Array.isArray(result.categories)) {
    result.categories = result.categories
      .map(categoryWithActiveItems)
      .filter((c) => c.items.length > 0)
  }

  if (result.locations) {
    const locs: Record<string, MenuLocation> = {}
    for (const [key, loc] of Object.entries(result.locations)) {
      locs[key] = {
        ...loc,
        categories: (loc.categories || [])
          .map(categoryWithActiveItems)
          .filter((c) => c.items.length > 0),
      }
    }
    result.locations = locs
  }

  return result
}

/** Cuenta los items archivados en todo el menú. */
export function countArchived(menu: MenuData | null | undefined): number {
  if (!menu) return 0
  let count = 0
  const visitCat = (cat: MenuCategory) => {
    count += (cat.items || []).filter(isItemArchived).length
  }
  if (Array.isArray(menu.categories)) menu.categories.forEach(visitCat)
  if (menu.locations) {
    Object.values(menu.locations).forEach((loc) => {
      (loc.categories || []).forEach(visitCat)
    })
  }
  return count
}

/** Genera un id estable corto para un item. */
export function generateItemId(): string {
  return `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Normaliza un menú asegurando que cada item y categoría tenga `id`.
 * No muta el original. Útil al cargar el menú desde la base.
 */
export function ensureIds(menu: MenuData | null | undefined): MenuData | null {
  if (!menu) return null
  const result: MenuData = { ...menu }

  const ensureCat = (cat: MenuCategory): MenuCategory => ({
    ...cat,
    id: cat.id || generateItemId().replace('it_', 'cat_'),
    items: (cat.items || []).map((it) => ({
      ...it,
      id: it.id || generateItemId(),
    })),
  })

  if (Array.isArray(result.categories)) {
    result.categories = result.categories.map(ensureCat)
  }
  if (result.locations) {
    const locs: Record<string, MenuLocation> = {}
    for (const [key, loc] of Object.entries(result.locations)) {
      locs[key] = {
        ...loc,
        categories: (loc.categories || []).map(ensureCat),
      }
    }
    result.locations = locs
  }

  return result
}
