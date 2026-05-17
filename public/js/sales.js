const API_BASE_URL = window.location.origin + "/api";

// Fiyat formatı (Türkçe: binler ayırıcı=nokta, ondalık=virgül)
function formatPrice(value) {
    return parseFloat(value || 0).toLocaleString('tr-TR', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    });
}

const salesTableBody = document.getElementById("salesTableBody");
const saleItemsBody = document.getElementById("saleItemsBody");
const warehouseSelect = document.getElementById("warehouseSelect");
const saleModalElement = document.getElementById("saleModal");
const saleModal = new bootstrap.Modal(saleModalElement);
const saleConfirmModal = new bootstrap.Modal(document.getElementById("saleConfirmModal"));

let currentDeleteId = null;
let currentWarehouseProducts = [];
let editMode = false;
let editSaleId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadSales();
    loadCaris();
    loadWarehouses();
    setToday();

    saleModalElement.addEventListener('hidden.bs.modal', () => {
        clearSaleForm();
    });
});

function setToday() {
    document.getElementById("saleDate").valueAsDate = new Date();
}

function clearSaleForm() {
    editMode = false;
    editSaleId = null;
    document.querySelector("#saleModal .modal-title").innerText = "Yeni Satış";
    
    document.getElementById("cariSelect").value = "";
    document.getElementById("warehouseSelect").value = "";
    document.getElementById("description").value = "";
    document.getElementById("totalAmount").value = "";
    document.getElementById("totalAmount").placeholder = "0.00";
    document.getElementById("warehouseProductCount").innerText = "Ürün Sayısı: 0";
    saleItemsBody.innerHTML = "";
    currentWarehouseProducts = [];
    setToday();
}

async function handleWarehouseChange() {
    const warehouseId = warehouseSelect.value;
    
    saleItemsBody.innerHTML = "";
    document.getElementById("totalAmount").value = "";
    document.getElementById("totalAmount").placeholder = "0.00";

    if (!warehouseId) {
        document.getElementById("warehouseProductCount").innerText = "Ürün Sayısı: 0";
        currentWarehouseProducts = [];
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/products/warehouse/${warehouseId}`);
        currentWarehouseProducts = await res.json();
        document.getElementById("warehouseProductCount").innerText = `Ürün Sayısı: ${currentWarehouseProducts.length}`;
        
        // Kullanıcı manuel depo değiştirdiğinde her zaman 1 boş satır ekle
        addSaleRow();
    } catch (error) {
        console.error("Ürünler yüklenemedi", error);
    }
}

function addSaleRow(data = null) {
    const warehouseId = warehouseSelect.value;
    if (!warehouseId) {
        showToast("Lütfen önce bir depo seçiniz", "warning");
        return;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <select class="form-select productSelect">
                <option value="">Seçiniz</option>
                ${currentWarehouseProducts.map(p => `
                    <option value="${p.product_id}" data-stock="${p.stock}" data-cost-price="${p.cost_price || 0}">
                        ${p.name}
                    </option>
                `).join("")}
            </select>
        </td>
        <td><span class="badge bg-success stockBadge">0</span></td>
        <td><input type="number" class="form-control qty" min="1" placeholder="Adet"></td>
        <td><input type="number" class="form-control costPrice" step="0.01" placeholder="0.00" readonly></td>
        <td><input type="number" class="form-control unitPrice" step="0.01" placeholder="0.00"></td>
        <td><input type="number" class="form-control rowTotal" step="0.01" placeholder="0.00"></td>
        <td class="text-end"><button class="btn btn-outline-danger btn-sm border-0" onclick="removeRow(this)"><i class="bi bi-trash"></i></button></td>
    `;

    saleItemsBody.appendChild(row);
    attachRowEvents(row);

    // DÜZENLEME MODU: Veri Geldiyse Satırı Doldur ve Stoku Hesapla
    if (data) {
        const selectEl = row.querySelector(".productSelect");
        selectEl.value = data.product_id;
        
        // Mevcut stoğa, daha önce satılmış olan miktarı ekliyoruz ki düzenlerken limit aşımı hatası vermesin.
        const option = selectEl.querySelector(`option[value="${data.product_id}"]`);
        
        if (option) {
            const currentDbStock = parseInt(option.dataset.stock || 0);
            const realStock = currentDbStock + parseInt(data.quantity);
            option.dataset.stock = realStock; // Dom'daki limiti güncelle
            row.querySelector(".stockBadge").innerText = realStock;
            
            // HATA BURADAYDI: option tanımlanmadan formatPrice kullanılmıştı. 
            // Doğru şekilde costPrice input'una değer olarak atandı.
            row.querySelector(".costPrice").value = formatPrice(option.dataset.costPrice || 0);
        }

        row.querySelector(".qty").value = data.quantity;
        row.querySelector(".unitPrice").value = data.unit_price;
        row.querySelector(".rowTotal").value = data.total_price;
    }
}

function attachRowEvents(row) {
    const product = row.querySelector(".productSelect");
    const qty = row.querySelector(".qty");
    const costPrice = row.querySelector(".costPrice");
    const unit = row.querySelector(".unitPrice");
    const total = row.querySelector(".rowTotal");
    const stockBadge = row.querySelector(".stockBadge");

    product.addEventListener("change", () => {
        const selected = product.options[product.selectedIndex];
        stockBadge.innerText = selected ? (selected.dataset.stock || 0) : 0;
        costPrice.value = selected ? formatPrice(selected.dataset.costPrice || 0) : "0,00";
    });

    qty.addEventListener("input", () => {
        checkStockLimit(row);
        updateRowTotal(row);
    });

    unit.addEventListener("input", () => updateRowTotal(row));

    total.addEventListener("input", () => {
        const t = parseFloat(total.value) || 0;
        const q = parseFloat(qty.value) || 0;
        if (q > 0) unit.value = (t / q).toFixed(2);
        calcTotal();
    });
}

function updateRowTotal(row) {
    const q = parseFloat(row.querySelector(".qty").value) || 0;
    const u = parseFloat(row.querySelector(".unitPrice").value) || 0;
    const totalInput = row.querySelector(".rowTotal");
    
    totalInput.value = (q * u).toFixed(2);
    calcTotal();
}

function checkStockLimit(row) {
    const stock = parseInt(row.querySelector(".stockBadge").innerText || 0);
    const qtyInput = row.querySelector(".qty");
    if (parseInt(qtyInput.value) > stock) {
        qtyInput.value = stock;
        showToast(`Maksimum ${stock} adet girebilirsiniz!`, "warning");
    }
}

function calcTotal() {
    let grandTotal = 0;
    document.querySelectorAll(".rowTotal").forEach(input => {
        grandTotal += parseFloat(input.value) || 0;
    });
    const totalEl = document.getElementById("totalAmount");
    totalEl.value = grandTotal.toFixed(2);
}

// =====================
// API İŞLEMLERİ
// =====================

async function loadSales() {
    const res = await fetch(`${API_BASE_URL}/sales`);
    const data = await res.json();
    salesTableBody.innerHTML = "";
    if (!data.length) {
        salesTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Satış bulunamadı</td></tr>';
        return;
    }
    data.forEach(s => {
        salesTableBody.innerHTML += `
        <tr>
            <td>${new Date(s.sale_date).toLocaleDateString('tr-TR')}</td>
            <td>${s.cari_name}</td>
            <td>${s.warehouse_name}</td>
            <td class="fw-semibold text-primary">${s.total_amount} ₺</td>
            <td>${s.active == 0 ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-danger">Silinmiş</span>'}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary rounded-pill me-2" title="Düzenle" onclick="openEditSale(${s.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="openDeleteSale(${s.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

async function openEditSale(id) {
    editMode = true;
    editSaleId = id;
    document.querySelector("#saleModal .modal-title").innerText = "Satışı Düzenle";

    try {
        const res = await fetch(`${API_BASE_URL}/sales/${id}`);
        const sale = await res.json();

        // TARIH DÜZELTMESİ (Saat dilimi farkını sıfırlar, böylece 1 gün geri atmaz)
        const d = new Date(sale.sale_date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        document.getElementById("saleDate").value = d.toISOString().split('T')[0];
        
        document.getElementById("cariSelect").value = sale.cari_id;
        document.getElementById("warehouseSelect").value = sale.warehouse_id;
        document.getElementById("description").value = sale.description || "";

        // Depo Ürünlerini Yükle
        const warehouseId = sale.warehouse_id;
        const resProd = await fetch(`${API_BASE_URL}/products/warehouse/${warehouseId}`);
        currentWarehouseProducts = await resProd.json();
        document.getElementById("warehouseProductCount").innerText = `Ürün Sayısı: ${currentWarehouseProducts.length}`;

        // Mevcut Satırları Doldur
        saleItemsBody.innerHTML = "";
        sale.items.forEach(item => {
            addSaleRow(item);
        });

        calcTotal();
        saleModal.show();
    } catch (error) {
        showToast("Veriler yüklenirken hata oluştu", "error");
    }
}

async function saveSale() {
    const cariId = document.getElementById("cariSelect").value;
    const warehouseId = warehouseSelect.value;
    const rows = document.querySelectorAll("#saleItemsBody tr");

    if (!cariId || !warehouseId || rows.length === 0) {
        return showToast("Lütfen cari, depo ve en az bir ürün seçin", "warning");
    }

    let items = [];
    rows.forEach(row => {
        const pId = row.querySelector(".productSelect").value;
        const q = row.querySelector(".qty").value;
        const u = row.querySelector(".unitPrice").value;
        const t = row.querySelector(".rowTotal").value;
        if (pId && q) {
            items.push({
                product_id: pId,
                quantity: q,
                unit_price: u,
                total_price: t
            });
        }
    });

    const payload = {
        sale_date: document.getElementById("saleDate").value,
        cari_id: cariId,
        warehouse_id: warehouseId,
        total_amount: document.getElementById("totalAmount").value,
        description: document.getElementById("description").value,
        items
    };

    const url = editMode ? `${API_BASE_URL}/sales/${editSaleId}` : `${API_BASE_URL}/sales`;
    const method = editMode ? "PUT" : "POST";

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
        showToast(editMode ? "Satış güncellendi" : "Satış kaydedildi", "success");
        saleModal.hide();
        loadSales();
    }
}

async function loadCaris() {
    const res = await fetch(`${API_BASE_URL}/caris`);
    const data = await res.json();
    const select = document.getElementById("cariSelect");
    select.innerHTML = '<option value="">Cari Seçiniz</option>' + data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function loadWarehouses() {
    const res = await fetch(`${API_BASE_URL}/warehouses`);
    const data = await res.json();
    const select = document.getElementById("warehouseSelect");
    select.innerHTML = '<option value="">Depo Seçiniz</option>' + data.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
}

function openDeleteSale(id) {
    currentDeleteId = id;
    document.getElementById("confirmTitle").innerText = "Satış Sil";
    document.getElementById("confirmText").innerText = "Satışı silmek istediğinizden emin misiniz? Stoklar iade edilecektir.";
    saleConfirmModal.show();
}

document.getElementById("confirmOkBtn").addEventListener("click", async () => {
    await fetch(`${API_BASE_URL}/sales/${currentDeleteId}`, { method: "DELETE" });
    saleConfirmModal.hide();
    loadSales();
    showToast("Satış silindi", "success");
});

function removeRow(btn) {
    btn.closest("tr").remove();
    calcTotal();
}