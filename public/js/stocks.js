const API_BASE_URL = window.location.origin + "/api";
const stocksTableBody = document.getElementById("stocksTableBody");

const openAddStockModalBtn = document.getElementById("openAddStockModalBtn");

const addStockForm = document.getElementById("addStockForm");
const editStockForm = document.getElementById("editStockForm");

const warehouseSelect = document.getElementById("warehouseSelect");
const productSelect = document.getElementById("productSelect");

const editWarehouseSelect = document.getElementById("editWarehouseSelect");
const editProductSelect = document.getElementById("editProductSelect");

const stockAmount = document.getElementById("stockAmount");
const editStockAmount = document.getElementById("editStockAmount");
const editStockId = document.getElementById("editStockId");

const addStockModal = new bootstrap.Modal(document.getElementById("addStockModal"));
const editStockModal = new bootstrap.Modal(document.getElementById("editStockModal"));

document.addEventListener("DOMContentLoaded", () => {
    loadStocks();
    loadWarehousesAndProducts();
});

openAddStockModalBtn.addEventListener("click", async () => {
    addStockForm.reset();
    await loadWarehousesAndProducts();
    addStockModal.show();
});

async function loadWarehousesAndProducts() {
    await loadWarehouses();
    await loadProducts();
}

async function loadWarehouses() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/warehouses`);

        if (!response.ok) {
            throw new Error(`HTTP hata: ${response.status}`);
        }

        const data = await response.json();

        warehouseSelect.innerHTML = `<option value="">Depo seçiniz</option>`;
        editWarehouseSelect.innerHTML = `<option value="">Depo seçiniz</option>`;

        data.forEach((warehouse) => {
            const warehouseName = warehouse.name || warehouse.warehouse_name;

            warehouseSelect.innerHTML += `<option value="${warehouse.id}">${warehouseName}</option>`;
            editWarehouseSelect.innerHTML += `<option value="${warehouse.id}">${warehouseName}</option>`;
        });
    } catch (error) {
        console.error("Depolar yüklenemedi:", error);
        showToast("Depolar yüklenirken bir hata oluştu.", "error");
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);

        if (!response.ok) {
            throw new Error(`HTTP hata: ${response.status}`);
        }

        const data = await response.json();

        productSelect.innerHTML = `<option value="">Ürün seçiniz</option>`;
        editProductSelect.innerHTML = `<option value="">Ürün seçiniz</option>`;

        data.forEach((product) => {
            const productName = product.name || product.product_name;

            productSelect.innerHTML += `<option value="${product.id}">${productName}</option>`;
            editProductSelect.innerHTML += `<option value="${product.id}">${productName}</option>`;
        });
    } catch (error) {
        console.error("Ürünler yüklenemedi:", error);
        showToast("Ürünler yüklenirken bir hata oluştu.", "error");
    }
}

async function loadStocks() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stocks`);

        if (!response.ok) {
            throw new Error(`HTTP hata: ${response.status}`);
        }

        const data = await response.json();

        stocksTableBody.innerHTML = "";

        if (!data.length) {
            stocksTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">Kayıtlı stok bulunamadı.</td>
                </tr>
            `;
            return;
        }

        data.forEach((stock) => {
            const createdAt = stock.created_at
                ? new Date(stock.created_at).toLocaleString("tr-TR")
                : "-";

            stocksTableBody.innerHTML += `
                <tr>
                    <td>${stock.warehouse_name}</td>
                    <td>${stock.product_name}</td>
                    <td>${stock.stock}</td>
                    <td>${createdAt}</td>
                    <td class="text-end">
                        <button 
                            class="btn btn-sm btn-outline-primary rounded-pill me-2"
                            data-bs-toggle="tooltip"
                            data-bs-title="Düzenle"
                            onclick="editStock(${stock.id})">
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button 
                            class="btn btn-sm btn-outline-danger rounded-pill"
                            data-bs-toggle="tooltip"
                            data-bs-title="Sil"
                            onclick="deleteStock(${stock.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        initTooltips();
    } catch (error) {
        console.error("Stoklar yüklenemedi:", error);
        stocksTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">Stoklar yüklenemedi.</td>
            </tr>
        `;
        showToast("Stoklar yüklenemedi.", "error");
    }
}

addStockForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        warehouse_id: warehouseSelect.value,
        product_id: productSelect.value,
        stock: stockAmount.value
    };

    if (!payload.warehouse_id || !payload.product_id || !payload.stock) {
        showToast("Lütfen tüm alanları doldurun.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/stocks/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            showToast(result.message || "Stok eklenemedi.", "error");
            return;
        }

        addStockModal.hide();
        addStockForm.reset();
        await loadStocks();
        showToast(result.message || "Stok kaydı eklendi.", "success");
    } catch (error) {
        console.error("Stok ekleme hatası:", error);
        showToast("Stok eklenirken bir hata oluştu.", "error");
    }
});

async function editStock(id) {
    try {
        await loadWarehousesAndProducts();

        const response = await fetch(`${API_BASE_URL}/api/stocks/${id}`);
        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Stok bilgisi alınamadı.", "error");
            return;
        }

        editStockId.value = data.id;
        editWarehouseSelect.value = data.warehouse_id;
        editProductSelect.value = data.product_id;
        editStockAmount.value = data.stock;

        editStockModal.show();
    } catch (error) {
        console.error("Stok bilgisi alınamadı:", error);
        showToast("Stok bilgisi alınırken bir hata oluştu.", "error");
    }
}

editStockForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = editStockId.value;

    const payload = {
        warehouse_id: editWarehouseSelect.value,
        product_id: editProductSelect.value,
        stock: editStockAmount.value
    };

    if (!payload.warehouse_id || !payload.product_id || !payload.stock) {
        showToast("Lütfen tüm alanları doldurun.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/stocks/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            showToast(result.message || "Stok güncellenemedi.", "error");
            return;
        }

        editStockModal.hide();
        await loadStocks();
        showToast(result.message || "Stok kaydı güncellendi.", "success");
    } catch (error) {
        console.error("Stok güncelleme hatası:", error);
        showToast("Stok güncellenirken bir hata oluştu.", "error");
    }
});

function deleteStock(id) {
    showConfirm(
        "Stok Kaydı Sil",
        "Bu stok kaydını silmek istediğinize emin misiniz?",
        async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/stocks/delete/${id}`, {
                    method: "PUT"
                });

                const result = await response.json();

                if (!response.ok) {
                    showToast(result.message || "Stok kaydı silinemedi.", "error");
                    return;
                }

                await loadStocks();
                showToast(result.message || "Stok kaydı silindi.", "success");
            } catch (error) {
                console.error("Stok silme hatası:", error);
                showToast("Stok silinirken bir hata oluştu.", "error");
            }
        }
    );
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