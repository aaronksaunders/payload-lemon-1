import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      label: 'Lemon Product ID',
      name: 'lemon_product_id',
      type: 'text',
      required: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      required: true,
    },
  ],
}
