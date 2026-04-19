import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as any).id
    const generation = await prisma.generation.findFirst({
      where: { id, userId },
    })

    if (!generation) {
      return NextResponse.json({ error: '找不到此生成記錄' }, { status: 404 })
    }

    return NextResponse.json({
      id: generation.id,
      type: generation.type,
      status: generation.status,
      resultUrl: generation.resultUrl,
      revisedPrompt: generation.revisedPrompt,
      errorMsg: generation.errorMsg,
      prompt: generation.prompt,
      model: generation.model,
      resolution: generation.resolution,
      aspectRatio: generation.aspectRatio,
      duration: generation.duration,
      createdAt: generation.createdAt,
      completedAt: generation.completedAt,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '查詢失敗' },
      { status: 500 }
    )
  }
}