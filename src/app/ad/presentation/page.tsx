import { readFileSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import PresentationClient from './PresentationClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Swapture — Video de presentación',
  robots: { index: false, follow: false },
}

export interface StoryboardBeat {
  id: string
  start: number
  end: number
  layout: 'center' | 'split'
  screen: 'full-text' | 'logo' | 'phone' | 'admin' | 'cta'
  text: string
  subtext: string | null
  voiceover: string
  video: 'customer' | 'admin' | null
}

export interface Storyboard {
  title: string
  totalDuration: number
  voice: string
  language: string
  beats: StoryboardBeat[]
}

export default function AdPresentationPage() {
  const raw = readFileSync(join(process.cwd(), 'scripts', 'storyboard.json'), 'utf8')
  const storyboard: Storyboard = JSON.parse(raw)

  return <PresentationClient storyboard={storyboard} />
}
