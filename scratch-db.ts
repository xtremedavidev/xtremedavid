import { getPayload } from 'payload'
import config from './payload.config'

async function main() {
  const payload = await getPayload({ config })
  const contacts = await payload.find({
    collection: 'contacts',
    sort: '-createdAt',
    limit: 1
  })
  
  if (contacts.docs.length > 0) {
    const c = contacts.docs[0]
    console.log(`Latest contact: ${c.name}, Email: ${c.email}`)
    console.log(`Conversation length: ${c.conversation?.length}`)
    if (c.conversation) {
        c.conversation.forEach((msg: any, idx: number) => {
            console.log(`Msg ${idx}: Sender: ${msg.sender}, MsgID: ${msg.emailMessageId}`)
        })
    }
  } else {
    console.log("No contacts found.")
  }
}

main().catch(console.error)
