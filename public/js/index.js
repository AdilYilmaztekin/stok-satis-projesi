// API adresi
const API_BASE_URL = window.location.origin + "/api";

// DOM elementleri
const productsTableBody = document.getElementById("productsTableBody");
const totalProducts = document.getElementById("totalProducts");


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
});