import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useCreateCampaign } from '@/hooks/useCampaigns'
import { useCampaignStore } from '@/store/campaignStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const step1Schema = z.object({
  title: z.string().min(10, 'At least 10 characters').max(100),
  category: z.string().min(1, 'Pick a category'),
  location: z.string().min(2, 'Enter a location'),
  shortDescription: z.string().min(20, 'At least 20 chars').max(250),
})

const step3Schema = z.object({
  goalAmount: z.coerce.number().min(1000, 'Minimum ₹1,000'),
  deadline: z.string().min(1, 'Pick a date'),
  minDonation: z.coerce.number().min(10, 'Minimum ₹10'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step3Data = z.infer<typeof step3Schema>

const STEPS = [
  { num: 1, label: 'BASICS' },
  { num: 2, label: 'STORY' },
  { num: 3, label: 'PAYOUTS' },
  { num: 4, label: 'REVIEW' },
]

const CATEGORY_OPTIONS = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Education', label: 'Education' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Community', label: 'Community' },
]

export function CreateCampaignPage() {
  const [step, setStep] = useState(1)
  const [story, setStory] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [agreed, setAgreed] = useState(false)
  const { draftCampaign, updateDraft, clearDraft } = useCampaignStore()
  const createCampaign = useCreateCampaign()
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: (draftCampaign.title as string) || '',
      category: (draftCampaign.category as string) || '',
      location: (draftCampaign.location as string) || '',
      shortDescription: (draftCampaign.shortDescription as string) || '',
    },
  })

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      goalAmount: (draftCampaign.goalAmount as number) || 100000,
      deadline: '',
      minDonation: (draftCampaign.minDonation as number) || 100,
    },
  })

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      const vals1 = form1.getValues()
      const vals3 = form3.getValues()
      updateDraft({ ...vals1, ...vals3, story })
    }, 30000)
    return () => clearInterval(interval)
  }, [story, form1, form3, updateDraft])

  const handleStep1 = form1.handleSubmit((data) => {
    updateDraft(data)
    setStep(2)
  })

  const handleStep2 = () => {
    if (story.length < 50) return
    updateDraft({ story, videoUrl })
    setStep(3)
  }

  const handleStep3 = form3.handleSubmit((data) => {
    updateDraft(data)
    setStep(4)
  })

  const handlePublish = async () => {
    if (!agreed) return
    try {
      const vals1 = form1.getValues()
      const vals3 = form3.getValues()

      // Convert uploaded file to base64 data URL so it can be stored properly.
      // If no image was uploaded, leave coverImage undefined — don't use a mock photo.
      let coverImage: string | undefined
      if (coverFile) {
        coverImage = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read image'))
          reader.readAsDataURL(coverFile)
        })
      }

      const payload = {
        ...vals1,
        ...vals3,
        story,
        videoUrl: videoUrl || undefined,
        coverImage,
        tags: [],
      }
      const campaign = await createCampaign.mutateAsync(payload)
      clearDraft()
      success('Campaign published! 🎉', 'Your campaign is now live.')
      navigate(`/campaigns/${campaign.slug}`)
    } catch {
      toastError('Failed to publish', 'Please try again.')
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep">
        {/* Step indicator */}
        <div className="sticky top-16 z-20 bg-bg-deep/90 backdrop-blur-xl border-b border-white/8">
          <div className="max-w-3xl mx-auto px-4 py-5">
            <div className="relative flex items-center justify-between">
              {/* Progress line */}
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-white/8 z-0">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              {STEPS.map((s) => (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                  <button
                    onClick={() => step > s.num && setStep(s.num)}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all',
                      s.num === step ? 'border-primary bg-primary text-white shadow-glow' :
                      s.num < step ? 'border-primary bg-primary/20 text-primary cursor-pointer hover:bg-primary/30' :
                      'border-white/20 bg-bg-deep text-text-muted'
                    )}
                  >
                    {s.num < step ? <Check className="w-4 h-4" /> : s.num}
                  </button>
                  <span className={cn('text-xs font-bold hidden sm:block', s.num === step ? 'text-primary' : 'text-text-muted')}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            {/* Step 1: Basics */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-sans font-bold text-3xl text-white mb-2">Let's start with the basics</h2>
                <p className="text-text-muted mb-8">Make it easy for people to learn about your campaign.</p>
                <form onSubmit={handleStep1} className="space-y-6">
                  <Input
                    label="Campaign Title"
                    placeholder="e.g., Clean Water for Himalayan Villages"
                    hint="Keep it short, clear, and impactful. (Max 80 characters)"
                    {...form1.register('title')}
                    error={form1.formState.errors.title?.message}
                    maxLength={100}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                      label="Category"
                      options={CATEGORY_OPTIONS}
                      placeholder="Select a category"
                      {...form1.register('category')}
                      error={form1.formState.errors.category?.message}
                    />
                    <Input
                      label="Location"
                      placeholder="e.g., Uttarakhand, India"
                      {...form1.register('location')}
                      error={form1.formState.errors.location?.message}
                    />
                  </div>

                  {/* Cover image drag-drop */}
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">Cover Image</label>
                    <label className={cn(
                      'block rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
                      coverPreview ? 'border-primary/40' : 'border-white/15 hover:border-primary/30 hover:bg-white/2'
                    )}>
                      <input type="file" accept="image/*" className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = URL.createObjectURL(file)
                            setCoverPreview(url)
                            setCoverFile(file)
                          }
                        }}
                      />
                      {coverPreview ? (
                        <div className="relative aspect-video">
                          <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={(e) => { e.preventDefault(); setCoverPreview(''); setCoverFile(null) }}
                            className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-14 flex flex-col items-center gap-3 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Upload a high-resolution photo</p>
                            <p className="text-sm text-text-muted mt-1">Use a 16:9 image (1200×675px) that represents your cause visually.</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <Textarea
                    label="Short Blurb"
                    placeholder="Give people a quick idea of what you are raising funds for."
                    rows={4}
                    maxLength={250}
                    showCount
                    {...form1.register('shortDescription')}
                    error={form1.formState.errors.shortDescription?.message}
                    value={form1.watch('shortDescription')}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-white/8">
                    <button type="button" onClick={() => navigate(-1)} className="text-sm text-text-muted hover:text-white transition-colors">
                      Save &amp; Exit
                    </button>
                    <Button type="submit">
                      Continue <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2: Story */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-sans font-bold text-3xl text-white mb-2">Tell your story</h2>
                <p className="text-text-muted mb-8">Help people connect with your cause and understand your vision.</p>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-text-secondary">Campaign Story</label>
                      <span className={cn('text-xs', story.length < 50 ? 'text-error' : 'text-text-muted')}>
                        {story.length} chars (min 50)
                      </span>
                    </div>
                    <textarea
                      value={story}
                      onChange={e => setStory(e.target.value)}
                      placeholder="Describe your campaign in detail. Why is this important? How will the funds be used? What's the impact?"
                      rows={12}
                      className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-white/8 text-white placeholder:text-text-muted text-sm resize-none focus:outline-none focus:border-primary/50 transition-all"
                    />
                    {story.length > 0 && story.length < 50 && (
                      <p className="flex items-center gap-1.5 text-xs text-error mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Please write at least 50 characters
                      </p>
                    )}
                  </div>
                  <Input
                    label="YouTube / Vimeo Video URL (optional)"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    hint="Add a video to boost credibility and engagement"
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-white/8">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button onClick={handleStep2} disabled={story.length < 50}>
                      Continue <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Funding */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-sans font-bold text-3xl text-white mb-2">Set up your funding</h2>
                <p className="text-text-muted mb-8">Configure your fundraising goal, timeline, and minimum donation.</p>
                <form onSubmit={handleStep3} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">Funding Goal (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="100000"
                        {...form3.register('goalAmount')}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                    {form3.formState.errors.goalAmount && <p className="text-xs text-error mt-1">{form3.formState.errors.goalAmount.message}</p>}
                  </div>
                  <Input
                    label="Campaign End Date"
                    type="date"
                    {...form3.register('deadline')}
                    error={form3.formState.errors.deadline?.message}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  />
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">Minimum Donation (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="100"
                        {...form3.register('minDonation')}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/8">
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="submit">
                      Continue <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-sans font-bold text-3xl text-white mb-2">Review & Publish</h2>
                <p className="text-text-muted mb-8">Double-check everything before your campaign goes live.</p>
                <div className="space-y-4 mb-8">
                  {[
                    { label: 'Title', value: form1.getValues('title') },
                    { label: 'Category', value: form1.getValues('category') },
                    { label: 'Location', value: form1.getValues('location') },
                    { label: 'Description', value: form1.getValues('shortDescription') },
                    { label: 'Goal', value: `₹${Number(form3.getValues('goalAmount')).toLocaleString('en-IN')}` },
                    { label: 'Deadline', value: form3.getValues('deadline') },
                  ].map(item => (
                    <div key={item.label} className="flex gap-4 py-3 border-b border-white/8 last:border-0">
                      <span className="text-sm text-text-muted w-28 shrink-0">{item.label}</span>
                      <span className="text-sm text-white">{item.value || '—'}</span>
                    </div>
                  ))}
                </div>

                {coverPreview && (
                  <div className="rounded-xl overflow-hidden border border-white/8 mb-6 aspect-video">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer mb-8 p-4 rounded-xl border border-white/8 hover:border-primary/30 transition-colors">
                  <div
                    role="checkbox"
                    aria-checked={agreed}
                    onClick={() => setAgreed(v => !v)}
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                      agreed ? 'bg-primary border-primary' : 'border-white/30'
                    )}
                  >
                    {agreed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-text-secondary">
                    I agree to FundBlaze's <span className="text-primary underline">Terms of Service</span> and confirm that all campaign information is accurate and truthful.
                  </span>
                </label>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(3)}>
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={!agreed}
                    loading={createCampaign.isPending}
                    size="lg"
                    className="px-10"
                  >
                    🚀 Publish Campaign
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
