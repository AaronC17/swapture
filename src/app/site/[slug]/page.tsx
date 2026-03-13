import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteClient from './SiteClient'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const client = await prisma.client.findUnique({ where: { slug: params.slug } })
  if (!client) return { title: 'No encontrado' }

  return {
    title: `${client.businessName} — ${client.businessType}`,
    description: client.description || `${client.businessName} — ${client.businessType}`,
  }
}

export default async function SitePage({ params }: Props) {
  const client = await prisma.client.findUnique({
    where: { slug: params.slug },
  })

  if (!client || client.status !== 'active') {
    notFound()
  }

  const services = client.services ? client.services.split(',').map(s => s.trim()).filter(Boolean) : []

  // Parse menu data from customNotes if available (JSON)
  let menuData = null
  if (client.customNotes) {
    try { menuData = JSON.parse(client.customNotes) } catch { /* not JSON, ignore */ }
  }

  const data = {
    slug: client.slug,
    businessName: client.businessName,
    businessType: client.businessType,
    description: client.description,
    services,
    phone: client.phone,
    whatsappNumber: client.whatsappNumber,
    brandColor: client.brandColor,
    logoUrl: client.logoUrl,
    menuData,
  }

  return <SiteClient data={data} />
}
