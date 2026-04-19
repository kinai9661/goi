import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '權限不足' }, { status: 403 })
    }

    const [
      totalUsers,
      totalGenerations,
      todayGenerations,
      imageGenerations,
      videoGenerations,
      failedGenerations,
      recentGenerations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.generation.count(),
      prisma.generation.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.generation.count({
        where: { type: { in: ['TEXT_TO_IMAGE', 'IMAGE_TO_IMAGE'] } },
      }),
      prisma.generation.count({
        where: { type: { in: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO'] } },
      }),
      prisma.generation.count({ where: { status: 'FAILED' } }),
      prisma.generation.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ])

    // Daily generation stats for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyStats = await prisma.generation.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    })

    // Get type distribution
    const typeStats = await prisma.generation.groupBy({
      by: ['type'],
      _count: true,
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalGenerations,
        todayGenerations,
        imageGenerations,
        videoGenerations,
        failedGenerations,
        successRate: totalGenerations > 0
          ? (((totalGenerations - failedGenerations) / totalGenerations) * 100).toFixed(1)
          : '0',
      },
      typeStats,
      recentGenerations,
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: error.message || '儀表板資料載入失敗' },
      { status: 500 }
    )
  }
}