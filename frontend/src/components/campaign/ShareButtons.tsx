import { Twitter, Facebook, Link2, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/cn'

interface ShareButtonsProps {
  url?: string
  title?: string
  className?: string
}

export function ShareButtons({ url, title = 'Check out this campaign!', className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || window.location.href
  const encoded = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
        target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-lg bg-white/5 border border-white/8 text-text-muted hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 transition-all"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-lg bg-white/5 border border-white/8 text-text-muted hover:text-[#1877F2] hover:border-[#1877F2]/30 transition-all"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <button
        onClick={handleCopy}
        className={cn(
          'p-2 rounded-lg border transition-all',
          copied
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-white/5 border-white/8 text-text-muted hover:text-white hover:border-white/20'
        )}
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
