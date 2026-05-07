const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
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
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/caris", cariRoutes);
app.use("/api/sales", salesRoutes);

// 3. Ana sayfada caris.html veya index.html'i otomatik açmak için:
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 4. Port ayarını canlı ortam değişkenine (environment variable) uyumlu yaptık
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);
=======
require("dotenv").config();

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// ROUTES
// =====================
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/warehouses", require("./routes/warehouseRoutes"));
app.use("/api/stocks", require("./routes/stockRoutes"));
app.use("/api/caris", require("./routes/carisRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));

// =====================
// TEST ROUTE
// =====================
app.get("/api", (req, res) => {
    res.json({ message: "API çalışıyor 🚀" });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server çalışıyor: ${PORT}`);
>>>>>>> 63d5c1633f11973f469fff2bc5458f43bd39aaa1
});