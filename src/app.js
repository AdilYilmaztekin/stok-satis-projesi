require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();

// Route Dosyalarını İçeri Aktarma
const productRoutes = require("./routes/productRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const stockRoutes = require("./routes/stockRoutes");
const cariRoutes = require("./routes/carisRoutes");
const salesRoutes = require("./routes/salesRoutes");
const loginRoutes = require("./routes/loginRoutes"); 

// Middleware Ayarları
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "login.html")); 
    // Not: Kullanıcı giriş yapmamışsa önce login.html açılması daha mantıklı olabilir.
});


// API Routes
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/caris", cariRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/login", loginRoutes);

// Ana Sayfa Yönlendirmesi
app.use(express.static(path.join(__dirname, "../public")));

// Port Ayarı ve Sunucuyu Başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor...`);
    console.log(`🔗 http://localhost:${PORT} adresinden erişebilirsiniz.`);
});