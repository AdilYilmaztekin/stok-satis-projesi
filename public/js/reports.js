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
    updateReportCards();
}

function showSalesReport() {
    currentReportType = 'sales';
    document.getElementById("warehouseReportSection").classList.add("d-none");
    document.getElementById("salesReportSection").classList.remove("d-none");
    document.getElementById("productReportSection").classList.add("d-none");
    updateSalesFilterButtons();
    updateReportCards();
}

function showProductReport() {
    currentReportType = 'product';
    document.getElementById("warehouseReportSection").classList.add("d-none");
    document.getElementById("salesReportSection").classList.add("d-none");
    document.getElementById("productReportSection").classList.remove("d-none");
    updateReportCards();
}

function backToReports() {
    currentReportType = null;
    document.getElementById("warehouseReportSection").classList.add("d-none");
    document.getElementById("salesReportSection").classList.add("d-none");
    document.getElementById("productReportSection").classList.add("d-none");
    salesFilterType = null;
    updateSalesFilterButtons();
    updateReportCards();
}

function updateSalesFilterButtons() {
    const warehouseBtn = document.getElementById("filterByWarehouse");
    const cariBtn = document.getElementById("filterByCari");
    if (!warehouseBtn || !cariBtn) return;

    warehouseBtn.classList.toggle("active", salesFilterType === 'warehouse');
    cariBtn.classList.toggle("active", salesFilterType === 'cari');
}

function updateReportCards() {
    const warehouseCard = document.getElementById("warehouseReportCard");
    const salesCard = document.getElementById("salesReportCard");
    const productCard = document.getElementById("productReportCard");
    if (!warehouseCard || !salesCard || !productCard) return;

    warehouseCard.classList.toggle("active", currentReportType === 'warehouse');
    salesCard.classList.toggle("active", currentReportType === 'sales');
    productCard.classList.toggle("active", currentReportType === 'product');
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
    const warehouseDiv = document.getElementById("warehouseFilterDiv");
    const cariDiv = document.getElementById("cariFilterDiv");
    const reportBody = document.getElementById("salesReportBody");

    if (salesFilterType === type) {
        // Aynı butona tıklandı, kapat
        salesFilterType = null;
        warehouseDiv.classList.add("d-none");
        cariDiv.classList.add("d-none");
        reportBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Filtre seçiniz</td></tr>';
    } else {
        // Yeni filtre tipi seçildi
        salesFilterType = type;
        if (type === 'warehouse') {
            warehouseDiv.classList.remove("d-none");
            cariDiv.classList.add("d-none");
            const warehouseId = document.getElementById("salesWarehouseSelect").value;
            if (warehouseId) {
                loadSalesReport();
            } else {
                reportBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Depo seçiniz</td></tr>';
            }
        } else {
            warehouseDiv.classList.add("d-none");
            cariDiv.classList.remove("d-none");
            const cariId = document.getElementById("salesCariSelect").value;
            if (cariId) {
                loadSalesReport();
            } else {
                reportBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Cari seçiniz</td></tr>';
            }
        }
    }
    updateSalesFilterButtons();
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

function downloadCsv(filename, rows) {
    if (!Array.isArray(rows) || rows.length === 0) return false;

    const header = Object.keys(rows[0]);
    const csvRows = [header.join(',')];

    rows.forEach(row => {
        const values = header.map(key => {
            const value = row[key] == null ? '' : String(row[key]);
            return `"${value.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    return true;
}

function exportWorkbook(filename, sheetName, data) {
    if (!Array.isArray(data) || data.length === 0) {
        if (typeof showToast === 'function') showToast('İndirilecek veri bulunamadı', 'warning');
        return;
    }

    if (typeof XLSX !== 'undefined') {
        const sheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
        XLSX.writeFile(workbook, filename);
        return;
    }

    const csvFilename = filename.replace(/\.xlsx$/i, '.csv');
    if (!downloadCsv(csvFilename, data)) {
        if (typeof showToast === 'function') showToast('Excel dosyası oluşturulamadı', 'error');
    }
}

function exportWarehouseReportExcel() {
    if (!currentWarehouseReport.length) {
        if (typeof showToast === 'function') showToast('Lütfen önce depo raporunu yükleyin', 'warning');
        return;
    }

    const warehouseName = document.getElementById('warehouseSelect').selectedOptions[0]?.text || 'Depo';
    const data = currentWarehouseReport.map(p => ({
        'Ürün Adı': p.name,
        'Stok': p.stock,
        'Kayıt Tarihi': formatReportDate(p.created_at)
    }));

    exportWorkbook(`Depo_${warehouseName}_${new Date().toLocaleDateString('tr-TR')}.xlsx`, 'Depo Raporu', data);
}

function exportWarehouseReportPDF() {
    const warehouseName = document.getElementById('warehouseSelect').selectedOptions[0]?.text || 'Depo';
    const table = document.querySelector('#warehouseReportBody').closest('table');
    const element = document.createElement('div');
    element.innerHTML = `
        <h2>Depo Raporu - ${warehouseName}</h2>
        <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        ${table?.outerHTML || ''}
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
    if (!salesFilterType) {
        if (typeof showToast === 'function') showToast('Lütfen önce satış filtresi seçin', 'warning');
        return;
    }

    const filterName = salesFilterType === 'warehouse'
        ? document.getElementById('salesWarehouseSelect').selectedOptions[0]?.text || 'Depo'
        : document.getElementById('salesCariSelect').selectedOptions[0]?.text || 'Cari';

    const data = [];
    const table = document.querySelector('#salesReportBody');
    table.querySelectorAll('tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length === 9) {
            data.push({
                'Tarih': cols[0].textContent.trim(),
                'Cari': cols[1].textContent.trim(),
                'Depo': cols[2].textContent.trim(),
                'Ürün': cols[3].textContent.trim(),
                'Adet': cols[4].textContent.trim(),
                'Alış Fiyatı': cols[5].textContent.trim(),
                'Birim Fiyat': cols[6].textContent.trim(),
                'Toplam': cols[7].textContent.trim(),
                'Kar': cols[8].textContent.trim()
            });
        }
    });

    if (!data.length) {
        showToast?.('Satış raporu görüntülenmeden önce Excel indirme yapılamaz', 'warning');
        return;
    }

    exportWorkbook(`Satış_${filterName}_${new Date().toLocaleDateString('tr-TR')}.xlsx`, 'Satış Raporu', data);
}

function exportSalesReportPDF() {
    const filterName = salesFilterType === 'warehouse'
        ? document.getElementById('salesWarehouseSelect').selectedOptions[0]?.text || 'Depo'
        : document.getElementById('salesCariSelect').selectedOptions[0]?.text || 'Cari';

    const table = document.querySelector('#salesReportBody').closest('table');
    const element = document.createElement('div');
    element.innerHTML = `
        <h2>Satış Raporu - ${filterName}</h2>
        <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        ${table?.outerHTML || ''}
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
    const productName = document.getElementById('productSelect').selectedOptions[0]?.text || 'Ürün';
    const data = [];
    const table = document.querySelector('#productReportBody');
    table.querySelectorAll('tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length === 8) {
            data.push({
                'Tarih': cols[0].textContent.trim(),
                'Cari': cols[1].textContent.trim(),
                'Depo': cols[2].textContent.trim(),
                'Adet': cols[3].textContent.trim(),
                'Alış Fiyatı': cols[4].textContent.trim(),
                'Birim Fiyat': cols[5].textContent.trim(),
                'Toplam': cols[6].textContent.trim(),
                'Kar': cols[7].textContent.trim()
            });
        }
    });

    if (!data.length) {
        showToast?.('Ürün raporu görüntülenmeden önce Excel indirme yapılamaz', 'warning');
        return;
    }

    exportWorkbook(`Ürün_${productName}_${new Date().toLocaleDateString('tr-TR')}.xlsx`, 'Ürün Raporu', data);
}

function exportProductReportPDF() {
    const productName = document.getElementById('productSelect').selectedOptions[0]?.text || 'Ürün';
    const table = document.querySelector('#productReportBody').closest('table');
    const element = document.createElement('div');
    element.innerHTML = `
        <h2>Ürün Raporu - ${productName}</h2>
        <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        ${table?.outerHTML || ''}
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
