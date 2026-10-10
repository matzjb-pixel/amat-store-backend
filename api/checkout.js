const midtransClient = require('midtrans-client');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, grossAmount, customerDetails } = req.body;

    let snap = new midtransClient.Snap({
      isProduction: true,
      serverKey: 'Mid-server-fGFpd38e1t480Bbl0hne-yoX',
      clientKey: 'Mid-client-AVcQojd_HgwST2NN'
    });

    let parameter = {
      transaction_details: {
        order_id: orderId || `AMAT-${Date.now()}`,
        gross_amount: parseInt(grossAmount || 10000)
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
    console.error('DETAIL MIDTRANS ERROR:', error);
    return res.status(500).json({ error: error.ApiResponse?.error_messages || error.message || 'Internal Server Error' });
  }
}
