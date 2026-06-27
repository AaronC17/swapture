'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Send, MessageCircle, X, ChevronDown, Phone, CheckCircle2,
  ArrowRight, User, Mail, MessageSquare, Bot, MapPin, Clock,
  Star, Flame, UtensilsCrossed, ShoppingCart, Plus, Minus,
  Trash2, ChevronRight, Sparkles, Heart, Timer, Truck, Menu as MenuIcon
} from 'lucide-react'

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface MenuItem { name: string; desc: string; price: number }
interface MenuCategory { name: string; emoji: string; items: MenuItem[] }
interface MenuData {
  categories?: MenuCategory[]
  hours?: string
  locations?: Record<string, { name: string; phone?: string; phone2?: string; whatsapp?: string; categories: MenuCategory[] }>
  style?: string
}

interface SiteData {
  slug: string; businessName: string; businessType: string; description: string
  services: string[]; phone: string; whatsappNumber: string
  brandColor: string; logoUrl: string; menuData?: MenuData | null
}

interface CartItem { name: string; price: number; qty: number }

type BubbleType = 'text' | 'options' | 'input-name' | 'input-phone' | 'input-email' | 'input-interest' | 'input-sucursal' | 'lead-saved' | 'service-list' | 'cart-update'
interface ChatBubble { id: string; from: 'bot' | 'user'; type: BubbleType; text: string; options?: { label: string; value: string }[] }
type ChatPhase = 'welcome' | 'menu' | 'services' | 'ask-gpt' | 'collect-name' | 'collect-phone' | 'collect-sucursal' | 'collect-email' | 'collect-interest' | 'saving' | 'done' | 'gpt-chat'
interface LeadCaptureData { name: string; phone: string; email: string; interest: string; sucursal: string }
interface PersistedChatState {
  updatedAt: number
  phase: ChatPhase
  chatOpen: boolean
  bubbles: ChatBubble[]
  gptHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  leadData: LeadCaptureData
  leadSaved: boolean
}

/* ═══════════════════════════════════════════════
   CONSTANTS — Tres Cuartos Streetfood
   Verde oscuro (principal) · Naranja mostaza (acento) · Crema (realce)
   ═══════════════════════════════════════════════ */
const ORANGE = '#d97706'   // naranja/ámbar del logo — acento primario
const GREEN = '#028448'    // verde del logo — principal (fondos / tints)
const GREEN_SOFT = '#028448cc' // verde suave para textos grandes
const CREAM = '#f5e6b8'    // crema — realce (highlights retro)
const LOGO = '/trescuartos/logo.jpg'

const fmt = (n: number) => `\u20A1${n.toLocaleString('es-CR')}`

/* Reusable Streetfood wordmark: all orange */
const StreetFoodMark = ({ className = '' }: { className?: string }) => (
  <span className={className} style={{ color: ORANGE }}>Streetfood</span>
)

const heroSlides = [
  '/trescuartos/instagram/burger-especial-real.png',
  '/trescuartos/instagram/picantita-real.png',
  '/trescuartos/instagram/trufada-real.png',
]

const reviews = [
  { name: 'Mar\u00EDa V.', text: 'La Tres Cuartos es mi burger de cabecera. Carne jugosa, queso perfecto y ese pan brioche\u2026 brutal. Se nota el saz\u00F3n callejero.', rating: 5, loc: 'Escaz\u00FA' },
  { name: 'Carlos R.', text: 'Los Doraditos y las alitas son adictivos. Pido cada semana en Guachipel\u00ED y siempre sale igual de rico. S\u00FAper r\u00E1pido.', rating: 5, loc: 'Escaz\u00FA' },
  { name: 'Andrea M.', text: 'La Trufada con champi\u00F1ones es otra cosa. Sabor urbano de verdad, no he encontrado nada parecido por Escaz\u00FA.', rating: 5, loc: 'Escaz\u00FA' },
  { name: 'Diego F.', text: 'Las malteadas de chocolate son cremos\u00EDsimas. Combo Cheeseburgers para dos y listo, plan perfecto para el s\u00E1bado.', rating: 5, loc: 'Escaz\u00FA' },
]

function getDisplayHours(_locationKey: string, _locationName: string, fallbackHours?: string): string | undefined {
  return fallbackHours
}

/* ═══════════════════════════════════════════════
   NAV ITEMS
   ═══════════════════════════════════════════════ */
const navSections = [
  { label: 'Inicio', id: 'hero-section' },
  { label: 'Menú', id: 'menu-link', isLink: true },
  { label: 'Cómo pedir', id: 'order-section' },
  { label: 'Nosotros', id: 'about-section' },
  { label: 'Locales', id: 'locations-section' },
  { label: 'Contacto', id: 'contacto' },
]

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export default function TresCuartosClient({ data }: { data: SiteData }) {
  const chatStorageKey = useMemo(() => `swapture-chat:${data.slug}`, [data.slug])

  /* ── Hydration guard ── */
  const [mounted, setMounted] = useState(false)

  /* ── Splash / curtain reveal ── */
  const [splashPhase, setSplashPhase] = useState<'logo' | 'split' | 'done'>('logo')
  useEffect(() => {
    setMounted(true)
    const t1 = setTimeout(() => setSplashPhase('split'), 1400)
    const t2 = setTimeout(() => setSplashPhase('done'), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const menu = data.menuData
  const allCategories = useMemo(() => {
    if (!menu?.locations) return []
    return Object.values(menu.locations).flatMap(loc => loc.categories || [])
  }, [menu])
  const hasMenu = allCategories.length > 0

  /* ── Scroll state ── */
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero-section')
  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60)
      const sections = navSections.map(s => ({ id: s.id, el: document.getElementById(s.id) })).filter(s => s.el)
      let current = 'hero-section'
      for (const s of sections) {
        if (s.el) {
          const rect = s.el.getBoundingClientRect()
          if (rect.top <= 200) current = s.id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Mobile menu ── */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  /* ── Category tab ── */
  const [activeCat, setActiveCat] = useState(0)

  /* ── Hero slideshow ── */
  const [heroSlide, setHeroSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(p => (p + 1) % heroSlides.length), 5000)
    return () => clearInterval(t)
  }, [])

  /* ── Cart ── */
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderSent, setOrderSent] = useState(false)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const addToCart = useCallback((item: MenuItem | { name: string; price: number }) => {
    setCart(prev => {
      const ex = prev.find(c => c.name === item.name)
      if (ex) return prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { name: item.name, price: item.price, qty: 1 }]
    })
  }, [])
  const removeFromCart = (name: string) => setCart(prev => prev.filter(c => c.name !== name))
  const updateQty = (name: string, d: number) => {
    setCart(prev => prev.map(c => c.name !== name ? c : { ...c, qty: Math.max(0, c.qty + d) }).filter(c => c.qty > 0))
  }

  const buildOrderMsg = () => {
    const lines = cart.map(c => `  • ${c.qty}x ${c.name} — ${fmt(c.price * c.qty)}`)
    const nameLabel = leadData.name ? `\nCliente: ${leadData.name}` : ''
    const phoneLabel = leadData.phone ? `\nTeléfono: ${leadData.phone}` : ''
    const sucLabel = leadData.sucursal ? `\nSucursal: ${leadData.sucursal}` : ''
    return `Nuevo pedido — Tres Cuartos Streetfood${nameLabel}${phoneLabel}${sucLabel}\n\n${lines.join('\n')}\n\nTotal: ${fmt(cartTotal)}\n\n¡Gracias por tu orden!`
  }
  const sendOrderWA = () => {
    if (!data.whatsappNumber || !cart.length) return
    window.open(`https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(buildOrderMsg())}`, '_blank')

    fetch(`/api/site/${data.slug}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: leadData.name || 'Pedido WhatsApp',
        phone: leadData.phone || data.whatsappNumber,
        message: cart.map(c => `${c.qty}x ${c.name}`).join(', '),
        source: 'whatsapp-chatbot',
        orderDetails: JSON.stringify(cart),
        totalAmount: cartTotal,
      }),
    }).catch(() => {})

    setOrderSent(true)
    setCart([])
    setCartOpen(false)
    setTimeout(() => setOrderSent(false), 4000)
  }

  const normalizeForMatch = (value: string): string => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const compactForMatch = (value: string): string => normalizeForMatch(value).replace(/\s+/g, '')

  const singularizeWord = (word: string): string => {
    if (word.length <= 4) return word
    if (word.endsWith('es')) return word.slice(0, -2)
    if (word.endsWith('s')) return word.slice(0, -1)
    return word
  }

  const extractQuantityAndQuery = (raw: string): { qty: number; query: string } => {
    const numWords: Record<string, number> = {
      una: 1, un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
      seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
    }

    let qty = 1
    let query = raw

    const xQty = query.match(/(?:^|\s)x\s*(\d{1,2})(?:\s|$)/i) || query.match(/(?:^|\s)(\d{1,2})\s*x(?:\s|$)/i)
    if (xQty) {
      qty = Math.max(1, Math.min(20, Number(xQty[1])))
      query = query.replace(xQty[0], ' ')
    } else {
      const digitQty = query.match(/(?:^|\s)(\d{1,2})(?:\s|$)/)
      if (digitQty) {
        qty = Math.max(1, Math.min(20, Number(digitQty[1])))
        query = query.replace(digitQty[0], ' ')
      } else {
        const wordQty = Object.entries(numWords).find(([word]) => new RegExp(`(?:^|\\s)${word}(?:\\s|$)`, 'i').test(query))
        if (wordQty) {
          qty = wordQty[1]
          query = query.replace(new RegExp(`(?:^|\\s)${wordQty[0]}(?:\\s|$)`, 'i'), ' ')
        }
      }
    }

    query = query
      .replace(/\b(quiero|quier|kiero|qiero|me|das|dame|para|porfa|porfavor|favor|agregame|agrega|agregar|pedido|pedir|orden|ordenar)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return { qty, query: query || raw }
  }

  /* ── Helper: find menu item by fuzzy name ── */
  const findMenuItem = useCallback((query: string): MenuItem | null => {
    if (!allCategories.length) return null
    const qNorm = normalizeForMatch(query)
    const qCompact = compactForMatch(query)
    const qTokens = qNorm.split(/\s+/).map(singularizeWord).filter(Boolean)

    let best: { item: MenuItem; score: number } | null = null

    for (const cat of allCategories) {
      for (const item of cat.items) {
        const itemNorm = normalizeForMatch(item.name)
        const itemCompact = compactForMatch(item.name)
        const itemTokens = itemNorm.split(/\s+/).map(singularizeWord).filter(Boolean)

        if (itemNorm.includes(qNorm) || qNorm.includes(itemNorm) || itemCompact.includes(qCompact) || qCompact.includes(itemCompact)) {
          return item
        }

        const overlap = qTokens.filter(t => itemTokens.some(it => it.includes(t) || t.includes(it))).length
        const score = overlap / Math.max(1, qTokens.length)

        if (!best || score > best.score) {
          best = { item, score }
        }
      }
    }

    return best && best.score >= 0.5 ? best.item : null
  }, [allCategories])

  /* ── Contact form ── */
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  /* ── Chatbot ── */
  const [chatOpen, setChatOpen] = useState(false)
  const [bubbles, setBubbles] = useState<ChatBubble[]>([])
  const [phase, setPhase] = useState<ChatPhase>('welcome')
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [gptHistory, setGptHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '', interest: '', sucursal: '' })
  const [leadSaved, setLeadSaved] = useState(false)
  const [hasNotif, setHasNotif] = useState(true)
  const [chatStateHydrated, setChatStateHydrated] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idC = useRef(0)
  const uid = () => `b-${++idC.current}`

  useEffect(() => {
    try {
      const raw = localStorage.getItem(chatStorageKey)
      if (!raw) {
        setChatStateHydrated(true)
        return
      }

      const parsed = JSON.parse(raw) as PersistedChatState
      const isExpired = Date.now() - parsed.updatedAt > 24 * 60 * 60 * 1000
      if (isExpired) {
        localStorage.removeItem(chatStorageKey)
        setChatStateHydrated(true)
        return
      }

      setPhase(parsed.phase || 'welcome')
      setChatOpen(Boolean(parsed.chatOpen))
      setBubbles(Array.isArray(parsed.bubbles) ? parsed.bubbles : [])
      setGptHistory(Array.isArray(parsed.gptHistory) ? parsed.gptHistory : [])
      setLeadData(parsed.leadData || { name: '', phone: '', email: '', interest: '', sucursal: '' })
      setLeadSaved(Boolean(parsed.leadSaved))
      if (Array.isArray(parsed.bubbles) && parsed.bubbles.length > 0) setHasNotif(false)

      const maxId = (parsed.bubbles || []).reduce((max, b) => {
        const n = Number(String(b.id || '').replace('b-', ''))
        return Number.isFinite(n) ? Math.max(max, n) : max
      }, 0)
      idC.current = maxId
    } catch {
      localStorage.removeItem(chatStorageKey)
    } finally {
      setChatStateHydrated(true)
    }
  }, [chatStorageKey])

  useEffect(() => {
    if (!chatStateHydrated) return
    const payload: PersistedChatState = {
      updatedAt: Date.now(),
      phase,
      chatOpen,
      bubbles,
      gptHistory,
      leadData,
      leadSaved,
    }
    localStorage.setItem(chatStorageKey, JSON.stringify(payload))
  }, [chatStateHydrated, phase, chatOpen, bubbles, gptHistory, leadData, leadSaved, chatStorageKey])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [bubbles, chatLoading])
  useEffect(() => { if (chatOpen) setTimeout(() => inputRef.current?.focus(), 200) }, [phase, chatOpen])

  const addBot = useCallback((text: string, type: BubbleType = 'text', options?: { label: string; value: string }[]) => {
    setBubbles(prev => [...prev, { id: uid(), from: 'bot', type, text, options }])
  }, [])
  const addUser = useCallback((text: string) => {
    setBubbles(prev => [...prev, { id: uid(), from: 'user', type: 'text', text }])
  }, [])

  const showMainMenu = useCallback((greeting?: string) => {
    addBot(greeting || '\u00BFEn qu\u00E9 te puedo ayudar?', 'options', [
      { label: '\uD83C\uDF54 Ver men\u00FA', value: 'services' },
      { label: '\uD83D\uDD50 Horarios y sucursales', value: 'horarios' },
      { label: '\uD83D\uDCAC Consulta', value: 'ask' },
      ...(data.whatsappNumber ? [{ label: '\uD83D\uDCF1 WhatsApp', value: 'whatsapp' }] : []),
    ])
    setPhase('menu')
  }, [addBot, data.whatsappNumber])

  useEffect(() => {
    if (chatOpen && phase === 'welcome') {
      setHasNotif(false)
      const t = setTimeout(() => {
        addBot(`\u00A1Hola! \uD83D\uDC4B Soy el asistente de **${data.businessName}**. Para brindarte una mejor atenci\u00F3n, \u00BFme pod\u00E9s decir tu nombre?`, 'input-name')
        setPhase('collect-name')
      }, 400)
      return () => clearTimeout(t)
    }
  }, [chatOpen, phase, addBot, data.businessName])

  /* ── Detect ordering intent from free text (multi-item) ── */
  const tryOrderFromText = useCallback((text: string): boolean => {
    if (!menu) return false
    const parts = text.split(/\s*(?:,|\+|\by\b|\bo\b|\/)\s*/i).map(s => s.trim()).filter(Boolean)
    const added: { name: string; qty: number; price: number }[] = []

    for (const part of parts) {
      const { qty, query } = extractQuantityAndQuery(part)
      const item = findMenuItem(query)
      if (item) {
        for (let i = 0; i < qty; i++) addToCart(item)
        added.push({ name: item.name, qty, price: item.price })
      }
    }

    if (added.length === 0) {
      const { qty, query } = extractQuantityAndQuery(text)
      const item = findMenuItem(query)
      if (!item) return false
      for (let i = 0; i < qty; i++) addToCart(item)
      added.push({ name: item.name, qty, price: item.price })
    }
    if (added.length === 0) return false
    const lines = added.map(a => `\u2705 **${a.qty}x ${a.name}** (${fmt(a.price * a.qty)})`).join('\n')
    addBot(lines, 'cart-update')
    setTimeout(() => {
      addBot('\u00BFAlgo m\u00E1s?', 'options', [
        { label: '\uD83C\uDF54 Seguir pidiendo', value: 'order' },
        { label: '🛒 Ver mi orden', value: 'view-cart' },
        { label: '\u2705 Pedir por WhatsApp', value: 'send-order' },
      ])
    }, 500)
    return true
  }, [menu, findMenuItem, addToCart, addBot])

  const handleOption = async (value: string) => {
    if (value === 'services') {
      addUser('Ver menú')
      setTimeout(() => {
        window.location.href = `/site/${data.slug}/menu`
      }, 250)
    } else if (value === 'horarios') {
      addUser('Horarios y sucursales')
      setTimeout(() => {
        if (menu?.locations && Object.keys(menu.locations).length) {
          const locs = Object.entries(menu.locations as Record<string, any>).map(([locKey, loc]: [string, any]) => {
            const hours = getDisplayHours(locKey, loc.name, loc.hours)
            return `\uD83D\uDCCD **${loc.name}**${hours ? `\n\uD83D\uDD50 ${hours}` : ''}${loc.phone ? `\n\uD83D\uDCDE ${loc.phone}` : ''}`
          }).join('\n\n')
          addBot(locs, 'options', [
            { label: '🍔 Ver menú', value: 'services' },
            { label: '💬 Consulta', value: 'ask' },
            ...(data.whatsappNumber ? [{ label: '📱 WhatsApp', value: 'whatsapp' }] : []),
          ])
        } else {
          addBot('No tenemos información de horarios disponible por ahora.', 'options', [
            { label: '🍔 Ver menú', value: 'services' },
            ...(data.whatsappNumber ? [{ label: '📱 WhatsApp', value: 'whatsapp' }] : []),
          ])
        }
        setPhase('services')
      }, 400)
    } else if (value === 'ask') {
      addUser('Consulta')
      setTimeout(() => { addBot('\u00A1Claro! Escrib\u00ED tu consulta. 😊'); setPhase('gpt-chat') }, 400)
    } else if (value === 'whatsapp') {
      window.open(`https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa saber m\u00E1s sobre ${data.businessName}`)}`, '_blank')
    } else if (value.startsWith('sucursal:')) {
      const locKey = value.replace('sucursal:', '')
      const locName = menu?.locations?.[locKey]?.name || locKey
      addUser(locName)
      const final = { ...leadData, sucursal: locName }
      setLeadData(final); setChatLoading(true)
      try {
        await fetch(`/api/site/${data.slug}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactData: final }) })
        setLeadSaved(true)
      } catch { /* silently continue */ }
      setChatLoading(false)
      setTimeout(() => {
        addBot(`¡Perfecto, **${final.name}**! ✅ Sucursal **${locName}** seleccionada.

¿Qué te gustaría hacer?`, 'options', [
          { label: '🍔 Ver menú', value: 'services' },
          { label: '🕐 Horarios', value: 'horarios' },
          { label: '💬 Consulta', value: 'ask' },
          ...(data.whatsappNumber ? [{ label: '📱 WhatsApp', value: 'whatsapp' }] : []),
        ])
        setPhase('menu')
      }, 400)
    } else if (value === 'restart') {
      addUser('Volver al inicio')
      setTimeout(() => showMainMenu('¿Qué más puedo hacer por ti?'), 400)
    } else if (value === 'new-question') {
      addUser('Otra consulta')
      setTimeout(() => { addBot('Adelante, escribí tu consulta. 😊'); setPhase('gpt-chat') }, 400)
    }
  }

  const startContactFlow = () => {
    if (leadSaved) {
      setTimeout(() => addBot(`Ya tenemos tus datos, **${leadData.name}** \u2705. \u00BFQuer\u00E9s dejarnos tu correo tambi\u00E9n?`, 'input-email'), 400)
      setPhase('collect-email')
      return
    }
    setTimeout(() => {
      addBot('Primero necesito tu nombre:')
      setTimeout(() => { addBot('\u00BFCu\u00E1l es tu nombre?', 'input-name'); setPhase('collect-name') }, 500)
    }, 400)
  }

  const handleStructuredInput = async () => {
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')

    if (phase === 'collect-name') {
      addUser(text); setLeadData(p => ({ ...p, name: text }))
      setTimeout(() => { addBot(`Gracias, **${text}**. \u00BFTu n\u00FAmero de tel\u00E9fono? \uD83D\uDCF1`, 'input-phone'); setPhase('collect-phone') }, 400)
    } else if (phase === 'collect-phone') {
      addUser(text)
      setLeadData(p => ({ ...p, phone: text }))
      const locs = menu?.locations
      if (locs && Object.keys(locs).length > 1) {
        const locOptions = Object.entries(locs).map(([key, loc]) => ({
          label: `📍 ${loc.name}`,
          value: `sucursal:${key}`,
        }))
        setTimeout(() => {
          addBot(`Gracias. 📍 ¿De cuál sucursal querés tu pedido?`, 'input-sucursal', locOptions)
          setPhase('collect-sucursal')
        }, 400)
      } else {
        const final = { ...leadData, phone: text }
        setLeadData(final); setChatLoading(true)
        try {
          await fetch(`/api/site/${data.slug}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactData: final }) })
          setLeadSaved(true)
        } catch { /* silently continue */ }
        setChatLoading(false)
        setTimeout(() => {
          addBot(`¡Perfecto, **${final.name}**! ✅ Ya te tengo registrado.\n\nAhora sí, ¿qué te gustaría hacer?`, 'options', [
            { label: '🍔 Ver menú', value: 'services' },
            { label: '🕐 Horarios', value: 'horarios' },
            { label: '💬 Consulta', value: 'ask' },
            ...(data.whatsappNumber ? [{ label: '📱 WhatsApp', value: 'whatsapp' }] : []),
          ])
          setPhase('menu')
        }, 400)
      }
    } else if (phase === 'collect-email') {
      const v = text.toLowerCase() === 'no' ? '' : text
      addUser(text); setLeadData(p => ({ ...p, email: v }))
      setTimeout(() => showMainMenu(), 400)
    } else if (phase === 'collect-interest') {
      addUser(text)
      setTimeout(() => showMainMenu(), 400)
    } else if (phase === 'gpt-chat' || phase === 'menu' || phase === 'services' || phase === 'done') {
      addUser(text)
      const normalizedText = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      const looksLikeOrder = /(\d+\s*x?|\bx\s*\d+|quier|kiero|qiero|dame|agrega|pedido|orden|hamburg|burger|cheese|bacon|picantita|trufada|portobello|sandwich|s[aá]ndwich|pepito|tropicana|bien montado|alitas?|popper|mozzarella|doradito|malteada|bebida|coca|fanta|sprite|tropical|jugo|fresco|gaseosa|agua)/i.test(normalizedText)
      if (looksLikeOrder) {
        addBot('Para hacer pedidos usa **Ver menú**. El chatbot queda para consultas, horarios y ayuda rápida.', 'options', [
          { label: '🍔 Ver menú', value: 'services' },
          { label: '🕐 Horarios', value: 'horarios' },
          ...(data.whatsappNumber ? [{ label: '📱 WhatsApp', value: 'whatsapp' }] : []),
        ])
        return
      }
      setChatLoading(true)
      const newH = [...gptHistory, { role: 'user' as const, content: text }]
      setGptHistory(newH)
      try {
        const res = await fetch(`/api/site/${data.slug}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newH }) })
        const d = await res.json()
        const reply = d.reply || 'Disculpa, no pude procesar eso.'
        setGptHistory(prev => [...prev, { role: 'assistant', content: reply }])
        addBot(reply)
        setTimeout(() => addBot('', 'options', [
          { label: '\uD83D\uDCAC Otra pregunta', value: 'new-question' },
          { label: '🍔 Ver menú', value: 'services' },
          { label: '\uD83D\uDD19 Inicio', value: 'restart' },
        ]), 600)
      } catch { addBot('Hubo un problema t\u00E9cnico.') }
      setChatLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      const res = await fetch(`/api/site/${data.slug}/lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); setFormError(d.error || 'Error'); setFormLoading(false); return }
      setFormSent(true)
    } catch { setFormError('Error de conexi\u00F3n.') }
    setFormLoading(false)
  }

  const waLink = data.whatsappNumber
    ? `https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa ${data.businessName}`)}`
    : null

  const getPlaceholder = () => {
    switch (phase) {
      case 'collect-name': return 'Tu nombre...'
      case 'collect-phone': return '+506 6012 3456'
      case 'collect-sucursal': return 'Seleccioná tu sucursal...'
      case 'collect-email': return 'tu@correo.com o "no"'
      case 'collect-interest': return 'Ej: Reserva para 6'
      case 'gpt-chat': return 'Escribí tu consulta...'
      case 'menu': return 'Escrib\u00ED lo que necesit\u00E1s...'
      case 'services': return 'Escrib\u00ED lo que necesit\u00E1s...'
      default: return 'Escrib\u00ED algo...'
    }
  }
  const showInput = true

  const BotAvatar = () => (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${GREEN}20` }}>
      <Bot size={14} style={{ color: GREEN }} />
    </div>
  )

  const md = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    )
  }

  const renderBubble = (b: ChatBubble) => {
    if (b.from === 'user') return (
      <div key={b.id} className="flex justify-end">
        <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-md text-sm text-white" style={{ background: GREEN }}>{b.text}</div>
      </div>
    )
    if (b.type === 'cart-update') return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm text-white/90 border" style={{ background: `${GREEN}10`, borderColor: `${GREEN}30` }}>
          <div className="flex items-center gap-2"><ShoppingCart size={14} style={{ color: GREEN }} /><span>{md(b.text)}</span></div>
        </div>
      </div>
    )
    if (b.type === 'options' && b.options) return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {b.text && <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] text-sm text-white/90 leading-relaxed whitespace-pre-line">{md(b.text)}</div>}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {b.options.map((o, i) => (
              <button key={i} onClick={() => handleOption(o.value)} className="px-3.5 py-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-white/80 hover:text-white transition-all whitespace-nowrap min-h-[40px]">{o.label}</button>
            ))}
          </div>
        </div>
      </div>
    )
    if (b.type === 'service-list') return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 min-w-0">
          <div className="max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] text-sm text-white/90 leading-relaxed">{md(b.text)}</div>
              <div className="mt-2 space-y-1">
                {data.services.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: `${GREEN}20`, color: GREEN }}>{i + 1}</div>
                    <span className="text-sm text-white/80">{s}</span>
                  </div>
                ))}
              </div>
        </div>
      </div>
    )
    if (b.type === 'lead-saved') return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[90%] px-3.5 py-3 rounded-2xl rounded-bl-md border text-sm" style={{ background: `${GREEN}10`, borderColor: `${GREEN}30` }}>
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={16} style={{ color: GREEN }} /><span className="font-semibold text-white">Datos registrados</span></div>
          <p className="text-white/70 text-xs">{md(b.text)}</p>
        </div>
      </div>
    )
    if (b.type === 'input-sucursal') return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] text-sm text-white/90 leading-relaxed flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: GREEN }} /> <span>{md(b.text)}</span>
          </div>
          {b.options && (
            <div className="flex flex-col gap-1.5 mt-1">
              {b.options.map((o, i) => (
                <button key={i} onClick={() => handleOption(o.value)} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-white/80 hover:text-white transition-all min-h-[44px]">
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
    const inputIcons: Record<string, typeof User> = { 'input-name': User, 'input-phone': Phone, 'input-email': Mail, 'input-interest': MessageSquare }
    const II = inputIcons[b.type]
    if (II) return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] text-sm text-white/90 leading-relaxed flex items-start gap-2">
          <II size={14} className="mt-0.5 shrink-0" style={{ color: GREEN }} /> <span>{md(b.text)}</span>
        </div>
      </div>
    )
    return (
      <div key={b.id} className="flex gap-2 justify-start">
        <BotAvatar />
        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] text-sm text-white/90 leading-relaxed whitespace-pre-line">{md(b.text)}</div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════
     HELPER: smooth scroll to section
     ═══════════════════════════════════════════════ */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  /* ── Logo tile (reusable) ── */
  const LogoTile = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const dim = size === 'sm' ? 'w-8 h-8 rounded-lg' : size === 'lg' ? 'w-20 h-20 rounded-2xl' : 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl'
    return (
      <div
        className={`${dim} flex items-center justify-center border border-white/10 overflow-hidden shrink-0 bg-transparent`}
        style={{
          backgroundImage: `url(${LOGO})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    )
  }

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  if (!mounted) return <div className="min-h-screen bg-[#0a0d0a]" />

  return (
    <div className="min-h-screen bg-[#0a0d0a] text-white selection:bg-[#f8ae1b]/30 overflow-x-hidden">

      {/* ═══════ SPLASH / CURTAIN REVEAL (mobile only) ═══════ */}
      {splashPhase !== 'done' && (
        <div className="fixed inset-0 z-[200] pointer-events-none sm:hidden">
          <div
            className="absolute top-0 left-0 w-1/2 h-full bg-[#060806] transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ transitionDuration: '900ms', transform: splashPhase === 'split' ? 'translateX(-100%)' : 'translateX(0)' }}
          />
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-[#060806] transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ transitionDuration: '900ms', transform: splashPhase === 'split' ? 'translateX(100%)' : 'translateX(0)' }}
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center transition-all ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ transitionDuration: '700ms', opacity: splashPhase === 'logo' ? 1 : 0, transform: splashPhase === 'logo' ? 'scale(1)' : 'scale(0.85)' }}
          >
            <LogoTile size="lg" />
            <h2
              className="text-3xl font-black uppercase tracking-tight mt-4"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              TRES CUARTOS
            </h2>
            <p
              className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.28em] mt-1.5"
              style={{ color: '#ffffff' }}
            >
              Streetfood
            </p>
            <div className="mt-6 w-16 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full animate-[splashLoad_1.4s_ease-in-out_forwards]" style={{ background: GREEN }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STICKY NAV ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-black/90 ${scrolled ? 'border-b border-white/[0.06] py-2' : 'py-3 sm:py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-end sm:justify-between relative">
          <button onClick={() => scrollTo('hero-section')} className="flex items-center gap-2 sm:gap-3 group absolute left-1/2 -translate-x-1/2 -ml-4 sm:ml-0 sm:static sm:translate-x-0">
            <LogoTile />
            <div className="leading-none">
              <span className="text-base sm:text-xl font-black tracking-tight uppercase" style={{ color: GREEN_SOFT }}>Tres Cuartos</span>
              <p className="text-[8px] sm:text-[10px] font-semibold tracking-[0.14em] sm:tracking-[0.22em] uppercase mt-0.5"><StreetFoodMark /></p>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-0.5">
            {navSections.map((s) => (
              s.isLink ? (
                <a
                  key={s.id}
                  href={`/site/${data.slug}/menu`}
                  className="relative px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                >
                  {s.label}
                </a>
              ) : (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`relative px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    activeSection === s.id
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  }`}
                >
                  {s.label}
                  {activeSection === s.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: GREEN }} />
                  )}
                </button>
              )
            ))}
          </div>

          <div className="flex items-center gap-2">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all">
                <Phone size={14} /> WhatsApp
              </a>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors">
              {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ MOBILE FULL-SCREEN MENU OVERLAY ═══════ */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(6,8,6,0.97)' }}
      >
        <div className="absolute inset-0 backdrop-blur-2xl" />
        <div className="absolute top-0 left-0 right-0 h-40 opacity-30" style={{ background: `radial-gradient(ellipse at top center, ${GREEN}20, transparent 70%)` }} />

        <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <LogoTile />
            <div className="leading-none">
              <span className="text-base font-black tracking-tight uppercase" style={{ color: GREEN_SOFT }}>Tres Cuartos</span>
              <p className="text-[8px] font-semibold tracking-[0.14em] uppercase mt-0.5"><StreetFoodMark /></p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/[0.04] active:scale-95 transition-transform">
            <X size={20} className="text-white/70" />
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-8 mt-8 gap-1">
          {navSections.map((s, i) => (
            s.isLink ? (
              <a
                key={s.id}
                href={`/site/${data.slug}/menu`}
                className="w-full text-center py-4 rounded-2xl text-[15px] font-bold uppercase tracking-[0.2em] transition-all text-white/50 hover:text-white active:scale-[0.97]"
                style={{ transitionDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms', transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(12px)', opacity: mobileMenuOpen ? undefined : 0 }}
              >
                {s.label}
              </a>
            ) : (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-center py-4 rounded-2xl text-[15px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97] ${
                  activeSection === s.id ? 'text-black' : 'text-white/50 hover:text-white'
                }`}
                style={{
                  ...(activeSection === s.id ? { background: GREEN } : {}),
                  transitionDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms',
                  transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(12px)',
                  opacity: mobileMenuOpen ? undefined : 0,
                }}
              >
                {s.label}
              </button>
            )
          ))}
        </div>

        <div className="relative z-10 absolute bottom-0 left-0 right-0 px-8 pb-10">
          {/* Retro checkerboard divider */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-3 h-3" style={{ background: i % 2 === 0 ? GREEN : CREAM, opacity: 0.5 }} />
            ))}
          </div>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl text-sm font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 active:scale-[0.97] transition-transform">
              <Phone size={16} /> Escribir por WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* ═══════ HERO — CINEMATIC FULL-SCREEN ═══════ */}
      <header id="hero-section" className="relative min-h-[100svh] flex items-center overflow-hidden">
        {heroSlides.map((src, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-[2000ms] ${heroSlide === i ? 'opacity-100' : 'opacity-0'}`}>
            <img src={src} alt="Tres Cuartos Streetfood" className="w-full h-full object-cover object-center" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0a] via-[#0a0d0a]/70 to-black/40 sm:via-[#0a0d0a]/60 sm:to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d0a]/95 via-[#0a0d0a]/50 to-transparent sm:via-[#0a0d0a]/40" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        <div className="absolute bottom-6 right-4 sm:bottom-10 sm:right-10 z-10 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} className={`h-1 sm:h-1.5 rounded-full transition-all duration-700 ${heroSlide === i ? 'w-5 sm:w-10' : 'w-1.5 sm:w-3 bg-white/15 hover:bg-white/30'}`} style={heroSlide === i ? { background: ORANGE } : undefined} />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-0 pt-20 sm:pt-28 mt-4 sm:mt-0">
          <div className="max-w-4xl text-center sm:text-left mx-auto sm:mx-0">
            <h1 className="relative mb-3 sm:mb-6">
              <span
                className="block text-[2.8rem] sm:text-[5.5rem] lg:text-[7rem] xl:text-[8.5rem] font-black uppercase leading-[0.85] tracking-tight text-white"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                TRES CUARTOS
              </span>
              <span
                className="block text-[1.08rem] sm:text-[2rem] lg:text-[2.8rem] xl:text-[3.2rem] font-black not-italic sm:italic uppercase leading-[1] tracking-[0.02em] sm:tracking-[0.3em] mt-1 sm:mt-4"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#ffffff' }}
              >
                Streetfood
              </span>
            </h1>

            {/* Brand strip */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-5 mb-5 sm:mb-8">
              <p className="text-xs sm:text-base text-white/40 max-w-sm leading-relaxed hidden sm:block">
                Burgers, sándwiches y antojos urbanos preparados al momento con ingredientes frescos
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-14">
              <button onClick={() => window.location.href = `/site/${data.slug}/menu`} className="group flex items-center justify-center gap-2.5 w-full max-w-[280px] sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-black text-sm text-white uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] border border-white/30 bg-transparent hover:border-white/50 hover:bg-white/5 backdrop-blur">
                <UtensilsCrossed size={16} /> Ver Men&uacute; <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setChatOpen(true)} className="flex items-center justify-center gap-2.5 w-full max-w-[280px] sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-sm text-white border border-white/30 hover:border-white/50 hover:bg-white/5 transition-all active:scale-[0.98] backdrop-blur uppercase tracking-wider">
                <MessageCircle size={16} /> Chat
              </button>
            </div>

            <div className="grid grid-cols-3 place-items-center sm:flex sm:justify-start gap-3 sm:gap-12 mt-6 sm:mt-0">
              {[
                { icon: MapPin, val: '1', label: 'Local' },
                { icon: Timer, val: '15 min', label: 'Delivery' },
                { icon: Star, val: '4.9', label: 'Rating' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:text-left sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.08] backdrop-blur-md shrink-0">
                    <s.icon size={14} className="sm:w-[19px] sm:h-[19px] text-white" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-xl font-black leading-none text-white">{s.val}</p>
                    <p className="text-[7px] sm:text-[11px] uppercase tracking-wider font-bold mt-0.5 text-white/70">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden sm:flex flex-col items-center gap-2">
          <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Scroll</span>
          <ChevronDown size={20} className="text-white/20" />
        </div>
      </header>

      {/* ═══════ MARQUEE BANNER ═══════ */}
      <div className="relative py-2.5 sm:py-3 overflow-hidden border-y border-white/[0.06]" style={{ background: `linear-gradient(90deg, ${GREEN}06, ${GREEN}10, ${GREEN}06)` }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="mx-3 sm:mx-8 text-[10px] sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] flex items-center gap-1.5 sm:gap-3" style={{ color: `${GREEN}90` }}>
              <Flame size={12} className="shrink-0" style={{ color: GREEN }} />
              Streetfood Urbano
              <span className="text-white/25">&bull;</span>
              Hecho al Momento
              <span className="text-white/25">&bull;</span>
              Sabor que Adicta
              <span className="text-white/25 hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline">Guachipel&iacute; &middot; Escaz&uacute;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════ STATS CARDS ═══════ */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-12">
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
            {[
            { icon: Heart, val: 'Real', label: 'SAZÓN', sub: 'Streetfood' },
            { icon: MapPin, val: '1', label: 'SUCURSAL', sub: 'Escazú' },
            { icon: UtensilsCrossed, val: '25+', label: 'opciones En el Menú', sub: '' },
          ].map((s, i) => (
            <div key={i} className="group relative p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#0c110c]/80 backdrop-blur-xl text-center hover:border-white/[0.15] transition-all duration-700 hover:translate-y-[-3px]" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.5)' }}>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ boxShadow: `inset 0 0 60px ${GREEN}08` }} />
              {s.icon ? (
                <s.icon size={18} className="mx-auto mb-1 sm:mb-2 transition-transform duration-500 group-hover:scale-110 relative z-10" style={{ color: GREEN }} />
              ) : (
                <div className="h-[18px] sm:h-[18px] mb-1 sm:mb-2" />
              )}
              <p className="text-lg sm:text-3xl font-black relative z-10 text-white">{s.val}</p>
              <p className="text-[7px] sm:text-[11px] text-white/50 uppercase tracking-[0.1em] sm:tracking-[0.15em] mt-0.5 sm:mt-1 font-black relative z-10">{s.label}</p>
              <p className="text-[6px] sm:text-[10px] text-white/20 uppercase tracking-wider mt-0.5 relative z-10 hidden sm:block">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ HOW TO ORDER ═══════ */}
      <section id="order-section" className="py-16 sm:py-20 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(248,174,27,0.05) 0%, transparent 60%)' }} />
        {/* Retro checkerboard top strip */}
        <div className="absolute top-0 left-0 right-0 flex justify-center gap-1 py-3 hidden sm:flex">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="w-2 h-2 shrink-0" style={{ background: i % 2 === 0 ? `${GREEN}25` : `${CREAM}15` }} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: GREEN }}>
              <ShoppingCart size={13} /> Orden&aacute; aqu&iacute;
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[1] sm:leading-[0.9] tracking-tight">
              &iquest;C&Oacute;MO POD&Eacute;S<br /><span style={{ color: GREEN }}>PEDIR EN TRES CUARTOS?</span>
            </h2>
            <p className="text-white/40 mt-4 sm:mt-6 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">Escog&eacute; tu opci&oacute;n favorita para el pedido</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {[
              { icon: UtensilsCrossed, title: 'Menú Online', desc: 'Mirá el menú con fotos y pedí con un click.', action: () => window.location.href = `/site/${data.slug}/menu`, btn: 'Ver Menú', color: GREEN },
              { icon: Phone, title: 'WhatsApp', desc: 'Escribinos al WhatsApp y te confirmamos al toque.', action: () => waLink && window.open(waLink, '_blank'), btn: 'WhatsApp', color: '#25D366' },
            ].map((opt, i) => (
              <div key={i} className="group relative p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-500 text-center" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03)' }}>
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border" style={{ borderColor: `${opt.color}25`, color: `${opt.color}60` }}>
                  0{i + 1}
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5 transition-all duration-500 group-hover:scale-110" style={{ background: `${opt.color}12`, border: `1px solid ${opt.color}20` }}>
                  <opt.icon size={22} className="sm:w-[26px] sm:h-[26px]" style={{ color: opt.color }} />
                </div>
                <h3 className="text-base sm:text-xl font-black mb-2 uppercase tracking-wide">{opt.title}</h3>
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">{opt.desc}</p>
                <button onClick={opt.action} className="w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all hover:brightness-125 active:scale-[0.98] min-h-[46px] sm:min-h-[48px]" style={{ background: `${opt.color}20`, border: `1px solid ${opt.color}30` }}>
                  {opt.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BRAND DIVIDER — checkerboard ═══════ */}
      <div className="flex items-center justify-center gap-3 py-8 sm:py-6">
        <div className="h-px flex-1 max-w-[120px]" style={{ background: `linear-gradient(90deg, transparent, ${GREEN}40)` }} />
        <div className="flex gap-1.5">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-3 h-3" style={{ background: i % 2 === 0 ? GREEN : CREAM, opacity: i % 2 === 0 ? 0.6 : 0.5, border: `1px solid ${GREEN}25` }} />
          ))}
        </div>
        <div className="h-px flex-1 max-w-[120px]" style={{ background: `linear-gradient(270deg, transparent, ${GREEN}40)` }} />
      </div>

      {/* ═══════ ABOUT ═══════ */}
      {hasMenu && (
        <section id="about-section" className="relative py-14 sm:py-20 overflow-hidden scroll-mt-20">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(248,174,27,0.04) 0%, transparent 65%)' }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.25em] mb-4 sm:mb-5" style={{ color: GREEN }}>
              <Sparkles size={12} /> Sobre nosotros
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-black leading-[1] sm:leading-[0.9] mb-4 sm:mb-6 tracking-tight">
              LA DIFERENCIA<br />EST&Aacute; EN <span style={{ color: GREEN }}>EL SAZ&Oacute;N</span>
            </h2>
            <p className="text-white/40 leading-relaxed text-xs sm:text-base mb-8 sm:mb-12 max-w-lg mx-auto">Tres Cuartos naci&oacute; en Guachipel&iacute; de Escaz&uacute; con una sola obsesi&oacute;n: llevar el streetfood urbano a otra vuelta. Burgers jugosas, s&aacute;ndwiches bien montados y antojos crujientes, todo preparado al momento con ingredientes frescos.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {[
                { label: 'Sazón Callejero', desc: 'Recetas urbanas con actitud.' },
                { label: 'Hecho al Momento', desc: 'Se prepara cuando lo pedís.' },
                { label: 'En Guachipelí de Escazú', desc: 'Tu antojo, cerca tuyo.' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${GREEN}15` }}>
                    <CheckCircle2 size={22} style={{ color: GREEN }} />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white/85">{item.label}</p>
                  <p className="text-[11px] sm:text-xs text-white/35">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ BRAND DIVIDER ═══════ */}
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="h-px flex-1 max-w-[100px]" style={{ background: `linear-gradient(90deg, transparent, ${GREEN}40)` }} />
        <Flame size={16} style={{ color: `${GREEN}60` }} />
        <div className="h-px flex-1 max-w-[100px]" style={{ background: `linear-gradient(270deg, transparent, ${GREEN}40)` }} />
      </div>

      {/* ═══════ REVIEWS (hidden on mobile) ═══════ */}
      <section id="reviews-section" className="hidden sm:block py-12 sm:py-20 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(248,174,27,0.04) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: GREEN }}>
              <Star size={13} className="fill-current" /> Rese&ntilde;as
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">LO QUE DICEN<br />NUESTROS <span style={{ color: GREEN }}>CLIENTES</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="group flex flex-col p-5 sm:p-7 rounded-xl sm:rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] transition-all duration-500 hover:translate-y-[-4px]" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.2)' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-current" style={{ color: GREEN }} />
                  ))}
                </div>
                <p className="text-sm text-white/50 leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 mt-6 border-t border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: `${GREEN}20`, color: CREAM }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-[11px] text-white/30 flex items-center gap-1"><MapPin size={10} />{r.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LOCATIONS ═══════ */}
      {menu?.locations && Object.keys(menu.locations).length > 0 && (
        <section id="locations-section" className="py-10 sm:py-20 relative overflow-hidden scroll-mt-20">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(248,174,27,0.04) 0%, transparent 50%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-6 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-2 sm:mb-4" style={{ color: GREEN }}>
                <MapPin size={13} /> Locales
              </div>
              <h2 className="text-lg sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">VISIT&Aacute;NOS<br /><span style={{ color: GREEN }}>HORARIOS</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
              {Object.entries(menu.locations as Record<string, { name: string; phone?: string; phone2?: string; whatsapp?: string; hours?: string; categories: MenuCategory[] }>).map(([locKey, loc]) => {
                const hasLocMenu = loc.categories && loc.categories.length > 0
                const displayHours = getDisplayHours(locKey, loc.name, loc.hours || menu.hours)
                const locWaLink = loc.whatsapp
                  ? `https://wa.me/${loc.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, quiero hacer un pedido en Tres Cuartos — ${loc.name}`)}`
                  : waLink
                return (
                  <div key={locKey} className="group w-full max-w-md p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] transition-all duration-500 hover:translate-y-[-4px] text-center" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 4px 30px rgba(0,0,0,0.2)' }}>
                    <div className="flex justify-center gap-1 mb-4 sm:mb-6 hidden sm:flex">
                      {[...Array(8)].map((_, j) => (
                        <div key={j} className="w-2.5 h-2.5 rotate-45 transition-all duration-500" style={{ background: j % 2 === 0 ? `${GREEN}25` : 'transparent', border: `1px solid ${GREEN}14` }} />
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-7">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-110" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}15` }}>
                        <img src={LOGO} alt="Tres Cuartos" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl sm:text-3xl uppercase">Tres Cuartos</h3>
                        <p className="text-xs sm:text-sm text-white/45 mt-1">{loc.name}</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-5 border-t border-white/[0.06]">
                      {displayHours && (
                        <div className="flex flex-col items-center gap-1">
                          <Clock size={16} style={{ color: GREEN }} />
                          <div className="text-xs sm:text-sm text-white/40 leading-relaxed">
                            <p className="font-bold text-white/60 mb-0.5">Horario</p>
                            <p className="break-words whitespace-normal">{displayHours}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        <Truck size={14} style={{ color: GREEN }} />
                        <span className="text-xs sm:text-sm text-white/40">Pick up, Delivery y WhatsApp</span>
                      </div>
                      {loc.phone && (
                        <div className="flex items-center justify-center gap-2">
                          <Phone size={14} style={{ color: '#25D366' }} />
                          <span className="text-xs sm:text-sm text-white/40">{`${loc.phone}${loc.phone2 ? ` / ${loc.phone2}` : ''}`}</span>
                        </div>
                      )}
                    </div>
                    {hasLocMenu ? (
                      <a href={`/site/${data.slug}/menu/${locKey}`} className="mt-5 sm:mt-7 flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[46px] sm:min-h-[50px]" style={{ background: `${ORANGE}18`, border: `1px solid ${ORANGE}30`, color: ORANGE }}>
                        <UtensilsCrossed size={14} /> Ordenar <ArrowRight size={14} />
                      </a>
                    ) : locWaLink ? (
                      <a href={locWaLink} target="_blank" rel="noopener noreferrer" className="mt-5 sm:mt-7 flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[46px] sm:min-h-[50px]" style={{ background: `${ORANGE}18`, border: `1px solid ${ORANGE}30`, color: ORANGE }}>
                        Ordenar <ArrowRight size={14} />
                      </a>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CTA — Visual banner ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.06]" style={{ background: `linear-gradient(135deg, ${GREEN}08, #0a0d0a, ${GREEN}04)` }}>
          <div className="absolute top-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[200px] opacity-[0.06]" style={{ background: GREEN }} />
          <div className="absolute bottom-0 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full blur-[180px] opacity-[0.04]" style={{ background: GREEN }} />

          <div className="relative grid sm:grid-cols-2 items-center">
            <div className="relative p-6 sm:p-12 lg:p-16 z-10">
              <div className="flex gap-1.5 mb-5 sm:mb-8 hidden sm:flex">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-3 h-3" style={{ background: i % 2 === 0 ? GREEN : CREAM, opacity: i % 2 === 0 ? 0.6 : 0.5 }} />
                ))}
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[0.9] mb-3 sm:mb-5 tracking-tight">
                SABOR QUE<br />SE SIENTE<br /><span style={{ color: GREEN }}>EN CADA MORDIDA</span>
              </h2>
              <p className="text-white/40 max-w-md text-xs sm:text-base leading-relaxed">Burgers, s&aacute;ndwiches y antojos urbanos preparados al momento. As&iacute; es Tres Cuartos.</p>
            </div>

            <div className="relative h-52 sm:h-full min-h-[220px] sm:min-h-[360px] overflow-hidden">
              <img
                src="/trescuartos/instagram/burger-especial-real.png"
                alt="Tres Cuartos Streetfood"
                className="absolute inset-0 w-full h-full object-cover object-[50%_35%] scale-110"
              />
              <div className="absolute inset-0 bg-[#0a0d0a]/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d0a] via-[#0a0d0a]/25 to-transparent sm:via-transparent sm:from-[#0a0d0a]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0a]/50 to-transparent sm:hidden" />
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.25)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-16 scroll-mt-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-4 sm:mb-5 text-white/40">
              <Mail size={13} /> Contacto
            </div>
            <h2 className="text-xl sm:text-4xl font-black mb-2 tracking-tight">PEDIDOS<br /><span style={{ color: GREEN }}>ESPECIALES</span></h2>
            <p className="text-white/30 text-xs sm:text-base mt-2 sm:mt-3">D&eacute;janos tus datos y te escribimos</p>
          </div>
          {formSent ? (
            <div className="text-center p-14 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `${GREEN}15` }}>
                <CheckCircle2 size={32} style={{ color: GREEN }} />
              </div>
              <h3 className="text-xl font-black mb-2">&iexcl;Mensaje enviado!</h3>
              <p className="text-white/40">Te contactaremos pronto.</p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4 p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.015]">
              {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>}
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">Nombre *</label>
                <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Tu nombre" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/20 transition-colors" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-2 font-medium">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="tu@email.com" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/20 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2 font-medium">Tel&eacute;fono *</label>
                  <input type="tel" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+506 6012 3456" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/20 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">Mensaje</label>
                <textarea rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="&iquest;En qu&eacute; podemos ayudarte?" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/20 resize-none transition-colors" />
              </div>
              <button type="submit" disabled={formLoading} className="w-full py-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]" style={{ background: `${ORANGE}18`, border: `1px solid ${ORANGE}30`, color: ORANGE }}>
                {formLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Enviar mensaje</>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.06] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <LogoTile size="sm" />
              <div>
                <p className="font-black text-sm uppercase tracking-tight leading-none" style={{ color: GREEN_SOFT }}>Tres Cuartos</p>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] leading-none mt-0.5"><StreetFoodMark /></p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              {navSections.map((s) => (
                s.isLink ? (
                  <a key={s.id} href={`/site/${data.slug}/menu`} className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-semibold uppercase tracking-wider">
                    {s.label}
                  </a>
                ) : (
                  <button key={s.id} onClick={() => scrollTo(s.id)} className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-semibold uppercase tracking-wider">
                    {s.label}
                  </button>
                )
              ))}
            </div>
            <div className="flex items-center gap-4">
              {data.whatsappNumber && (
                <a href={waLink || '#'} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/30 hover:text-[#25D366] transition-colors flex items-center gap-1.5 font-semibold">
                  <Phone size={11} className="text-[#25D366]/50" />{data.whatsappNumber}
                </a>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
            <p className="text-[10px] text-white/15">&copy; Tres Cuartos {new Date().getFullYear()} &mdash; Todos los derechos reservados</p>
            <p className="text-[10px] text-white/15">Hecho con <a href="/" className="hover:text-white/30 transition-colors underline underline-offset-2">Swapture</a></p>
          </div>
        </div>
      </footer>

      {/* ═══════ CART PANEL ═══════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-3xl bg-[#0e120e] border-t sm:border border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GREEN}15` }}>
                  <ShoppingCart size={18} style={{ color: GREEN }} />
                </div>
                <div>
                  <h3 className="font-black text-lg">Tu orden</h3>
                  <p className="text-xs text-white/40">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors"><X size={20} className="text-white/40" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Tu carrito est&aacute; vac&iacute;o</p>
                </div>
              ) : cart.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                    <p className="text-xs mt-0.5" style={{ color: GREEN }}>{fmt(item.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-xl p-1">
                    <button onClick={() => updateQty(item.name, -1)} className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center hover:bg-white/10 active:bg-white/15"><Minus size={14} className="sm:w-3 sm:h-3" /></button>
                    <span className="w-7 sm:w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.name, 1)} className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center hover:bg-white/10 active:bg-white/15"><Plus size={14} className="sm:w-3 sm:h-3" /></button>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <p className="font-black text-sm">{fmt(item.price * item.qty)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.name)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} className="text-red-400/60" /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-white/[0.06] shrink-0 space-y-4" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 font-medium">Total</span>
                  <span className="font-black text-xl" style={{ color: GREEN }}>{fmt(cartTotal)}</span>
                </div>
                {orderSent ? (
                  <div className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-bold text-sm">
                    <CheckCircle2 size={18} /> &iexcl;Orden enviada!
                  </div>
                ) : (
                  <button onClick={sendOrderWA} className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg bg-[#25D366] min-h-[48px]">
                    <Phone size={18} /> Pedir por WhatsApp
                  </button>
                )}
                <p className="text-center text-[11px] text-white/20">Se abrir&aacute; WhatsApp con tu orden</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ CHATBOT FAB (desktop only) ═══════ */}
      <button onClick={() => setChatOpen(prev => !prev)} className={`fixed bottom-5 right-5 z-[80] w-12 h-12 rounded-full shadow-2xl hidden sm:flex items-center justify-center transition-all hover:scale-105 active:scale-95`} style={{ background: `${ORANGE}20`, border: `1px solid ${ORANGE}35`, color: ORANGE }}>
        {chatOpen ? <X size={20} /> : <MessageCircle size={20} />}
        {!chatOpen && hasNotif && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#0a0d0a] animate-pulse" />}
      </button>

      {/* ═══════ CHATBOT PANEL ═══════ */}
      {chatOpen && (
        <div className="fixed inset-0 z-[70] sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[380px] sm:h-[520px] sm:rounded-2xl border-0 sm:border border-white/[0.08] bg-[#0c100c] shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 sm:py-3.5 border-b border-white/[0.06] flex items-center gap-3 shrink-0 bg-[#0a0d0a]" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${GREEN}20` }}><Bot size={18} style={{ color: GREEN }} /></div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0d0a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Asistente Tres Cuartos</p>
              <p className="text-[11px]" style={{ color: `${GREEN}cc` }}>En línea • Consultas, horarios y ayuda rápida</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="p-2 rounded-lg hover:bg-white/[0.06]"><X size={18} className="text-white/50" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {bubbles.map(renderBubble)}
            {chatLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${GREEN}20` }}><Bot size={14} style={{ color: GREEN }} /></div>
                <div className="bg-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {showInput && (
            <div className="p-3 border-t border-white/[0.06] shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <form onSubmit={(e) => { e.preventDefault(); handleStructuredInput() }} className="flex gap-2">
                <input ref={inputRef} type={phase === 'collect-email' ? 'email' : phase === 'collect-phone' ? 'tel' : 'text'} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={getPlaceholder()} className="flex-1 px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[16px] sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20" />
                <button type="submit" disabled={chatLoading || !chatInput.trim()} className="px-5 sm:px-4 py-3.5 sm:py-3 rounded-xl text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-30 font-bold min-w-[48px]" style={{ background: GREEN }}><ArrowRight size={18} className="sm:w-4 sm:h-4" /></button>
              </form>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
