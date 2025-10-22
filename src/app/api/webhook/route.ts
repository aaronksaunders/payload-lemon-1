import crypto from 'crypto'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Webhook body interface for Lemon Squeezy webhook events
 */
interface WebhookBody {
  meta: {
    event_name: string
    custom_data?: Record<string, unknown>
  }
  data: {
    id: string
    type: string
    attributes: {
      identifier: string
      user_email: string
      status: string
      total: number
      [key: string]: unknown
    }
  }
}

/**
 * Success response interface
 */
interface WebhookResponse {
  success: true
  message: string
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string
  message?: string
}

/**
 * NOTE: Using a constant for the Orders collection slug.
 * We cast to `any` at call sites because generated types may not yet include
 * the new collection at build time. This avoids blocking runtime behavior.
 */
const ORDERS_COLLECTION = 'orders' as const

/**
 * POST /api/webhook
 * Handles Lemon Squeezy webhook events for order processing
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    // Get signature from headers
    const signature = request.headers.get('x-signature')
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

    if (!signature || !secret) {
      console.warn('Missing signature or webhook secret')
      return Response.json({ error: 'Unauthorized' } as ErrorResponse, { status: 401 })
    }

    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify webhook signature
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

    if (hash !== signature) {
      console.warn('Invalid webhook signature')
      return Response.json({ error: 'Unauthorized' } as ErrorResponse, { status: 401 })
    }

    // Parse body
    let body: WebhookBody
    try {
      body = JSON.parse(rawBody) as WebhookBody
    } catch (error) {
      console.error('Failed to parse webhook body:', error)
      return Response.json({ error: 'Invalid JSON in webhook body' } as ErrorResponse, {
        status: 400,
      })
    }

    const eventType = body.meta?.event_name
    const orderData = body.data

    // Log all events (helpful for debugging)
    console.log(`Webhook received: ${eventType}`, {
      orderId: orderData.id,
      email: orderData.attributes.user_email,
      amount: orderData.attributes.total,
    })

    // Initialize Payload for database operations
    const payload = await getPayload({
      config: configPromise,
    })

    // Handle different event types
    if (eventType === 'order_created') {
      const email = orderData.attributes.user_email
      const orderId = orderData.id
      const orderIdentifier = orderData.attributes.identifier
      const amount = orderData.attributes.total
      const payloadProductId = String(
        (body.meta?.custom_data as Record<string, unknown> | undefined)?.payloadProductId ?? '',
      )

      console.log('✓ Order created:', {
        orderId,
        email,
        orderIdentifier,
        amount,
        payloadProductId,
      })

      // Upsert order in Payload
      try {
        // Try update by lemonSqueezyOrderId; if not exists, create
        const existing = await payload.find({
          // Casting to any to bypass CollectionSlug type mismatch until types regenerate
          collection: ORDERS_COLLECTION as any,
          where: { lemonSqueezyOrderId: { equals: orderId } },
          limit: 1,
        } as any)

        if (existing.docs?.length) {
          await payload.update({
            collection: ORDERS_COLLECTION as any,
            id: existing.docs[0].id,
            // Casting to any as fields are defined in Orders collection
            data: {
              email,
              orderIdentifier,
              amount,
              status: 'paid',
              payloadProductId,
              raw: orderData,
            } as any,
          } as any)
        } else {
          await payload.create({
            collection: ORDERS_COLLECTION as any,
            data: {
              lemonSqueezyOrderId: orderId,
              email,
              orderIdentifier,
              amount,
              status: 'paid',
              payloadProductId,
              raw: orderData,
            } as any,
          } as any)
        }
      } catch (persistError) {
        console.error('Failed to persist order:', persistError)
        // Do not fail the webhook on DB error
      }
    }

    if (eventType === 'order_refunded') {
      const orderId = orderData.id
      console.log('✓ Order refunded:', { orderId })

      try {
        const existing = await payload.find({
          collection: ORDERS_COLLECTION as any,
          where: { lemonSqueezyOrderId: { equals: orderId } },
          limit: 1,
        } as any)
        if (existing.docs?.length) {
          await payload.update({
            collection: ORDERS_COLLECTION as any,
            id: existing.docs[0].id,
            data: { status: 'refunded', raw: orderData } as any,
          } as any)
        }
      } catch (persistError) {
        console.error('Failed to update order status:', persistError)
        // Do not fail the webhook on DB error
      }
    }

    // Return 200 to acknowledge receipt
    return Response.json({
      success: true,
      message: 'Webhook processed',
    } as WebhookResponse)
  } catch (error) {
    console.error('Webhook processing error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return Response.json(
      {
        error: 'Webhook processing failed',
        message: errorMessage,
      } as ErrorResponse,
      { status: 500 },
    )
  }
}
