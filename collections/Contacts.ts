import type { CollectionConfig } from 'payload'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'budget', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'projectTypes',
      type: 'array',
      label: 'Project Types / Services',
      fields: [
        {
          name: 'type',
          type: 'text',
        },
      ],
    },
    {
      name: 'budget',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'conversation',
      type: 'array',
      label: 'Conversation Thread',
      admin: {
        description: 'Full conversation history with this contact.',
        // Make the default array UI read-only — replies happen via the custom component
        readOnly: true,
      },
      fields: [
        {
          name: 'sender',
          type: 'select',
          required: true,
          options: [
            { label: 'Client', value: 'client' },
            { label: 'Admin (David)', value: 'admin' },
          ],
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
        },
        {
          name: 'sentAt',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'emailMessageId',
          type: 'text',
          admin: {
            description: 'Email Message-ID header for threading.',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'conversationUI',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/app/components/admin/ConversationPanel#ConversationPanel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // When a new contact is created, auto-populate the first conversation entry
        if (operation === 'create' && doc.message && (!doc.conversation || doc.conversation.length === 0)) {
          await req.payload.update({
            collection: 'contacts',
            id: doc.id,
            data: {
              conversation: [
                {
                  sender: 'client',
                  body: doc.message,
                  sentAt: doc.createdAt || new Date().toISOString(),
                },
              ],
            },
          })
        }
      },
    ],
  },
}
