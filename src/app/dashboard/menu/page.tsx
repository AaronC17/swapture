'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Pencil, Archive, ArchiveRestore, Trash2, X, Loader2, Save,
  Search, ExternalLink, ChevronDown, ChevronRight, Image as ImageIcon,
  Check, AlertTriangle, UtensilsCrossed, MapPin, FolderPlus, GripVertical,
} from 'lucide-react'
import {
  ensureIds, generateItemId, isItemArchived,
  type MenuData, type MenuCategory, type MenuItem, type MenuLocation,
} from '@/lib/menu'
import { imageForItem } from '@/lib/menu-images'

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface LoadResponse {
  menu: MenuData | null
  businessName: string
  slug: string
  status: string
  publicMenu: MenuData | null
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export default function ClientMenuEditorPage() {
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [meta, setMeta] = useState<{ businessName: string; slug: string; status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const [selectedLocKey, setSelectedLocKey] = useState<string | null>(null)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // Modals
  const [itemModal, setItemModal] = useState<
    | { mode: 'add'; catId: string }
    | { mode: 'edit'; catId: string; item: MenuItem }
    | null
  >(null)
  const [catModal, setCatModal] = useState<
    | { mode: 'add' }
    | { mode: 'edit'; cat: MenuCategory }
    | null
  >(null)
  const [confirm, setConfirm] = useState<
    | { type: 'archive-item'; catId: string; item: MenuItem }
    | { type: 'restore-item'; catId: string; item: MenuItem }
    | { type: 'delete-item'; catId: string; item: MenuItem }
    | { type: 'delete-cat'; catId: string; catName: string }
    | null
  >(null)

  /* ── Cargar menú ── */
  const loadMenu = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/client/menu')
      if (!res.ok) throw new Error()
      const data = (await res.json()) as LoadResponse
      const ensured = ensureIds(data.menu) || { categories: [] }
      setMenu(ensured)
      setMeta({ businessName: data.businessName, slug: data.slug, status: data.status })

      // Seleccionar primera location por defecto
      if (ensured.locations && Object.keys(ensured.locations).length > 0) {
        const firstKey = Object.keys(ensured.locations)[0]
        setSelectedLocKey(firstKey)
      } else {
        setSelectedLocKey(null)
      }
    } catch {
      setMenu({ categories: [] })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadMenu()
  }, [loadMenu])

  /* ── Guardar menú ── */
  const saveMenu = useCallback(async (next: MenuData) => {
    setSaveState('saving')
    try {
      const res = await fetch('/api/client/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: next }),
      })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { menu: MenuData | null }
      setMenu(ensureIds(data.menu) || next)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1800)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 2500)
    }
  }, [])

  /* ── Helpers de estructura ── */
  const hasLocations = Boolean(menu?.locations && Object.keys(menu.locations).length > 0)
  const locationKeys = useMemo(() => (menu?.locations ? Object.keys(menu.locations) : []), [menu])

  const currentCategories: MenuCategory[] = useMemo(() => {
    if (!menu) return []
    if (hasLocations && selectedLocKey && menu.locations) {
      return menu.locations[selectedLocKey]?.categories || []
    }
    return menu.categories || []
  }, [menu, hasLocations, selectedLocKey])

  /** Devuelve un nuevo MenuData reemplazando las categorías del objetivo activo. */
  const withCategories = useCallback(
    (nextCats: MenuCategory[]): MenuData => {
      const base = menu || { categories: [] }
      if (hasLocations && selectedLocKey && base.locations) {
        return {
          ...base,
          locations: {
            ...base.locations,
            [selectedLocKey]: {
              ...base.locations[selectedLocKey],
              categories: nextCats,
            },
          },
        }
      }
      return { ...base, categories: nextCats }
    },
    [menu, hasLocations, selectedLocKey]
  )

  /* ── Mutaciones de items ── */
  const addItem = (catId: string, item: MenuItem) => {
    const nextCats = currentCategories.map((c) =>
      c.id === catId ? { ...c, items: [...c.items, { ...item, id: item.id || generateItemId() }] } : c
    )
    saveMenu(withCategories(nextCats))
  }

  const updateItem = (catId: string, item: MenuItem) => {
    const nextCats = currentCategories.map((c) =>
      c.id === catId
        ? { ...c, items: c.items.map((it) => (it.id === item.id ? item : it)) }
        : c
    )
    saveMenu(withCategories(nextCats))
  }

  const archiveItem = (catId: string, itemId: string) => {
    const nextCats = currentCategories.map((c) =>
      c.id === catId
        ? {
            ...c,
            items: c.items.map((it) =>
              it.id === itemId
                ? { ...it, archived: true, archivedAt: new Date().toISOString() }
                : it
            ),
          }
        : c
    )
    saveMenu(withCategories(nextCats))
  }

  const restoreItem = (catId: string, itemId: string) => {
    const nextCats = currentCategories.map((c) =>
      c.id === catId
        ? {
            ...c,
            items: c.items.map((it) =>
              it.id === itemId ? { ...it, archived: false, archivedAt: undefined } : it
            ),
          }
        : c
    )
    saveMenu(withCategories(nextCats))
  }

  const permanentlyDeleteItem = (catId: string, itemId: string) => {
    const nextCats = currentCategories.map((c) =>
      c.id === catId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c
    )
    saveMenu(withCategories(nextCats))
  }

  /* ── Mutaciones de categorías ── */
  const addCategory = (name: string, emoji: string) => {
    const newCat: MenuCategory = {
      id: generateItemId().replace('it_', 'cat_'),
      name,
      emoji: emoji || '🍴',
      items: [],
    }
    const nextCats = [...currentCategories, newCat]
    saveMenu(withCategories(nextCats))
    setExpandedCats((p) => ({ ...p, [newCat.id as string]: true }))
  }

  const updateCategory = (catId: string, name: string, emoji: string) => {
    const nextCats = currentCategories.map((c) =>
      c.id === catId ? { ...c, name, emoji: emoji || c.emoji } : c
    )
    saveMenu(withCategories(nextCats))
  }

  const deleteCategory = (catId: string) => {
    const nextCats = currentCategories.filter((c) => c.id !== catId)
    saveMenu(withCategories(nextCats))
  }

  /* ── Mutaciones de locations ── */
  const addLocation = (name: string) => {
    const base = menu || { categories: [] }
    const key = `sucursal-${locationKeys.length + 1}`
    const newLoc: MenuLocation = { name, categories: [] }
    const next: MenuData = { ...base, locations: { ...(base.locations || {}), [key]: newLoc } }
    saveMenu(next)
    setSelectedLocKey(key)
  }

  /* ── Búsqueda ── */
  const filteredCats = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return currentCategories
    return currentCategories
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (it) => it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.items.length > 0)
  }, [currentCategories, search])

  /* ── Items archivados del objetivo activo ── */
  const archivedItems = useMemo(() => {
    const out: { catId: string; catName: string; item: MenuItem }[] = []
    for (const c of currentCategories) {
      for (const it of c.items) {
        if (isItemArchived(it)) out.push({ catId: c.id as string, catName: c.name, item: it })
      }
    }
    return out
  }, [currentCategories])

  const totalActive = currentCategories.reduce((s, c) => s + c.items.filter((i) => !isItemArchived(i)).length, 0)

  /* ── UI helpers ── */
  const toggleCat = (id: string) => setExpandedCats((p) => ({ ...p, [id]: !p[id] }))
  const expandAll = () => {
    const all: Record<string, boolean> = {}
    currentCategories.forEach((c) => { if (c.id) all[c.id] = true })
    setExpandedCats(all)
  }
  const collapseAll = () => setExpandedCats({})

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        <p className="text-sm text-muted">Cargando tu menú...</p>
      </div>
    )
  }

  if (!meta) {
    return <div className="text-center py-20 text-muted">No se pudo cargar la información del negocio.</div>
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-accent/50 placeholder:text-muted/40 transition-colors'

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold">Editar menú</h1>
          <p className="text-muted text-sm mt-0.5">
            {meta.businessName}
            {hasLocations && selectedLocKey && menu?.locations?.[selectedLocKey]
              ? ` · ${menu.locations[selectedLocKey].name}`
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SaveBadge state={saveState} />
          {meta.slug && meta.status === 'active' && (
            <a
              href={`/site/${meta.slug}/menu`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 text-sm text-white/60 hover:text-white border border-white/[0.10] hover:border-white/[0.18] rounded-xl transition-all"
            >
              <ExternalLink size={14} /> Ver menú
            </a>
          )}
        </div>
      </div>

      {/* ── LOCATION SELECTOR ── */}
      {hasLocations && (
        <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <MapPin size={14} className="text-muted ml-1" />
          {locationKeys.map((key) => {
            const loc = menu?.locations?.[key]
            if (!loc) return null
            const active = key === selectedLocKey
            return (
              <button
                key={key}
                onClick={() => setSelectedLocKey(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active ? 'bg-accent/15 text-accent border border-accent/30' : 'text-muted hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {loc.name}
              </button>
            )
          })}
          <button
            onClick={() => {
              const name = prompt('Nombre de la nueva sucursal:')
              if (name && name.trim()) addLocation(name.trim())
            }}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white hover:bg-white/[0.05] flex items-center gap-1.5 transition-all"
          >
            <Plus size={12} /> Sucursal
          </button>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className={`${inputCls} pl-10`}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCatModal({ mode: 'add' })}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-white border border-white/[0.08] transition-all"
          >
            <FolderPlus size={14} /> Categoría
          </button>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              showArchived
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border-white/[0.08]'
            }`}
          >
            <Archive size={14} /> Archivados
            {archivedItems.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${showArchived ? 'bg-amber-500/20' : 'bg-white/[0.08]'}`}>
                {archivedItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="flex items-center gap-4 text-xs text-muted">
        <span>{currentCategories.length} categorías</span>
        <span className="text-white/10">·</span>
        <span>{totalActive} productos activos</span>
        {archivedItems.length > 0 && (
          <>
            <span className="text-white/10">·</span>
            <span className="text-amber-400/70">{archivedItems.length} archivados</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={expandAll} className="text-muted/60 hover:text-white transition-colors">Expandir todo</button>
          <span className="text-white/10">·</span>
          <button onClick={collapseAll} className="text-muted/60 hover:text-white transition-colors">Colapsar</button>
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {currentCategories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.10] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={24} className="text-muted/60" />
          </div>
          <h3 className="text-base font-semibold mb-1">Aún no hay categorías</h3>
          <p className="text-sm text-muted mb-5">Creá tu primera categoría para empezar a agregar productos.</p>
          <button
            onClick={() => setCatModal({ mode: 'add' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-light transition-all"
          >
            <Plus size={16} /> Crear categoría
          </button>
        </div>
      )}

      {/* ── CATEGORIES + ARCHIVED PANEL ── */}
      {currentCategories.length > 0 && (
        <div className={`grid gap-5 ${showArchived ? 'lg:grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>
          {/* Lista de categorías */}
          <div className="space-y-3">
            {filteredCats.map((cat) => {
              const id = cat.id as string
              const isOpen = expandedCats[id] ?? false
              const activeCount = cat.items.filter((i) => !isItemArchived(i)).length
              const archivedCount = cat.items.filter(isItemArchived).length
              return (
                <CategoryRow
                  key={id}
                  cat={cat}
                  businessName={meta.businessName}
                  isOpen={isOpen}
                  search={search}
                  activeCount={activeCount}
                  archivedCount={archivedCount}
                  onToggle={() => toggleCat(id)}
                  onAddItem={() => setItemModal({ mode: 'add', catId: id })}
                  onEditItem={(it) => setItemModal({ mode: 'edit', catId: id, item: it })}
                  onArchiveItem={(it) => setConfirm({ type: 'archive-item', catId: id, item: it })}
                  onEditCat={() => setCatModal({ mode: 'edit', cat: cat })}
                  onDeleteCat={() => setConfirm({ type: 'delete-cat', catId: id, catName: cat.name })}
                />
              )
            })}

            {filteredCats.length === 0 && search && (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center text-muted">
                <Search size={22} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No encontramos productos para &ldquo;{search}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Panel de archivados */}
          {showArchived && (
            <ArchivedPanel
              businessName={meta.businessName}
              items={archivedItems}
              onRestore={(catId, item) => setConfirm({ type: 'restore-item', catId, item })}
              onDelete={(catId, item) => setConfirm({ type: 'delete-item', catId, item })}
            />
          )}
        </div>
      )}

      {/* ── MODAL: ITEM (add/edit) ── */}
      {itemModal && (
        <ItemModal
          mode={itemModal.mode}
          item={itemModal.mode === 'edit' ? itemModal.item : undefined}
          businessName={meta.businessName}
          onClose={() => setItemModal(null)}
          onSubmit={(item) => {
            if (itemModal.mode === 'add') addItem(itemModal.catId, item)
            else updateItem(itemModal.catId, item)
            setItemModal(null)
          }}
        />
      )}

      {/* ── MODAL: CATEGORÍA (add/edit) ── */}
      {catModal && (
        <CategoryModal
          mode={catModal.mode}
          category={catModal.mode === 'edit' ? catModal.cat : undefined}
          onClose={() => setCatModal(null)}
          onSubmit={(name, emoji) => {
            if (catModal.mode === 'add') addCategory(name, emoji)
            else updateCategory(catModal.cat.id as string, name, emoji)
            setCatModal(null)
          }}
        />
      )}

      {/* ── MODAL: CONFIRMACIÓN ── */}
      {confirm && (
        <ConfirmDialog
          confirm={confirm}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.type === 'archive-item') archiveItem(confirm.catId, confirm.item.id as string)
            else if (confirm.type === 'restore-item') restoreItem(confirm.catId, confirm.item.id as string)
            else if (confirm.type === 'delete-item') permanentlyDeleteItem(confirm.catId, confirm.item.id as string)
            else if (confirm.type === 'delete-cat') deleteCategory(confirm.catId)
            setConfirm(null)
          }}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SAVE BADGE
   ═══════════════════════════════════════════════ */
function SaveBadge({ state }: { state: SaveState }) {
  if (state === 'idle') return null
  const cfg = {
    saving: { text: 'Guardando...', icon: Loader2, cls: 'text-white/60 bg-white/[0.05] border-white/[0.08]', spin: true },
    saved: { text: 'Guardado', icon: Check, cls: 'text-positive bg-positive/10 border-positive/20', spin: false },
    error: { text: 'Error al guardar', icon: AlertTriangle, cls: 'text-negative bg-negative/10 border-negative/20', spin: false },
  }[state]
  const Icon = cfg.icon
  return (
    <span className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border ${cfg.cls}`}>
      <Icon size={13} className={cfg.spin ? 'animate-spin' : ''} /> {cfg.text}
    </span>
  )
}

/* ═══════════════════════════════════════════════
   CATEGORY ROW
   ═══════════════════════════════════════════════ */
function CategoryRow({
  cat, businessName, isOpen, search, activeCount, archivedCount,
  onToggle, onAddItem, onEditItem, onArchiveItem, onEditCat, onDeleteCat,
}: {
  cat: MenuCategory
  businessName: string
  isOpen: boolean
  search: string
  activeCount: number
  archivedCount: number
  onToggle: () => void
  onAddItem: () => void
  onEditItem: (item: MenuItem) => void
  onArchiveItem: (item: MenuItem) => void
  onEditCat: () => void
  onDeleteCat: () => void
}) {
  const visibleItems = search
    ? cat.items.filter((i) => !isItemArchived(i))
    : cat.items.filter((i) => !isItemArchived(i))

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
        <button onClick={onToggle} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
          {isOpen ? <ChevronDown size={16} className="text-muted shrink-0" /> : <ChevronRight size={16} className="text-muted shrink-0" />}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{cat.name || 'Sin nombre'}</h3>
            <p className="text-[11px] text-muted">
              {activeCount} activo{activeCount !== 1 ? 's' : ''}
              {archivedCount > 0 && <span className="text-amber-400/60"> · {archivedCount} archivado{archivedCount !== 1 ? 's' : ''}</span>}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onAddItem} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-all">
            <Plus size={13} /> Producto
          </button>
          <button onClick={onEditCat} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-all" title="Editar categoría">
            <Pencil size={14} />
          </button>
          <button onClick={onDeleteCat} className="p-1.5 rounded-lg text-muted hover:text-negative hover:bg-negative/10 transition-all" title="Eliminar categoría">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Items */}
      {isOpen && (
        <div className="p-2">
          {visibleItems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted mb-3">Sin productos en esta categoría</p>
              <button onClick={onAddItem} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white transition-all">
                <Plus size={13} /> Agregar producto
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleItems.map((it) => (
                <ItemRow
                  key={it.id as string}
                  item={it}
                  businessName={businessName}
                  onEdit={() => onEditItem(it)}
                  onArchive={() => onArchiveItem(it)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ITEM ROW
   ═══════════════════════════════════════════════ */
function ItemRow({ item, businessName, onEdit, onArchive }: {
  item: MenuItem
  businessName: string
  onEdit: () => void
  onArchive: () => void
}) {
  const fmt = (n: number) => `₡${n.toLocaleString('es-CR')}`
  const img = imageForItem(item.name, item.image, businessName)

  return (
    <div className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
      <GripVertical size={14} className="text-white/10 shrink-0 hidden sm:block" />

      {/* Imagen — misma presentación que en el menú real (contain, fondo oscuro, padding) */}
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/[0.06] flex items-center justify-center" style={{ background: 'rgba(18,20,16,0.95)' }}>
        <img src={img} alt={item.name} className="w-full h-full object-contain p-1.5 drop-shadow-xl" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name || 'Sin nombre'}</p>
        {item.desc && <p className="text-xs text-muted truncate">{item.desc}</p>}
      </div>

      {/* Precio */}
      <span className="text-sm font-bold text-accent shrink-0 tabular-nums">{fmt(item.price)}</span>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.08] transition-all" title="Editar">
          <Pencil size={14} />
        </button>
        <button onClick={onArchive} className="p-1.5 rounded-lg text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Archivar (ocultar del menú)">
          <Archive size={14} />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ARCHIVED PANEL
   ═══════════════════════════════════════════════ */
function ArchivedPanel({ businessName, items, onRestore, onDelete }: {
  businessName: string
  items: { catId: string; catName: string; item: MenuItem }[]
  onRestore: (catId: string, item: MenuItem) => void
  onDelete: (catId: string, item: MenuItem) => void
}) {
  return (
    <aside className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] overflow-hidden lg:sticky lg:top-24 h-fit">
      <div className="px-4 py-3 border-b border-amber-500/15 flex items-center gap-2">
        <Archive size={15} className="text-amber-400" />
        <h3 className="font-semibold text-sm text-amber-400">Archivados</h3>
        <span className="ml-auto text-[11px] text-amber-400/60 font-medium">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted">No hay productos archivados</p>
          <p className="text-[11px] text-muted/60 mt-1">Los items que archives aparecerán acá y se pueden restaurar.</p>
        </div>
      ) : (
        <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1.5">
          {items.map(({ catId, catName, item }) => (
            <div key={item.id as string} className="flex items-center gap-2.5 p-2 rounded-xl bg-black/20 border border-white/[0.04]">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/[0.06] flex items-center justify-center" style={{ background: 'rgba(18,20,16,0.95)' }}>
                <img src={imageForItem(item.name, item.image, businessName)} alt={item.name} className="w-full h-full object-contain p-1 drop-shadow-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-muted truncate">{catName}</p>
              </div>
              <button
                onClick={() => onRestore(catId, item)}
                className="p-1.5 rounded-lg text-muted hover:text-positive hover:bg-positive/10 transition-all"
                title="Restaurar"
              >
                <ArchiveRestore size={13} />
              </button>
              <button
                onClick={() => onDelete(catId, item)}
                className="p-1.5 rounded-lg text-muted hover:text-negative hover:bg-negative/10 transition-all"
                title="Eliminar permanentemente"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

/* ═══════════════════════════════════════════════
   ITEM MODAL (add / edit)
   ═══════════════════════════════════════════════ */

/** Procesa un archivo de imagen: redimensiona a maxSize y comprime a JPEG. */
function processImageFile(file: File, maxSize = 400, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen'))
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize }
        } else {
          if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No se pudo procesar la imagen')); return }
        ctx.drawImage(img, 0, 0, width, height)
        // PNG con transparencia → mantener PNG; resto → JPEG
        const isPng = file.type === 'image/png'
        const dataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality)
        // Evitar data URLs descomunales (> 500 KB de string ≈ ~375 KB de imagen)
        if (dataUrl.length > 500_000) {
          reject(new Error('La imagen es muy grande. Probá con una más pequeña.'))
          return
        }
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

function ItemModal({ mode, item, businessName, onClose, onSubmit }: {
  mode: 'add' | 'edit'
  item?: MenuItem
  businessName: string
  onClose: () => void
  onSubmit: (item: MenuItem) => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [desc, setDesc] = useState(item?.desc || '')
  const [price, setPrice] = useState<string>(item ? String(item.price) : '')
  const [image, setImage] = useState(item?.image || '')
  const [error, setError] = useState('')
  const [imgLoading, setImgLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const previewSrc = image.trim() || imageForItem(name.trim(), undefined, businessName)

  const handleFile = async (file: File) => {
    setImgLoading(true)
    setError('')
    try {
      const dataUrl = await processImageFile(file)
      setImage(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen')
    }
    setImgLoading(false)
  }

  const submit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) { setError('El nombre es obligatorio'); return }
    const priceNum = Number(price)
    if (!Number.isFinite(priceNum) || priceNum < 0) { setError('Precio inválido'); return }

    const next: MenuItem = {
      id: item?.id || generateItemId(),
      name: trimmedName,
      desc: desc.trim(),
      price: Math.round(priceNum),
    }
    const trimmedImage = image.trim()
    if (trimmedImage) next.image = trimmedImage
    onSubmit(next)
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-accent/50 placeholder:text-muted/40 transition-colors'

  return (
    <ModalShell onClose={onClose} title={mode === 'add' ? 'Agregar producto' : 'Editar producto'}>
      <div className="space-y-4">
        {/* Preview + cambiar imagen */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/[0.06] flex items-center justify-center group" style={{ background: 'rgba(18,20,16,0.95)' }}>
            {previewSrc ? (
              <img src={previewSrc} alt="preview" className="w-full h-full object-contain p-2 drop-shadow-xl" />
            ) : (
              <ImageIcon size={22} className="text-white/15" />
            )}
            {imgLoading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 size={18} className="animate-spin text-white/70" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{name || 'Nombre del producto'}</p>
            <p className="text-xs text-accent font-bold mb-2">
              {price && Number.isFinite(Number(price)) ? `₡${Number(price).toLocaleString('es-CR')}` : '₡0'}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={imgLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
              >
                {imgLoading ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                {image ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-negative hover:bg-negative/10 transition-all"
                >
                  <X size={12} /> Quitar
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted/50 mt-1.5">
              {image ? 'Imagen personalizada' : 'Se usa la imagen por defecto según el nombre'}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Nombre *</label>
          <input value={name} onChange={(e) => { setName(e.target.value); setError('') }} autoFocus className={inputCls} placeholder="Ej: Cheeseburger" />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Descripción</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Ingredientes, detalles..." />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Precio (colones) *</label>
          <input type="number" min={0} step={100} value={price} onChange={(e) => { setPrice(e.target.value); setError('') }} className={inputCls} placeholder="4500" />
        </div>

        {error && <p className="text-xs text-negative flex items-center gap-1.5"><AlertTriangle size={12} /> {error}</p>}
      </div>

      <ModalFooter
        onClose={onClose}
        onSubmit={submit}
        submitLabel={mode === 'add' ? 'Agregar' : 'Guardar cambios'}
      />
    </ModalShell>
  )
}

/* ═══════════════════════════════════════════════
   CATEGORY MODAL (add / edit)
   ═══════════════════════════════════════════════ */
function CategoryModal({ mode, category, onClose, onSubmit }: {
  mode: 'add' | 'edit'
  category?: MenuCategory
  onClose: () => void
  onSubmit: (name: string, emoji: string) => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [error, setError] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('El nombre es obligatorio'); return }
    // Se conserva el emoji existente en la data por compatibilidad, pero ya no se muestra ni edita.
    onSubmit(trimmed, category?.emoji || '🍴')
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-accent/50 placeholder:text-muted/40 transition-colors'

  return (
    <ModalShell onClose={onClose} title={mode === 'add' ? 'Nueva categoría' : 'Editar categoría'}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1.5">Nombre *</label>
          <input value={name} onChange={(e) => { setName(e.target.value); setError('') }} autoFocus className={inputCls} placeholder="Ej: Hamburguesas" />
        </div>
        {error && <p className="text-xs text-negative flex items-center gap-1.5"><AlertTriangle size={12} /> {error}</p>}
      </div>

      <ModalFooter
        onClose={onClose}
        onSubmit={submit}
        submitLabel={mode === 'add' ? 'Crear categoría' : 'Guardar cambios'}
      />
    </ModalShell>
  )
}

/* ═══════════════════════════════════════════════
   CONFIRM DIALOG
   ═══════════════════════════════════════════════ */
function ConfirmDialog({ confirm, onClose, onConfirm }: {
  confirm:
    | { type: 'archive-item'; catId: string; item: MenuItem }
    | { type: 'restore-item'; catId: string; item: MenuItem }
    | { type: 'delete-item'; catId: string; item: MenuItem }
    | { type: 'delete-cat'; catId: string; catName: string }
  onClose: () => void
  onConfirm: () => void
}) {
  const cfg = {
    'archive-item': {
      title: 'Archivar producto',
      body: (<>¿Ocultar <strong className="text-white">{confirm.type === 'archive-item' ? confirm.item.name : ''}</strong> del menú público?</>),
      hint: 'Se puede restaurar desde el panel de archivados. No se elimina permanentemente.',
      btn: 'Archivar',
      danger: false,
      icon: Archive,
      iconCls: 'text-amber-400 bg-white/[0.04]',
    },
    'restore-item': {
      title: 'Restaurar producto',
      body: (<>¿Volver a mostrar <strong className="text-white">{confirm.type === 'restore-item' ? confirm.item.name : ''}</strong> en el menú?</>),
      hint: 'El producto volverá a estar visible para los clientes.',
      btn: 'Restaurar',
      danger: false,
      icon: ArchiveRestore,
      iconCls: 'text-positive bg-white/[0.04]',
    },
    'delete-item': {
      title: 'Eliminar permanentemente',
      body: (<>¿Eliminar <strong className="text-white">{confirm.type === 'delete-item' ? confirm.item.name : ''}</strong> para siempre?</>),
      hint: 'Esta acción no se puede deshacer.',
      btn: 'Eliminar',
      danger: true,
      icon: Trash2,
      iconCls: '',
    },
    'delete-cat': {
      title: 'Eliminar categoría',
      body: (<>¿Eliminar la categoría <strong className="text-white">{confirm.type === 'delete-cat' ? confirm.catName : ''}</strong> y todos sus productos?</>),
      hint: 'Esta acción no se puede deshacer.',
      btn: 'Eliminar',
      danger: true,
      icon: Trash2,
      iconCls: '',
    },
  }[confirm.type]

  const Icon = cfg.icon

  return (
    <ModalShell onClose={onClose} title={cfg.title} narrow>
      <div className="space-y-4">
        <div className={`p-4 rounded-xl border ${cfg.danger ? 'bg-negative/5 border-negative/15' : 'bg-white/[0.02] border-white/[0.06]'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.danger ? 'bg-negative/10 text-negative' : cfg.iconCls}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 text-sm text-muted leading-relaxed">
              {cfg.body}
              <p className="text-xs text-muted/60 mt-2">{cfg.hint}</p>
            </div>
          </div>
        </div>
      </div>
      <ModalFooter
        onClose={onClose}
        onSubmit={onConfirm}
        submitLabel={cfg.btn}
        danger={cfg.danger}
      />
    </ModalShell>
  )
}

/* ═══════════════════════════════════════════════
   MODAL SHELL (reutilizable)
   ═══════════════════════════════════════════════ */
function ModalShell({ children, onClose, title, narrow }: {
  children: React.ReactNode
  onClose: () => void
  title: string
  narrow?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm modal-overlay" onClick={onClose} />
      <div
        className={`relative w-full ${narrow ? 'sm:max-w-md' : 'sm:max-w-lg'} mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl bg-bg-elevated border border-white/[0.08] shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col modal-panel-mobile sm:modal-panel-desktop`}
      >
        <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <h2 className="font-heading font-bold text-base sm:text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/[0.06] transition-colors border border-white/[0.04]">
            <X size={16} className="text-white/40" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MODAL FOOTER (reutilizable)
   ═══════════════════════════════════════════════ */
function ModalFooter({ onClose, onSubmit, submitLabel, danger }: {
  onClose: () => void
  onSubmit: () => void
  submitLabel: string
  danger?: boolean
}) {
  return (
    <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/[0.06]" style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}>
      <button
        onClick={onClose}
        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-white hover:bg-white/[0.06] transition-all"
      >
        Cancelar
      </button>
      <button
        onClick={onSubmit}
        className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
          danger ? 'bg-negative text-white hover:bg-negative/90' : 'bg-accent text-white hover:bg-accent-light'
        }`}
      >
        {submitLabel}
      </button>
    </div>
  )
}
