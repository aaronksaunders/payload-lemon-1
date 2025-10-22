'use client'
import React from 'react'

import './styles.css'

export default function HomePage() {
  const processCheckout = async () => {
    fetch('http://localhost:3001/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: '2',
        email: 'test@example.com',
      }),
    })
      .then((r) => r.json())
      .then((d) => console.log(d.checkoutUrl))
  }

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <button
        onClick={processCheckout}
        style={{
          padding: '10px 20px',
          backgroundColor: 'blue',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Process Checkout
      </button>
    </div>
  )
}
