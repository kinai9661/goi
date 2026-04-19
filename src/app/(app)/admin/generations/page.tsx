'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, ExternalLink, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface GenerationItem {
  id: string
  type: string
  prompt: string
  revisedPrompt: string | null
  status: string
  resultUrl: string | null
  model: string
  resolution: string | null
  aspectRatio: string | null
  duration: number | null
  errorMsg: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
}

const TYPE_FILTERS = [
  { value: '', label: '全部類型' },
  { value: 'TEXT_TO_IMAGE', label: '文字生圖' },
  { value: 'IMAGE_TO_IMAGE', label: '圖片編輯' },
  { value: 'TEXT_TO_VIDEO', label: '文字生影片' },
  { value: 'IMAGE_TO_VIDEO', label: '圖片轉影片' },
]

const STATUS_FILTERS = [
  { value: '', label: '全部狀態' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'PROCESSING', label: '處理中' },
  { value: 'FAILED', label: '失敗' },
]

export default function AdminGenerationsPage() {
  const [generations, setGenerations] = useState<GenerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchGenerations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('limit', '15')

      const res = await fetch(`/api/admin/generations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setGenerations(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenerations()
  }, [page, typeFilter, statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此生成記錄嗎？')) return

    try {
      const res = await fetch(`/api/admin/generations?id=${id}`, { method: 'DELETE' })
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">生成記錄</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-40">
          <Select
            options={TYPE_FILTERS}
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          />
        </div>
        <div className="w-40">
          <Select
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">用戶</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">類型</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">提示詞</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">狀態</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">模型</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">時間</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={7} className="px-4 py-3"><div className="animate-shimmer h-5 rounded" /></td>
                  </tr>
                ))}
                {!loading && generations.map((gen) => (
                  <tr key={gen.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{gen.user.name || '未設定'}</p>
                        <p className="text-xs text-muted-foreground">{gen.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(gen.type)}`}>
                        {getTypeLabel(gen.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-sm">{gen.prompt}</p>
                      {gen.errorMsg && (
                        <p className="text-xs text-red-500 truncate mt-0.5">{gen.errorMsg}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(gen.status)}
                        <span className="text-xs">{gen.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {gen.model}
                      {gen.resolution && <span> · {gen.resolution}</span>}
                      {gen.duration && <span> · {gen.duration}s</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(gen.createdAt).toLocaleDateString('zh-TW', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {gen.resultUrl && (
                          <a
                            href={gen.resultUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 transition-colors"
                            title="查看結果"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(gen.id)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                          title="刪除記錄"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && generations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      沒有找到生成記錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">第 {page} / {totalPages} 頁</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}