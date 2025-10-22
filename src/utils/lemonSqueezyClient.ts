import axios from 'axios'

const BASE_URL = 'https://api.lemonsqueezy.com/v1'

export const lsClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
})

/**
 * Create a checkout link for a product variant
 */
export const createCheckoutLink = async (
  variantId: string,
  email?: string,
  customData?: Record<string, unknown>,
  storeId?: string,
) => {
  try {
    // Debug: Log the request data
    const requestData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email,
            custom: customData,
          },
          // Add additional required attributes
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          preview: false,
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId || process.env.LEMON_SQUEEZY_STORE_ID || '1',
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    }

    console.log(
      'Creating checkout for variant:',
      variantId,
      'store:',
      storeId || process.env.LEMON_SQUEEZY_STORE_ID || '1',
    )

    const { data } = await lsClient.post('/checkouts', requestData)

    return data.data
  } catch (error) {
    console.error('Error creating checkout:', error)

    // Log detailed error information for debugging
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        errors: error.response?.data?.errors,
      })

      // Log specific validation errors if available
      if (error.response?.data?.errors) {
        console.error(
          'Lemon Squeezy validation errors:',
          JSON.stringify(error.response.data.errors, null, 2),
        )
      }
    }

    throw error
  }
}

/**
 * Fetch order details from Lemon Squeezy
 */
export const getOrder = async (orderId: string) => {
  try {
    const { data } = await lsClient.get(`/orders/${orderId}`)
    return data.data
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

/**
 * Fetch store details from Lemon Squeezy
 */
export const getStores = async () => {
  try {
    const { data } = await lsClient.get('/stores')
    return data.data
  } catch (error) {
    console.error('Error fetching stores:', error)
    throw error
  }
}
