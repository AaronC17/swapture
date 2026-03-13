'use client'

import { useState } from 'react'
import { Settings, Globe, Zap, Bell, Shield, Palette, Save, Loader2, Check, ExternalLink } from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  icon: React.ElementType
  description: string
  items: Array<{ label: string; description: string; type: 'toggle' | 'text' | 'select'; key: string; value: string | boolean; options?: string[] }>
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    defaultPlan: 'growth',
    autoWelcomeEmail: true,
    leadNotifications: true,
    notificationEmail: 'admin@swapture.com',
    defaultBrandColor: '#a855f7',
    webhookUrl: '',
    webhookActive: false,
    maintenanceMode: false,
    autoLeadAssign: true,
    defaultWhatsappTemplate: '¡Hola {nombre}! Gracias por tu interés en {negocio}. ¿En qué podemos ayudarte?',
  })

  const update = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate save (in a real app, this would POST to an API)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sections: SettingSection[] = [
    {
      id: 'general', title: 'General', icon: Settings, description: 'Configuración general del sistema',
      items: [
        { label: 'Plan por defecto', description: 'Plan asignado a nuevos clientes', type: 'select', key: 'defaultPlan', value: settings.defaultPlan, options: ['básico', 'crecimiento', 'premium'] },
        { label: 'Modo mantenimiento', description: 'Desactiva el acceso de clientes temporalmente', type: 'toggle', key: 'maintenanceMode', value: settings.maintenanceMode },
        { label: 'Auto-asignar contactos', description: 'Los contactos se asignan automáticamente al cliente correspondiente', type: 'toggle', key: 'autoLeadAssign', value: settings.autoLeadAssign },
      ],
    },
    {
      id: 'notifications', title: 'Notificaciones', icon: Bell, description: 'Configura alertas y emails',
      items: [
        { label: 'Email de bienvenida', description: 'Enviar email automático al crear un cliente', type: 'toggle', key: 'autoWelcomeEmail', value: settings.autoWelcomeEmail },
        { label: 'Notificaciones de contactos', description: 'Recibir alerta cuando llega una nueva persona interesada', type: 'toggle', key: 'leadNotifications', value: settings.leadNotifications },
        { label: 'Email de notificaciones', description: 'Dirección donde recibes alertas', type: 'text', key: 'notificationEmail', value: settings.notificationEmail },
      ],
    },
    {
      id: 'branding', title: 'Branding', icon: Palette, description: 'Estilos por defecto para nuevos clientes',
      items: [
        { label: 'Color principal por defecto', description: 'Color de acento para las páginas de nuevos clientes', type: 'text', key: 'defaultBrandColor', value: settings.defaultBrandColor },
      ],
    },
    {
      id: 'integrations', title: 'Integraciones', icon: Zap, description: 'Webhooks y conexiones externas',
      items: [
        { label: 'Webhook activo', description: 'Enviar eventos a una URL externa', type: 'toggle', key: 'webhookActive', value: settings.webhookActive },
        { label: 'URL del webhook', description: 'Endpoint que recibirá los eventos (contactos, clientes, etc.)', type: 'text', key: 'webhookUrl', value: settings.webhookUrl },
      ],
    },
    {
      id: 'templates', title: 'Plantillas', icon: Globe, description: 'Mensajes predefinidos',
      items: [
        { label: 'Plantilla WhatsApp', description: 'Mensaje de primer contacto. Usa {nombre} y {negocio} como variables', type: 'text', key: 'defaultWhatsappTemplate', value: settings.defaultWhatsappTemplate },
      ],
    },
  ]

  const cls = "w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-muted/50"

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Configuración</h1>
          <p className="text-muted text-sm mt-1">Ajustes generales del sistema Swapture</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Guardado' : 'Guardar todo'}
        </button>
      </div>

      {sections.map(section => (
        <div key={section.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-1">
            <section.icon size={16} className="text-white/40" />
            <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">{section.title}</h2>
          </div>
          <p className="text-xs text-muted mb-4">{section.description}</p>

          <div className="space-y-4">
            {section.items.map(item => (
              <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted">{item.description}</p>
                </div>

                {item.type === 'toggle' && (
                  <button
                    onClick={() => update(item.key, !(item.value as boolean))}
                    className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${item.value ? 'bg-white/20' : 'bg-white/[0.06] border border-white/[0.08]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${item.value ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                )}

                {item.type === 'text' && (
                  <input type="text" value={item.value as string} onChange={e => update(item.key, e.target.value)} className={`${cls} sm:max-w-xs`} />
                )}

                {item.type === 'select' && (
                  <select value={item.value as string} onChange={e => update(item.key, e.target.value)} className={`${cls} sm:max-w-[160px]`}>
                    {item.options?.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quick links */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-white/40" />
          <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Accesos rápidos</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Gestionar clientes', href: '/admin/clients', desc: 'Ver y editar clientes' },
            { label: 'Nuevo cliente', href: '/admin/clients/new', desc: 'Crear un cliente nuevo' },
            { label: 'Todos los contactos', href: '/admin/leads', desc: 'Ver contactos de todos los clientes' },
          ].map(link => (
            <a key={link.href} href={link.href} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all group">
              <p className="text-sm font-medium flex items-center gap-1">{link.label} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></p>
              <p className="text-xs text-muted">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
