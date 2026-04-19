'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Image as ImageIcon, Video, AlertTriangle, CheckCircle, Activity } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalGenerations: number
  todayGenerations: number
  imageGenerations: number
  videoGenerations: number
  failedGenerations: number
  successRate: string
}

interface RecentGeneration {
  id: string
  type: string
  prompt: string
  status: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<RecentGeneration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecent(data.recentGenerations)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">儀表板</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-28 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: '總用戶數',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: '總生成次數',
      value: stats?.totalGenerations ?? 0,
      icon: Activity,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: '圖片生成',
      value: stats?.imageGenerations ?? 0,
      icon: ImageIcon,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },
    {
      title: '影片生成',
      value: stats?.videoGenerations ?? 0,
      icon: Video,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ]

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TEXT_TO_IMAGE: '文字生圖',
      IMAGE_TO_IMAGE: '圖片編輯',
      TEXT_TO_VIDEO: '文字生影片',
      IMAGE_TO_VIDEO: '圖片轉影片',
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500"><CheckCircle className="h-3 w-3" />完成</span>
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">處理中</span>
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500"><AlertTriangle className="h-3 w-3" />失敗</span>
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">儀表板</h1>
        <p className="text-sm text-muted-foreground">今日生成：{stats?.todayGenerations ?? 0} 次</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-3xl font-bold">{card.value.toLocaleString()}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Rate + Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-green-500">{stats?.successRate}%</div>
              <div className="flex-1">
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                    style={{ width: `${stats?.successRate ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">失敗次數</p>
                <p className="font-medium text-red-500">{stats?.failedGenerations ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">成功次數</p>
                <p className="font-medium text-green-500">
                  {(stats?.totalGenerations ?? 0) - (stats?.failedGenerations ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近生成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.slice(0, 5).map((gen) => (
                <div key={gen.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{gen.prompt}</p>
                    <p className="text-xs text-muted-foreground">
                      {gen.user.name || gen.user.email} · {getTypeLabel(gen.type)}
                    </p>
                  </div>
                  {getStatusBadge(gen.status)}
                </div>
              ))}
              {recent.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">暫無記錄</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}