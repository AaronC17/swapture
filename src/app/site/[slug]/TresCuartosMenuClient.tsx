'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  ArrowLeft, Phone, ShoppingCart, Plus, Minus, Trash2,
  X, ChevronRight, Flame, Star,
  CheckCircle2, Clock, MapPin, Search, User, Smartphone, Home, Truck,
  CupSoda
} from 'lucide-react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface MenuItem { name: string; desc: string; price: number; top?: boolean }
interface MenuCategory { name: string; emoji: string; items: MenuItem[] }
interface MenuData { categories: MenuCategory[]; hours?: string; locations?: string[]; style?: string }

interface MenuSiteData {
  slug: string
  businessName: string
  whatsappNumber: string
  menuData: MenuData
  locationName?: string
  locationPhone?: string
  locationPhone2?: string
  locationSlug?: string
}

interface CartItem { name: string; price: number; qty: number }
interface PersistedChatLeadState {
  updatedAt?: number
  leadData?: {
    name?: string
    phone?: string
  }
}

/* ═══════════════════════════════════════════════
   VARIANT GROUPING
   ═══════════════════════════════════════════════ */
interface Variant { label: string; fullName: string; price: number; top?: boolean }
interface DisplayItem { baseName: string; desc: string; variants: Variant[]; kind: 'size' | 'liquid' | 'single' }

const SIZE_SUFFIXES = ['Small', 'Large', 'XL'] as const
const LIQUID_SUFFIXES = ['(Agua)', '(Leche)'] as const
const QTY_SUFFIXES = ['x6', 'x12'] as const
const SIZE_SHORT: Record<string, string> = { Small: 'S', Large: 'XL', XL: 'XL' }

function groupItems(items: MenuItem[]): DisplayItem[] {
  const groups = new Map<string, DisplayItem>()
  const order: string[] = []
  for (const item of items) {
    let matched = false
    for (const suf of SIZE_SUFFIXES) {
      if (item.name.endsWith(` ${suf}`)) {
        const base = item.name.slice(0, -(suf.length + 1))
        if (!groups.has(base)) { groups.set(base, { baseName: base, desc: item.desc, variants: [], kind: 'size' }); order.push(base) }
        groups.get(base)!.variants.push({ label: suf, fullName: item.name, price: item.price, top: item.top })
        matched = true; break
      }
    }
    if (!matched) {
      for (const suf of LIQUID_SUFFIXES) {
        if (item.name.endsWith(` ${suf}`)) {
          const base = item.name.slice(0, -(suf.length + 1))
          if (!groups.has(base)) { groups.set(base, { baseName: base, desc: item.desc, variants: [], kind: 'liquid' }); order.push(base) }
          groups.get(base)!.variants.push({ label: suf === '(Agua)' ? 'Agua' : 'Leche', fullName: item.name, price: item.price, top: item.top })
          matched = true; break
        }
      }
    }
    if (!matched) {
      for (const suf of QTY_SUFFIXES) {
        if (item.name.endsWith(` ${suf}`)) {
          const base = item.name.slice(0, -(suf.length + 1))
          if (!groups.has(base)) { groups.set(base, { baseName: base, desc: item.desc, variants: [], kind: 'size' }); order.push(base) }
          groups.get(base)!.variants.push({ label: suf, fullName: item.name, price: item.price, top: item.top })
          matched = true; break
        }
      }
    }
    if (!matched) {
      groups.set(item.name, { baseName: item.name, desc: item.desc, variants: [{ label: '', fullName: item.name, price: item.price, top: item.top }], kind: 'single' })
      order.push(item.name)
    }
  }
  return order.map(k => groups.get(k)!)
}

/* ═══════════════════════════════════════════════
   CONSTANTS — Tres Cuartos Streetfood
   ═══════════════════════════════════════════════ */
const ORANGE = '#d97706'   // naranja/ámbar del logo — acento
const GREEN = '#028448'    // verde del logo — principal
const GREEN_SOFT = '#028448cc' // verde suave para textos grandes
const CREAM = '#f5e6b8'    // crema — realce
const LOGO = '/trescuartos/logo.jpg'
const fmt = (n: number) => `₡${n.toLocaleString('es-CR')}`

/* Reusable Streetfood wordmark: all orange */
const StreetFoodMark = ({ className = '' }: { className?: string }) => (
  <span className={className} style={{ color: ORANGE }}>Streetfood</span>
)

import { tresCuartosItemImages, fallbackImage } from '@/lib/menu-images'

/* Extract base product name from a bundled cart item (e.g. "Alitas (6 pzas) + Queso, Tocineta" → "Alitas (6 pzas)") */
const baseNameFromCart = (name: string) => {
  const idx = name.indexOf(' + ')
  return idx >= 0 ? name.slice(0, idx) : name
}
const imgFor = (name: string) => tresCuartosItemImages[name] || tresCuartosItemImages[baseNameFromCart(name)] || fallbackImage

const drinkNames = (menuData: MenuData | undefined) => {
  const set = new Set<string>()
  menuData?.categories?.forEach((cat) => {
    if (cat.name === 'Bebidas') {
      cat.items.forEach((item) => set.add(item.name))
    }
  })
  return set
}

const isDrink = (name: string, menuData: MenuData | undefined) => drinkNames(menuData).has(name)

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export default function TresCuartosMenuClient({ data }: { data: MenuSiteData }) {
  const menu = data.menuData
  const [activeCat, setActiveCat] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  /* ── Extract "Adicionales" from categories: shown as in-modal add-ons, not as a menu tab ── */
  const { displayCategories, addons } = useMemo(() => {
    const ads: MenuItem[] = []
    const cats: MenuCategory[] = []
    for (const cat of menu.categories) {
      if (cat.name.trim().toLowerCase() === 'adicionales') {
        ads.push(...cat.items)
      } else {
        cats.push(cat)
      }
    }
    return { displayCategories: cats, addons: ads }
  }, [menu.categories])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 120)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Cart state ── */
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  /* ── Checkout flow ── */
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'info' | 'confirm'>('cart')
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custOrderType, setCustOrderType] = useState<'recoger' | 'envio'>('recoger')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [addedItem, setAddedItem] = useState<string | null>(null)
  const [cartBumped, setCartBumped] = useState(false)
  const [variantSel, setVariantSel] = useState<Record<string, string>>({})

  /* ── Product detail modal ── */
  const [modalItem, setModalItem] = useState<DisplayItem | null>(null)
  const [modalQty, setModalQty] = useState(1)
  const [modalAddons, setModalAddons] = useState<string[]>([])
  const [modalCatName, setModalCatName] = useState<string>('')

  const openModal = useCallback((di: DisplayItem, catName: string) => {
    setModalItem(di)
    setModalCatName(catName)
    setModalQty(1)
    setModalAddons([])
  }, [])
  const closeModal = useCallback(() => {
    setModalItem(null)
    setModalCatName('')
    setModalQty(1)
    setModalAddons([])
  }, [])

  /* ── Bloquear scroll del body cuando un modal esté abierto ── */
  useEffect(() => {
    const blocked = cartOpen || modalItem !== null
    if (blocked) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [cartOpen, modalItem])

  const modalVariant = useMemo(() => {
    if (!modalItem) return null
    if (modalItem.kind === 'single') return modalItem.variants[0]
    return modalItem.variants.find(v => v.fullName === variantSel[modalItem.baseName]) ?? modalItem.variants[0]
  }, [modalItem, variantSel])

  /* ── Adicionales visibles según la categoría del item abierto ── */
  const visibleAddons = useMemo(() => {
    const cat = modalCatName.trim().toLowerCase()
    if (!cat) return addons
    // En Malteadas no se muestran adicionales
    if (cat === 'malteadas') return []
    // En Aperitivos se omiten "Papas grandes" y "Torta de carne"
    if (cat === 'aperitivos') {
      return addons.filter(a => !/^papas grandes/i.test(a.name.trim()) && !/^torta de carne/i.test(a.name.trim()))
    }
    return addons
  }, [addons, modalCatName])

  const modalAddonsTotal = useMemo(() => {
    return modalAddons.reduce((s, name) => {
      const a = visibleAddons.find(x => x.name === name)
      return s + (a?.price || 0)
    }, 0)
  }, [modalAddons, visibleAddons])

  const modalUnitPrice = (modalVariant?.price || 0) + modalAddonsTotal
  const modalTotalPrice = modalUnitPrice * modalQty

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`swapture-chat:${data.slug}`)
      if (!raw) return

      const parsed = JSON.parse(raw) as PersistedChatLeadState
      const isExpired = typeof parsed.updatedAt === 'number' && Date.now() - parsed.updatedAt > 24 * 60 * 60 * 1000
      if (isExpired) return

      const savedName = String(parsed.leadData?.name || '').trim()
      const savedPhone = String(parsed.leadData?.phone || '').trim()

      if (savedName) setCustName((prev) => (prev.trim() ? prev : savedName))
      if (savedPhone) setCustPhone((prev) => (prev.trim() ? prev : savedPhone))
    } catch {
      // Ignore malformed local storage data and continue with empty fields.
    }
  }, [data.slug])

  const addToCart = useCallback((item: MenuItem | { name: string; price: number }) => {
    setCart(prev => {
      const ex = prev.find(c => c.name === item.name)
      if (ex) return prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { name: item.name, price: item.price, qty: 1 }]
    })
    setAddedItem(item.name)
    setCartBumped(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setCartBumped(true)))
    setTimeout(() => setAddedItem(null), 1400)
    setTimeout(() => setCartBumped(false), 700)
  }, [])

  const removeFromCart = (name: string) => setCart(prev => prev.filter(c => c.name !== name))
  const updateQty = (name: string, d: number) => {
    setCart(prev => prev.map(c => c.name !== name ? c : { ...c, qty: Math.max(0, c.qty + d) }).filter(c => c.qty > 0))
  }

  const buildOrderMsg = () => {
    const lines = cart.map(c => `  • ${c.qty}x ${c.name} — ${fmt(c.price * c.qty)}`)
    const locLabel = data.locationName ? ` (${data.locationName})` : ''
    const nameLabel = custName ? `\nCliente: ${custName}` : ''
    const phoneLabel = custPhone ? `\nTeléfono: ${custPhone}` : ''
    const typeLabel = `\nTipo: ${custOrderType === 'recoger' ? 'Para recoger' : 'Envío a domicilio'}`
    return `Nuevo pedido — Tres Cuartos Streetfood${locLabel}${nameLabel}${phoneLabel}${typeLabel}\n\n${lines.join('\n')}\n\nTotal: ${fmt(cartTotal)}\n\n¡Gracias por tu orden!`
  }

  const sendOrderWA = () => {
    if (!data.whatsappNumber || !cart.length) return
    window.open(`https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(buildOrderMsg())}`, '_blank')
    fetch(`/api/site/${data.slug}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: custName || 'Pedido WhatsApp (Menú)',
        phone: custPhone || data.whatsappNumber,
        message: cart.map(c => `${c.qty}x ${c.name}`).join(', '),
        source: 'whatsapp-menu',
        orderDetails: JSON.stringify(cart),
        totalAmount: cartTotal,
      }),
    }).catch(() => {})
    setOrderSent(true)
    setCart([])
    setCartOpen(false)
    setCheckoutStep('cart')
    setCustName('')
    setCustPhone('')
    setCustOrderType('recoger')
    setTimeout(() => setOrderSent(false), 4000)
  }

  const waLink = data.whatsappNumber
    ? `https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, quiero hacer un pedido en ${data.businessName}${data.locationName ? ` — ${data.locationName}` : ''}`)}`
    : null

  /* ── Search ── */
  const filteredItems = searchQuery.trim()
    ? displayCategories.flatMap(cat => cat.items.filter(item => {
        const q = searchQuery.toLowerCase()
        return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
      }).map(item => ({ ...item, catName: cat.name })))
    : []

  const totalItems = displayCategories.reduce((s, c) => s + c.items.length, 0)

  useEffect(() => {
    if (tabsRef.current) {
      const btn = tabsRef.current.children[activeCat] as HTMLElement | undefined
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeCat])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    if (modalItem) {
      const scrollY = window.scrollY
      const html = document.documentElement
      const body = document.body
      const originalHtmlOverflow = html.style.overflow
      const originalBodyOverflow = body.style.overflow
      const originalBodyPosition = body.style.position
      const originalBodyTop = body.style.top
      const originalBodyWidth = body.style.width
      const originalBodyTouchAction = body.style.touchAction

      window.addEventListener('keydown', onKey)
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.width = '100%'
      body.style.touchAction = 'none'

      return () => {
        window.removeEventListener('keydown', onKey)
        html.style.overflow = originalHtmlOverflow
        body.style.overflow = originalBodyOverflow
        body.style.position = originalBodyPosition
        body.style.top = originalBodyTop
        body.style.width = originalBodyWidth
        body.style.touchAction = originalBodyTouchAction
        window.scrollTo(0, scrollY)
      }
    }
  }, [modalItem, closeModal])

  return (
    <div className="relative min-h-screen max-w-full overflow-x-clip text-white selection:bg-[#f8ae1b]/30" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #080808 35%, #0c0c0c 70%, #080808 100%)' }}>
      {/* Ambient warm glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${GREEN}04, transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, ${GREEN}02, transparent 60%)` }} />

      {/* ═══════ FLOATING NAV ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-3 sm:mx-8 mt-3 sm:mt-4">
          <div className={`max-w-6xl mx-auto flex items-center justify-between h-12 sm:h-14 px-4 sm:px-5 rounded-2xl transition-all duration-500 border ${scrolled ? 'bg-[#0b0f0b]/95 backdrop-blur-2xl border-white/[0.08]' : 'bg-black/40 backdrop-blur-xl border-white/[0.04]'}`} style={{ boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.2)' }}>
            {/* Back */}
            <Link href={`/site/${data.slug}`} className="flex items-center gap-2 text-white/50 hover:text-white transition-all group">
              <span className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] hidden sm:inline">Inicio</span>
            </Link>

            {/* Center brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: GREEN }}>
                <img src={LOGO} alt="Tres Cuartos" className="w-full h-full object-cover" />
              </div>
              <div className="leading-none">
                <span className="text-xs font-black tracking-tight uppercase" style={{ color: GREEN_SOFT }}>Tres Cuartos</span>
                <p className="text-[7px] sm:text-[8px] font-bold tracking-[0.2em] uppercase" style={{ color: `${GREEN}cc` }}>
                  {data.locationName || 'Menú'}
                </p>
              </div>
            </div>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-[11px] font-bold transition-colors hover:scale-105 active:scale-95 ${cartBumped ? 'cart-bump' : ''}`}
              style={{
                background: cartBumped ? `${GREEN}22` : 'rgba(255,255,255,0.04)',
                color: cartCount > 0 ? GREEN : 'rgba(255,255,255,0.5)',
                border: `1px solid ${cartCount > 0 ? `${GREEN}40` : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <ShoppingCart size={13} />
              {cartCount > 0 && (
                <span className="text-[10px] font-black" style={{ color: GREEN }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO BANNER ═══════ */}
      <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden flex items-center justify-center" style={{ background: '#0b0f0b' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f0b] via-transparent to-[#0b0f0b]/60" />

        <div className="relative z-10 flex flex-col items-center justify-end h-full w-full max-w-6xl mx-auto px-5 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.06] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: GREEN }}>
                <Star size={9} className="fill-current" /> {data.locationName || <StreetFoodMark />}
              </div>
              {data.locationPhone && (
                <div className="inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-xl border border-white/[0.06] text-[9px] font-medium text-white/50 break-all">
                  <Phone size={8} /> {`${data.locationPhone}${data.locationPhone2 ? ` / ${data.locationPhone2}` : ''}`}
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[0.9] text-center">
              Nuestro <span style={{ color: GREEN }}>Men&uacute;</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-white/40 mt-1.5 font-medium text-center">
              {displayCategories.length} categorías · {totalItems} productos
            </p>
        </div>
      </div>

      {/* ═══════ SEARCH / INFO BAR ═══════ */}
      <div className="border-b border-white/[0.05] bg-[#0b0f0b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-center gap-2">
            <button
              onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery('') }}
              className={`flex items-center gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all ${searchOpen ? 'bg-white/[0.08] text-white/60' : 'bg-white/[0.04] border border-white/[0.06] text-white/45 hover:text-white/60 hover:bg-white/[0.06]'}`}
            >
              <Search size={11} /> <span className="hidden sm:inline">Buscar</span>
            </button>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[#25D366]/8 text-[#25D366] border border-[#25D366]/12 hover:bg-[#25D366]/15 transition-all shrink-0">
                <Phone size={10} /> <span className="hidden sm:inline">Pedir</span>
              </a>
            )}
        </div>

        {searchOpen && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-3">
            <div className="relative">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en el menú..."
                autoFocus
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[16px] text-white placeholder:text-white/25 outline-none focus:border-white/[0.15] transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════ SEARCH RESULTS ═══════ */}
      {searchQuery.trim() && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          <p className="text-[10px] sm:text-xs text-white/40 mb-5 font-medium">{filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para &ldquo;{searchQuery}&rdquo;</p>
          {filteredItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, idx) => {
                const inCart = cart.find(c => c.name === item.name)
                const drink = isDrink(item.name, menu)
                const img = drink ? undefined : (tresCuartosItemImages[item.name] || fallbackImage)
                return (
                  <div key={idx} className="group flex gap-3.5 p-3 rounded-2xl border border-white/[0.07] bg-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                    <div className="w-[80px] h-[80px] rounded-xl overflow-hidden shrink-0 border border-white/[0.04]" style={{ background: 'rgba(18,22,18,0.95)' }}>
                      {drink ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <CupSoda size={28} className="text-white/30" />
                        </div>
                      ) : (
                        <img src={img} alt={item.name} className="w-full h-full object-contain p-1.5 drop-shadow-xl" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-white/35 mb-0.5">{item.catName}</p>
                        <h4 className="font-bold text-[13px] truncate leading-tight">{item.name}</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-black" style={{ color: GREEN }}>{fmt(item.price)}</span>
                        {inCart ? (
                          <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
                            <button onClick={() => updateQty(item.name, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10"><Minus size={11} /></button>
                            <span className="w-5 text-center text-[11px] font-bold">{inCart.qty}</span>
                            <button onClick={() => updateQty(item.name, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10"><Plus size={11} /></button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform" style={{ background: GREEN }}>
                            <Plus size={13} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-white/15">
              <Search size={24} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No encontramos &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════ CATEGORY TABS ═══════ */}
      {!searchQuery.trim() && (
        <>
          <div className="sticky top-[3.25rem] sm:top-[3.75rem] z-40 backdrop-blur-2xl border-b border-white/[0.06]" style={{ background: 'rgba(11,15,11,0.97)' }}>
            <div className="max-w-6xl mx-auto">
              <div ref={tabsRef} className="flex gap-1.5 overflow-x-auto px-3 sm:px-8 py-2.5 sm:py-3 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                {displayCategories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCat(i)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all snap-start ${
                      activeCat === i
                        ? 'text-black'
                        : 'text-white/45 bg-white/[0.04] hover:text-white/65 hover:bg-white/[0.07]'
                    }`}
                    style={activeCat === i ? { background: GREEN, boxShadow: `0 2px 15px ${GREEN}25` } : undefined}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════ MENU ITEMS ═══════ */}
          <main className="relative max-w-6xl mx-auto w-full px-3 sm:px-8 py-4 sm:py-8 pb-28 overflow-x-clip">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full blur-[140px] opacity-[0.04] pointer-events-none" style={{ background: GREEN }} />
            {displayCategories.map((cat, ci) => ci === activeCat && (
              <div key={ci} className="relative">
                {/* Category header */}
                <div className="mb-4 sm:mb-7">
                    <div className="flex items-center gap-3 mb-2.5 sm:mb-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}22` }}>
                        <span className="text-sm sm:text-base font-black" style={{ color: GREEN }}>{cat.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-sm sm:text-xl font-black uppercase tracking-tight leading-tight">{cat.name}</h2>
                        <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5 font-medium">{cat.items.length} opciones disponibles</p>
                      </div>
                    </div>
                    <div className="h-px" style={{ background: `linear-gradient(90deg, ${GREEN}22, ${GREEN}08, transparent)` }} />
                </div>

                {/* Items grid */}
                {(() => {
                  const grouped = groupItems(cat.items)
                  const total = grouped.length
                  return (
                    <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
                      {grouped.map((di, idx) => {
                        const selV = di.kind === 'single'
                          ? di.variants[0]
                          : (di.variants.find(v => v.fullName === variantSel[di.baseName]) ?? di.variants[0])
                        const inCart = cart.find(c => c.name === selV.fullName)
                        const drink = isDrink(di.baseName, menu)
                        const img = drink ? undefined : (tresCuartosItemImages[di.baseName] || tresCuartosItemImages[selV.fullName] || fallbackImage)
                        const justAdded = addedItem === selV.fullName
                        const isLoneOnMobile = total % 2 === 1 && idx === total - 1
                        const isLoneOnDesktop = total % 3 === 1 && idx === total - 1

                        return (
                          <div
                            key={idx}
                            className={`group relative rounded-xl sm:rounded-2xl overflow-hidden duration-300 ${justAdded ? 'item-pop' : ''} ${isLoneOnMobile ? 'col-span-2 max-w-[48%] mx-auto w-full lg:col-span-1 lg:max-w-full lg:mx-0' : ''} ${isLoneOnDesktop ? 'lg:col-start-2' : ''}`}
                            style={{
                              background: 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
                              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${justAdded ? `${GREEN}55` : 'rgba(255,255,255,0.07)'}, 0 8px 32px rgba(0,0,0,0.35)`,
                              transition: 'box-shadow 0.3s ease',
                            }}
                          >
                            {/* Image */}
                            <div
                              onClick={() => openModal(di, cat.name)}
                              className="relative h-36 sm:h-48 lg:h-52 overflow-hidden cursor-pointer"
                              style={{ background: 'rgba(18,18,18,0.95)' }}
                            >
                              {drink ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <CupSoda size={48} className="text-white/30" />
                                </div>
                              ) : (
                                <img
                                  src={img}
                                  alt={di.baseName}
                                  className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-[1.04] transition-transform duration-500 drop-shadow-2xl"
                                  loading="lazy"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f0b] via-transparent to-transparent opacity-80" />

                              {/* Price pill */}
                              <div key={selV.fullName} className="price-flip absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-xl bg-black/60 border border-white/[0.08]">
                                <span className="text-[11px] sm:text-[13px] font-black" style={{ color: GREEN }}>{fmt(selV.price)}</span>
                              </div>

                              {/* Top tag */}
                              {selV.top && (
                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 rounded-md backdrop-blur-xl bg-black/60 border border-white/[0.08]">
                                  <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5" style={{ color: CREAM }}>
                                    <Star size={6} className="fill-current" /> Top
                                  </span>
                                </div>
                              )}

                              {/* Added animation */}
                              {justAdded && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
                                      style={{ background: GREEN, animation: 'checkIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
                                    >
                                      <CheckCircle2 size={18} className="text-black" strokeWidth={3} />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-2.5 sm:p-4">
                              <h3 className="font-bold text-[12px] sm:text-sm leading-tight mb-0.5 sm:mb-1 line-clamp-1 break-words">{di.baseName}</h3>
                              <p className="text-[9px] sm:text-[10px] text-white/50 leading-relaxed line-clamp-2 min-h-[26px] sm:min-h-[32px]">{di.desc}</p>

                              {/* Variant selector */}
                              {di.kind !== 'single' && (
                                <div className="flex gap-1 mt-2 mb-1">
                                  {di.variants.map(v => {
                                    const isSel = selV.fullName === v.fullName
                                    return (
                                      <button
                                        key={v.fullName}
                                        onClick={(e) => { e.stopPropagation(); setVariantSel(prev => ({ ...prev, [di.baseName]: v.fullName })) }}
                                        className="min-w-[2.25rem] px-1.5 py-0.5 rounded text-[9px] font-bold text-center transition-all duration-150"
                                        style={isSel
                                          ? { background: GREEN, color: '#000' }
                                          : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }
                                        }
                                      >
                                        {di.kind === 'size' ? (SIZE_SHORT[v.label] ?? v.label) : v.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}

                              {/* Add controls */}
                              <div className="flex items-center justify-end mt-1.5 sm:mt-2.5">
                                {inCart ? (
                                  <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-lg p-0.5 border border-white/[0.06]">
                                    <button onClick={(e) => { e.stopPropagation(); updateQty(selV.fullName, -1) }} className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors">
                                      <Minus size={11} />
                                    </button>
                                    <span className="w-4 sm:w-5 text-center text-[11px] font-bold">{inCart.qty}</span>
                                    <button onClick={(e) => { e.stopPropagation(); updateQty(selV.fullName, 1) }} className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors">
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); addToCart({ name: selV.fullName, price: selV.price }) }}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-black transition-all hover:scale-110 active:scale-90"
                                    style={{ background: GREEN, boxShadow: `0 3px 12px ${GREEN}25` }}
                                  >
                                    <Plus size={14} strokeWidth={3} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}

                {/* Next category */}
                {ci < displayCategories.length - 1 && (
                  <div className="mt-6 sm:mt-10 flex justify-center">
                    <button
                      onClick={() => setActiveCat(ci + 1)}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold text-white/45 bg-white/[0.06] border border-white/[0.08] hover:text-white/60 hover:bg-white/[0.08] transition-all"
                    >
                      Siguiente: {displayCategories[ci + 1].name} <ChevronRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </main>
        </>
      )}

      {/* ═══════ CART PANEL ═══════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setCartOpen(false); setCheckoutStep('cart') }} />
          <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl bg-[#0e120e] border-t sm:border border-white/[0.07] shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}15` }}>
                  <ShoppingCart size={16} style={{ color: GREEN }} />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">Tu orden</h3>
                  <p className="text-[10px] text-white/25 font-medium">{cartCount} {cartCount === 1 ? 'producto' : 'productos'}{data.locationName ? ` · ${data.locationName}` : ''}</p>
                </div>
              </div>
              <button onClick={() => { setCartOpen(false); setCheckoutStep('cart') }} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/[0.05] transition-colors border border-white/[0.04]">
                <X size={14} className="text-white/30" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-white/15">
                  <ShoppingCart size={26} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Tu carrito está vacío</p>
                  <p className="text-[10px] text-white/15 mt-1">Agregá productos desde el menú</p>
                </div>
              ) : cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.025] transition-colors">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/[0.04]" style={{ background: 'rgba(18,22,18,0.95)' }}>
                    {isDrink(item.name, menu) ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <CupSoda size={24} className="text-white/30" />
                      </div>
                    ) : (
                      <img src={imgFor(item.name)} alt={item.name} className="w-full h-full object-contain p-1 drop-shadow-lg" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[13px] truncate">{item.name}</h4>
                    <p className="text-[11px] mt-0.5 font-bold" style={{ color: GREEN }}>{fmt(item.price * item.qty)}</p>
                  </div>
                  <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
                    <button onClick={() => updateQty(item.name, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10"><Minus size={11} /></button>
                    <span className="w-5 text-center text-[11px] font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.name, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10"><Plus size={11} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.name)} className="p-1.5 rounded-lg hover:bg-red-500/10 shrink-0">
                    <Trash2 size={12} className="text-red-400/40" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer — multi-step checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-white/[0.04] shrink-0 space-y-3" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>

                {/* STEP: CART */}
                {checkoutStep === 'cart' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/30 text-sm font-medium">Total</span>
                      <span className="font-black text-lg sm:text-xl" style={{ color: GREEN }}>{fmt(cartTotal)}</span>
                    </div>
                    {orderSent ? (
                      <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/15 text-[#25D366] font-bold text-sm">
                        <CheckCircle2 size={16} /> ¡Orden enviada!
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (custName.trim() && custPhone.trim()) {
                            setCheckoutStep('confirm')
                            return
                          }
                          setCheckoutStep('info')
                          setTimeout(() => nameInputRef.current?.focus(), 200)
                        }}
                        className="w-full py-3.5 rounded-2xl text-[12px] sm:text-[13px] font-black text-black transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[46px]"
                        style={{ background: ORANGE, boxShadow: `0 4px 20px ${ORANGE}30` }}
                      >
                        <ShoppingCart size={15} /> Confirmar pedido
                      </button>
                    )}
                  </>
                )}

                {/* STEP: INFO */}
                {checkoutStep === 'info' && (
                  <>
                    <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/60 font-medium transition-colors mb-1">
                      <ArrowLeft size={12} /> Volver al carrito
                    </button>
                    <p className="text-white/80 text-sm font-bold">¿A nombre de quién es el pedido?</p>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={custName}
                      onChange={e => setCustName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[16px] text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
                    />
                    <input
                      type="tel"
                      value={custPhone}
                      onChange={e => setCustPhone(e.target.value)}
                      placeholder="+506 6012 3456"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[16px] text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
                    />
                    <div className="flex gap-2">
                      {(['recoger', 'envio'] as const).map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCustOrderType(opt)}
                          className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
                            custOrderType === opt
                              ? 'text-black border-transparent'
                              : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
                          }`}
                          style={custOrderType === opt ? { background: GREEN } : {}}
                        >
                          {opt === 'recoger' ? 'Para recoger' : 'Envío'}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { if (custName.trim() && custPhone.trim()) setCheckoutStep('confirm') }}
                      disabled={!custName.trim() || !custPhone.trim()}
                      className="w-full py-3.5 rounded-2xl text-[12px] sm:text-[13px] font-black text-black transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[46px] disabled:opacity-30 disabled:pointer-events-none"
                      style={{ background: ORANGE, boxShadow: `0 4px 20px ${ORANGE}30` }}
                    >
                      Continuar <ChevronRight size={14} />
                    </button>
                  </>
                )}

                {/* STEP: CONFIRM */}
                {checkoutStep === 'confirm' && (
                  <>
                    <button onClick={() => setCheckoutStep('info')} className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/60 font-medium transition-colors mb-1">
                      <ArrowLeft size={12} /> Editar datos
                    </button>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-2">
                      <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Tipo de entrega</p>
                      <div className="flex gap-2">
                        {(['recoger', 'envio'] as const).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setCustOrderType(opt)}
                            className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
                              custOrderType === opt
                                ? 'text-black border-transparent'
                                : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
                            }`}
                            style={custOrderType === opt ? { background: GREEN } : {}}
                          >
                            {opt === 'recoger' ? 'Para recoger' : 'Envío'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-2">
                      <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Resumen del pedido</p>
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-white/50" />
                        <span className="text-white/80 font-medium">{custName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone size={14} className="text-white/50" />
                        <span className="text-white/80 font-medium">{custPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {custOrderType === 'recoger' ? <Home size={14} className="text-white/50" /> : <Truck size={14} className="text-white/50" />}
                        <span className="text-white/80 font-medium">{custOrderType === 'recoger' ? 'Para recoger' : 'Envío a domicilio'}</span>
                      </div>
                      <div className="w-full h-px bg-white/[0.05] my-1" />
                      {cart.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-[12px]">
                          <span className="text-white/60">{c.qty}x {c.name}</span>
                          <span className="text-white/40 font-medium">{fmt(c.price * c.qty)}</span>
                        </div>
                      ))}
                      <div className="w-full h-px bg-white/[0.05] my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-white/50 text-sm font-medium">Total</span>
                        <span className="font-black text-base" style={{ color: GREEN }}>{fmt(cartTotal)}</span>
                      </div>
                    </div>
                    <button
                      onClick={sendOrderWA}
                      className="w-full py-3.5 rounded-2xl text-[12px] sm:text-[13px] font-black text-white transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2.5 bg-[#25D366] min-h-[46px]"
                      style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.2)' }}
                    >
                      <Phone size={15} /> Enviar por WhatsApp
                    </button>
                    <p className="text-center text-[9px] text-white/10 font-medium">Se abrirá WhatsApp con tu orden lista</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ PRODUCT DETAIL MODAL ═══════ */}
      {modalItem && modalVariant && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div
            className="modal-overlay absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={closeModal}
            onTouchMove={(e) => e.preventDefault()}
          />
          <div
            className="modal-panel-mobile sm:modal-panel-desktop relative w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-[28px] sm:rounded-[28px] bg-[#0e120e] sm:border border-white/[0.08] shadow-2xl overflow-hidden max-h-[82vh] sm:max-h-[88vh] flex flex-col"
            style={{ borderColor: `${GREEN}20` }}
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            {/* Image */}
            <div className="relative h-44 sm:h-64 shrink-0 overflow-hidden bg-[#0e120e]">
              {isDrink(modalItem.baseName, menu) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <CupSoda size={64} className="text-white/30" />
                </div>
              ) : (
                <img
                  src={tresCuartosItemImages[modalItem.baseName] || tresCuartosItemImages[modalVariant.fullName] || fallbackImage}
                  alt={modalItem.baseName}
                  className="w-full h-full object-contain p-4 sm:p-8 drop-shadow-2xl"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0e120e] to-transparent" />

              {/* Floating close */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/[0.08] text-white/70 hover:text-white hover:bg-black/60 transition-all active:scale-90"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>

              {/* Category pill */}
              <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xl border border-white/[0.08] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: GREEN }}>
                  {displayCategories[activeCat]?.name}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 pt-5 sm:pt-6 pb-3 text-center">
              {/* Name + price */}
              <div className="mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-[1.1]">{modalItem.baseName}</h2>
                <p className="text-lg sm:text-2xl font-black mt-1.5" style={{ color: GREEN }}>{fmt(modalVariant.price)}</p>
              </div>

              {/* Description */}
              {modalItem.desc && (
                <p className="text-[13px] sm:text-sm text-white/55 leading-relaxed mb-5 sm:mb-6 max-w-sm mx-auto">{modalItem.desc}</p>
              )}

              {/* Variants */}
              {modalItem.kind !== 'single' && (
                <div className="mb-5 sm:mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Elegí tu opción</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {modalItem.variants.map(v => {
                      const isSel = modalVariant.fullName === v.fullName
                      return (
                        <button
                          key={v.fullName}
                          onClick={() => setVariantSel(prev => ({ ...prev, [modalItem.baseName]: v.fullName }))}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95"
                          style={isSel
                            ? { background: GREEN, color: '#000', boxShadow: `0 2px 12px ${GREEN}35` }
                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.07)' }
                          }
                        >
                          {modalItem.kind === 'size' ? (SIZE_SHORT[v.label] ?? v.label) : v.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Adicionales (in-modal add-ons) */}
              {visibleAddons.length > 0 && !isDrink(modalItem.baseName, menu) && (
                <div className="mb-2 sm:mb-3 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-1.5">
                      <Plus size={11} style={{ color: GREEN }} /> Adicionales
                    </p>
                    {modalAddons.length > 0 && (
                      <button
                        onClick={() => setModalAddons([])}
                        className="text-[9px] font-bold uppercase tracking-wider text-white/25 hover:text-white/50 transition-colors"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-sm mx-auto w-full">
                    {visibleAddons.map(a => {
                      const isOn = modalAddons.includes(a.name)
                      return (
                        <button
                          key={a.name}
                          onClick={() => setModalAddons(prev => isOn ? prev.filter(n => n !== a.name) : [...prev, a.name])}
                          className="flex items-center justify-between gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98]"
                          style={isOn
                            ? { background: `${GREEN}14`, border: `1px solid ${GREEN}35` }
                            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                          }
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                              style={isOn ? { background: GREEN } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                              {isOn && <CheckCircle2 size={12} className="text-black" strokeWidth={3} />}
                            </span>
                            <span className={`text-[12px] font-bold truncate ${isOn ? 'text-white' : 'text-white/55'}`}>{a.name}</span>
                          </span>
                          <span className="text-[11px] font-black shrink-0" style={{ color: isOn ? GREEN : 'rgba(255,255,255,0.35)' }}>
                            +{fmt(a.price)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer — qty + total + CTA in one clean row */}
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-t border-white/[0.06] shrink-0 text-center" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {/* Qty stepper */}
                <div className="inline-flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setModalQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors active:scale-90"
                    aria-label="Restar"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center text-base font-black">{modalQty}</span>
                  <button
                    onClick={() => setModalQty(q => Math.min(20, q + 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors active:scale-90"
                    aria-label="Sumar"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* CTA with total */}
                <button
                  onClick={() => {
                    const addonLabel = modalAddons.length > 0 ? ` + ${modalAddons.join(', ')}` : ''
                    const bundledName = `${modalVariant.fullName}${addonLabel}`
                    for (let i = 0; i < modalQty; i++) {
                      addToCart({ name: bundledName, price: modalUnitPrice })
                    }
                    closeModal()
                  }}
                  className="flex-1 flex items-center justify-between gap-3 pl-5 pr-4 h-12 sm:h-13 rounded-2xl text-black transition-all hover:brightness-110 active:scale-[0.98] min-h-[48px]"
                  style={{ background: ORANGE, boxShadow: `0 4px 20px ${ORANGE}35` }}
                >
                  <span className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
                    <ShoppingCart size={16} /> Agregar
                  </span>
                  <span className="text-sm font-black">{fmt(modalTotalPrice)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
