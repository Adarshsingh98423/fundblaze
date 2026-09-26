import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { campaignService } from '@/services/campaign.service'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, Flame, Users, TrendingUp, Download, Plus, Edit,
  ExternalLink, Share2, Trash2, ArrowUpRight, Check, X, Camera, UploadCloud,
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/campaign/ProgressBar'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/utils/formatCurrency'
import { getTimeAgo } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { Campaign } from '@/types/campaign.types'

const TABS = ['Overview', 'My Campaigns', 'Donations', 'Analytics', 'Settings']

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'gold'> = {
  active: 'success',
  draft: 'warning',
  funded: 'gold',
  ended: 'default',
}

const profileSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  contactEmail: z.string().email('Invalid email address').or(z.literal('').transform(() => undefined)).optional(),
  bio: z.string().max(500).optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

export function DashboardPage() {
  const { user, updateUser } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { toastError('File too large', 'Max size is 5 MB.'); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = e => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleAvatarDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleAvatarFile(file)
  }, [handleAvatarFile])

  const removeAvatar = () => { setAvatarPreview(null); setAvatarFile(null) }
  const qc = useQueryClient()
  const navigate = useNavigate()

  // Read ?tab= from URL so links like /dashboard?tab=Settings work
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const initialTab = TABS.includes(tabFromUrl ?? '') ? (tabFromUrl as string) : 'Overview'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Keep URL in sync when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchParams(tab === 'Overview' ? {} : { tab })
  }

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: myCampaigns = [] } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: userService.getMyCampaigns,
    enabled: !!user,
  })

  const { data: myDonationsRes } = useQuery({
    queryKey: ['my-donations'],
    queryFn: () => userService.getMyDonations(1),
    enabled: !!user,
  })

  const { data: statsData } = useQuery({
    queryKey: ['my-stats'],
    queryFn: userService.getMyStats,
    enabled: !!user,
  })

  const myDonations = myDonationsRes?.data ?? []
  const weeklyChart = statsData?.weeklyChart ?? []
  const recentDonations = statsData?.recentDonations ?? []
  const donationSources = statsData?.donationSources ?? []

  // ── Stats cards ──────────────────────────────────────────────────────────
  const stats = [
    {
      icon: DollarSign,
      label: 'Total Raised',
      value: statsData ? formatCurrency(statsData.totalRaised) : '—',
      sub: `${statsData?.totalCampaigns ?? 0} campaigns total`,
    },
    {
      icon: Flame,
      label: 'Active Campaigns',
      value: statsData ? String(statsData.activeCampaigns) : '—',
      sub: `${statsData?.fundedCampaigns ?? 0} funded`,
    },
    {
      icon: Users,
      label: 'Total Donors',
      value: statsData ? statsData.totalDonors.toLocaleString() : '—',
      sub: 'all time',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Donation',
      value: statsData ? formatCurrency(statsData.avgDonation) : '—',
      sub: 'per supporter',
    },
  ]

  // ── Delete campaign ──────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-campaigns'] })
      qc.invalidateQueries({ queryKey: ['my-stats'] })
      success('Campaign deleted', 'Your campaign has been removed.')
      setDeletingId(null)
    },
    onError: () => toastError('Delete failed', 'Could not delete campaign.'),
  })

  // ── Profile settings form ────────────────────────────────────────────────
  const { register: regProfile, handleSubmit: hsProfile, formState: { errors: peErrors, isSubmitting: pSubmitting } } =
    useForm<ProfileForm>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        name: user?.name ?? '',
        contactEmail: user?.contactEmail ?? '',
        bio: user?.bio ?? '',
        socialLinks: { twitter: user?.socialLinks?.twitter ?? '', linkedin: user?.socialLinks?.linkedin ?? '', website: user?.socialLinks?.website ?? '' },
      },
    })

  const saveProfile = async (data: ProfileForm) => {
    try {
      let avatarUrl = user?.avatar
      if (avatarFile) {
        // Convert to base64 data URL for local preview persistence (no real server)
        avatarUrl = avatarPreview ?? user?.avatar
      }
      const updated = await userService.updateProfile({ ...data, avatar: avatarUrl })
      updateUser(updated)
      if (avatarPreview) updateUser({ ...updated, avatar: avatarPreview })
      success('Profile saved', 'Your changes have been saved.')
    } catch {
      toastError('Save failed', 'Could not update profile.')
    }
  }

  // ── Export CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Donor', 'Campaign', 'Amount', 'Method', 'Date'],
      ...myDonations.map((d: any) => [
        d.anonymous ? 'Anonymous' : (d.donorName || 'Supporter'),
        d.campaignTitle || '',
        d.amount,
        d.paymentMethod,
        new Date(d.createdAt).toLocaleDateString(),
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'fundblaze-donations.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-sans font-extrabold text-3xl text-white">Creator Dashboard</h1>
              <p className="text-text-muted mt-1">
                Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening with your campaigns.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-1" /> Export Data
              </Button>
              <Link to="/campaigns/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Create New Campaign
                </Button>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/8 mb-8 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    'px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap',
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── Overview Tab ─────────────────────────────────────────────── */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-text-muted">{s.label}</span>
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <s.icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <p className="font-sans font-extrabold text-2xl text-white mb-1">{s.value}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-success" />{s.sub}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Area chart */}
                <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">Fundraising Progress</h3>
                      <p className="text-xs text-text-muted mt-0.5">Donations over the last 7 days</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Live Updates
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={weeklyChart.length ? weeklyChart : [{ day: 'Mon', amount: 0 }]}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: '#60607A', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#60607A', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={v => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                        labelStyle={{ color: '#fff', fontWeight: 600 }}
                        itemStyle={{ color: '#FF6B00' }}
                        formatter={(v: number) => [`₹${v}`, 'Donations']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#FF6B00" strokeWidth={2.5}
                        fill="url(#colorAmt)" dot={false} activeDot={{ r: 5, fill: '#FF6B00' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <h3 className="font-semibold text-white mb-1">Donation Sources</h3>
                  <p className="text-xs text-text-muted mb-4">Where your support is coming from</p>
                  {donationSources.length === 0 ? (
                    <div className="flex items-center justify-center h-[180px] text-text-muted text-sm">
                      No donation data yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={donationSources} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          dataKey="value" strokeWidth={0}>
                          {donationSources.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                          labelStyle={{ color: '#fff' }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {donationSources.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-xs text-text-muted">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campaigns + Activity */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">My Campaigns</h3>
                      <span className="text-xs bg-white/8 px-2 py-0.5 rounded-full text-text-muted">
                        {myCampaigns.length} Total
                      </span>
                    </div>
                    <button onClick={() => handleTabChange('My Campaigns')} className="text-xs text-primary hover:text-primary-light transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {myCampaigns.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center gap-4">
                        {c.coverImage ? <img src={c.coverImage} alt="" className="w-14 h-10 object-cover rounded-xl shrink-0" /> : <div className="w-14 h-10 rounded-xl shrink-0 bg-white/8" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white truncate">{c.title}</span>
                            <Badge variant={statusVariant[c.status] || 'default'} size="sm">{c.status}</Badge>
                          </div>
                          <ProgressBar current={c.raisedAmount} goal={c.goalAmount} size="sm" />
                          <p className="text-xs text-text-muted mt-1">{formatCurrency(c.raisedAmount)} of {formatCurrency(c.goalAmount)}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Link to={`/campaigns/${c.slug}`}>
                            <button className="p-1.5 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    {myCampaigns.length === 0 && (
                      <p className="text-sm text-text-muted text-center py-4">No campaigns yet. <Link to="/campaigns/new" className="text-primary hover:underline">Create one!</Link></p>
                    )}
                  </div>
                </div>

                {/* Recent Activity + Profile */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentDonations.slice(0, 3).map(d => (
                        <div key={d.id} className="flex items-center gap-3">
                          <Avatar src={d.donorAvatar} fallback={d.donorName?.[0] || '?'} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium truncate">{d.donorName} donated</p>
                            <p className="text-sm font-bold text-primary">{formatCurrency(d.amount)}</p>
                          </div>
                          <span className="text-xs text-text-muted shrink-0">{getTimeAgo(d.createdAt)}</span>
                        </div>
                      ))}
                      {recentDonations.length === 0 && (
                        <p className="text-xs text-text-muted text-center py-2">No donations yet.</p>
                      )}
                    </div>
                    {recentDonations.length > 0 && (
                      <button
                        onClick={() => handleTabChange('Donations')}
                        className="mt-4 w-full text-xs text-primary text-center hover:text-primary-light transition-colors"
                      >
                        View Full Transaction Log
                      </button>
                    )}
                  </div>

                  {user && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
                      <Avatar src={user.avatar} fallback={user.name} size="xl" className="mx-auto mb-3" />
                      <p className="font-semibold text-white mb-1">{user.name}</p>
                      <p className="text-xs text-text-muted mb-4 capitalize">{user.role} • Member</p>
                      <Link to={`/profile/${user.username}`}>
                        <Button variant="ghost" size="sm" fullWidth>View Public Profile</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── My Campaigns Tab ────────────────────────────────────────── */}
          {activeTab === 'My Campaigns' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">All My Campaigns ({myCampaigns.length})</h3>
                <Link to="/campaigns/new">
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Campaign</Button>
                </Link>
              </div>

              {/* Confirm delete dialog */}
              {deletingId && (
                <div className="mb-4 p-4 rounded-2xl border border-error/30 bg-error/5 flex items-center justify-between gap-4">
                  <p className="text-sm text-white">Are you sure you want to delete this campaign?</p>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(deletingId)}
                      disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.03]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Campaign', 'Status', 'Raised', 'Goal', '%', 'Donors', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myCampaigns.map(c => {
                      const pct = c.goalAmount > 0 ? Math.round((c.raisedAmount / c.goalAmount) * 100) : 0
                      return (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {c.coverImage ? <img src={c.coverImage} alt="" className="w-10 h-7 object-cover rounded-lg shrink-0" /> : <div className="w-10 h-7 rounded-lg shrink-0 bg-white/8" />}
                              <span className="text-sm text-white font-medium line-clamp-1 max-w-[180px]">{c.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4"><Badge variant={statusVariant[c.status] || 'default'}>{c.status}</Badge></td>
                          <td className="px-4 py-4 text-sm font-semibold text-white">{formatCurrency(c.raisedAmount)}</td>
                          <td className="px-4 py-4 text-sm text-text-muted">{formatCurrency(c.goalAmount)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <ProgressBar current={c.raisedAmount} goal={c.goalAmount} size="sm" className="w-16" />
                              <span className="text-xs text-text-muted">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-text-muted">{c.donorCount}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1">
                              <Link to={`/campaigns/${c.slug}`}>
                                <button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/8 transition-all" title="View">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/8 transition-all"
                                title="Delete"
                                onClick={() => setDeletingId(c.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {myCampaigns.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted text-sm">
                        No campaigns yet. <Link to="/campaigns/new" className="text-primary hover:underline">Create your first campaign!</Link>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Donations Tab ────────────────────────────────────────────── */}
          {activeTab === 'Donations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">My Donation History ({myDonationsRes?.total ?? 0})</h3>
                <Button variant="ghost" size="sm" onClick={exportCSV}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Campaign', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myDonations.map((d: any) => (
                      <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {d.campaignImage && (
                              <img src={d.campaignImage} alt="" className="w-8 h-6 object-cover rounded-md shrink-0" />
                            )}
                            <Link to={`/campaigns/${d.campaignSlug}`} className="text-sm text-white hover:text-primary transition-colors">
                              {d.campaignTitle || 'Campaign'}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-primary">{formatCurrency(d.amount)}</td>
                        <td className="px-4 py-4"><Badge variant="outline">{d.paymentMethod}</Badge></td>
                        <td className="px-4 py-4">
                          <Badge variant={d.status === 'completed' ? 'success' : d.status === 'failed' ? 'error' : 'default'}>
                            {d.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-xs text-text-muted">{getTimeAgo(d.createdAt)}</td>
                      </tr>
                    ))}
                    {myDonations.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-text-muted text-sm">
                        You haven't made any donations yet.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Analytics Tab ────────────────────────────────────────────── */}
          {activeTab === 'Analytics' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <h3 className="font-semibold text-white mb-6">7-Day Donation Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyChart.length ? weeklyChart : [{ day: 'No data', amount: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#60607A', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#60607A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                      itemStyle={{ color: '#FF6B00' }}
                      formatter={(v: number) => [`₹${v}`, 'Donations']}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#FF6B00" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#FF6B00' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Raised (all time)', value: statsData ? formatCurrency(statsData.totalRaised) : '—' },
                  { label: 'Average Donation', value: statsData ? formatCurrency(statsData.avgDonation) : '—' },
                  { label: 'Funded Campaigns', value: statsData?.fundedCampaigns ?? '—' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-center">
                    <p className="font-sans font-bold text-2xl text-white mb-1">{s.value}</p>
                    <p className="text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Settings Tab ─────────────────────────────────────────────── */}
          {activeTab === 'Settings' && (
            <div className="max-w-xl space-y-6">
              {/* Profile settings */}
              <form onSubmit={hsProfile(saveProfile)} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-5">
                <h3 className="font-semibold text-white mb-1">Profile Settings</h3>

                {/* ── Profile Picture Upload ── */}
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-3">Profile Picture</label>
                  <div className="flex items-start gap-5">
                    {/* Current avatar preview */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
                        {(avatarPreview || user?.avatar) ? (
                          <img
                            src={avatarPreview ?? user?.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white/30 select-none">
                            {user?.name?.[0]?.toUpperCase() ?? '?'}
                          </span>
                        )}
                      </div>
                      {/* Camera overlay button */}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary border-2 border-bg-deep flex items-center justify-center hover:bg-primary/90 transition-colors"
                        title="Change photo"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>

                    {/* Drop zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleAvatarDrop}
                      onClick={() => avatarInputRef.current?.click()}
                      className={`flex-1 min-h-[80px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all
                        ${isDragging
                          ? 'border-primary bg-primary/10 scale-[1.02]'
                          : 'border-white/12 bg-white/3 hover:border-primary/40 hover:bg-primary/5'
                        }`}
                    >
                      <UploadCloud className={`w-5 h-5 transition-colors ${isDragging ? 'text-primary' : 'text-text-muted'}`} />
                      <p className="text-xs text-text-muted text-center leading-snug">
                        <span className="text-primary font-medium">Click to upload</span> or drag & drop<br />
                        PNG, JPG, GIF · max 5 MB
                      </p>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f) }}
                    />
                  </div>

                  {/* Actions shown only when a new file is selected */}
                  {avatarPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 mt-3 px-1"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        New photo selected — will save with your profile
                      </div>
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="ml-auto text-xs text-text-muted hover:text-error transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-white/5" />

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">Display Name</label>
                  <input
                    {...regProfile('name')}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                  {peErrors.name && <p className="text-xs text-error mt-1">{peErrors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">Contact Email</label>
                  <input
                    {...regProfile('contactEmail')}
                    placeholder="E.g. support@example.com (optional)"
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                  {peErrors.contactEmail && <p className="text-xs text-error mt-1">{peErrors.contactEmail.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">Bio</label>
                  <textarea
                    {...regProfile('bio')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm resize-none focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">Twitter handle</label>
                  <input
                    {...regProfile('socialLinks.twitter')}
                    placeholder="@username"
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">Website</label>
                  <input
                    {...regProfile('socialLinks.website')}
                    placeholder="https://yoursite.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <Button type="submit" disabled={pSubmitting}>
                  {pSubmitting ? 'Saving…' : 'Save Changes'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
