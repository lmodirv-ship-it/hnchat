import { NextRequest, NextResponse } from 'next/server';

// Stripe-supported currencies (lowercase)
const STRIPE_SUPPORTED_CURRENCIES = [
  'usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'cny', 'chf', 'sek', 'nok',
  'dkk', 'nzd', 'sgd', 'hkd', 'mxn', 'brl', 'inr', 'krw', 'thb', 'myr',
  'php', 'idr', 'pln', 'czk', 'huf', 'ron', 'bgn', 'hrk', 'isk', 'try',
  'aed', 'sar', 'qar', 'kwd', 'bhd', 'omr', 'jod', 'egp', 'mad',
];

// Zero-decimal currencies (no cents)
const ZERO_DECIMAL_CURRENCIES = ['jpy', 'krw', 'bif', 'clp', 'gnf', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'xaf', 'xof'];

function toStripeAmount(amount: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'usd', description, metadata = {} } = await req.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const normalizedCurrency = currency.toLowerCase();
    const finalCurrency = STRIPE_SUPPORTED_CURRENCIES.includes(normalizedCurrency)
      ? normalizedCurrency
      : 'usd';

    const stripeAmount = toStripeAmount(amount, finalCurrency);

    // Create Stripe PaymentIntent
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: stripeAmount.toString(),
        currency: finalCurrency,
        description: description || 'hnChat Payment',
        'automatic_payment_methods[enabled]': 'true',
        ...Object.fromEntries(
          Object.entries(metadata).map(([k, v]) => [`metadata[${k}]`, String(v)])
        ),
      }),
    });

    const paymentIntent = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: paymentIntent.error?.message || 'Stripe error' }, { status: 400 });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      currency: finalCurrency,
      amount: stripeAmount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
