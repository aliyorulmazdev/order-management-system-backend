const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.json());

// MSSQL veritabanı yapılandırması
const dbConfig = {
    user: 'sa',
    password: 'f1f1d2d2b0',
    server: 'localhost',
    database: 'ermatOrders',
    options: {
        enableArithAbort: true,
        encrypt: false, // Self-signed sertifikaları kabul etmek için encrypt'i false yapın
    },
};

// Siparişleri veritabanına kaydetme
app.post('/api/createOrder', async (req, res) => {
    try {
        const order = req.body;

        // MSSQL bağlantısı
        await sql.connect(dbConfig);
        console.log('Veritabanına bağlantı başarılı.');

        // Sipariş bilgilerini veritabanına ekleme sorgusu
        const query = `
      INSERT INTO Orders (
        SiparisTarihi, 
        TerminTarihi, 
        FirmaAdi, 
        IsinAdi, 
        IsinAdedi, 
        KagitTuru, 
        KagitGramaji, 
        KagitEn, 
        KagitBoy, 
        BaskiEn, 
        BaskiBoy, 
        StandartBaskiRenkleri, 
        BaskiTuru, 
        BaskiRenkleri, 
        EkstraBaskiRenkleri, 
        BaskiMakinasi, 
        KalipTuru, 
        KalipAdedi, 
        Selefon, 
        Kesim, 
        BicakTuru, 
        BicakKodu, 
        SiparisDurumu, 
        Note
      )
      VALUES (
        @siparisTarihi,
        @terminTarihi,
        @firmaAdi,
        @isinAdi,
        @isinAdedi,
        @kagitTuru,
        @kagitGramaji,
        @kagitEn,
        @kagitBoy,
        @baskiEn,
        @baskiBoy,
        @standartBaskiRenkleri,
        @baskiTuru,
        @baskiRenkleri,
        @ekstraBaskiRenkleri,
        @baskiMakinasi,
        @kalipTuru,
        @kalipAdedi,
        @selefon,
        @kesim,
        @bicakTuru,
        @bicakKodu,
        @siparisDurumu,
        @note
      );
    `;

        const request = new sql.Request();
        request.input('siparisTarihi', sql.DateTime, order.siparisTarihi);
        request.input('terminTarihi', sql.DateTime, order.terminTarihi);
        request.input('firmaAdi', sql.NVarChar, order.firmaAdi);
        request.input('isinAdi', sql.NVarChar, order.isinAdi);
        request.input('isinAdedi', sql.Int, order.isinAdedi);
        request.input('kagitTuru', sql.NVarChar, order.kagitTuru.label);
        request.input('kagitGramaji', sql.Int, order.kagitGramaji);
        request.input('kagitEn', sql.Int, order.kagitOlculeri.en);
        request.input('kagitBoy', sql.Int, order.kagitOlculeri.boy);
        request.input('baskiEn', sql.Int, order.baskiOlculeri.en);
        request.input('baskiBoy', sql.Int, order.baskiOlculeri.boy);
        request.input('standartBaskiRenkleri', sql.NVarChar, order.standartBaskiRenkleri.label);
        request.input('baskiTuru', sql.NVarChar, order.baskiTuru.label);
        request.input('baskiRenkleri', sql.NVarChar, JSON.stringify(order.baskiRenkleri));
        request.input('ekstraBaskiRenkleri', sql.NVarChar, JSON.stringify(order.ekstraBaskiRenkleri));
        request.input('baskiMakinasi', sql.NVarChar, order.baskiMakinasi.label);
        request.input('kalipTuru', sql.NVarChar, order.kalipTuru.label);
        request.input('kalipAdedi', sql.Int, order.kalipAdedi);
        request.input('selefon', sql.NVarChar, order.selefon.label);
        request.input('kesim', sql.NVarChar, order.kesim.label);
        request.input('bicakTuru', sql.NVarChar, order.bicakTuru.label);
        request.input('bicakKodu', sql.NVarChar, order.bicakKodu);
        request.input('siparisDurumu', sql.NVarChar, order.siparisDurumu);
        request.input('note', sql.NVarChar, order.note);

        // Sorguyu yürütme
        await request.query(query);

        // MSSQL bağlantısını kapatma
        sql.close();

        res.status(200).json({ message: 'Sipariş başarıyla kaydedildi.' });
        console.log('sipariş başarıyla kaydedildi');
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

// Siparişleri listeleme
app.get('/api/orders', async (req, res) => {
    try {
        // MSSQL bağlantısı
        await sql.connect(dbConfig);
        console.log('LİSTELEME İSTEĞİ ALDIM. Veritabanına bağlantı başarılı.');

        // Siparişleri çekme sorgusu
        const query = `
            SELECT * FROM Orders;
        `;

        const result = await sql.query(query);

        // MSSQL bağlantısını kapatma
        sql.close();

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

// Express sunucusunu başlatma
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor.`);
});
