import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateImage } from '@/lib/grok-api'
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

    // Check quota
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
    const { prompt, resolution, aspect_ratio } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: '請輸入提示詞' }, { status: 400 })
    }

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        userId,
        type: 'TEXT_TO_IMAGE',
        prompt: prompt.trim(),
        model: 'grok-imagine-image',
        resolution: resolution || '1k',
        aspectRatio: aspect_ratio || '1:1',
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    })

    // Increment quota
    await prisma.user.update({
      where: { id: userId },
      data: { usedQuota: { increment: 1 } },
    })

    try {
      const result = await generateImage(prompt.trim(), {
        resolution: resolution || '1k',
        aspect_ratio: aspect_ratio || '1:1',
      })

      const imageData = result.data?.[0]
      if (!imageData?.url) {
        throw new Error('API 未返回圖片 URL')
      }

      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'COMPLETED',
          resultUrl: imageData.url,
          revisedPrompt: imageData.revised_prompt,
          completedAt: new Date(),
        },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: 'GENERATE_IMAGE',
          details: prompt.trim().substring(0, 100),
        },
      })

      return NextResponse.json({
        id: generation.id,
        url: imageData.url,
        revisedPrompt: imageData.revised_prompt,
        status: 'COMPLETED',
      })
    } catch (apiError: any) {
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMsg: apiError.message || '圖片生成失敗',
          completedAt: new Date(),
        },
      })

      // Refund quota on failure
      await prisma.user.update({
        where: { id: userId },
        data: { usedQuota: { decrement: 1 } },
      })

      throw apiError
    }
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || '圖片生成失敗，請稍後再試' },
      { status: 500 }
    )
  }
}