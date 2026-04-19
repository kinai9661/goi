import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@grokstudio.com'
  const password = process.env.ADMIN_PASSWORD || 'changeme123'

  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      dailyQuota: 999,
      usedQuota: 0,
      quotaResetAt: new Date(),
    },
  })

  console.log(`✅ Admin user created: ${admin.email}`)

  // Create default settings
  const defaultSettings = [
    { key: 'site_name', value: 'Grok Imagine Studio' },
    { key: 'site_description', value: 'AI 圖片與影片生成平台' },
    { key: 'default_quota', value: '50' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'max_image_resolution', value: '2k' },
    { key: 'max_video_duration', value: '10' },
    { key: 'allowed_registrations', value: 'true' },
    { key: 'announcement', value: '' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    })
  }

  console.log('✅ Default settings created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })