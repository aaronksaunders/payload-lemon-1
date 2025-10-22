import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getStores } from '@/utils/lemonSqueezyClient'

/**
 * GET /api/test-checkout
 * Test endpoint to debug Lemon Squeezy checkout creation
 */
export const GET = async (): Promise<Response> => {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config: configPromise,
    })

    // Get a test product
    const products = await payload.find({
      collection: 'products',
      limit: 1,
    })

    if (!products.docs || products.docs.length === 0) {
      return Response.json({
        error: 'No products found',
        suggestion: 'Create a product first with a valid lemon_product_id',
      })
    }

    const product = products.docs[0]

    // Get Lemon Squeezy stores
    const stores = await getStores()

    return Response.json({
      message: 'Test endpoint ready',
      product: {
        id: product.id,
        title: product.title,
        lemon_product_id: product.lemon_product_id,
      },
      stores: stores.map((store) => ({
        id: store.id,
        name: store.attributes.name,
        domain: store.attributes.domain,
      })),
      nextStep: 'Use POST /api/create-checkout with this product data',
      note: 'Add LEMON_SQUEEZY_STORE_ID to your .env file with one of the store IDs above',
    })
  } catch (error) {
    console.error('Test endpoint error:', error)

    return Response.json(
      {
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
