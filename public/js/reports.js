const API_BASE_URL = window.location.origin + "/api";

let currentReportType = null;
let currentWarehouseReport = [];
let currentSalesReport = [];
let currentProductReport = [];

// Fiyat formatı (Türkçe)
function formatPrice(value) {
    return parseFloat(value || 0).toLocaleString('tr-TR', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    });
}

function formatReportDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('tr-TR');
}

document.addEventListener("DOMContentLoaded", () => {
    loadWarehouseSelectOptions();
    loadSalesWarehouseSelectOptions();
    loadSalesCariSelectOptions();
    loadProductSelectOptions();
});

// =====================
// RAPOR SEÇİM FONKSİYONLARI
// =====================

function showWarehouseReport() {
    currentReportType = 'warehouse';
    document.getElementById("warehouseReportSection").classList.remove("d-none");
    document.getElementById("salesReportSection").classList.add("d-none");
    document.getElementById("productReportSection").classList.add("d-none");
}

function showSalesReport() {
    currentReportType = 'sales';
    document.getElementById("warehouseReportSection").classList.add("d-none");
    document.getElementById("salesReportSection").classList.remove("d-none");
    document.getElementById("productReportSection").classList.add("d-none");
}

function showProductReport() {
    currentReportType = 'product';
    document.getElementById("warehouseReportSection").classList.add("d-none");
    document.getElementById("salesReportSection").classList.add("d-none");
    document.getElementById("productReportSection").classList.remove("d-none");
}

function backToReports() {
    currentReportType = null;
    document.getElementById("warehouseReportSection").classList.add("d-none");
    document.getElementById("salesReportSection").classList.add("d-none");
    document.getElementById("productReportSection").classList.add("d-none");
}

// =====================
// DEPO RAPORU
// =====================

async function loadWarehouseSelectOptions() {
    try {
        const res = await fetch(`${API_BASE_URL}/warehouses`);
        const warehouses = await res.json();
        const select = document.getElementById("warehouseSelect");
        select.innerHTML = '<option value="">Depo Seçiniz</option>';
        warehouses.forEach(w => {
            select.innerHTML += `<option value="${w.id}">${w.name}</option>`;
        });
    } catch (error) {
        console.error("Depolar yüklenemedi", error);
    }
}

async function loadWarehouseReport() {
    const warehouseId = document.getElementById("warehouseSelect").value;
    if (!warehouseId) {
        document.getElementById("warehouseReportBody").innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Depo seçiniz</td></tr>';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/products/warehouse/${warehouseId}`);
        currentWarehouseReport = await res.json();

        let html = '';
        currentWarehouseReport.forEach(p => {
            html += `
                <tr>
                    <td>${p.name}</td>
                    <td><span class="badge bg-info">${p.stock}</span></td>
                    <td>${formatReportDate(p.created_at)}</td>
                    <td></td>
                </tr>
            `;
        });

        document.getElementById("warehouseReportBody").innerHTML = html || '<tr><td colspan="4" class="text-center text-muted py-4">Ürün bulunamadı</td></tr>';
    } catch (error) {
        console.error("Rapor yüklenemedi", error);
        showToast("Rapor yüklenmedi", "error");
    }
}

// =====================
// SATIŞ RAPORU
// =====================

let salesFilterType = null;

function toggleSalesFilter(type) {
    if (salesFilterType === type) {
        // Aynı butona tıklandı, kapat
        salesFilterType = null;
        document.getElementById("warehouseFilterDiv").classList.add("d-none");
        document.getElementById("cariFilterDiv").classList.add("d-none");
        document.getElementById("salesReportBody").innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Filtre seçiniz</td></tr>';
    } else {
        // Yeni filtre tipi seçildi
        salesFilterType = type;
        if (type === 'warehouse') {
            document.getElementById("warehouseFilterDiv").classList.remove("d-none");
            document.getElementById("cariFilterDiv").classList.add("d-none");
        } else {
            document.getElementById("warehouseFilterDiv").classList.add("d-none");
            document.getElementById("cariFilterDiv").classList.remove("d-none");
        }
        document.getElementById("salesReportBody").innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Filtre seçiniz</td></tr>';
    }
}

async function loadSalesWarehouseSelectOptions() {
    try {
        const res = await fetch(`${API_BASE_URL}/warehouses`);
        const warehouses = await res.json();
        const select = document.getElementById("salesWarehouseSelect");
        select.innerHTML = '<option value="">Depo Seçiniz</option>';
        warehouses.forEach(w => {
            select.innerHTML += `<option value="${w.id}">${w.name}</option>`;
        });
    } catch (error) {
        console.error("Depolar yüklenemedi", error);
    }
}

async function loadSalesCariSelectOptions() {
    try {
        const res = await fetch(`${API_BASE_URL}/caris`);
        const caris = await res.json();
        const select = document.getElementById("salesCariSelect");
        select.innerHTML = '<option value="">Cari Seçiniz</option>';
        caris.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    } catch (error) {
        console.error("Cariler yüklenemedi", error);
    }
}

async function loadSalesReport() {
    if (!salesFilterType) return;

    let url = `${API_BASE_URL}/sales`;
    if (salesFilterType === 'warehouse') {
        const warehouseId = document.getElementById("salesWarehouseSelect").value;
        if (!warehouseId) return;
        url += `?warehouse_id=${warehouseId}`;
    } else {
        const cariId = document.getElementById("salesCariSelect").value;
        if (!cariId) return;
        url += `?cari_id=${cariId}`;
    }

    try {
        const res = await fetch(url);
        const sales = await res.json();

        let html = '';
        sales.forEach(sale => {
            if (sale.items && Array.isArray(sale.items)) {
                sale.items.forEach(item => {
                    const kar = (item.unit_price - (item.cost_price || 0)) * item.quantity;
                    html += `
                        <tr>
                            <td>${formatReportDate(sale.sale_date)}</td>
                            <td>${sale.cari_name}</td>
                            <td>${sale.warehouse_name}</td>
                            <td>${item.product_name || 'N/A'}</td>
                            <td>${item.quantity}</td>
                            <td>${formatPrice(item.cost_price || 0)}</td>
                            <td>${formatPrice(item.unit_price)}</td>
                            <td>${formatPrice(item.total_price)}</td>
                            <td><span class="badge ${kar > 0 ? 'bg-success' : 'bg-danger'}">${formatPrice(kar)}</span></td>
                        </tr>
                    `;
                });
            }
        });

        currentSalesReport = sales;
        document.getElementById("salesReportBody").innerHTML = html || '<tr><td colspan="9" class="text-center text-muted py-4">Satış bulunamadı</td></tr>';
    } catch (error) {
        console.error("Satış raporu yüklenemedi", error);
        showToast("Rapor yüklenmedi", "error");
    }
}

// =====================
// ÜRÜN RAPORU
// =====================

async function loadProductSelectOptions() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);
        const products = await res.json();
        const select = document.getElementById("productSelect");
        select.innerHTML = '<option value="">Ürün Seçiniz</option>';
        products.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });
    } catch (error) {
        console.error("Ürünler yüklenemedi", error);
    }
}

async function loadProductReport() {
    const productId = document.getElementById("productSelect").value;
    if (!productId) {
        document.getElementById("productReportBody").innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Ürün seçiniz</td></tr>';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/sales`);
        const sales = await res.json();

        let html = '';
        sales.forEach(sale => {
            if (sale.items && Array.isArray(sale.items)) {
                const productItems = sale.items.filter(item => item.product_id == productId);
                productItems.forEach(item => {
                    const kar = (item.unit_price - (item.cost_price || 0)) * item.quantity;
                    html += `
                        <tr>
                            <td>${formatReportDate(sale.sale_date)}</td>
                            <td>${sale.cari_name}</td>
                            <td>${sale.warehouse_name}</td>
                            <td>${item.quantity}</td>
                            <td>${formatPrice(item.cost_price || 0)}</td>
                            <td>${formatPrice(item.unit_price)}</td>
                            <td>${formatPrice(item.total_price)}</td>
                            <td><span class="badge ${kar > 0 ? 'bg-success' : 'bg-danger'}">${formatPrice(kar)}</span></td>
                        </tr>
                    `;
                });
            }
        });

        currentProductReport = sales.filter(s => s.items && s.items.some(item => item.product_id == productId));
        document.getElementById("productReportBody").innerHTML = html || '<tr><td colspan="8" class="text-center text-muted py-4">Satış bulunamadı</td></tr>';
    } catch (error) {
        console.error("Ürün raporu yüklenemedi", error);
        showToast("Rapor yüklenmedi", "error");
    }
}

// =====================
// EXCEL & PDF EXPORT
// =====================

function exportWarehouseReportExcel() {
    const warehouseName = document.getElementById("warehouseSelect").selectedOptions[0].text;
    const data = currentWarehouseReport.map(p => ({
        'Ürün Adı': p.name,
        'Stok': p.stock,
        'Kayıt Tarihi': formatReportDate(p.created_at)
    }));

    const sheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Depo Raporu");
    XLSX.writeFile(workbook, `Depo_${warehouseName}_${new Date().toLocaleDateString('tr-TR')}.xlsx`);
}

function exportWarehouseReportPDF() {
    const warehouseName = document.getElementById("warehouseSelect").selectedOptions[0].text;
    const table = document.querySelector("#warehouseReportBody").parentElement.parentElement;
    const element = document.createElement("div");
    element.innerHTML = `
        <h2>Depo Raporu - ${warehouseName}</h2>
        <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        ${table.outerHTML}
    `;

    const opt = {
        margin: 10,
        filename: `Depo_${warehouseName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
}

function exportSalesReportExcel() {
    const filterName = salesFilterType === 'warehouse' 
        ? document.getElementById("salesWarehouseSelect").selectedOptions[0].text
        : document.getElementById("salesCariSelect").selectedOptions[0].text;

    const data = [];
    const table = document.querySelector("#salesReportBody");
    table.querySelectorAll("tr").forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 0) {
            data.push({
                'Tarih': cols[0].textContent,
                'Cari': cols[1].textContent,
                'Depo': cols[2].textContent,
                'Ürün': cols[3].textContent,
                'Adet': cols[4].textContent,
                'Alış Fiyatı': cols[5].textContent,
                'Birim Fiyat': cols[6].textContent,
                'Toplam': cols[7].textContent,
                'Kar': cols[8].textContent
            });
        }
    });

    const sheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Satış Raporu");
    XLSX.writeFile(workbook, `Satış_${filterName}_${new Date().toLocaleDateString('tr-TR')}.xlsx`);
}

function exportSalesReportPDF() {
    const filterName = salesFilterType === 'warehouse' 
        ? document.getElementById("salesWarehouseSelect").selectedOptions[0].text
        : document.getElementById("salesCariSelect").selectedOptions[0].text;

    const table = document.querySelector("#salesReportBody").parentElement.parentElement;
    const element = document.createElement("div");
    element.innerHTML = `
        <h2>Satış Raporu - ${filterName}</h2>
        <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        ${table.outerHTML}
    `;

    const opt = {
        margin: 10,
        filename: `Satış_${filterName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
}

function exportProductReportExcel() {
    const productName = document.getElementById("productSelect").selectedOptions[0].text;
    
    const data = [];
    const table = document.querySelector("#productReportBody");
    table.querySelectorAll("tr").forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 0) {
            data.push({
                'Tarih': cols[0].textContent,
                'Cari': cols[1].textContent,
                'Depo': cols[2].textContent,
                'Adet': cols[3].textContent,
                'Alış Fiyatı': cols[4].textContent,
                'Birim Fiyat': cols[5].textContent,
                'Toplam': cols[6].textContent,
                'Kar': cols[7].textContent
            });
        }
    });

    const sheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Ürün Raporu");
    XLSX.writeFile(workbook, `Ürün_${productName}_${new Date().toLocaleDateString('tr-TR')}.xlsx`);
}

function exportProductReportPDF() {
    const productName = document.getElementById("productSelect").selectedOptions[0].text;
    const table = document.querySelector("#productReportBody").parentElement.parentElement;
    const element = document.createElement("div");
    element.innerHTML = `
        <h2>Ürün Raporu - ${productName}</h2>
        <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        ${table.outerHTML}
    `;

    const opt = {
        margin: 10,
        filename: `Ürün_${productName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
}
