import { useEffect, useRef } from 'react'

export function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) callback() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [callback, hasMore])

  return ref
}
