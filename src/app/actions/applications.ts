'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { z } from 'zod'

const applicationSchema = z.object({ fullName: z.string().min(2), gmail: z.string().email(), phone: z.string().min(7), educationLevel: z.string().min(1) })

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function saveApplication(data: Record<string, unknown>, submit = false) {
  const userId = await getUserId()
  const parsed = applicationSchema.safeParse(data)
  if (!parsed.success) throw new Error('Please complete the required fields.')
  const existing = await db.select().from(applications).where(eq(applications.userId, userId)).limit(1)
  const now = new Date()
  if (existing[0]) {
    const referenceId = existing[0].referenceId
    await db.update(applications).set({ data, status: submit ? 'submitted' : 'draft', submittedAt: submit ? now : existing[0].submittedAt, updatedAt: now }).where(eq(applications.id, existing[0].id))
    return { referenceId, status: submit ? 'submitted' : 'draft', submittedAt: submit ? now.toISOString() : existing[0].submittedAt?.toISOString() }
  }
  const id = crypto.randomUUID()
  const referenceId = `LAP-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
  await db.insert(applications).values({ id, userId, referenceId, status: submit ? 'submitted' : 'draft', data, submittedAt: submit ? now : null })
  return { referenceId, status: submit ? 'submitted' : 'draft', submittedAt: submit ? now.toISOString() : undefined }
}

export async function getMyApplication() {
  const userId = await getUserId()
  const rows = await db.select().from(applications).where(eq(applications.userId, userId)).limit(1)
  return rows[0] ?? null
}
