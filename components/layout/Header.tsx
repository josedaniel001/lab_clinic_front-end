import { SmartConnectionStatus } from "@/components/ui/SmartConnectionStatus"
import Image from "next/image"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Image
          src="/logo-labofutura.png"
          alt="LaboFutura"
          width={120}
          height={40}
          className="object-contain"
          priority
        />
        <SmartConnectionStatus />
      </div>
    </header>
  )
}
