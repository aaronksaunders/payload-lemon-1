import type { CollectionConfig } from 'payload'

/**
 * Orders collection stores Lemon Squeezy order records persisted from webhooks.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'lemonSqueezyOrderId',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'lemonSqueezyOrderId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'orderIdentifier',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Pending', value: 'pending' },
      ],
      defaultValue: 'paid',
    },
    {
      name: 'payloadProductId',
      type: 'text',
      admin: {
        description: 'Payload product id attached via Lemon Squeezy custom data',
      },
    },
    {
      name: 'raw',
      type: 'json',
      admin: {
        description: 'Raw webhook payload snapshot for auditing',
      },
    },
  ],
}
