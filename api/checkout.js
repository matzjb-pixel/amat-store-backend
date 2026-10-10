const midtransClient = require('midtrans-client');

export default async function handler(req, res) {
  // Set header CORS agar frontend bisa mengakses backend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tangani preflight request OPTIONS dari browser
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, grossAmount, customerDetails } = req.body;

    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    let parameter = {
      transaction_details: {
        order_id: orderId || `AMAT-${Date.now()}`,
        gross_amount: parseInt(grossAmount)
      },
      customer_details: {
        first_name: customerDetails?.name || "Gamer Amat Store",
        email: customerDetails?.email || "customer@amatstore.com"
      }
    };

    const transaction = await snap.createTransaction(parameter);

    return res.status(200).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (error) {
    console.error('Midtrans Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
