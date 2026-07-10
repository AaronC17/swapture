import Image from 'next/image'

export default function Logo({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logotipo.png"
      alt="Swapture"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
