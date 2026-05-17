// API adresi
const API_BASE_URL = window.location.origin + "/api";

// DOM elementleri
const productsTableBody = document.getElementById("productsTableBody");
const totalProducts = document.getElementById("totalProducts");
const totalWarehouses = document.getElementById("totalWarehouses");
const todaySales = document.getElementById("todaySales");
const criticalStocks = document.getElementById("criticalStocks");
const warehouseCardsContainer = document.getElementById("warehouseCards");

// =====================
// SON 5 ÜRÜNÜ YÜKLEME
// =====================
async function loadLatestProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/latest`);

        if (!response.ok) {
            throw new Error("Son ürünler alınamadı.");
        }

        const products = await response.json();

        productsTableBody.innerHTML = "";

        if (!products.length) {
            productsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        Ürün bulunamadı
                    </td>
                </tr>
            `;
            return;
        }

        products.forEach(product => {
            productsTableBody.innerHTML += `
                <tr>
                    <td>${product.name}</td>
                    <td>${formatPrice(product.price)}</td>
                    <td><span class="badge-soft-success">Aktif</span></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Son ürünler yüklenirken hata:", error);

        productsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger py-4">
                    Ürünler yüklenemedi
                </td>
            </tr>
        `;
    }
}

// =====================
// TOPLAM ÜRÜN SAYISI
// =====================
async function loadTotalProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/count`);

        if (!response.ok) {
            throw new Error("Toplam ürün sayısı alınamadı.");
        }

        const data = await response.json();
        totalProducts.textContent = data.total;

    } catch (error) {
        console.error("Toplam ürün sayısı alınırken hata:", error);
        totalProducts.textContent = "0";
    }
}

// =====================
// TOPLAM DEPO SAYISI
// =====================
async function loadTotalWarehouses() {
    if (!totalWarehouses) return;
    try {
        const response = await fetch(`${API_BASE_URL}/warehouses/count`);
        if (!response.ok) throw new Error("Depo sayısı alınamadı.");
        const data = await response.json();
        totalWarehouses.textContent = data.total;
    } catch (error) {
        console.error("Toplam depo sayısı alınırken hata:", error);
        totalWarehouses.textContent = "0";
    }
}

// =====================
// BUGÜNKÜ SATIŞ TOPLAMI
// =====================
async function loadTodaySales() {
    if (!todaySales) return;
    try {
        const response = await fetch(`${API_BASE_URL}/sales/today`);
        if (!response.ok) throw new Error("Bugünkü satışlar alınamadı.");
        const data = await response.json();
        todaySales.textContent = formatPrice(data.total_sales);
    } catch (error) {
        console.error("Bugünkü satışlar alınırken hata:", error);
        todaySales.textContent = "₺0";
    }
}

// =====================
// KRİTİK STOK SAYISI
// =====================
async function loadCriticalStocks() {
    if (!criticalStocks) return;
    try {
        const response = await fetch(`${API_BASE_URL}/stocks/critical?threshold=5`);
        if (!response.ok) throw new Error("Kritik stok sayısı alınamadı.");
        const data = await response.json();
        criticalStocks.textContent = data.total;
    } catch (error) {
        console.error("Kritik stok sayısı alınırken hata:", error);
        criticalStocks.textContent = "0";
    }
}

// =====================
// DEPO KARTLARI
// =====================
async function loadWarehouseCards() {
    if (!warehouseCardsContainer) return;
    try {
        const response = await fetch(`${API_BASE_URL}/warehouses`);
        if (!response.ok) throw new Error("Depolar alınamadı.");
        const warehouses = await response.json();

        if (!warehouses.length) {
            warehouseCardsContainer.innerHTML = `
                <div class="alert alert-secondary mb-3">Aktif depo bulunamadı.</div>
            `;
            return;
        }

        warehouseCardsContainer.innerHTML = warehouses.slice(0, 3).map(warehouse => `
            <div class="warehouse-card d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-semibold mb-1">${warehouse.name}</div>
                    <small class="text-muted">${warehouse.location || 'Bilinmiyor'}</small>
                </div>
                <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill py-2 px-3">Aktif</span>
            </div>
        `).join('');
    } catch (error) {
        console.error("Depo kartları yüklenirken hata:", error);
        warehouseCardsContainer.innerHTML = `
            <div class="alert alert-danger mb-3">Depo bilgileri alınamadı.</div>
        `;
    }
}

// =====================
// FİYAT FORMATLAMA
// =====================
function formatPrice(price) {
    return `₺${Number(price).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// =====================
// SAYFA AÇILINCA ÇALIŞIR
// =====================
document.addEventListener("DOMContentLoaded", () => {
    loadLatestProducts();
    loadTotalProducts();
    loadTotalWarehouses();
    loadTodaySales();
    loadCriticalStocks();
    loadWarehouseCards();
});