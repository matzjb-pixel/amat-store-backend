const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/transaksi', (req, res) => {
    const { service_code, target } = req.body;

    if (!service_code || !target) {
        return res.status(400).json({
            status: false,
            message: "Parameter service_code dan target wajib diisi!"
        });
    }

    let productName = "";
    if (service_code === "ml-50") {
        productName = "Mobile Legends 50 Diamond";
    } else if (service_code === "telkomsel-10k") {
        productName = "Pulsa Telkomsel 10.000";
    } else {
        return res.status(400).json({
            status: false,
            message: "Produk tidak ditemukan!"
        });
    }

    res.json({
        status: true,
        message: `Transaksi ${productName} ke tujuan ${target} berhasil diproses!`,
        data: {
            service_code,
            target,
            status_transaksi: "SUCCESS"
        }
    });
});

module.exports = app;
