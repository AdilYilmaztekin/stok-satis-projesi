// API adresi
const API_BASE_URL = window.location.origin + "/api";

// DOM elementleri
const warehousesTableBody = document.getElementById("warehousesTableBody");

const addWarehouseForm = document.getElementById("addWarehouseForm");
const addWarehouseModalElement = document.getElementById("addWarehouseModal");
const addWarehouseModal = new bootstrap.Modal(addWarehouseModalElement);
const openAddWarehouseModalBtn = document.getElementById("openAddWarehouseModalBtn");

const editWarehouseModalElement = document.getElementById("editWarehouseModal");
const editWarehouseModal = new bootstrap.Modal(editWarehouseModalElement);
const editWarehouseForm = document.getElementById("editWarehouseForm");


// =====================
// VERİYİ YÜKLEME (LIST)
// =====================
async function loadWarehouses() {
    try {
        const response = await fetch(`${API_BASE_URL}/warehouses`);

        if (!response.ok) {
            throw new Error("Depolar alınamadı.");
        }

        const warehouses = await response.json();

        warehousesTableBody.innerHTML = "";

        if (!warehouses.length) {
            warehousesTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        Henüz depo bulunmuyor.
                    </td>
                </tr>
            `;
            return;
        }

        warehouses.forEach(warehouse => {
            const statusBadge = `<span class="badge-soft-success">Aktif</span>`;

            const row = `
                <tr data-id="${warehouse.id}">
                    <td>${warehouse.name}</td>
                    <td>${warehouse.location}</td>
                    <td>${statusBadge}</td>
                    <td class="text-end">
                        <button 
                            class="btn btn-sm btn-outline-primary rounded-pill me-2"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Düzenle"
                            onclick='openEditWarehouseModal(${warehouse.id}, ${JSON.stringify(warehouse.name)}, ${JSON.stringify(warehouse.location)})'>
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button 
                            class="btn btn-sm btn-outline-danger rounded-pill"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Sil"
                            onclick="deleteWarehouse(${warehouse.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

            warehousesTableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Depolar alınırken hata oluştu:", error);

        warehousesTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger py-4">
                    Depolar yüklenemedi.
                </td>
            </tr>
        `;

        showToast("Depolar yüklenemedi.", "error");
    }

    initTooltips();
}


// =====================
// KAYDETME (ADD)
// =====================
async function addWarehouse(event) {
    event.preventDefault();

    const name = document.getElementById("warehouseName").value.trim();
    const location = document.getElementById("warehouseLocation").value.trim();

    if (!name || !location) {
        showToast("Lütfen tüm alanları doldurun.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/warehouses/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, location })
        });

        if (!response.ok) {
            throw new Error("Depo eklenemedi.");
        }

        addWarehouseForm.reset();
        addWarehouseModal.hide();
        await loadWarehouses();

        showToast("Depo başarıyla eklendi.", "success");

    } catch (error) {
        console.error("Depo ekleme hatası:", error);
        showToast("Depo eklenirken hata oluştu.", "error");
    }
}


// =====================
// MODAL AÇ (EDIT)
// =====================
function openEditWarehouseModal(id, name, location) {
    document.getElementById("editWarehouseId").value = id;
    document.getElementById("editWarehouseName").value = name;
    document.getElementById("editWarehouseLocation").value = location;

    editWarehouseModal.show();
}


// =====================
// GÜNCELLEME (UPDATE)
// =====================
async function updateWarehouse(event) {
    event.preventDefault();

    const id = document.getElementById("editWarehouseId").value;
    const name = document.getElementById("editWarehouseName").value.trim();
    const location = document.getElementById("editWarehouseLocation").value.trim();

    if (!name || !location) {
        showToast("Lütfen tüm alanları doldurun.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/warehouses/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, location })
        });

        if (!response.ok) {
            throw new Error("Depo güncellenemedi.");
        }

        editWarehouseModal.hide();
        await loadWarehouses();

        showToast("Depo başarıyla güncellendi.", "success");

    } catch (error) {
        console.error("Depo güncelleme hatası:", error);
        showToast(error.message || "Depo güncellenirken hata oluştu.", "error");
    }
}


// =====================
// SİLME (DELETE)
// =====================
async function deleteWarehouse(id) {
    showConfirm(
        "Depoyu Sil",
        "Bu depoyu silmek istediğine emin misin?",
        async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/warehouses/delete/${id}`, {
                    method: "DELETE"
                });

                const data = await response.text();

                if (!response.ok) {
                    throw new Error(data || "Silme işlemi başarısız");
                }

                await loadWarehouses();
                showToast(data || "Depo başarıyla silindi.", "success");

            } catch (error) {
                console.error("Silme hatası:", error);
                showToast(error.message || "Depo silinirken hata oluştu.", "error");
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


// =====================
// MODAL AÇMA (ADD BUTONU)
// =====================
openAddWarehouseModalBtn.addEventListener("click", () => {
    addWarehouseModal.show();
});


// =====================
// FORM SUBMIT (ADD)
// Yeni depo ekleme formu submit edildiğinde çalışır
// =====================
addWarehouseForm.addEventListener("submit", addWarehouse);


// =====================
// FORM SUBMIT (UPDATE)
// Güncelleme formu submit edildiğinde çalışır
// =====================
editWarehouseForm.addEventListener("submit", updateWarehouse);


// =====================
// SAYFA YÜKLENDİĞİNDE
// Sayfa açılır açılmaz depoları getirir
// =====================
document.addEventListener("DOMContentLoaded", loadWarehouses);