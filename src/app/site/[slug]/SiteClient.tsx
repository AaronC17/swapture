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

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */
const G = '#6abf4b'

const fmt = (n: number) => `\u20A1${n.toLocaleString('es-CR')}`

const foodGallery = [
  '/hamburguesas/CHEESEBURGUER.png',
  '/hamburguesas/oklahoma.png',
  '/hamburguesas/double%20bacon.png',
  '/hamburguesas/triple%20bacon.png',
  '/hamburguesas/bacon%20cheeseburguer.png',
  '/hamburguesas/double%20cheeseburguer.png',
]

const heroSlides = [
  'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=1920&h=1080&fit=crop&q=90',
  'https://images.unsplash.com/photo-1586816001966-79b736744398?w=1920&h=1080&fit=crop&q=90',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1920&h=1080&fit=crop&q=90',
]

const reviews = [
  { name: 'Mar\u00EDa V.', text: 'La Oklahoma es otra cosa. Esa cebolla caramelizada con la salsa BBQ... de verdad que se nota que la carne es 100% Angus.', rating: 5, loc: 'Jac\u00F3' },
  { name: 'Carlos R.', text: 'Fui con mis hijos un domingo y qued\u00E9 impresionado. Los nachos de mechada y las papas Quincho son brutales. Ya volvimos dos veces m\u00E1s.', rating: 5, loc: 'Esparza' },
  { name: 'Andrea M.', text: 'La Trufada con queso brie es de otro nivel. El pan brioche se deshace solo. No he encontrado nada parecido en toda la zona.', rating: 5, loc: 'Orotina' },
  { name: 'Diego F.', text: 'Los Smash Fries con doble carne son adictivos. Llevo meses pidiendo cada semana y nunca me ha fallado ni una vez.', rating: 5, loc: 'Orotina' },
]

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
export default function SiteClient({ data }: { data: SiteData }) {
  /* ── Hydration guard ── */
  const [mounted, setMounted] = useState(false)

  /* ── Splash / curtain reveal ── */
  const [splashPhase, setSplashPhase] = useState<'logo' | 'split' | 'done'>('logo')
  useEffect(() => {
    setMounted(true)
    // Phase 1: show logo for 1.4s, then split curtain
    const t1 = setTimeout(() => setSplashPhase('split'), 1400)
    // Phase 2: curtain fully open after another 0.9s, remove overlay
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
    return `Nuevo pedido — Quincho's Smash Burger${nameLabel}${phoneLabel}${sucLabel}\n\n${lines.join('\n')}\n\nTotal: ${fmt(cartTotal)}\n\n¡Gracias por tu orden!`
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

  /* ── Helper: find menu item by fuzzy name ── */
  const findMenuItem = useCallback((query: string): MenuItem | null => {
    if (!allCategories.length) return null
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    for (const cat of allCategories) {
      for (const item of cat.items) {
        const n = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (n.includes(q) || q.includes(n)) return item
      }
    }
    for (const cat of allCategories) {
      for (const item of cat.items) {
        const words = item.name.toLowerCase().split(/\s+/)
        if (words.some(w => q.includes(w) && w.length > 3)) return item
      }
    }
    return null
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
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idC = useRef(0)
  const uid = () => `b-${++idC.current}`

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
    const numWords: Record<string, number> = { una: 1, un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 }
    const numPat = `(?:${Object.keys(numWords).join('|')}|\\d+)`
    const parts = text.split(/\s*(?:,|\+|\by\b)\s*/i).map(s => s.trim()).filter(Boolean)
    const added: { name: string; qty: number; price: number }[] = []
    for (const part of parts) {
      const qtyRx = new RegExp(`^(${numPat})\\s*x?\\s*(.+)$`, 'i')
      const m = part.match(qtyRx)
      let qty = 1
      let nameQuery = part
      if (m) {
        const qw = m[1].toLowerCase()
        qty = numWords[qw] ?? parseInt(qw)
        if (!isNaN(qty) && qty >= 1 && qty <= 20) {
          nameQuery = m[2]
        } else {
          qty = 1
        }
      }
      const trailingQty = nameQuery.match(/(.+?)\s*x\s*(\d+)\s*$/i)
      if (trailingQty) {
        nameQuery = trailingQty[1]
        qty = Math.min(parseInt(trailingQty[2]), 20)
      }
      const item = findMenuItem(nameQuery)
      if (item) {
        for (let i = 0; i < qty; i++) addToCart(item)
        added.push({ name: item.name, qty, price: item.price })
      }
    }
    if (added.length === 0) {
      const item = findMenuItem(text)
      if (!item) return false
      let qty = 1
      const qm = text.match(/(\d+)\s*x?\s*/i)
      if (qm) qty = Math.min(parseInt(qm[1]), 20)
      for (const [w, n] of Object.entries(numWords)) { if (text.toLowerCase().includes(w)) { qty = n; break } }
      for (let i = 0; i < qty; i++) addToCart(item)
      added.push({ name: item.name, qty, price: item.price })
    }
    if (added.length === 0) return false
    const lines = added.map(a => `\u2705 **${a.qty}x ${a.name}** (${fmt(a.price * a.qty)})`).join('\n')
    addBot(lines, 'cart-update')
    setTimeout(() => {
      addBot('\u00BFAlgo m\u00E1s?', 'options', [
        { label: '\uD83C\uDF54 Seguir pidiendo', value: 'order' },
        { label: '\uD83D\uDED2 Ver mi orden', value: 'view-cart' },
        { label: '\u2705 Pedir por WhatsApp', value: 'send-order' },
      ])
    }, 500)
    return true
  }, [menu, findMenuItem, addToCart, addBot])

  const handleOption = async (value: string) => {
    if (value === 'services') {
      addUser('Ver el men\u00FA')
      setTimeout(() => {
        addBot('\uD83C\uDF54 Te llevo al men\u00FA completo con fotos y precios.', 'options', [
          { label: '\uD83D\uDCCB Abrir men\u00FA', value: 'goto-menu' },
          { label: '\uD83D\uDD19 Volver', value: 'restart' },
        ])
        setPhase('services')
      }, 400)
    } else if (value === 'goto-menu') {
      window.location.href = `/site/${data.slug}/menu`
    } else if (value === 'horarios') {
      addUser('Horarios y sucursales')
      setTimeout(() => {
        if (menu?.locations && Object.keys(menu.locations).length) {
          const locs = Object.values(menu.locations as Record<string, any>).map((loc: any) =>
            `\uD83D\uDCCD **${loc.name}**${loc.hours ? `\n\uD83D\uDD50 ${loc.hours}` : ''}${loc.phone ? `\n\uD83D\uDCDE ${loc.phone}` : ''}`
          ).join('\n\n')
          addBot(locs, 'options', [
            { label: '\uD83C\uDF54 Ver men\u00FA', value: 'services' },
            { label: '\uD83D\uDCAC Consulta', value: 'ask' },
            ...(data.whatsappNumber ? [{ label: '\uD83D\uDCF1 WhatsApp', value: 'whatsapp' }] : []),
          ])
        } else {
          addBot('No tenemos informaci\u00F3n de horarios disponible.', 'options', [
            ...(data.whatsappNumber ? [{ label: '\uD83D\uDCF1 WhatsApp', value: 'whatsapp' }] : []),
          ])
        }
        setPhase('services')
      }, 400)
    } else if (value === 'view-cart') {
      addUser('Ver mi orden')
      setTimeout(() => {
        if (cart.length === 0) {
          addBot('Tu carrito est\u00E1 vac\u00EDo. \u00BFQuer\u00E9s pedir algo?', 'options', [
            { label: '\uD83C\uDF54 Ver men\u00FA', value: 'services' },
            { label: '\uD83D\uDED2 Hacer pedido', value: 'order' },
          ])
        } else {
          const items = cart.map(c => `\u2022 ${c.qty}x ${c.name} \u2014 ${fmt(c.price * c.qty)}`).join('\n')
          addBot(`\uD83D\uDED2 **Tu orden actual:**\n\n${items}\n\n**Total: ${fmt(cartTotal)}**`, 'options', [
            { label: '\u2795 Agregar m\u00E1s', value: 'order' },
            { label: '\u2705 Pedir por WhatsApp', value: 'send-order' },
            { label: '\uD83D\uDDD1\uFE0F Vaciar carrito', value: 'clear-cart' },
          ])
        }
      }, 400)
    } else if (value === 'send-order') {
      addUser('Enviar pedido')
      if (cart.length === 0) {
        setTimeout(() => addBot('No ten\u00E9s nada en el carrito. \u00BFQuer\u00E9s pedir algo?', 'options', [
          { label: '\uD83C\uDF54 Ver men\u00FA', value: 'services' },
          { label: '\uD83D\uDED2 Hacer pedido', value: 'order' },
        ]), 400)
      } else {
        sendOrderWA()
        setTimeout(() => addBot('\u2705 \u00A1Orden enviada por WhatsApp! Te responderemos pronto.', 'options', [
          { label: '\uD83C\uDF54 Nuevo pedido', value: 'order' },
          { label: '\uD83D\uDD19 Inicio', value: 'restart' },
        ]), 400)
      }
    } else if (value === 'clear-cart') {
      setCart([])
      addUser('Vaciar carrito')
      setTimeout(() => addBot('Carrito vaciado. \u00BFQuer\u00E9s empezar de nuevo?', 'options', [
        { label: '\uD83C\uDF54 Ver men\u00FA', value: 'services' },
        { label: '\uD83D\uDED2 Hacer pedido', value: 'order' },
      ]), 400)
    } else if (value === 'ask') {
      addUser('Consulta')
      setTimeout(() => { addBot('\u00A1Claro! Escrib\u00ED tu consulta. \uD83D\uDE0A'); setPhase('gpt-chat') }, 400)
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
      // Show sucursal selection
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
        // Only one or no locations — skip sucursal and save lead
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
            { label: '� Horarios', value: 'horarios' },
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
      if (tryOrderFromText(text)) return
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
          { label: '\uD83D\uDED2 Hacer pedido', value: 'order' },
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
      case 'gpt-chat': return 'Ej: Quiero una Doble Bacon...'
      case 'menu': return 'Escrib\u00ED lo que necesit\u00E1s...'
      case 'services': return 'Escrib\u00ED lo que necesit\u00E1s...'
      default: return 'Escrib\u00ED algo...'
    }
  }
  const showInput = true

  const BotAvatar = () => (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${G}25` }}>
      <Bot size={14} style={{ color: G }} />
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
        <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-md text-sm text-white" style={{ background: G }}>{b.text}</div>
      </div>
    )
    if (b.type === 'cart-update') return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm text-white/90 border" style={{ background: `${G}10`, borderColor: `${G}30` }}>
          <div className="flex items-center gap-2"><ShoppingCart size={14} style={{ color: G }} /><span>{md(b.text)}</span></div>
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
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: `${G}20`, color: G }}>{i + 1}</div>
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
        <div className="max-w-[90%] px-3.5 py-3 rounded-2xl rounded-bl-md border text-sm" style={{ background: `${G}10`, borderColor: `${G}30` }}>
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={16} style={{ color: G }} /><span className="font-semibold text-white">Datos registrados</span></div>
          <p className="text-white/70 text-xs">{md(b.text)}</p>
        </div>
      </div>
    )
    /* Sucursal input — show text + location option buttons */
    if (b.type === 'input-sucursal') return (
      <div key={b.id} className="flex gap-2">
        <BotAvatar />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] text-sm text-white/90 leading-relaxed flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: G }} /> <span>{md(b.text)}</span>
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
          <II size={14} className="mt-0.5 shrink-0" style={{ color: G }} /> <span>{md(b.text)}</span>
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

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  if (!mounted) return <div className="min-h-screen bg-[#060606]" />

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-green-500/30 overflow-x-hidden">

      {/* ═══════ SPLASH / CURTAIN REVEAL (mobile only) ═══════ */}
      {splashPhase !== 'done' && (
        <div className="fixed inset-0 z-[200] pointer-events-none sm:hidden">
          {/* Left curtain */}
          <div
            className="absolute top-0 left-0 w-1/2 h-full bg-[#060606] transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              transitionDuration: '900ms',
              transform: splashPhase === 'split' ? 'translateX(-100%)' : 'translateX(0)',
            }}
          />
          {/* Right curtain */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-[#060606] transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              transitionDuration: '900ms',
              transform: splashPhase === 'split' ? 'translateX(100%)' : 'translateX(0)',
            }}
          />
          {/* Logo in center */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center transition-all ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              transitionDuration: '700ms',
              opacity: splashPhase === 'logo' ? 1 : 0,
              transform: splashPhase === 'logo' ? 'scale(1)' : 'scale(0.85)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${G}15`, border: `1px solid ${G}20` }}>
              <Flame size={28} style={{ color: G }} />
            </div>
            <h2
              className="text-3xl font-black uppercase tracking-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              QUINCHO&apos;S
            </h2>
            <p
              className="text-[10px] font-black uppercase tracking-[0.35em] mt-1.5"
              style={{ color: `${G}90` }}
            >
              Smash Burgers
            </p>
            {/* Subtle loading bar */}
            <div className="mt-6 w-16 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full animate-[splashLoad_1.4s_ease-in-out_forwards]" style={{ background: G }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STICKY NAV — with section anchors + mobile menu ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/95 backdrop-blur-2xl border-b border-white/[0.06] py-2' : 'bg-gradient-to-b from-black/70 to-transparent py-3 sm:py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo('hero-section')} className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-white/10 transition-all group-hover:scale-105" style={{ background: `${G}15` }}>
              <Flame size={22} style={{ color: G }} />
            </div>
            <div className="leading-none">
              <span className="text-base sm:text-xl font-black tracking-tight uppercase">Quincho&apos;s</span>
              <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase mt-0.5" style={{ color: G }}>Smash Burgers</p>
            </div>
          </button>

          {/* Desktop nav links */}
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
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: G }} />
                  )}
                </button>
              )
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all">
                <Phone size={14} /> WhatsApp
              </a>
            )}
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors">
              {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

      </nav>

      {/* ═══════ MOBILE FULL-SCREEN MENU OVERLAY ═══════ */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(6,6,6,0.97)' }}
      >
        {/* Decorative blur overlay */}
        <div className="absolute inset-0 backdrop-blur-2xl" />
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-40 opacity-30" style={{ background: `radial-gradient(ellipse at top center, ${G}15, transparent 70%)` }} />

        {/* Header with close */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10" style={{ background: `${G}15` }}>
              <Flame size={20} style={{ color: G }} />
            </div>
            <div className="leading-none">
              <span className="text-base font-black tracking-tight uppercase">Quincho&apos;s</span>
              <p className="text-[9px] font-bold tracking-[0.25em] uppercase mt-0.5" style={{ color: G }}>Smash Burgers</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/[0.04] active:scale-95 transition-transform">
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Nav links — centered */}
        <div className="relative z-10 flex flex-col items-center justify-center px-8 mt-8 gap-1">
          {navSections.map((s, i) => (
            s.isLink ? (
              <a
                key={s.id}
                href={`/site/${data.slug}/menu`}
                className="w-full text-center py-4 rounded-2xl text-[15px] font-bold uppercase tracking-[0.2em] transition-all text-white/50 hover:text-white active:scale-[0.97]"
                style={{
                  transitionDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms',
                  transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(12px)',
                  opacity: mobileMenuOpen ? undefined : 0,
                }}
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
                  ...(activeSection === s.id ? { background: G } : {}),
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

        {/* Bottom section — WhatsApp + divider */}
        <div className="relative z-10 absolute bottom-0 left-0 right-0 px-8 pb-10">
          <div className="w-16 h-[1px] mx-auto mb-6" style={{ background: `${G}30` }} />
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl text-sm font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 active:scale-[0.97] transition-transform">
              <Phone size={16} /> Escribir por WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* ═══════ HERO — CINEMATIC FULL-SCREEN ═══════ */}
      <header id="hero-section" className="relative min-h-[100svh] flex items-center overflow-hidden">
        {/* Background slides */}
        {heroSlides.map((src, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-[2000ms] ${heroSlide === i ? 'opacity-100' : 'opacity-0'}`}>
            <img src={src} alt="Smash Burger" className="w-full h-full object-cover object-center" />
          </div>
        ))}
        {/* Overlays for depth — stronger on mobile for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-black/40 sm:via-[#0a0a0a]/60 sm:to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/50 to-transparent sm:via-[#0a0a0a]/40" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        {/* Slide indicators */}
        <div className="absolute bottom-6 right-4 sm:bottom-10 sm:right-10 z-10 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} className={`h-1 sm:h-1.5 rounded-full transition-all duration-700 ${heroSlide === i ? 'w-5 sm:w-10' : 'w-1.5 sm:w-3 bg-white/15 hover:bg-white/30'}`} style={heroSlide === i ? { background: G } : undefined} />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-0 pt-20 sm:pt-28 mt-4 sm:mt-0">
          <div className="max-w-4xl text-center sm:text-left mx-auto sm:mx-0">
            {/* Top badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-white/[0.08] text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-5 sm:mb-8" style={{ color: G }}>
              <Star size={11} className="fill-current shrink-0" /> <span>Smash Burgers hechas con pasi&oacute;n</span>
            </div>

            {/* MAIN TITLE — QUINCHO'S is the star */}
            <h1 className="relative mb-3 sm:mb-6">
              <span
                className="block text-[2.8rem] sm:text-[5.5rem] lg:text-[7rem] xl:text-[8.5rem] font-black uppercase leading-[0.85] tracking-tight"
                style={{
                  color: 'white',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 8px 0 rgba(0,0,0,0.12)',
                }}
              >
                QUINCHO&apos;S
              </span>
              <span
                className="block text-[1.15rem] sm:text-[2rem] lg:text-[2.8rem] xl:text-[3.2rem] font-black not-italic sm:italic uppercase leading-[1] tracking-[0.05em] sm:tracking-[0.3em] mt-1 sm:mt-4"
                style={{
                  color: G,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  textShadow: `0 0 50px ${G}20, 0 2px 0 #4a8a33`,
                }}
              >
                Smash Burgers
              </span>
            </h1>

            {/* 100% ANGUS strip — prominent design */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-5 mb-5 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 backdrop-blur-md shrink-0" style={{ borderColor: `${G}50`, background: `${G}08` }}>
                <Heart size={14} className="shrink-0" style={{ color: G }} />
                <div>
                  <p className="text-base sm:text-2xl font-black tracking-tight leading-none" style={{ color: G }}>100%</p>
                  <p className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-white/70">Carne Angus</p>
                </div>
              </div>
              <div className="h-8 sm:h-10 w-px bg-white/10 hidden sm:block" />
              <p className="text-xs sm:text-base text-white/40 max-w-sm leading-relaxed hidden sm:block">
                Aplastada en plancha caliente, pan brioche artesanal y salsas que no vas a olvidar
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-14">
              <button onClick={() => window.location.href = `/site/${data.slug}/menu`} className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-black text-sm text-black uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl" style={{ background: G, boxShadow: `0 8px 30px ${G}35` }}>
                <UtensilsCrossed size={16} /> Ver Men&uacute; <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setChatOpen(true)} className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-sm border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all active:scale-[0.98] backdrop-blur-md uppercase tracking-wider">
                <MessageCircle size={16} /> Chat
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex justify-center sm:justify-start gap-3 sm:gap-12">
              {[
                { icon: MapPin, val: '3', label: 'Locales' },
                { icon: Timer, val: '15 min', label: 'Delivery' },
                { icon: Star, val: '4.9', label: 'Rating' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.08] backdrop-blur-md shrink-0">
                    <s.icon size={14} className="sm:w-[19px] sm:h-[19px]" style={{ color: G }} />
                  </div>
                  <div>
                    <p className="text-sm sm:text-xl font-black leading-none">{s.val}</p>
                    <p className="text-[7px] sm:text-[11px] text-white/40 uppercase tracking-wider font-bold mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden sm:flex flex-col items-center gap-2">
          <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Scroll</span>
          <ChevronDown size={20} className="text-white/20" />
        </div>
      </header>

      {/* ═══════ MARQUEE BANNER — ANGUS CERTIFIED ═══════ */}
      <div className="relative py-2.5 sm:py-3 overflow-hidden border-y" style={{ borderColor: `${G}15`, background: `linear-gradient(90deg, ${G}06, ${G}10, ${G}06)` }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="mx-3 sm:mx-8 text-[10px] sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] flex items-center gap-1.5 sm:gap-3" style={{ color: `${G}60` }}>
              <Flame size={12} className="shrink-0" style={{ color: G }} />
              100% Angus Beef
              <span className="text-white/15">&bull;</span>
              Brioche Artesanal
              <span className="text-white/15">&bull;</span>
              Smash Technique
              <span className="text-white/15 hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline">Hecho con Pasi&oacute;n</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════ STATS CARDS ═══════ */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          {[
            { icon: Heart, val: '100%', label: 'CARNE ANGUS', sub: 'Certified Beef' },
            { icon: MapPin, val: '3', label: 'SUCURSALES', sub: 'Costa Rica' },
            { icon: UtensilsCrossed, val: '60+', label: 'OPCIONES', sub: 'En el Men\u00FA' },
          ].map((s, i) => (
            <div key={i} className="group relative p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#111]/80 backdrop-blur-xl text-center hover:border-white/[0.15] transition-all duration-700 hover:translate-y-[-3px]" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.5)' }}>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ boxShadow: `inset 0 0 60px ${G}08` }} />
              <s.icon size={18} className="mx-auto mb-1 sm:mb-2 transition-transform duration-500 group-hover:scale-110 relative z-10" style={{ color: G }} />
              <p className="text-lg sm:text-3xl font-black relative z-10" style={{ color: G }}>{s.val}</p>
              <p className="text-[7px] sm:text-[11px] text-white/50 uppercase tracking-[0.1em] sm:tracking-[0.15em] mt-0.5 sm:mt-1 font-black relative z-10">{s.label}</p>
              <p className="text-[6px] sm:text-[10px] text-white/20 uppercase tracking-wider mt-0.5 relative z-10 hidden sm:block">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ HOW TO ORDER — Clean cards ═══════ */}
      <section id="order-section" className="py-16 sm:py-20 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(106,191,75,0.06) 0%, transparent 60%)' }} />
        <div className="absolute top-0 left-0 right-0 flex justify-center gap-1 py-3 hidden sm:flex">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="w-2 h-2 rotate-45 shrink-0" style={{ background: i % 2 === 0 ? `${G}12` : 'transparent' }} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: G }}>
              <ShoppingCart size={13} /> Orden&aacute; aqu&iacute;
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[1] sm:leading-[0.9] tracking-tight">
              &iquest;C&Oacute;MO POD&Eacute;S<br /><span style={{ color: G }}>PEDIR EN QUINCHO&apos;S?</span>
            </h2>
            <p className="text-white/40 mt-4 sm:mt-6 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">Escog&eacute; tu opci&oacute;n favorita para el pedido</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {[
              { icon: UtensilsCrossed, title: 'Menú Online', desc: 'Mirá el menú con fotos y pedí con un click.', action: () => window.location.href = `/site/${data.slug}/menu`, btn: 'Ver Menú', color: G },
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

      {/* ═══════ BRAND DIVIDER ═══════ */}
      <div className="flex items-center justify-center gap-3 py-8 sm:py-6">
        <div className="h-px flex-1 max-w-[120px]" style={{ background: `linear-gradient(90deg, transparent, ${G}30)` }} />
        <div className="flex gap-1.5">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-3 h-3 rotate-45" style={{ background: i % 2 === 0 ? `${G}30` : 'transparent', border: `1px solid ${G}20` }} />
          ))}
        </div>
        <div className="h-px flex-1 max-w-[120px]" style={{ background: `linear-gradient(270deg, transparent, ${G}30)` }} />
      </div>

      {/* ═══════ ABOUT — Minimal ═══════ */}
      {hasMenu && (
        <section id="about-section" className="relative py-14 sm:py-20 overflow-hidden scroll-mt-20">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(106,191,75,0.05) 0%, transparent 65%)' }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.25em] mb-4 sm:mb-5" style={{ color: G }}>
              <Sparkles size={12} /> Sobre nosotros
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-black leading-[1] sm:leading-[0.9] mb-4 sm:mb-6 tracking-tight">
              LA DIFERENCIA<br />EST&Aacute; EN <span style={{ color: G }}>EL SMASH</span>
            </h2>
            <p className="text-white/40 leading-relaxed text-xs sm:text-base mb-8 sm:mb-12 max-w-lg mx-auto">Quincho&apos;s naci&oacute; en Orotina y creci&oacute; hasta Jac&oacute; y Esparza con una sola regla: hamburguesas smash hechas como se debe. Carne 100% Angus, sellada en plancha de hierro, queso que se derrite al instante y pan brioche fresco cada ma&ntilde;ana.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {[
                { label: 'Carne Angus 100%', desc: 'Sin mezclas. Sin rellenos. Solo res.' },
                { label: 'Pan Brioche Fresco', desc: 'Llega horneado cada ma\u00F1ana.' },
                { label: 'Tres Sucursales', desc: 'Orotina \u00B7 Jac\u00F3 \u00B7 Esparza' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${G}15` }}>
                    <CheckCircle2 size={22} style={{ color: G }} />
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
        <div className="h-px flex-1 max-w-[100px]" style={{ background: `linear-gradient(90deg, transparent, ${G}30)` }} />
        <Flame size={16} style={{ color: `${G}40` }} />
        <div className="h-px flex-1 max-w-[100px]" style={{ background: `linear-gradient(270deg, transparent, ${G}30)` }} />
      </div>

      {/* ═══════ REVIEWS — Premium (hidden on mobile) ═══════ */}
      <section id="reviews-section" className="hidden sm:block py-12 sm:py-20 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(106,191,75,0.03) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: G }}>
              <Star size={13} className="fill-current" /> Rese&ntilde;as
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">LO QUE DICEN<br />NUESTROS <span style={{ color: G }}>CLIENTES</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="group flex flex-col p-5 sm:p-7 rounded-xl sm:rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] transition-all duration-500 hover:translate-y-[-4px]" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.2)' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-current" style={{ color: G }} />
                  ))}
                </div>
                <p className="text-sm text-white/50 leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 mt-6 border-t border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: `${G}15`, color: G }}>
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

      {/* ═══════ LOCATIONS — Burga-style ═══════ */}
      {menu?.locations && Object.keys(menu.locations).length > 0 && (
        <section id="locations-section" className="py-10 sm:py-20 relative overflow-hidden scroll-mt-20">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(106,191,75,0.04) 0%, transparent 50%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-6 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-3 sm:mb-4" style={{ color: G }}>
                <MapPin size={13} /> Locales
              </div>
              <h2 className="text-xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">VISIT&Aacute;NOS<br /><span style={{ color: G }}>HORARIOS</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {Object.entries(menu.locations).map(([locKey, loc]) => {
                const hasLocMenu = loc.categories && loc.categories.length > 0
                const locWaLink = loc.whatsapp
                  ? `https://wa.me/${loc.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, quiero hacer un pedido en Quincho's — ${loc.name}`)}`
                  : waLink
                return (
                  <div key={locKey} className="group p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] transition-all duration-500 hover:translate-y-[-4px]" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 4px 30px rgba(0,0,0,0.2)' }}>
                    <div className="flex gap-1 mb-3 sm:mb-5 hidden sm:flex">
                      {[...Array(8)].map((_, j) => (
                        <div key={j} className="w-2.5 h-2.5 rotate-45 transition-all duration-500" style={{ background: j % 2 === 0 ? `${G}30` : 'transparent', border: `1px solid ${G}15` }} />
                      ))}
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110" style={{ background: `${G}10`, border: `1px solid ${G}15` }}>
                        <MapPin size={20} className="sm:w-6 sm:h-6" style={{ color: G }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-lg sm:text-2xl uppercase">Quincho&apos;s</h3>
                        <p className="text-xs sm:text-sm text-white/45 mt-0.5 truncate">{loc.name}</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-5 border-t border-white/[0.06]">
                      {menu.hours && (
                        <div className="flex items-start gap-3">
                          <Clock size={16} className="mt-0.5 shrink-0" style={{ color: G }} />
                          <div className="text-sm text-white/40 leading-relaxed">
                            <p className="font-bold text-white/60 mb-1">Horario</p>
                            <p>{menu.hours}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Truck size={16} style={{ color: G }} />
                        <span className="text-sm text-white/40">Pick up, Delivery y WhatsApp</span>
                      </div>
                      {loc.phone && (
                        <div className="flex items-center gap-3">
                          <Phone size={16} style={{ color: '#25D366' }} />
                          <span className="text-sm text-white/40">{`${loc.phone}${loc.phone2 ? ` / ${loc.phone2}` : ''}`}</span>
                        </div>
                      )}
                    </div>
                    {hasLocMenu ? (
                      <a href={`/site/${data.slug}/menu/${locKey}`} className="mt-4 sm:mt-6 flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 min-h-[44px] sm:min-h-[48px]" style={{ background: G, boxShadow: `0 4px 15px ${G}25` }}>
                        <UtensilsCrossed size={14} /> Ordenar <ArrowRight size={14} />
                      </a>
                    ) : locWaLink ? (
                      <a href={locWaLink} target="_blank" rel="noopener noreferrer" className="mt-4 sm:mt-6 flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 min-h-[44px] sm:min-h-[48px]" style={{ background: G, boxShadow: `0 4px 15px ${G}25` }}>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.06]" style={{ background: `linear-gradient(135deg, ${G}08, #0a0a0a, ${G}04)` }}>
          {/* Green glows */}
          <div className="absolute top-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[200px] opacity-[0.07]" style={{ background: G }} />
          <div className="absolute bottom-0 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full blur-[180px] opacity-[0.05]" style={{ background: G }} />

          <div className="relative grid sm:grid-cols-2 items-center">
            {/* Text side */}
            <div className="relative p-6 sm:p-12 lg:p-16 z-10">
              <div className="flex gap-1.5 mb-5 sm:mb-8 hidden sm:flex">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-3 h-3 rotate-45" style={{ background: i % 2 === 0 ? `${G}40` : 'transparent', border: `1px solid ${G}25` }} />
                ))}
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[0.9] mb-3 sm:mb-5 tracking-tight">
                SABOR QUE<br />SE SIENTE<br /><span style={{ color: G }}>EN CADA MORDIDA</span>
              </h2>
              <p className="text-white/40 max-w-md text-xs sm:text-base leading-relaxed">Carne 100% Angus aplastada en plancha caliente, queso derretido y pan brioche artesanal. As&iacute; es Quincho&apos;s.</p>
            </div>

            {/* Image side */}
            <div className="relative h-52 sm:h-full min-h-[220px] sm:min-h-[360px]">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=85"
                alt="Quincho's Smash Burger"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent sm:via-transparent sm:from-[#0a0a0a]/80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent sm:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-16 scroll-mt-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/[0.06] text-[11px] font-bold uppercase tracking-[0.25em] mb-4 sm:mb-5 text-white/40">
              <Mail size={13} /> Contacto
            </div>
            <h2 className="text-xl sm:text-4xl font-black mb-2 tracking-tight">PEDIDOS<br /><span style={{ color: G }}>ESPECIALES</span></h2>
            <p className="text-white/30 text-xs sm:text-base mt-2 sm:mt-3">D&eacute;janos tus datos y te escribimos</p>
          </div>
          {formSent ? (
            <div className="text-center p-14 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `${G}15` }}>
                <CheckCircle2 size={32} style={{ color: G }} />
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
              <button type="submit" disabled={formLoading} className="w-full py-4 rounded-xl text-sm font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]" style={{ background: G }}>
                {formLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Send size={16} /> Enviar mensaje</>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ═══════ FOOTER — Compact ═══════ */}
      <footer className="border-t border-white/[0.06] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Top row: brand + nav links inline */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${G}15` }}>
                <Flame size={16} style={{ color: G }} />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-tight leading-none">Quincho&apos;s</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5" style={{ color: G }}>Smash Burgers</p>
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
          {/* Bottom divider + copyright */}
          <div className="pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
            <p className="text-[10px] text-white/15">&copy; Quincho&apos;s {new Date().getFullYear()} &mdash; Todos los derechos reservados</p>
            <p className="text-[10px] text-white/15">Hecho con <a href="/" className="hover:text-white/30 transition-colors underline underline-offset-2">Swapture</a></p>
          </div>
        </div>
      </footer>

      {/* ═══════ CART PANEL ═══════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-3xl bg-[#111] border-t sm:border border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${G}15` }}>
                  <ShoppingCart size={18} style={{ color: G }} />
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
                    <p className="text-xs mt-0.5" style={{ color: G }}>{fmt(item.price)} c/u</p>
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
                  <span className="font-black text-xl" style={{ color: G }}>{fmt(cartTotal)}</span>
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
      <button onClick={() => setChatOpen(prev => !prev)} className={`fixed bottom-5 right-5 z-[80] w-12 h-12 rounded-full shadow-2xl hidden sm:flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${chatOpen ? '' : ''}`} style={{ background: G, boxShadow: `0 4px 20px ${G}50` }}>
        {chatOpen ? <X size={20} className="text-black" /> : <MessageCircle size={20} className="text-black" />}
        {!chatOpen && hasNotif && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#0a0a0a] animate-pulse" />}
      </button>

      {/* ═══════ CHATBOT PANEL ═══════ */}
      {chatOpen && (
        <div className="fixed inset-0 z-[70] sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[380px] sm:h-[520px] sm:rounded-2xl border-0 sm:border border-white/[0.08] bg-[#0f0f0f] shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 sm:py-3.5 border-b border-white/[0.06] flex items-center gap-3 shrink-0 bg-[#0a0a0a]" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${G}20` }}><Bot size={18} style={{ color: G }} /></div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0a0a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Asistente Quincho&apos;s</p>
              <p className="text-[11px] text-green-400/80">En l&iacute;nea &bull; Pod&eacute;s pedir desde aqu&iacute;</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="p-2 rounded-lg hover:bg-white/[0.06]"><X size={18} className="text-white/50" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {bubbles.map(renderBubble)}
            {chatLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${G}20` }}><Bot size={14} style={{ color: G }} /></div>
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
                <button type="submit" disabled={chatLoading || !chatInput.trim()} className="px-5 sm:px-4 py-3.5 sm:py-3 rounded-xl text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-30 font-bold min-w-[48px]" style={{ background: G }}><ArrowRight size={18} className="sm:w-4 sm:h-4" /></button>
              </form>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
