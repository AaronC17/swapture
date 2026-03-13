import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import MenuClient from '../MenuClient'

interface Props {
  params: { slug: string; location: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const client = await prisma.client.findUnique({ where: { slug: params.slug } })
  if (!client) return { title: 'No encontrado' }

  let menuData = null
  if (client.customNotes) {
    try { menuData = JSON.parse(client.customNotes) } catch { /* */ }
  }

  const locData = menuData?.locations?.[params.location]
  const locName = locData?.name || params.location

  return {
    title: `Menú ${locName} — ${client.businessName}`,
    description: `Menú completo de ${client.businessName} en ${locName}. Pedí online por WhatsApp.`,
  }
}

export default async function LocationMenuPage({ params }: Props) {
  const client = await prisma.client.findUnique({
    where: { slug: params.slug },
  })

  if (!client || client.status !== 'active') {
    notFound()
  }

  let menuData = null
  if (client.customNotes) {
    try { menuData = JSON.parse(client.customNotes) } catch { /* */ }
  }

  // Get location-specific menu
  const locData = menuData?.locations?.[params.location]

  if (!locData || !locData.categories?.length) {
    notFound()
  }

  // Build a MenuData-compatible object for this location
  const locationMenu = {
    categories: locData.categories,
    hours: locData.hours || menuData.hours,
    style: menuData.style,
  }

  const data = {
    slug: client.slug,
    businessName: client.businessName,
    whatsappNumber: locData.whatsapp || client.whatsappNumber,
    menuData: locationMenu,
    locationName: locData.name,
    locationPhone: locData.phone,
    locationPhone2: locData.phone2,
    locationSlug: params.location,
  }

  return <MenuClient data={data} />
}
