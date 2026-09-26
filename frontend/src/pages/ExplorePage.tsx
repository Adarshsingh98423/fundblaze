import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, TrendingUp, Users, X } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { CampaignCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useInfiniteCampaigns } from '@/hooks/useCampaigns'
import { useDebounce } from '@/hooks/useDebounce'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { CampaignCategory } from '@/types/campaign.types'
import { cn } from '@/utils/cn'

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'Technology', label: 'Tech' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Education', label: 'Education' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Community', label: 'Community' },
]

const SORT_OPTIONS = [
  { value: 'trending', label: '🔥 Trending' },
  { value: 'newest', label: '✨ Newest' },
  { value: 'most_funded', label: '💰 Most Funded' },
  { value: 'ending_soon', label: '⏳ Ending Soon' },
]

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'trending')
  const debouncedQuery = useDebounce(query, 300)

  // Sync to URL
  useEffect(() => {
    const params: Record<string, string> = {}
    if (debouncedQuery) params.q = debouncedQuery
    if (category !== 'all') params.category = category
    if (sort !== 'trending') params.sort = sort
    setSearchParams(params, { replace: true })
  }, [debouncedQuery, category, sort, setSearchParams])

  const params = {
    q: debouncedQuery || undefined,
    category: category !== 'all' ? (category as CampaignCategory) : undefined,
    sort: sort as 'trending' | 'newest' | 'most_funded' | 'ending_soon',
    limit: 9,
  }

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteCampaigns(params)
  const sentinelRef = useInfiniteScroll(() => { if (hasNextPage) fetchNextPage() }, !!hasNextPage)

  const allCampaigns = data?.pages.flatMap(p => p.data) ?? []
  const totalCount = data?.pages[0]?.total ?? 0

  return (
    <PageWrapper>
      {/* Hero header */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-sans font-extrabold text-4xl sm:text-5xl text-white mb-3"
          >
            Discover Your Next <span className="gradient-text">Inspiration</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary mb-8 max-w-xl mx-auto"
          >
            Explore thousands of innovative projects across technology, art, community, and more. Support the visions that matter to you.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-lg mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search campaigns, creators, or categories..."
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:bg-white/8 text-sm transition-all"
              aria-label="Search campaigns"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                  category === cat.value
                    ? 'bg-primary text-white border-primary shadow-glow'
                    : 'bg-white/5 border-white/10 text-text-secondary hover:text-white hover:border-white/20'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Stats + Sort */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-primary" /> {totalCount.toLocaleString()} Live</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 22k Donors</span>
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                aria-label="Sort campaigns"
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-text-secondary focus:outline-none focus:border-primary/40 appearance-none"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-bg-card">{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results header */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sans font-bold text-lg text-white">
              Featured Campaigns
              {totalCount > 0 && <span className="ml-2 text-sm font-normal text-text-muted">{totalCount} Projects</span>}
            </h2>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <CampaignCardSkeleton key={i} />)}
          </div>
        ) : allCampaigns.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-sans font-bold text-xl text-white mb-2">No campaigns found</h3>
            <p className="text-text-muted mb-6">Try adjusting your search or filter criteria.</p>
            <Button variant="ghost" onClick={() => { setQuery(''); setCategory('all') }}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCampaigns.map((c, i) => <CampaignCard key={c.id} campaign={c} index={i % 9} />)}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 text-text-muted text-sm">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading more campaigns...
            </div>
          )}
          {!hasNextPage && allCampaigns.length > 0 && (
            <p className="text-text-muted text-sm">Showing all {totalCount} campaigns</p>
          )}
        </div>

        {/* Email subscribe */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 rounded-2xl bg-gradient-to-br from-bg-elevated to-bg-card border border-white/8 p-8 sm:p-12"
        >
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4">
                🔥 Early Access
              </div>
              <h3 className="font-sans font-bold text-2xl text-white mb-2">Get the latest projects delivered to your inbox.</h3>
              <p className="text-text-muted text-sm">Join 50,000+ backers and be the first to hear about trending campaigns and exclusive creator updates.</p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/40"
              />
              <Button>Subscribe Now</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
