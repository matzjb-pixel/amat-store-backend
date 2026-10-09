const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Kredensial VIP Reseller Amat Store
const API_ID = 'nUNNGi6S';
const API_KEY = '6itopui9VURzAkv7xM4APjlaz7InkQau3kege6:';

app.post('/api/transaksi', async (req, res) => {
    const { service_code, target, server_id } = req.body;
    const sign = crypto.createHmac('sha256', API_KEY).update(API_ID + 'transaction').digest('hex');
    const destination = server_id ? `${target}${server_id}` : target;

    try {
        const response = await fetch('https://vip-reseller.co.id/api/game-feature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: API_KEY,
                sign: sign,
                type: 'order',
                service: service_code,
                data_no: destination
            })
        });

        const result = await response.json();
        res.json({ status: true, data: result });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Amat Store aktif di port ${PORT}`));
