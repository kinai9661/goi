import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '權限不足' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          dailyQuota: true,
          usedQuota: true,
          isBanned: true,
          createdAt: true,
          _count: { select: { generations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '查詢失敗' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '權限不足' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, action, value } = body

    if (!userId || !action) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case 'ban':
        updateData = { isBanned: value ?? true }
        break
      case 'unban':
        updateData = { isBanned: false }
        break
      case 'setQuota':
        updateData = { dailyQuota: parseInt(value) }
        break
      case 'setRole':
        updateData = { role: value }
        break
      case 'resetQuota':
        updateData = { usedQuota: 0, quotaResetAt: new Date() }
        break
      default:
        return NextResponse.json({ error: '無效的操作' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, isBanned: true, dailyQuota: true, usedQuota: true },
    })

    return NextResponse.json({ data: user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '更新失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '權限不足' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '缺少用戶 ID' }, { status: 400 })
    }

    // Prevent deleting self
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: '無法刪除自己的帳號' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '刪除失敗' },
      { status: 500 }
    )
  }
}