'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, Download, Upload, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const RESOLUTIONS = [
  { value: '1k', label: '1K (1024px)' },
  { value: '2k', label: '2K (2048px)' },
]

export default function EditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [resolution, setResolution] = useState('1k')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string; revisedPrompt: string } | null>(null)

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('圖片大小不能超過 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImagePreview(dataUrl)
      setImageBase64(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  })

  const removeImage = () => {
    setImagePreview(null)
    setImageBase64(null)
  }

  const handleEdit = async () => {
    if (!prompt.trim()) {
      toast.error('請輸入編輯提示詞')
      return
    }
    if (!imageBase64) {
      toast.error('請上傳圖片')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/generate/image-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrl: imageBase64,
          resolution,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '編輯失敗')

      setResult({ url: data.url, revisedPrompt: data.revisedPrompt })
      toast.success('圖片編輯成功！')
    } catch (error: any) {
      toast.error(error.message || '編輯失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">圖片編輯</h1>
        <p className="mt-2 text-muted-foreground">上傳圖片並描述修改需求，AI 幫你重新風格化</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-pink-500" />
                上傳圖片
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="上傳的圖片" className="w-full rounded-lg border border-border object-contain max-h-64" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                    isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-border hover:border-purple-500/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? '放開以上傳圖片' : '拖放圖片至此處，或點擊上傳'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">支援 PNG、JPG、WEBP，最大 10MB</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                編輯提示詞
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="描述你想如何修改圖片，例如：make it look like a watercolor painting..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">解析度</label>
                <Select
                  options={RESOLUTIONS}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>
              <Button
                onClick={handleEdit}
                loading={loading}
                disabled={!imageBase64}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {loading ? '編輯中...' : '編輯圖片'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>編輯結果</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
                  <p className="mt-4 text-muted-foreground">AI 正在編輯中，請稍候...</p>
                </div>
              )}
              {result && !loading && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img src={result.url} alt={result.revisedPrompt || prompt} className="w-full object-contain" />
                  </div>
                  {result.revisedPrompt && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">AI 修訂的提示詞</p>
                      <p className="text-sm">{result.revisedPrompt}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => window.open(result.url, '_blank')}>
                      <Download className="mr-2 h-4 w-4" /> 下載圖片
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setResult(null)}>
                      <Sparkles className="mr-2 h-4 w-4" /> 重新編輯
                    </Button>
                  </div>
                </div>
              )}
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Sparkles className="h-16 w-16 mb-4 opacity-20" />
                  <p>上傳圖片並輸入提示詞，結果將顯示在這裡</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}