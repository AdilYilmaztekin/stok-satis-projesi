require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // 1. Path modülünü ekledik
const db = require("./config/db");
const app = express();

const productRoutes = require("./routes/productRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const stockRoutes = require("./routes/stockRoutes");
const cariRoutes = require("./routes/carisRoutes");
const salesRoutes = require("./routes/salesRoutes");

// middleware
app.use(cors());
app.use(express.json());

// 2. Statik dosyaları sunma (public klasörünü dışarı açar)
app.use(express.static(path.join(__dirname, "../public")));

// routes
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/caris", cariRoutes);
app.use("/api/sales", salesRoutes);

// 3. Ana sayfada caris.html veya index.html'i otomatik açmak için:
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// 4. Port ayarını canlı ortam değişkenine (environment variable) uyumlu yaptık
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);
});