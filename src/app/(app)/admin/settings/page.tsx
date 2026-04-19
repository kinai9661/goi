'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: 'Grok Imagine Studio',
  site_description: 'AI 圖片與影片生成平台',
  default_quota: '50',
  maintenance_mode: 'false',
  max_image_resolution: '2k',
  max_video_duration: '10',
  allowed_registrations: 'true',
  announcement: '',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings({ ...DEFAULT_SETTINGS, ...data.data })
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (res.ok) {
        toast.success('設定已儲存')
      } else {
        toast.error('儲存失敗')
      }
    } catch (error) {
      toast.error('儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('確定要重置所有設定為預設值嗎？')) {
      setSettings(DEFAULT_SETTINGS)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">系統設定</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-shimmer h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">系統設定</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> 重置預設
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            loading={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-500"
          >
            <Save className="mr-2 h-4 w-4" /> 儲存設定
          </Button>
        </div>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本設定</CardTitle>
          <CardDescription>網站名稱、描述與公告</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">網站名稱</label>
              <Input
                value={settings.site_name}
                onChange={(e) => updateSetting('site_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">網站描述</label>
              <Input
                value={settings.site_description}
                onChange={(e) => updateSetting('site_description', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">公告訊息（留空則不顯示）</label>
            <Input
              value={settings.announcement}
              onChange={(e) => updateSetting('announcement', e.target.value)}
              placeholder="例如：系統維護中，暫停服務..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Quota & Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">配額與限制</CardTitle>
          <CardDescription>用戶每日生成配額與解析度限制</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">每日預設配額</label>
              <Input
                type="number"
                value={settings.default_quota}
                onChange={(e) => updateSetting('default_quota', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">最大圖片解析度</label>
              <Input
                value={settings.max_image_resolution}
                onChange={(e) => updateSetting('max_image_resolution', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">最大影片時長（秒）</label>
              <Input
                type="number"
                value={settings.max_video_duration}
                onChange={(e) => updateSetting('max_video_duration', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">功能開關</CardTitle>
          <CardDescription>控制網站功能的啟用與停用</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-sm">維護模式</p>
                <p className="text-xs text-muted-foreground">啟用後網站將顯示維護頁面</p>
              </div>
              <button
                onClick={() => updateSetting('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenance_mode === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-sm">開放註冊</p>
                <p className="text-xs text-muted-foreground">關閉後新用戶無法註冊</p>
              </div>
              <button
                onClick={() => updateSetting('allowed_registrations', settings.allowed_registrations === 'true' ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowed_registrations === 'true' ? 'bg-green-500' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowed_registrations === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}