import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { createCheckoutLink } from '@/utils/lemonSqueezyClient'

/**
 * Request body interface for the create checkout endpoint
 */
interface CreateCheckoutRequest {
  productId: string // Payload product ID NOT Lemon Squeezy product ID
  email: string
}

/**
 * Response interface for successful checkout creation
 */
interface CreateCheckoutResponse {
  success: true
  checkoutUrl: string
  checkoutId: string
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string
  message?: string
}

/**
 * POST /api/create-checkout
 * Creates a Lemon Squeezy checkout link for a product
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    // Parse and validate request body
    let data: CreateCheckoutRequest
    try {
      data = (await request.json()) as CreateCheckoutRequest
    } catch (error) {
      return Response.json({ error: 'Invalid JSON in request body' } as ErrorResponse, {
        status: 400,
      })
    }

    // Validate required fields
    if (!data.productId || !data.email) {
      return Response.json(
        { error: 'Missing required fields: productId and email' } as ErrorResponse,
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return Response.json({ error: 'Invalid email format' } as ErrorResponse, { status: 400 })
    }

    // Initialize Payload
    const payload = await getPayload({
      config: configPromise,
    })

    // Find product in Payload CMS
    const productResult = await payload.findByID({
      collection: 'products',
      id: data.productId,
    })

    if (!productResult) {
      return Response.json({ error: 'Product not found' } as ErrorResponse, { status: 404 })
    }

    if (!productResult.lemon_product_id) {
      return Response.json({ error: 'Product not linked to Lemon Squeezy' } as ErrorResponse, {
        status: 400,
      })
    }

    // Create checkout link in Lemon Squeezy
    const checkout = await createCheckoutLink(
      productResult.lemon_product_id,
      data.email,
      {
        payloadProductId: String(productResult.id),
      },
      process.env.LEMON_SQUEEZY_STORE_ID,
    )

    if (!checkout || !checkout.attributes?.url) {
      return Response.json({ error: 'Failed to create checkout link' } as ErrorResponse, {
        status: 500,
      })
    }

    return Response.json({
      success: true,
      checkoutUrl: checkout.attributes.url,
      checkoutId: checkout.id,
    } as CreateCheckoutResponse)
  } catch (error) {
    console.error('Checkout creation error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return Response.json(
      {
        error: 'Failed to create checkout',
        message: errorMessage,
      } as ErrorResponse,
      { status: 500 },
    )
  }
}
