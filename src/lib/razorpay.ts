interface RazorpayCheckoutOptions {
  key: string
  amount: string
  currency: string
  order_id: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayCheckoutInstance {
  open: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance
  }
}

const CHECKOUT_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptLoadPromise: Promise<void> | null = null

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()

  scriptLoadPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load the Razorpay Checkout script.'))
    document.body.appendChild(script)
  })

  return scriptLoadPromise
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  await loadCheckoutScript()
  if (!window.Razorpay) throw new Error('Razorpay Checkout failed to load.')
  new window.Razorpay(options).open()
}
