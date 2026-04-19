import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVideo } from '@/lib/grok-api'
import { isQuotaExpired, getQuotaResetTime } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || user.isBanned) {
      return NextResponse.json({ error: '帳號已被停用' }, { status: 403 })
    }

    if (isQuotaExpired(user.quotaResetAt)) {
      await prisma.user.update({
        where: { id: userId },
        data: { usedQuota: 0, quotaResetAt: getQuotaResetTime() },
      })
      user.usedQuota = 0
    }

    if (user.usedQuota >= user.dailyQuota) {
      return NextResponse.json(
        { error: `今日配額已用完（${user.dailyQuota} 次），請明天再試` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { prompt, duration, resolution, aspect_ratio, imageUrl } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: '請輸入提示詞' }, { status: 400 })
    }

    const genType = imageUrl ? 'IMAGE_TO_VIDEO' : 'TEXT_TO_VIDEO'

    const generation = await prisma.generation.create({
      data: {
        userId,
        type: genType,
        prompt: prompt.trim(),
        model: 'grok-imagine-video',
        resolution: resolution || '480p',
        aspectRatio: aspect_ratio || '16:9',
        duration: duration || 5,
        sourceUrl: imageUrl || null,
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { usedQuota: { increment: 1 } },
    })

    try {
      const result = await generateVideo(prompt.trim(), {
        duration: duration || 5,
        resolution: resolution || '480p',
        aspect_ratio: aspect_ratio || '16:9',
        imageUrl: imageUrl || undefined,
      })

      const videoData = result.data?.[0]
      if (!videoData?.url) {
        throw new Error('API 未返回影片 URL')
      }

      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'COMPLETED',
          resultUrl: videoData.url,
          completedAt: new Date(),
        },
      })

      await prisma.activity.create({
        data: {
          userId,
          action: 'GENERATE_VIDEO',
          details: prompt.trim().substring(0, 100),
        },
      })

      return NextResponse.json({
        id: generation.id,
        url: videoData.url,
        duration: videoData.duration,
        resolution: videoData.resolution,
        status: 'COMPLETED',
      })
    } catch (apiError: any) {
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMsg: apiError.message || '影片生成失敗',
          completedAt: new Date(),
        },
      })

      await prisma.user.update({
        where: { id: userId },
        data: { usedQuota: { decrement: 1 } },
      })

      throw apiError
    }
  } catch (error: any) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: error.message || '影片生成失敗，請稍後再試' },
      { status: 500 }
    )
  }
}