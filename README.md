# Payload Lemon - E-commerce with Payload CMS & Lemon Squeezy

A modern e-commerce solution built with Payload CMS 3.x and Lemon Squeezy payment processing, featuring custom checkout creation and webhook handling.

## 🚀 Features

- **Payload CMS 3.x** - Headless CMS with Next.js integration
- **Lemon Squeezy Integration** - Payment processing and checkout creation
- **Custom API Routes** - Next.js API routes for checkout and webhook handling
- **TypeScript** - Full type safety throughout the application
- **SQLite Database** - Local development with easy deployment options
- **Webhook Support** - Handle Lemon Squeezy order events

## 📋 Prerequisites

- Node.js 18.20.2 or higher
- pnpm 9 or higher
- Lemon Squeezy account
- ngrok account (for webhook testing)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd payload-lemon
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```bash
# Payload CMS Configuration
PAYLOAD_SECRET=your-super-secret-payload-key-here
DATABASE_URI=file:./payload-lemon.db

# Lemon Squeezy Configuration
LEMON_SQUEEZY_API_KEY=your-lemon-squeezy-api-key
LEMON_SQUEEZY_STORE_ID=your-store-id
LEMON_SQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# Next.js Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Get Your Lemon Squeezy Credentials

#### API Key

1. Go to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/settings/api)
2. Create a new API key
3. Copy the key to `LEMON_SQUEEZY_API_KEY`

#### Store ID

1. Visit `http://localhost:3000/api/test-checkout` after starting the app
2. Copy your store ID to `LEMON_SQUEEZY_STORE_ID`

#### Webhook Secret

1. Go to [Lemon Squeezy Webhooks](https://app.lemonsqueezy.com/settings/webhooks)
2. Create a new webhook with URL: `https://your-ngrok-url.ngrok.io/api/webhook`
3. Copy the webhook secret to `LEMON_SQUEEZY_WEBHOOK_SECRET`

## 🚀 Development

### Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

- **Frontend**: `http://localhost:3000`
- **Payload Admin**: `http://localhost:3000/admin`
- **API Routes**: `http://localhost:3000/api/*`

## 🔧 ngrok Setup for Webhooks

### 1. Install ngrok

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### 2. Create ngrok Account

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your authtoken from the dashboard
3. Configure ngrok:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 3. Start ngrok Tunnel

```bash
ngrok http 3000
```

This will give you a public URL like `https://abc123.ngrok.io`

### 4. Update Webhook URL

1. Copy the ngrok URL
2. Update your Lemon Squeezy webhook URL to: `https://abc123.ngrok.io/api/webhook`
3. Update your `.env.local`:

```bash
NEXT_PUBLIC_SERVER_URL=https://abc123.ngrok.io
```

## 📦 API Endpoints

### Create Checkout

**POST** `/api/create-checkout`

Creates a Lemon Squeezy checkout link for a product.

**Request Body:**

```json
{
  "productId": "1051375",
  "email": "customer@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "checkoutUrl": "https://store.lemonsqueezy.com/checkout/...",
  "checkoutId": "checkout-uuid"
}
```

### Webhook Handler

**POST** `/api/webhook`

Handles Lemon Squeezy webhook events (order created, refunded, etc.).

### Test Endpoint

**GET** `/api/test-checkout`

Returns available products and stores for testing.

## 🗄️ Database Setup

### Create Products

1. Go to `http://localhost:3000/admin`
2. Navigate to Products collection
3. Create a new product with:
   - **Title**: Product name
   - **Description**: Product description
   - **Price**: Product price
   - **Lemon Product ID**: Your Lemon Squeezy variant ID
   - **Published**: Check this box

### Get Variant ID

1. Go to your Lemon Squeezy dashboard
2. Navigate to Products → Your Product → Variants
3. Copy the variant ID (e.g., "1051375")

## 🔄 Webhook Events

The webhook handler processes these Lemon Squeezy events:

- `order_created` - New order completed
- `order_refunded` - Order refunded

### Webhook Payload Example

```json
{
  "meta": {
    "event_name": "order_created",
    "custom_data": {
      "payloadProductId": "1"
    }
  },
  "data": {
    "id": "order-id",
    "type": "orders",
    "attributes": {
      "user_email": "customer@example.com",
      "total": 2999,
      "status": "paid"
    }
  }
}
```

## 🧪 Testing

### Test Checkout Creation

```bash
curl -X POST http://localhost:3000/api/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1051375",
    "email": "test@example.com"
  }'
```

### Test Webhook (with ngrok)

```bash
curl -X POST https://your-ngrok-url.ngrok.io/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: your-webhook-signature" \
  -d '{
    "meta": {
      "event_name": "order_created"
    },
    "data": {
      "id": "test-order",
      "type": "orders",
      "attributes": {
        "user_email": "test@example.com",
        "total": 2999
      }
    }
  }'
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Variables for Production

```bash
PAYLOAD_SECRET=your-production-secret
DATABASE_URI=your-production-database-url
LEMON_SQUEEZY_API_KEY=your-api-key
LEMON_SQUEEZY_STORE_ID=your-store-id
LEMON_SQUEEZY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
```

### Update Webhook URL

Update your Lemon Squeezy webhook URL to:

```
https://your-domain.com/api/webhook
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── create-checkout/    # Checkout creation endpoint
│   │   ├── webhook/            # Webhook handler
│   │   └── test-checkout/      # Test endpoint
│   ├── (frontend)/             # Public frontend
│   └── (payload)/              # Payload admin
├── collections/
│   ├── Products.ts             # Product collection
│   ├── Users.ts                # User collection
│   └── Media.ts                # Media collection
├── utils/
│   └── lemonSqueezyClient.ts   # Lemon Squeezy API client
└── payload.config.ts           # Payload configuration
```

## 🔧 Configuration

### Payload CMS Configuration

The `payload.config.ts` includes:

- SQLite database adapter
- Lexical rich text editor
- Email adapter (Nodemailer)
- Custom collections

### Lemon Squeezy Client

The `lemonSqueezyClient.ts` provides:

- Checkout creation
- Order fetching
- Store information
- Webhook signature verification

## 🐛 Troubleshooting

### Common Issues

1. **422 Error on Checkout Creation**
   - Ensure `LEMON_SQUEEZY_STORE_ID` is set
   - Verify variant ID exists in Lemon Squeezy
   - Check that custom data values are strings

2. **Webhook Signature Verification Failed**
   - Ensure `LEMON_SQUEEZY_WEBHOOK_SECRET` matches Lemon Squeezy
   - Verify ngrok URL is correct
   - Check webhook URL in Lemon Squeezy dashboard

3. **Email Adapter Warning**
   - Configure SMTP settings in `.env.local`
   - Or ignore if not using email features

### Debug Endpoints

- `GET /api/test-checkout` - Check products and stores
- Check console logs for detailed error information

## 📚 Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Lemon Squeezy API Documentation](https://docs.lemonsqueezy.com/api)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [ngrok Documentation](https://ngrok.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:

- Check the troubleshooting section
- Review Payload CMS and Lemon Squeezy documentation
- Open an issue in this repository
