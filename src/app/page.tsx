import Link from 'next/link'
import { Sparkles, Image as ImageIcon, Video, FolderOpen, Zap, Shield, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 mb-6">
              <Zap className="h-4 w-4" />
              Powered by Grok Imagine API
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="gradient-text">AI 圖片與影片</span>
              <br />
              <span className="text-foreground">生成工作室</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              輸入文字，即刻生成高品質圖片與影片。支援文字生圖、圖片編輯、文字生影片、圖片轉影片四大功能。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 text-base font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
              >
                <ImageIcon className="h-5 w-5" />
                開始生圖
              </Link>
              <Link
                href="/video"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-8 py-3 text-base font-medium transition-colors hover:bg-accent"
              >
                <Video className="h-5 w-5" />
                開始生影片
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">四大核心功能</h2>
          <p className="mt-4 text-muted-foreground">一站式 AI 生成平台，滿足你的創作需求</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ImageIcon,
              title: '文字生圖',
              desc: '輸入文字描述，AI 即刻為你生成高品質圖片',
              href: '/generate',
              gradient: 'from-purple-500 to-indigo-500',
            },
            {
              icon: Sparkles,
              title: '圖片編輯',
              desc: '上傳圖片並描述修改需求，AI 幫你重新風格化',
              href: '/edit',
              gradient: 'from-pink-500 to-rose-500',
            },
            {
              icon: Video,
              title: '文字生影片',
              desc: '用文字描述場景，生成 5 秒動態影片',
              href: '/video',
              gradient: 'from-cyan-500 to-blue-500',
            },
            {
              icon: FolderOpen,
              title: '圖片轉影片',
              desc: '上傳靜態圖片，讓 AI 賦予它動態生命',
              href: '/video',
              gradient: 'from-amber-500 to-orange-500',
            },
          ].map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="mt-4 text-2xl font-bold">快速生成</h3>
              <p className="mt-2 text-muted-foreground">圖片秒級回應，影片 15-60 秒完成</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/10">
                <Shield className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="mt-4 text-2xl font-bold">安全可靠</h3>
              <p className="mt-2 text-muted-foreground">API Key 安全存於後端，前端不暴露任何金鑰</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                <Clock className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="mt-4 text-2xl font-bold">每日配額</h3>
              <p className="mt-2 text-muted-foreground">每日免費配額，用完自動重置</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="font-semibold gradient-text">Grok Imagine Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Grok Imagine Studio. Powered by Grok API.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}