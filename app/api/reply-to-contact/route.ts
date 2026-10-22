import { NextRequest, NextResponse } from 'next/server'
import { sendReply } from '@/app/actions/replyToContact'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Authenticate the admin user via Payload's auth (reads JWT from cookies/headers)
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — please log in to admin' },
        { status: 401 },
      )
    }

    // Parse request body
    const body = await req.json()
    const { contactId, body: replyBody } = body

    if (!contactId || !replyBody?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing contactId or reply body' },
        { status: 400 },
      )
    }

    // Send the reply
    const result = await sendReply({
      contactId,
      body: replyBody.trim(),
    })

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error: unknown) {
    console.error('Reply API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
