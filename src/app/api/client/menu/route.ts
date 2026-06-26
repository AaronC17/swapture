import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { safeJsonParse, sanitizeString, sanitizeNumber } from '@/lib/security'
import {
  ensureIds,
  filterArchived,
  type MenuData,
  type MenuItem,
  type MenuCategory,
  type MenuLocation,
  generateItemId,
} from '@/lib/menu'

// GET — devuelve el menú completo (con items archivados) del cliente autenticado.
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.userId },
      select: { customNotes: true, businessName: true, slug: true, status: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    let menuData: MenuData | null = null
    if (client.customNotes) {
      try {
        const parsed = JSON.parse(client.customNotes)
        if (parsed && typeof parsed === 'object') menuData = parsed as MenuData
      } catch {
        // customNotes no es JSON válido → devolver menú vacío
      }
    }

    const menu = ensureIds(menuData)

    return NextResponse.json({
      menu,
      businessName: client.businessName,
      slug: client.slug,
      status: client.status,
      publicMenu: filterArchived(menu),
    })
  } catch (error) {
    console.error('GET /api/client/menu error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PUT — reemplaza el menú completo del cliente autenticado.
// El frontend manipula la estructura y envía el menú resultante.
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await safeJsonParse(req)
    if (!body || typeof body.menu !== 'object' || body.menu === null) {
      return NextResponse.json({ error: 'Menú inválido.' }, { status: 400 })
    }

    const cleaned = sanitizeMenu(body.menu as MenuData)
    const serialized = JSON.stringify(cleaned)

    // Límite razonable para customNotes (MongoDB maneja strings grandes, pero
    // acotamos para evitar abusos).
    if (serialized.length > 800_000) {
      return NextResponse.json({ error: 'El menú es demasiado grande.' }, { status: 413 })
    }

    const client = await prisma.client.update({
      where: { userId: user.userId },
      data: { customNotes: serialized },
      select: { customNotes: true },
    })

    let menuData: MenuData | null = null
    try {
      menuData = JSON.parse(client.customNotes) as MenuData
    } catch {
      menuData = null
    }

    return NextResponse.json({
      menu: ensureIds(menuData),
      publicMenu: filterArchived(ensureIds(menuData)),
    })
  } catch (error) {
    console.error('PUT /api/client/menu error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// ───────── HELPERS DE SANITIZACIÓN ─────────

const MAX_NAME = 120
const MAX_DESC = 400
const MAX_EMOJI = 8
// Las imágenes subidas se guardan como data URL base64, por eso el límite es grande.
const MAX_IMAGE = 600_000
const MAX_HOURS = 120
const MAX_LOC_NAME = 120
const MAX_PHONE = 30
const MAX_CAT = 200
const MAX_ITEMS_PER_CAT = 300
const MAX_LOCATIONS = 30

function sanitizeItem(item: unknown): MenuItem {
  const obj = (item || {}) as Record<string, unknown>
  const name = sanitizeString(obj.name, MAX_NAME)
  const desc = sanitizeString(obj.desc, MAX_DESC)
  const price = sanitizeNumber(obj.price, 0, 999_999_999)
  const image = sanitizeString(obj.image, MAX_IMAGE)
  const id = sanitizeString(obj.id, 60)
  const archived = obj.archived === true
  const archivedAt = typeof obj.archivedAt === 'string' ? obj.archivedAt.slice(0, 40) : undefined

  const result: MenuItem = {
    id: id || generateItemId(),
    name,
    desc,
    price,
  }
  if (image) result.image = image
  if (archived) {
    result.archived = true
    result.archivedAt = archivedAt || new Date().toISOString()
  }
  return result
}

function sanitizeCategory(cat: unknown): MenuCategory {
  const obj = (cat || {}) as Record<string, unknown>
  const name = sanitizeString(obj.name, MAX_NAME)
  const emoji = sanitizeString(obj.emoji, MAX_EMOJI)
  const id = sanitizeString(obj.id, 60)
  const rawItems = Array.isArray(obj.items) ? obj.items.slice(0, MAX_ITEMS_PER_CAT) : []

  const result: MenuCategory = {
    id: id || generateItemId().replace('it_', 'cat_'),
    name,
    emoji,
    items: rawItems.map(sanitizeItem),
  }
  return result
}

function sanitizeLocation(loc: unknown): MenuLocation {
  const obj = (loc || {}) as Record<string, unknown>
  return {
    name: sanitizeString(obj.name, MAX_LOC_NAME),
    phone: sanitizeString(obj.phone, MAX_PHONE),
    phone2: sanitizeString(obj.phone2, MAX_PHONE),
    whatsapp: sanitizeString(obj.whatsapp, MAX_PHONE),
    hours: sanitizeString(obj.hours, MAX_HOURS),
    categories: (Array.isArray(obj.categories) ? obj.categories.slice(0, MAX_CAT) : []).map(sanitizeCategory),
  }
}

function sanitizeMenu(menu: MenuData): MenuData {
  const result: MenuData = {}

  if (Array.isArray(menu.categories)) {
    result.categories = menu.categories.slice(0, MAX_CAT).map(sanitizeCategory)
  }

  if (menu.locations && typeof menu.locations === 'object') {
    const entries = Object.entries(menu.locations).slice(0, MAX_LOCATIONS)
    const locs: Record<string, MenuLocation> = {}
    for (const [key, loc] of entries) {
      const cleanKey = sanitizeString(key, 60)
      if (cleanKey) locs[cleanKey] = sanitizeLocation(loc)
    }
    result.locations = locs
  }

  const hours = sanitizeString(menu.hours, MAX_HOURS)
  if (hours) result.hours = hours

  const style = sanitizeString(menu.style, 60)
  if (style) result.style = style

  return result
}
