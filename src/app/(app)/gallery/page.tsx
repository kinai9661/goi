'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { FolderOpen, Image as ImageIcon, Video, Trash2, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface Generation {
  id: string
  type: string
  prompt: string
  revisedPrompt: string | null
  status: string
  resultUrl: string | null
  resolution: string | null
  aspectRatio: string | null
  duration: number | null
  createdAt: string
}

const TYPE_FILTERS = [
  { value: '', label: '全部類型' },
  { value: 'TEXT_TO_IMAGE', label: '文字生圖' },
  { value: 'IMAGE_TO_IMAGE', label: '圖片編輯' },
  { value: 'TEXT_TO_VIDEO', label: '文字生影片' },
  { value: 'IMAGE_TO_VIDEO', label: '圖片轉影片' },
]

export default function GalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [previewItem, setPreviewItem] = useState<Generation | null>(null)

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const fetchGenerations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      params.set('page', page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/gallery?${params}`)
      const data = await res.json()

      if (res.ok) {
        setGenerations(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchGenerations()
  }, [session, typeFilter, page])

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此生成記錄嗎？')) return

    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('已刪除')
        fetchGenerations()
      }
    } catch (error) {
      toast.error('刪除失敗')
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TEXT_TO_IMAGE: '文字生圖',
      IMAGE_TO_IMAGE: '圖片編輯',
      TEXT_TO_VIDEO: '文字生影片',
      IMAGE_TO_VIDEO: '圖片轉影片',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TEXT_TO_IMAGE: 'bg-purple-500/10 text-purple-500',
      IMAGE_TO_IMAGE: 'bg-pink-500/10 text-pink-500',
      TEXT_TO_VIDEO: 'bg-cyan-500/10 text-cyan-500',
      IMAGE_TO_VIDEO: 'bg-amber-500/10 text-amber-500',
    }
    return colors[type] || 'bg-muted text-muted-foreground'
  }

  const isVideo = (type: string) => type.includes('VIDEO')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">我的畫廊</h1>
          <p className="mt-2 text-muted-foreground">查看和管理你的所有生成記錄</p>
        </div>
        <div className="w-48">
          <Select
            options={TYPE_FILTERS}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-64 rounded-lg" />
          ))}
        </div>
      )}

      {!loading && generations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderOpen className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">還沒有生成記錄</p>
          <p className="text-sm mt-1">前往生圖或生影片頁面開始創作</p>
        </div>
      )}

      {!loading && generations.length > 0 && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {generations.map((gen) => (
              <Card key={gen.id} className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {gen.status === 'COMPLETED' && gen.resultUrl ? (
                    isVideo(gen.type) ? (
                      <video src={gen.resultUrl} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={gen.resultUrl} alt={gen.prompt} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {gen.status === 'PROCESSING' ? (
                        <div className="animate-pulse text-muted-foreground">處理中...</div>
                      ) : (
                        <div className="text-muted-foreground">失敗</div>
                      )}
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {gen.resultUrl && (
                      <button
                        onClick={() => setPreviewItem(gen)}
                        className="rounded-full bg-white/90 p-2 text-black hover:bg-white transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    )}
                    {gen.resultUrl && (
                      <a
                        href={gen.resultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-white/90 p-2 text-black hover:bg-white transition-colors"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(gen.id)}
                      className="rounded-full bg-white/90 p-2 text-red-600 hover:bg-white transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Type badge */}
                  <div className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(gen.type)}`}>
                    {getTypeLabel(gen.type)}
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm line-clamp-2">{gen.prompt}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(gen.createdAt).toLocaleDateString('zh-TW')}</span>
                    {gen.resolution && <span>· {gen.resolution}</span>}
                    {gen.duration && <span>· {gen.duration}s</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 頁
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute -top-10 right-0 text-white hover:text-white/80"
            >
              ✕ 關閉
            </button>
            {isVideo(previewItem.type) ? (
              <video src={previewItem.resultUrl!} controls autoPlay className="w-full rounded-lg" />
            ) : (
              <img src={previewItem.resultUrl!} alt={previewItem.prompt} className="w-full rounded-lg" />
            )}
            <div className="mt-4 rounded-lg bg-black/60 p-4 text-white">
              <p className="text-sm">{previewItem.prompt}</p>
              {previewItem.revisedPrompt && (
                <p className="mt-2 text-xs text-white/60">AI 修訂：{previewItem.revisedPrompt}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}