'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'

export function Navbar() {
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = session && (session.user as any)?.role === 'ADMIN'

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-110">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Grok Imagine</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {session && (
              <>
                <Link
                  href="/generate"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <ImageIcon className="h-4 w-4" />
                  生圖
                </Link>
                <Link
                  href="/edit"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Sparkles className="h-4 w-4" />
                  編輯圖片
                </Link>
                <Link
                  href="/video"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Video className="h-4 w-4" />
                  生影片
                </Link>
                <Link
                  href="/gallery"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <FolderOpen className="h-4 w-4" />
                  畫廊
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-500/10"
                  >
                    <Settings className="h-4 w-4" />
                    後台
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
                >
                  註冊
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 py-4 space-y-1">
            {session ? (
              <>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {session.user?.name} ({session.user?.email})
                </div>
                <Link href="/generate" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileOpen(false)}>
                  <ImageIcon className="h-4 w-4" /> 生圖
                </Link>
                <Link href="/edit" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileOpen(false)}>
                  <Sparkles className="h-4 w-4" /> 編輯圖片
                </Link>
                <Link href="/video" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileOpen(false)}>
                  <Video className="h-4 w-4" /> 生影片
                </Link>
                <Link href="/gallery" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setMobileOpen(false)}>
                  <FolderOpen className="h-4 w-4" /> 畫廊
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-amber-500 hover:bg-amber-500/10" onClick={() => setMobileOpen(false)}>
                    <Settings className="h-4 w-4" /> 後台管理
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> 登出
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Link href="/login" className="rounded-md px-4 py-2 text-center text-sm font-medium hover:bg-accent" onClick={() => setMobileOpen(false)}>
                  登入
                </Link>
                <Link href="/register" className="rounded-md bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-center text-sm font-medium text-white" onClick={() => setMobileOpen(false)}>
                  註冊
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}