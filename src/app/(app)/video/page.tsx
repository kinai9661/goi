'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Loader2, Download, Upload, X, Sparkles } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const DURATIONS = [
  { value: '5', label: '5 秒' },
  { value: '10', label: '10 秒' },
]

const RESOLUTIONS = [
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
]

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 寬螢幕' },
  { value: '9:16', label: '9:16 直式' },
  { value: '1:1', label: '1:1 正方形' },
]

export default function VideoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('5')
  const [resolution, setResolution] = useState('480p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ url: string; duration: number; resolution: string } | null>(null)

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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('請輸入提示詞')
      return
    }

    setLoading(true)
    setResult(null)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 8
      })
    }, 2000)

    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: parseInt(duration),
          resolution,
          aspect_ratio: aspectRatio,
          imageUrl: imageBase64 || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '影片生成失敗')

      clearInterval(progressInterval)
      setProgress(100)
      setResult({
        url: data.url,
        duration: data.duration,
        resolution: data.resolution,
      })
      toast.success('影片生成成功！')
    } catch (error: any) {
      clearInterval(progressInterval)
      setProgress(0)
      toast.error(error.message || '影片生成失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">
          {imageBase64 ? '圖片轉影片' : '文字生影片'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {imageBase64
            ? '上傳靜態圖片，讓 AI 賦予它動態生命'
            : '用文字描述場景，生成動態影片'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-6">
          {/* Image upload (optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-5 w-5 text-cyan-500" />
                參考圖片（選填）
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="參考圖片" className="w-full rounded-lg border border-border object-contain max-h-48" />
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
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
                    isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-border hover:border-cyan-500/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    上傳圖片可將其轉為影片
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-cyan-500" />
                影片提示詞
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="描述你想生成的影片，例如：a drone flying over a mountain range at sunset..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">時長</label>
                  <Select options={DURATIONS} value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">解析度</label>
                  <Select options={RESOLUTIONS} value={resolution} onChange={(e) => setResolution(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">長寬比</label>
                  <Select options={ASPECT_RATIOS} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                loading={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600"
                size="lg"
              >
                <Video className="mr-2 h-5 w-5" />
                {loading ? '生成中...' : '生成影片'}
              </Button>
              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>生成進度</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">影片生成通常需要 15-60 秒，請耐心等候</p>
                </div>
              )}
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
                  <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
                  <p className="mt-4 text-muted-foreground">AI 正在生成影片，這可能需要一些時間...</p>
                </div>
              )}
              {result && !loading && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <video
                      src={result.url}
                      controls
                      autoPlay
                      loop
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>時長：{result.duration}秒</span>
                    <span>解析度：{result.resolution}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => window.open(result.url, '_blank')}>
                      <Download className="mr-2 h-4 w-4" /> 下載影片
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setResult(null)}>
                      <Sparkles className="mr-2 h-4 w-4" /> 重新生成
                    </Button>
                  </div>
                </div>
              )}
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Video className="h-16 w-16 mb-4 opacity-20" />
                  <p>輸入提示詞並點擊生成，影片將顯示在這裡</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}