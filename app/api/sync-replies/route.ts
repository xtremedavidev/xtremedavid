import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const cookieHeader = req.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/payload-token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { contactId } = body

    if (!contactId) {
      return NextResponse.json({ success: false, error: 'Missing contactId' }, { status: 400 })
    }

    const contact = await payload.findByID({
      collection: 'contacts',
      id: contactId,
    })

    if (!contact || !contact.email) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 })
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPass) {
      return NextResponse.json({ success: false, error: 'Gmail credentials not configured' }, { status: 500 })
    }

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      logger: false,
    })

    await client.connect()

    const lock = await client.getMailboxLock('INBOX')
    
    let newMessagesAdded = 0
    let updatedConversation = (contact.conversation || []) as Array<any>
    
    const existingMessageIds = updatedConversation
      .filter(m => m.emailMessageId)
      .map(m => m.emailMessageId)

    try {
      // Search for emails from this contact since the contact was created
      const searchCriteria: any = { 
        from: contact.email as string,
        since: new Date(contact.createdAt as string)
      }
      
      const fetchOptions = {
        source: true,
        uid: true,
        envelope: true,
      }

      // We only want to fetch emails that we haven't already saved
      // But IMAP search by Message-ID isn't always reliable across servers, 
      // so we search by sender and filter locally.
      
      for await (const message of client.fetch(searchCriteria, fetchOptions)) {
        if (!message.source) continue
        
        const parsed = await simpleParser(message.source)
        const msgId = parsed.messageId
        
        // Skip if we already have this message
        if (msgId && existingMessageIds.includes(msgId)) {
          continue
        }

        // Make sure it was actually sent to you (fixes self-testing loop)
        const toList = parsed.to
          ? Array.isArray(parsed.to)
            ? parsed.to.flatMap((item) => item.value)
            : parsed.to.value
          : []
        const isToMe = toList.some(
          (t) => t.address?.toLowerCase() === gmailUser.toLowerCase()
        )
        if (!isToMe) continue

        // Clean up the body text
        const textBody = parsed.text || parsed.textAsHtml || 'No text content'
        
        // Remove quoted replies (basic cleanup for Gmail)
        let cleanBody = textBody.split(/On .* wrote:/)[0].trim()
        cleanBody = cleanBody.split(/>.*$/m)[0].trim()
        
        updatedConversation.push({
          sender: 'client',
          body: cleanBody || textBody, // Fallback to full text if parsing was too aggressive
          sentAt: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
          emailMessageId: msgId,
        })
        
        newMessagesAdded++
      }
      
    } finally {
      lock.release()
    }

    await client.logout()

    if (newMessagesAdded > 0) {
      // Sort chronologically by sentAt
      updatedConversation.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
      
      await payload.update({
        collection: 'contacts',
        id: contactId,
        data: {
          conversation: updatedConversation,
          status: 'new', // Set status to 'new' since client replied
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      newMessages: newMessagesAdded,
      conversation: updatedConversation
    })

  } catch (error: any) {
    console.error('Sync API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
