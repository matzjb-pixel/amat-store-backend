const midtransClient = require('midtrans-client');

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, grossAmount, customerDetails } = req.body;

    // Inisialisasi Midtrans Snap API Client menggunakan Server Key lu
    let snap = new midtransClient.Snap({
      isProduction: false, // Ubah jadi true kalau udah siap rilis ke publik/live
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    let parameter = {
      transaction_details: {
        order_id: orderId || `AMAT-${Date.now()}`,
        gross_amount: grossAmount
      },
      customer_details: {
        first_name: customerDetails?.name || 'Gamer',
        email: customerDetails?.email || 'customer@amatstore.com'
      }
    };

    // Minta Snap Token ke Midtrans
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
