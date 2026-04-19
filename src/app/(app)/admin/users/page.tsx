'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Ban, Shield, RotateCcw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserItem {
  id: string
  email: string
  name: string | null
  role: string
  dailyQuota: number
  usedQuota: number
  isBanned: boolean
  createdAt: string
  _count: { generations: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', page.toString())
      params.set('limit', '15')

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handleAction = async (userId: string, action: string, value?: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      })

      if (res.ok) {
        toast.success('操作成功')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || '操作失敗')
      }
    } catch (error) {
      toast.error('操作失敗')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('確定要刪除此用戶嗎？此操作不可撤銷。')) return

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('用戶已刪除')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || '刪除失敗')
      }
    } catch (error) {
      toast.error('刪除失敗')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用戶管理</h1>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="搜尋用戶名稱或電子郵件..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">用戶</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">角色</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">配額</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">生成數</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">狀態</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">註冊時間</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={7} className="px-4 py-3"><div className="animate-shimmer h-5 rounded" /></td>
                  </tr>
                ))}
                {!loading && users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name || '未設定'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role === 'ADMIN' ? '管理員' : '用戶'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{user.usedQuota} / {user.dailyQuota}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{user._count.generations}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isBanned
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {user.isBanned ? '已封禁' : '正常'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user.isBanned ? (
                          <button
                            onClick={() => handleAction(user.id, 'unban')}
                            className="rounded p-1.5 text-green-500 hover:bg-green-500/10 transition-colors"
                            title="解除封禁"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user.id, 'ban')}
                            className="rounded p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                            title="封禁用戶"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user.id, 'setRole', user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                          className="rounded p-1.5 text-amber-500 hover:bg-amber-500/10 transition-colors"
                          title={user.role === 'ADMIN' ? '降為用戶' : '升為管理員'}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction(user.id, 'resetQuota')}
                          className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 transition-colors"
                          title="重置配額"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                          title="刪除用戶"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      沒有找到用戶
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