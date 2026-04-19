'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon, Loader2, Download, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const RESOLUTIONS = [
  { value: '1k', label: '1K (1024px)' },
  { value: '2k', label: '2K (2048px)' },
]

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 正方形' },
  { value: '16:9', label: '16:9 寬螢幕' },
  { value: '9:16', label: '9:16 直式' },
  { value: '4:3', label: '4:3 標準' },
  { value: '3:4', label: '3:4 直式標準' },
  { value: '3:2', label: '3:2 照片' },
]

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [resolution, setResolution] = useState('1k')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string; revisedPrompt: string } | null>(null)

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('請輸入提示詞')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          resolution,
          aspect_ratio: aspectRatio,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '生成失敗')
      }

      setResult({
        url: data.url,
        revisedPrompt: data.revisedPrompt,
      })
      toast.success('圖片生成成功！')
    } catch (error: any) {
      toast.error(error.message || '生成失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">文字生圖</h1>
        <p className="mt-2 text-muted-foreground">輸入文字描述，AI 為你生成高品質圖片</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-500" />
                提示詞
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="描述你想生成的圖片，例如：a cyberpunk cityscape at night with neon lights, rain-soaked streets, and flying cars..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">解析度</label>
                  <Select
                    options={RESOLUTIONS}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">長寬比</label>
                  <Select
                    options={ASPECT_RATIOS}
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                loading={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {loading ? '生成中...' : '生成圖片'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>生成結果</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                  <p className="mt-4 text-muted-foreground">AI 正在創作中，請稍候...</p>
                </div>
              )}
              {result && !loading && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={result.url}
                      alt={result.revisedPrompt || prompt}
                      className="w-full object-contain"
                    />
                  </div>
                  {result.revisedPrompt && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">AI 修訂的提示詞</p>
                      <p className="text-sm">{result.revisedPrompt}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(result.url, '_blank')
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下載圖片
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setPrompt(result.revisedPrompt || prompt)
                        setResult(null)
                      }}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      重新生成
                    </Button>
                  </div>
                </div>
              )}
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p>輸入提示詞並點擊生成，結果將顯示在這裡</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}