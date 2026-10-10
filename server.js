const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const md5 = require('md5'); // Library untuk enkripsi password/signature VIP Reseller

const app = express();
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Koneksi Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Data VIP Reseller dari Vercel
const vipApiId = process.env.VIP_API_ID;
const vipApiKey = process.env.VIP_API_KEY;

app.post('/api/transaksi', async (req, res) => {
    const { service_code, target, zone } = req.body;

    try {
        // 1. Buat Signature untuk VIP Reseller (Formula: MD5 dari API_ID + API_KEY)
        const sign = md5(vipApiId + vipApiKey);

        // 2. Tembak Request Otomatis ke API VIP Reseller
        const vipRequest = await fetch('https://vip-reseller.co.id/api/game-feature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                key: vipApiKey,
                sign: sign,
                type: 'order',
                service: service_code,
                data_no: target,
                data_zone: zone
            })
        });

        const vipResponse = await vipRequest.json();

        // 3. Simpan data ke Database Supabase lu (Format target digabung agar masuk ke 1 kolom)
        const dataTargetGabung = target + " (" + zone + ")";
        await supabase
            .from('transactions')
            .insert([
                { service_code: service_code, target: dataTargetGabung }
            ]);

        // 4. Kirim balasan ke Web Frontend sesuai jawaban dari VIP Reseller
        if (vipResponse.result === true) {
            res.json({ 
                status: true, 
                message: vipResponse.message || 'Pesanan berhasil dikirim ke server!', 
                status_transaksi: 'SUCCESS',
                target: dataTargetGabung
            });
        } else {
            res.json({ 
                status: false, 
                message: vipResponse.message || 'Pesanan gagal diproses server.', 
                status_transaksi: 'FAILED',
                target: dataTargetGabung
            });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            status: false, 
            message: 'Terjadi kesalahan internal pada server.', 
            status_transaksi: 'ERROR' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
