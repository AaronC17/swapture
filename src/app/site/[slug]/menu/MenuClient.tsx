'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ArrowLeft, Phone, ShoppingCart, Plus, Minus, Trash2,
  X, ChevronRight, Flame, Star,
  CheckCircle2, Clock, MapPin, Search
} from 'lucide-react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface MenuItem { name: string; desc: string; price: number }
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

/* ═══════════════════════════════════════════════
   VARIANT GROUPING
   ═══════════════════════════════════════════════ */
interface Variant { label: string; fullName: string; price: number }
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
    // Size variants (Small, Large, XL)
    for (const suf of SIZE_SUFFIXES) {
      if (item.name.endsWith(` ${suf}`)) {
        const base = item.name.slice(0, -(suf.length + 1))
        if (!groups.has(base)) { groups.set(base, { baseName: base, desc: item.desc, variants: [], kind: 'size' }); order.push(base) }
        groups.get(base)!.variants.push({ label: suf, fullName: item.name, price: item.price })
        matched = true; break
      }
    }
    // Liquid variants (Agua, Leche)
    if (!matched) {
      for (const suf of LIQUID_SUFFIXES) {
        if (item.name.endsWith(` ${suf}`)) {
          const base = item.name.slice(0, -(suf.length + 1))
          if (!groups.has(base)) { groups.set(base, { baseName: base, desc: item.desc, variants: [], kind: 'liquid' }); order.push(base) }
          groups.get(base)!.variants.push({ label: suf === '(Agua)' ? 'Agua' : 'Leche', fullName: item.name, price: item.price })
          matched = true; break
        }
      }
    }
    // Quantity variants (x6, x12)
    if (!matched) {
      for (const suf of QTY_SUFFIXES) {
        if (item.name.endsWith(` ${suf}`)) {
          const base = item.name.slice(0, -(suf.length + 1))
          if (!groups.has(base)) { groups.set(base, { baseName: base, desc: item.desc, variants: [], kind: 'size' }); order.push(base) }
          groups.get(base)!.variants.push({ label: suf, fullName: item.name, price: item.price })
          matched = true; break
        }
      }
    }
    if (!matched) {
      groups.set(item.name, { baseName: item.name, desc: item.desc, variants: [{ label: '', fullName: item.name, price: item.price }], kind: 'single' })
      order.push(item.name)
    }
  }
  return order.map(k => groups.get(k)!)
}

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */
const G = '#6abf4b'
const fmt = (n: number) => `₡${n.toLocaleString('es-CR')}`

/* ── Food images ── */
const itemImages: Record<string, string> = {
  // — Batidos —
  'Batido de Sandía (Agua)': '/resto%20de%20menu/sand%C3%ADa.png',
  'Batido de Sandía (Leche)': '/resto%20de%20menu/sand%C3%ADa.png',
  'Batido de Sandía': '/resto%20de%20menu/sand%C3%ADa.png',
  'Batido de Melón (Agua)': '/resto%20de%20menu/mel%C3%B3n.png',
  'Batido de Melón (Leche)': '/resto%20de%20menu/mel%C3%B3n.png',
  'Batido de Melón': '/resto%20de%20menu/mel%C3%B3n.png',
  'Batido de Fresa (Agua)': '/resto%20de%20menu/fresa.png',
  'Batido de Fresa (Leche)': '/resto%20de%20menu/fresa.png',
  'Batido de Fresa': '/resto%20de%20menu/fresa.png',
  // — Malteadas —
  'Malteada de Chicle': '/resto%20de%20menu/CHICLE.png',
  'Malteada de Taro': '/resto%20de%20menu/taro.png',
  'Malteada de Caramelo': '/resto%20de%20menu/caramelo.png',
  'Malteada de Algodón de Azúcar': '/resto%20de%20menu/ALGOD%C3%93N%20DE%20AZ%C3%9ACAR.png',
  'Malteada Algodón de Azúcar': '/resto%20de%20menu/ALGOD%C3%93N%20DE%20AZ%C3%9ACAR.png',
  'Malteada de Melón Verde': '/resto%20de%20menu/MELON%20VERDE.png',
  'Malteada de Crema': '/resto%20de%20menu/crema.png',
  // — Entradas / Snacks —
  'Palitos de Queso': '/menu/PALITOS%20DE%20QUESO.png',
  'Aros de Cebolla': '/menu/AROS%20DE%20CEBOLLA.png',
  'Bolitas de Yuca': '/menu/BOLITAS%20DE%20YUCA.png',
  // — Desayunos —
  'Quesopinto': '/menu/QUESOPINTO.png',
  'Pinto Económico': '/menu/pinto%20econ%C3%B3mico.png',
  'Burripinto': '/menu/BURRIPINTO.png',
  'Pinto de la Casa': '/menu/PINTO%20DE%20LA%20CASA.png',
  // — Casados —
  'Casado de Pescado': '/resto%20de%20menu/CASADO%20CON%20PESCADO.png',
  'Casado de Pollo': '/resto%20de%20menu/CASADO%20CON%20POLLO.png',
  'Casado de Mechada': '/resto%20de%20menu/CASADO%20CON%20CARNE.png',
  'Casado de Fajitas': '/resto%20de%20menu/CASADO%20CON%20FAJITAS.png',
  'Casado Carne Mechada': '/resto%20de%20menu/CASADO%20CON%20CARNE.png',
  'Casado Fajitas de Lomo': '/resto%20de%20menu/CASADO%20CON%20FAJITAS.png',
  'Casado Pescado': '/resto%20de%20menu/CASADO%20CON%20PESCADO.png',
  'Casado Pollo': '/resto%20de%20menu/CASADO%20CON%20POLLO.png',
  // — Classic Burgers —
  'Cheeseburger': '/menu/CHEESEBURGUER.png',
  'Bacon Cheeseburger': '/menu/bacon%20cheeseburguer.png',
  'Bacon Cheese': '/menu/bacon%20cheeseburguer.png',
  'Cheeseburger Bacon': '/menu/bacon%20cheeseburguer.png',
  'Doble Cheeseburger': '/menu/double%20cheeseburguer.png',
  'Doble Cheese': '/menu/double%20cheeseburguer.png',
  'Doble Bacon': '/menu/double%20bacon.png',
  'Triple Bacon': '/menu/triple%20bacon.png',
  'Oklahoma': '/menu/oklahoma.png',
  // — Premium Burgers —
  'Maradona': '/menu/maradona.png',
  'Portobello': '/menu/portobello.png',
  'Mar y Tierra': '/menu/mar%20y%20tierra.png',
  'Trufada': '/menu/trufada.png',
  'Tropical': '/menu/tropical.png',
  'Pork Belly': '/menu/pork%20belly.png',
  // — BBQ —
  'BBQ Burger': '/menu/oklahoma.png',
  'BBQ Bacon': '/menu/double%20bacon.png',
  'BBQ Pulled Pork': '/menu/PULLED%20PORK.png',
  'Pulled Pork': '/menu/PULLED%20PORK.png',
  'Pulled Pork Small': '/menu/PULLED%20PORK.png',
  'Pulled Pork Large': '/menu/PULLED%20PORK.png',
  'Onion BBQ': '/menu/ONION%20BBQ.png',
  'Cheeselover': '/menu/CHEESELOVER.png',
  'Cheeselover BBQ': '/menu/CHEESELOVER.png',
  // — Chicken Burgers —
  'Crispy Chicken': '/menu/CHICKEN%20CHIPOTLE.png',
  'Buffalo Chicken': '/menu/CHICKEN%20BBQ.png',
  'Chicken Bacon': '/menu/bacon%20cheeseburguer.png',
  'Chipotle Chicken': '/menu/CHICKEN%20CHIPOTLE.png',
  'Chicken Chipotle': '/menu/CHICKEN%20CHIPOTLE.png',
  'Chicken Jalapeña': '/menu/CHICKEN%20JALAPE%C3%91A.png',
  'Maple Fire Chicken': '/menu/MAPLE%20FIRE%20CHICKEN.png',
  'Chicken BBQ': '/menu/CHICKEN%20BBQ.png',
  // — Papas Orotina (Classic / Premium Fries con tallas) —
  'Classic Fries Small': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Classic Fries Medium': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Classic Fries Large': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Classic Fries XL': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Premium Fries Small': '/papas/PAPAS%20ESPECIALES.png',
  'Premium Fries Medium': '/papas/PAPAS%20ESPECIALES.png',
  'Premium Fries Large': '/papas/PAPAS%20ESPECIALES.png',
  'Premium Fries XL': '/papas/PAPAS%20ESPECIALES.png',
  // — Papas Jacó (Smash / Bacon Fries con tallas) —
  'Smash Fries Small': '/papas/PAPAS%20SMASH.png',
  'Smash Fries Medium': '/papas/PAPAS%20SMASH.png',
  'Smash Fries Large': '/papas/PAPAS%20SMASH.png',
  'Smash Fries XL': '/papas/PAPAS%20SMASH.png',
  'Bacon Fries Small': '/papas/PAPAS%20BACON.png',
  'Bacon Fries Medium': '/papas/PAPAS%20BACON.png',
  'Bacon Fries Large': '/papas/PAPAS%20BACON.png',
  // — Papas Esparza (con tallas) —
  'Francesas Small': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Francesas Large': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Gajo Small': '/papas/ORDEN%20DE%20GAJO.png',
  'Gajo Large': '/papas/ORDEN%20DE%20GAJO.png',
  'Salchipapas Small': '/papas/SALCHIPAPAS.png',
  'Salchipapas Large': '/papas/SALCHIPAPAS.png',
  'Papicarne Small': '/papas/PAPICARNE.png',
  'Papicarne Large': '/papas/PAPICARNE.png',
  'Gajo Mechada Small': '/papas/GAJO%20MECHADA.png',
  'Gajo Mechada Large': '/papas/GAJO%20MECHADA.png',
  'Salchipapicarne Small': '/papas/SALCHIPAPICARNE.png',
  'Salchipapicarne Large': '/papas/SALCHIPAPICARNE.png',
  'Papas Bacon Small': '/papas/PAPAS%20BACON.png',
  'Papas Bacon Large': '/papas/PAPAS%20BACON.png',
  'Papas Especiales Small': '/papas/PAPAS%20ESPECIALES.png',
  'Papas Especiales Large': '/papas/PAPAS%20ESPECIALES.png',
  'Papas Quincho Small': '/papas/PAPAS%20QUINCHO.png',
  'Papas Quincho Large': '/papas/PAPAS%20QUINCHO.png',
  'Smash Monster Small': '/papas/PAPAS%20SMASH.png',
  'Smash Monster Large': '/papas/PAPAS%20SMASH.png',
  'Monster Papas Small': '/papas/MONSTER%20PAPAS.png',
  'Monster Papas Large': '/papas/MONSTER%20PAPAS.png',
  'Papas Smash Small': '/papas/PAPAS%20SMASH.png',
  'Papas Smash Large': '/papas/PAPAS%20SMASH.png',
  // — Papas genéricas (sin talla) —
  'Papas Francesas': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Papas Gajo': '/papas/ORDEN%20DE%20GAJO.png',
  'Salchipapas': '/papas/SALCHIPAPAS.png',
  'Papicarne': '/papas/PAPICARNE.png',
  'Gajo Mechada': '/papas/GAJO%20MECHADA.png',
  'Salchipapicarne': '/papas/SALCHIPAPICARNE.png',
  'Bacon Fries': '/papas/PAPAS%20BACON.png',
  'Bacon Fries XL': '/papas/PAPAS%20BACON.png',
  'Papas Especiales': '/papas/PAPAS%20ESPECIALES.png',
  'Papas Quincho': '/papas/PAPAS%20QUINCHO.png',
  'Smash Fries': '/papas/PAPAS%20SMASH.png',
  'Monster Fries': '/papas/MONSTER%20PAPAS.png',
  'Monster Papas': '/papas/MONSTER%20PAPAS.png',
  'Papas Smash': '/papas/PAPAS%20SMASH.png',
  // — Menú Infantil —
  'Papas Jr': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Salchipapas Jr': '/papas/SALCHIPAPAS.png',
  // — Sin imagen local → fallback —
  'Nachos Mix': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Pollo': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Pulled Pork': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Mechada': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Mechada': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Camarón': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Camarón': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Mar y Tierra': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Mixto': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Trozos de Res': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Res': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Platinacho': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Quesadilla': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Queso': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Pollo': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Pollo': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Pulled Pork': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Mechada': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Mixta': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Trozos de Res': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Camarón': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Mechada': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Fajitas': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Camarón': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Mar y Tierra': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Burrito': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Queso': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Pollo': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Pollo': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Pulled Pork': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Mechada': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Mixto': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Chicharrón': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Trozos de Res': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Camarón': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Mechada': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Fajitas': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Camarón': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Mar y Tierra': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Deditos de Queso': 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=500&h=500&fit=crop&q=80',
  'Hamburguesa Jr': '/menu/CHEESEBURGUER.png',
  'Dedos de Pollo': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=500&fit=crop&q=80',
}

const fallbackImage = 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=500&fit=crop&q=80'

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export default function MenuClient({ data }: { data: MenuSiteData }) {
  const menu = data.menuData
  const [activeCat, setActiveCat] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 120)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Cart state ── */
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  /* ── Checkout flow: collect name + phone before sending ── */
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'info' | 'confirm'>('cart')
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custOrderType, setCustOrderType] = useState<'recoger' | 'envio'>('recoger')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [addedItem, setAddedItem] = useState<string | null>(null)
  const [cartBumped, setCartBumped] = useState(false)
  const [variantSel, setVariantSel] = useState<Record<string, string>>({})
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

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
    return `Nuevo pedido — Quincho's Smash Burger${locLabel}${nameLabel}${phoneLabel}${typeLabel}\n\n${lines.join('\n')}\n\nTotal: ${fmt(cartTotal)}\n\n¡Gracias por tu orden!`
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
    ? menu.categories.flatMap(cat => cat.items.filter(item => {
        const q = searchQuery.toLowerCase()
        return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
      }).map(item => ({ ...item, catName: cat.name })))
    : []

  const totalItems = menu.categories.reduce((s, c) => s + c.items.length, 0)

  /* ── Scroll active tab into view ── */
  useEffect(() => {
    if (tabsRef.current) {
      const btn = tabsRef.current.children[activeCat] as HTMLElement | undefined
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeCat])

  return (
    <div className="relative min-h-screen max-w-full overflow-x-clip text-white selection:bg-green-500/30" style={{ background: 'linear-gradient(180deg, #0d0f0c 0%, #0a0b09 35%, #0c0d0b 70%, #0a0b09 100%)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${G}04, transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, ${G}02, transparent 60%)` }} />

      {/* ═══════ FLOATING NAV ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-3 sm:mx-8 mt-3 sm:mt-4">
          <div className={`max-w-6xl mx-auto flex items-center justify-between h-12 sm:h-14 px-4 sm:px-5 rounded-2xl transition-all duration-500 border ${scrolled ? 'bg-[#0b0c0a]/95 backdrop-blur-2xl border-white/[0.08]' : 'bg-black/40 backdrop-blur-xl border-white/[0.04]'}`} style={{ boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.2)' }}>
            {/* Back */}
            <Link href={`/site/${data.slug}/menu`} className="flex items-center gap-2 text-white/50 hover:text-white transition-all group">
              <span className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] hidden sm:inline">Sucursales</span>
            </Link>

            {/* Center brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${G}15` }}>
                <Flame size={13} style={{ color: G }} />
              </div>
              <div className="leading-none">
                <span className="text-xs font-black tracking-tight uppercase">Quincho&apos;s</span>
                <p className="text-[7px] sm:text-[8px] font-bold tracking-[0.2em] uppercase" style={{ color: `${G}90` }}>
                  {data.locationName || 'Menú'}
                </p>
              </div>
            </div>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-[11px] font-bold transition-colors hover:scale-105 active:scale-95 ${cartBumped ? 'cart-bump' : ''}`}
              style={{
                background: cartBumped ? `${G}22` : 'rgba(255,255,255,0.04)',
                color: cartCount > 0 ? G : 'rgba(255,255,255,0.5)',
                border: `1px solid ${cartCount > 0 ? `${G}40` : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <ShoppingCart size={13} />
              {cartCount > 0 && (
                <span className="text-[10px] font-black" style={{ color: G }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO BANNER ═══════ */}
      <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden flex items-center justify-center" style={{ background: '#0b0c0a' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0a] via-transparent to-[#0b0c0a]/60" />

        <div className="relative z-10 flex flex-col items-center justify-end h-full w-full max-w-6xl mx-auto px-5 sm:px-8 pb-6 sm:pb-8">
            {/* Location + phone pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.06] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: G }}>
                <Star size={9} className="fill-current" /> {data.locationName || 'Smash Burgers'}
              </div>
              {data.locationPhone && (
                <div className="inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-xl border border-white/[0.06] text-[9px] font-medium text-white/50 break-all">
                  <Phone size={8} /> {`${data.locationPhone}${data.locationPhone2 ? ` / ${data.locationPhone2}` : ''}`}
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[0.9] text-center">
              Nuestro <span style={{ color: G }}>Men&uacute;</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-white/40 mt-1.5 font-medium text-center">
              {menu.categories.length} categorías · {totalItems} productos
            </p>
        </div>
      </div>

      {/* ═══════ SEARCH / INFO BAR ═══════ */}
      <div className="border-b border-white/[0.05] bg-[#0b0c0a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            {menu.hours && (
              <div className="flex items-center gap-1.5 text-white/45 shrink-0">
                <Clock size={11} style={{ color: `${G}80` }} />
                <span className="text-[10px] sm:text-[11px] font-medium max-w-[44vw] truncate sm:max-w-none">{menu.hours}</span>
              </div>
            )}
            {data.locationName && (
              <div className="flex items-center gap-1.5 text-white/45 shrink-0 hidden sm:flex">
                <MapPin size={11} style={{ color: `${G}80` }} />
                <span className="text-[11px] font-medium">{data.locationName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
        </div>

        {/* Expanded search */}
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
                const img = itemImages[item.name] || fallbackImage
                return (
                  <div key={idx} className="group flex gap-3.5 p-3 rounded-2xl border border-white/[0.07] bg-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                    <div className="w-[80px] h-[80px] rounded-xl overflow-hidden shrink-0 border border-white/[0.04]" style={{ background: 'rgba(18,20,16,0.95)' }}>
                      <img src={img} alt={item.name} className="w-full h-full object-contain p-1.5 drop-shadow-xl" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-white/35 mb-0.5">{item.catName}</p>
                        <h4 className="font-bold text-[13px] truncate leading-tight">{item.name}</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-black" style={{ color: G }}>{fmt(item.price)}</span>
                        {inCart ? (
                          <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
                            <button onClick={() => updateQty(item.name, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10"><Minus size={11} /></button>
                            <span className="w-5 text-center text-[11px] font-bold">{inCart.qty}</span>
                            <button onClick={() => updateQty(item.name, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10"><Plus size={11} /></button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform" style={{ background: G }}>
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
          <div className="sticky top-[3.25rem] sm:top-[3.75rem] z-40 backdrop-blur-2xl border-b border-white/[0.06]" style={{ background: 'rgba(11,12,10,0.97)' }}>
            <div className="max-w-6xl mx-auto">
              <div ref={tabsRef} className="flex gap-1.5 overflow-x-auto px-3 sm:px-8 py-2.5 sm:py-3 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                {menu.categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCat(i)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all snap-start ${
                      activeCat === i
                        ? 'text-black'
                        : 'text-white/45 bg-white/[0.04] hover:text-white/65 hover:bg-white/[0.07]'
                    }`}
                    style={activeCat === i ? { background: G, boxShadow: `0 2px 15px ${G}25` } : undefined}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* ═══════ MENU ITEMS ═══════ */}
          <main className="relative max-w-6xl mx-auto w-full px-3 sm:px-8 py-4 sm:py-8 pb-28 overflow-x-clip">
            {/* Ambient category glow */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full blur-[140px] opacity-[0.05] pointer-events-none" style={{ background: G }} />
            {menu.categories.map((cat, ci) => ci === activeCat && (
              <div key={ci} className="relative">
                {/* Category header */}
                <div className="mb-4 sm:mb-7">
                  <div className="flex items-center gap-3 mb-2.5 sm:mb-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: `${G}15`, border: `1px solid ${G}22` }}>
                      <span className="text-sm sm:text-base font-black" style={{ color: G }}>{cat.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm sm:text-xl font-black uppercase tracking-tight leading-tight">{cat.name}</h2>
                      <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5 font-medium">{cat.items.length} opciones disponibles</p>
                    </div>
                  </div>
                  <div className="h-px" style={{ background: `linear-gradient(90deg, ${G}25, ${G}08, transparent)` }} />
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
                        const img = itemImages[di.baseName] || itemImages[selV.fullName] || fallbackImage
                        const justAdded = addedItem === selV.fullName
                        const isLoneOnMobile = total % 2 === 1 && idx === total - 1
                        const isLoneOnDesktop = total % 3 === 1 && idx === total - 1

                        return (
                          <div
                            key={idx}
                            className={`group relative rounded-xl sm:rounded-2xl overflow-hidden duration-300 ${justAdded ? 'item-pop' : ''} ${isLoneOnMobile ? 'col-span-2 max-w-[48%] mx-auto w-full lg:col-span-1 lg:max-w-full lg:mx-0' : ''} ${isLoneOnDesktop ? 'lg:col-start-2' : ''}`}
                            style={{
                              background: 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
                              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${justAdded ? `${G}55` : 'rgba(255,255,255,0.07)'}, 0 8px 32px rgba(0,0,0,0.35)`,
                              transition: 'box-shadow 0.3s ease',
                            }}
                          >
                            {/* Image */}
                            <div className="relative h-36 sm:h-48 lg:h-52 overflow-hidden" style={{ background: 'rgba(18,20,16,0.95)' }}>
                              <img
                                src={img}
                                alt={di.baseName}
                                className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-[1.04] transition-transform duration-500 drop-shadow-2xl"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0a] via-transparent to-transparent opacity-80" />

                              {/* Price pill */}
                              <div key={selV.fullName} className="price-flip absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-xl bg-black/60 border border-white/[0.08]">
                                <span className="text-[11px] sm:text-[13px] font-black" style={{ color: G }}>{fmt(selV.price)}</span>
                              </div>

                              {/* Premium tag */}
                              {selV.price >= 8000 && (
                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 rounded-md backdrop-blur-xl bg-black/60 border border-white/[0.08]">
                                  <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5" style={{ color: G }}>
                                    <Star size={6} className="fill-current" /> Premium
                                  </span>
                                </div>
                              )}

                              {/* Added animation */}
                              {justAdded && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
                                      style={{ background: G, animation: 'checkIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
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
                                        onClick={() => setVariantSel(prev => ({ ...prev, [di.baseName]: v.fullName }))}
                                        className="min-w-[2.25rem] px-1.5 py-0.5 rounded text-[9px] font-bold text-center transition-all duration-150"
                                        style={isSel
                                          ? { background: G, color: '#000' }
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
                                    <button onClick={() => updateQty(selV.fullName, -1)} className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors">
                                      <Minus size={11} />
                                    </button>
                                    <span className="w-4 sm:w-5 text-center text-[11px] font-bold">{inCart.qty}</span>
                                    <button onClick={() => updateQty(selV.fullName, 1)} className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors">
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart({ name: selV.fullName, price: selV.price })}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-black transition-all hover:scale-110 active:scale-90"
                                    style={{ background: G, boxShadow: `0 3px 12px ${G}25` }}
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
                {ci < menu.categories.length - 1 && (
                  <div className="mt-6 sm:mt-10 flex justify-center">
                    <button
                      onClick={() => setActiveCat(ci + 1)}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold text-white/45 bg-white/[0.06] border border-white/[0.08] hover:text-white/60 hover:bg-white/[0.08] transition-all"
                    >
                      Siguiente: {menu.categories[ci + 1].name} <ChevronRight size={11} />
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
          <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl bg-[#0e100d] border-t sm:border border-white/[0.07] shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/[0.04] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${G}10`, border: `1px solid ${G}12` }}>
                  <ShoppingCart size={16} style={{ color: G }} />
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
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/[0.04]" style={{ background: 'rgba(18,20,16,0.95)' }}>
                    <img src={itemImages[item.name] || fallbackImage} alt={item.name} className="w-full h-full object-contain p-1 drop-shadow-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[13px] truncate">{item.name}</h4>
                    <p className="text-[11px] mt-0.5 font-bold" style={{ color: G }}>{fmt(item.price * item.qty)}</p>
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

                {/* ── STEP: CART (default) ── */}
                {checkoutStep === 'cart' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/30 text-sm font-medium">Total</span>
                      <span className="font-black text-lg sm:text-xl" style={{ color: G }}>{fmt(cartTotal)}</span>
                    </div>
                    {orderSent ? (
                      <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/15 text-[#25D366] font-bold text-sm">
                        <CheckCircle2 size={16} /> ¡Orden enviada!
                      </div>
                    ) : (
                      <button
                        onClick={() => { setCheckoutStep('info'); setTimeout(() => nameInputRef.current?.focus(), 200) }}
                        className="w-full py-3.5 rounded-2xl text-[12px] sm:text-[13px] font-black text-black transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[46px]"
                        style={{ background: G, boxShadow: `0 4px 20px ${G}30` }}
                      >
                        <ShoppingCart size={15} /> Confirmar pedido
                      </button>
                    )}
                  </>
                )}

                {/* ── STEP: INFO (collect name + phone) ── */}
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
                          style={custOrderType === opt ? { background: G } : {}}
                        >
                          {opt === 'recoger' ? 'Para recoger' : 'Envío'}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { if (custName.trim() && custPhone.trim()) setCheckoutStep('confirm') }}
                      disabled={!custName.trim() || !custPhone.trim()}
                      className="w-full py-3.5 rounded-2xl text-[12px] sm:text-[13px] font-black text-black transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[46px] disabled:opacity-30 disabled:pointer-events-none"
                      style={{ background: G, boxShadow: `0 4px 20px ${G}30` }}
                    >
                      Continuar <ChevronRight size={14} />
                    </button>
                  </>
                )}

                {/* ── STEP: CONFIRM (order summary + send) ── */}
                {checkoutStep === 'confirm' && (
                  <>
                    <button onClick={() => setCheckoutStep('info')} className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/60 font-medium transition-colors mb-1">
                      <ArrowLeft size={12} /> Editar datos
                    </button>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-2">
                      <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Resumen del pedido</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/50">👤</span>
                        <span className="text-white/80 font-medium">{custName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/50">📱</span>
                        <span className="text-white/80 font-medium">{custPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/50">{custOrderType === 'recoger' ? '🏠' : '🛵'}</span>
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
                        <span className="font-black text-base" style={{ color: G }}>{fmt(cartTotal)}</span>
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
    </div>
  )
}
