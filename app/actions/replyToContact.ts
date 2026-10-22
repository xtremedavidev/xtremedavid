'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import nodemailer from 'nodemailer'

interface ReplyData {
  contactId: string
  body: string
}

export async function sendReply(data: ReplyData) {
  try {
    const payload = await getPayload({ config })

    // Get the contact document
    const contact = await payload.findByID({
      collection: 'contacts',
      id: data.contactId,
    })

    if (!contact) {
      return { success: false, error: 'Contact not found' }
    }

    // Build email references for threading
    const existingMessages = (contact.conversation || []) as Array<{
      sender: string
      body: string
      sentAt: string
      emailMessageId?: string
    }>
    const lastClientMessageId = [...existingMessages]
      .reverse()
      .find((m) => m.emailMessageId)?.emailMessageId

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'davidadebayo702@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Build email headers for threading
    const headers: Record<string, string> = {}
    if (lastClientMessageId) {
      headers['In-Reply-To'] = lastClientMessageId
      headers['References'] = lastClientMessageId
    }

    const clientName = (contact.name as string).split(' ')[0]

    // Send the reply email
    const info = await transporter.sendMail({
      from: `"David Adebayo" <${process.env.GMAIL_USER || 'davidadebayo702@gmail.com'}>`,
      to: contact.email as string,
      subject: `Re: Your project inquiry — ${clientName}`,
      headers,
      html: `
        <div style="background-color: #080808; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif; padding: 45px; border-radius: 8px; border: 1px solid #1a1a1a; max-width: 600px; margin: 0 auto;">
          <div style="font-size: 28px; font-weight: bold; color: #ffffff; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px;">
            DAVID<span style="color: #C8FF00;">ADEBAYO</span>
          </div>
          
          <div style="color: #e0e0e0; line-height: 1.8; font-size: 16px; white-space: pre-wrap;">${data.body}</div>
          
          <div style="margin-top: 45px; border-top: 1px solid #1a1a1a; padding-top: 25px;">
            <div style="color: #ffffff; font-weight: bold; font-size: 16px;">David Adebayo</div>
            <div style="color: #888888; font-size: 14px; margin-top: 2px;">UI/UX Designer & Software Engineer</div>
            <div style="margin-top: 12px;">
              <a href="https://www.behance.net/xtremedavid" style="color: #C8FF00; text-decoration: none; font-size: 14px; margin-right: 15px;">Behance</a>
              <a href="https://www.linkedin.com/in/david-adebayo/" style="color: #C8FF00; text-decoration: none; font-size: 14px; margin-right: 15px;">LinkedIn</a>
              <a href="https://x.com/xtremedaviddev" style="color: #C8FF00; text-decoration: none; font-size: 14px;">X / Twitter</a>
            </div>
          </div>
        </div>
      `,
      text: `${data.body}\n\n--\nDavid Adebayo\nUI/UX Designer & Software Engineer\nBehance: https://www.behance.net/xtremedavid\nLinkedIn: https://www.linkedin.com/in/david-adebayo\nX/Twitter: https://x.com/xtremedaviddev`,
    })

    const actualMessageId = info.messageId

    // Update the conversation thread and status
    const updatedConversation = [
      ...existingMessages,
      {
        sender: 'admin' as const,
        body: data.body,
        sentAt: new Date().toISOString(),
        emailMessageId: actualMessageId,
      },
    ]

    await payload.update({
      collection: 'contacts',
      id: data.contactId,
      data: {
        conversation: updatedConversation,
        status: 'replied',
      },
    })

    return { success: true, messageId: actualMessageId }
  } catch (error: unknown) {
    console.error('Error sending reply:', error)
    const message = error instanceof Error ? error.message : 'Failed to send reply'
    return { success: false, error: message }
  }
}
