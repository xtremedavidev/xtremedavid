import type { CollectionConfig } from 'payload'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'budget', 'createdAt'],
  },
  access: {
    // David is the admin, so by default he can read, create, update, delete contacts.
    // For API submissions, we should allow anyone (public) to create contacts.
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
  ],
}
