// API adresi
const API_BASE_URL = window.location.origin + "/api";

// DOM elementleri
const productsTableBody = document.getElementById("productsTableBody");

const addProductForm = document.getElementById("addProductForm");
const addProductModalElement = document.getElementById("addProductModal");
const addProductModal = new bootstrap.Modal(addProductModalElement);
const openAddProductModalBtn = document.getElementById("openAddProductModalBtn");

const editProductModalElement = document.getElementById("editProductModal");
const editProductModal = new bootstrap.Modal(editProductModalElement);
const editProductForm = document.getElementById("editProductForm");


// =====================
// VERİYİ YÜKLEME (LIST)
// =====================
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error("Ürünler alınamadı.");
        }

        const products = await response.json();

        productsTableBody.innerHTML = "";

        if (!products.length) {
            productsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        Henüz ürün bulunmuyor.
                    </td>
                </tr>
            `;
            return;
        }

        products.forEach(product => {
            const statusBadge = `<span class="badge-soft-success">Aktif</span>`;

            const row = `
                <tr data-id="${product.id}">
                    <td>${product.name}</td>
                    <td>${formatPrice(product.price)}</td>
                    <td>${statusBadge}</td>
                    <td class="text-end">
                        <button 
                            class="btn btn-sm btn-outline-primary rounded-pill me-2"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Düzenle"
                            onclick='openEditModal(${product.id}, ${JSON.stringify(product.name)}, ${product.price})'>
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button 
                            class="btn btn-sm btn-outline-danger rounded-pill"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Sil"
                            onclick="deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

            productsTableBody.innerHTML += row;
        });

        initTooltips();
    } catch (error) {
        console.error("Ürünler alınırken hata oluştu:", error);

        productsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger py-4">
                    Ürünler yüklenemedi.
                </td>
            </tr>
        `;

        showToast("Ürünler yüklenemedi.", "error");
    }
}


// =====================
// KAYDETME (ADD)
// =====================
async function addProduct(event) {
    event.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value.trim();

    if (!name || !price) {
        showToast("Lütfen tüm alanları doldurun.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, price })
        });

        if (!response.ok) {
            throw new Error("Ürün eklenemedi.");
        }

        addProductForm.reset();
        addProductModal.hide();
        await loadProducts();

        showToast("Ürün başarıyla eklendi.", "success");

    } catch (error) {
        console.error("Ürün ekleme hatası:", error);
        showToast("Ürün eklenirken hata oluştu.", "error");
    }
}


// =====================
// MODAL AÇ (EDIT)
// =====================
function openEditModal(id, name, price) {
    document.getElementById("editProductId").value = id;
    document.getElementById("editProductName").value = name;
    document.getElementById("editProductPrice").value = price;

    editProductModal.show();
}


// =====================
// GÜNCELLEME (UPDATE)
// =====================
async function updateProduct(event) {
    event.preventDefault();

    const id = document.getElementById("editProductId").value;
    const name = document.getElementById("editProductName").value.trim();
    const price = document.getElementById("editProductPrice").value.trim();

    if (!name || !price) {
        showToast("Lütfen tüm alanları doldurun.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, price })
        });

        if (!response.ok) {
            throw new Error("Ürün güncellenemedi.");
        }

        editProductModal.hide();
        await loadProducts();

        showToast("Ürün başarıyla güncellendi.", "success");

    } catch (error) {
        console.error("Ürün güncelleme hatası:", error);
        showToast(error.message || "Ürün güncellenirken hata oluştu.", "error");
    }
}


// =====================
// SİLME (DELETE)
// =====================
async function deleteProduct(id) {
    showConfirm(
        "Ürünü Sil",
        "Bu ürünü silmek istediğine emin misin?",
        async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/delete/${id}`, {
                    method: "DELETE"
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Silme işlemi başarısız");
                }

                await loadProducts();
                showToast(data.message || "Ürün başarıyla silindi.", "success");

            } catch (error) {
                console.error("Silme hatası:", error);
                showToast(error.message || "Ürün silinirken hata oluştu.", "error");
            }
        }
    );
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
// TOOLTIP AKTİF ETME
// =====================
function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}


// =====================
// MODAL AÇMA (ADD BUTONU)
// =====================
openAddProductModalBtn.addEventListener("click", () => {
    addProductModal.show();
});


// =====================
// FORM SUBMIT (ADD)
// Yeni ürün ekleme formu submit edildiğinde çalışır
// =====================
addProductForm.addEventListener("submit", addProduct);


// =====================
// FORM SUBMIT (UPDATE)
// Güncelleme formu submit edildiğinde çalışır
// =====================
editProductForm.addEventListener("submit", updateProduct);


// =====================
// SAYFA YÜKLENDİĞİNDE
// Sayfa açılır açılmaz ürünleri getirir
// =====================
document.addEventListener("DOMContentLoaded", loadProducts);