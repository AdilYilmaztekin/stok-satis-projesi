// =====================
// NAVBAR - AYARLAR
// =====================
function setupNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navbarHTML = `
        <div class="brand">
            <i class="bi bi-box-seam"></i>
            <span>Stok+Satış</span>
        </div>

        <nav class="nav flex-column">
            <a href="index.html" class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">
                <i class="bi bi-grid-fill"></i> Dashboard
            </a>
            <a href="products.html" class="nav-link ${currentPage === 'products.html' ? 'active' : ''}">
                <i class="bi bi-box"></i> Ürünler
            </a>
            <a href="warehouses.html" class="nav-link ${currentPage === 'warehouses.html' ? 'active' : ''}">
                <i class="bi bi-buildings"></i> Depolar
            </a>
            <a href="stocks.html" class="nav-link ${currentPage === 'stocks.html' ? 'active' : ''}">
                <i class="bi bi-diagram-3"></i> Stok Yönetimi
            </a>
            <a href="caris.html" class="nav-link ${currentPage === 'caris.html' ? 'active' : ''}">
                <i class="bi bi-people"></i> Cariler
            </a>
            <a href="sales.html" class="nav-link ${currentPage === 'sales.html' ? 'active' : ''}">
                <i class="bi bi-cart-check"></i> Satışlar
            </a>
            <a href="reports.html" class="nav-link ${currentPage === 'reports.html' ? 'active' : ''}">
                <i class="bi bi-bar-chart-line"></i> Raporlar
            </a>
            <a href="#" class="nav-link">
                <i class="bi bi-gear"></i> Ayarlar
            </a>
        </nav>
    `;

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.innerHTML = navbarHTML;
    }
}

// Sayfa yüklendiğinde navbar'ı ayarla
document.addEventListener('DOMContentLoaded', setupNavbar);

// Ortak modal elementleri
const messageModalElement = document.getElementById("messageModal");
const messageModal = messageModalElement ? new bootstrap.Modal(messageModalElement) : null;

const confirmModalElement = document.getElementById("confirmModal");
const confirmModal = confirmModalElement ? new bootstrap.Modal(confirmModalElement) : null;


// =====================
// MESAJ MODALI
// =====================
function showMessage(title, message) {
    document.getElementById("messageModalTitle").textContent = title;
    document.getElementById("messageModalText").textContent = message;
    messageModal.show();
}


// =====================
// ONAY MODALI
// =====================
function showConfirm(title, message, onConfirm) {
    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModalText").textContent = message;

    const confirmBtn = document.getElementById("confirmModalOkBtn");

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener("click", () => {
        confirmModal.hide();
        onConfirm();
    });

    confirmModal.show();
}



// Toast bildirim sistemi
function showToast(message, type = "success") {
    let toastContainer = document.getElementById("toastContainer");

    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.className = "toast-container-custom";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast-custom toast-${type}`;

    let iconClass = "bi-check-circle-fill";

    if (type === "error") {
        iconClass = "bi-x-circle-fill";
    } else if (type === "warning") {
        iconClass = "bi-exclamation-circle-fill";
    } else if (type === "info") {
        iconClass = "bi-info-circle-fill";
    }

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="bi ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button type="button" class="toast-close-btn">
            <i class="bi bi-x-lg"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    const removeToast = () => {
        toast.classList.remove("show");

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    };

    const autoRemove = setTimeout(removeToast, 2500);

    toast.querySelector(".toast-close-btn").addEventListener("click", () => {
        clearTimeout(autoRemove);
        removeToast();
    });
}

function parseTableNumber(value) {
    if (!value) return 0;
    const cleaned = value
        .replace(/₺/g, '')
        .replace(/[^0-9,.-]/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.');
    return parseFloat(cleaned) || 0;
}

function parseTableDate(value) {
    if (!value) return 0;
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const parsed = Date.parse(trimmed);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    const [datePart, timePart = '00:00'] = trimmed.split(' ');
    const dateParts = datePart.split('.');
    if (dateParts.length === 3) {
        const [day, month, year] = dateParts.map(v => parseInt(v, 10));
        const [hour = '0', minute = '0'] = timePart.split(':');
        return new Date(year, month - 1, day, parseInt(hour, 10), parseInt(minute, 10)).getTime();
    }
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function filterTableRows(tableBody, query) {
    const lower = query.trim().toLowerCase();
    Array.from(tableBody.querySelectorAll('tr')).forEach(row => {
        const text = row.textContent.trim().toLowerCase();
        row.style.display = lower ? (text.includes(lower) ? '' : 'none') : '';
    });
}

function sortTableRows(tableBody, columnIndex, type, asc) {
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[columnIndex]?.textContent.trim() || '';
        const cellB = rowB.children[columnIndex]?.textContent.trim() || '';

        if (type === 'number') {
            return parseTableNumber(cellA) - parseTableNumber(cellB);
        }
        if (type === 'date') {
            return parseTableDate(cellA) - parseTableDate(cellB);
        }
        return cellA.localeCompare(cellB, 'tr', { numeric: true, sensitivity: 'base' });
    });

    if (!asc) rows.reverse();
    rows.forEach(row => tableBody.appendChild(row));
}

function setupTableSearchAndSort() {
    document.querySelectorAll('.table-search-input').forEach(input => {
        const tableBodyId = input.dataset.tableBodyId;
        const tableBody = tableBodyId ? document.getElementById(tableBodyId) : null;
        if (!tableBody) return;

        const applyFilter = () => filterTableRows(tableBody, input.value);
        input.addEventListener('input', applyFilter);

        const searchButton = input.closest('.d-flex')?.querySelector('.table-search-btn');
        if (searchButton) {
            searchButton.addEventListener('click', applyFilter);
        }
    });
}

const AUTH_USER_KEY = 'loggedInUser';
const AUTH_TOKEN_KEY = 'authToken';

function getAuthUser() {
    return localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY) || null;
}

function isAuthenticated() {
    return Boolean(getAuthUser());
}

function logout() {
    showToast('Çıkışınız yapılıyor...', 'success');

    setTimeout(() => {
        localStorage.removeItem(AUTH_USER_KEY);
        sessionStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        window.location.href = '/index.html';
    }, 1000);
}

function initUserDropdown() {
    document.querySelectorAll('#logoutBtn').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            logout();
        });
    });
}

function checkAuth() {
    const path = window.location.pathname.toLowerCase();
    const publicPaths = ['/', '/login.html'];

    if (publicPaths.includes(path)) {
        if (isAuthenticated()) {
            window.location.href = '/index.html';
        }
        return;
    }

    if (!isAuthenticated()) {
        window.location.href = '/';
    }
}

function populateLoggedUser() {
    const rawUsername = getAuthUser();
    const username = rawUsername ? rawUsername.trim() : '';
    const formattedName = username ? username.charAt(0).toUpperCase() + username.slice(1) : '';

    document.querySelectorAll('.logged-user-name').forEach(el => {
        el.textContent = formattedName;
        el.style.display = formattedName ? '' : 'none';
    });

    document.querySelectorAll('.logged-user-greeting').forEach(el => {
        el.textContent = formattedName ? `Hoşgeldin, ${formattedName}` : '';
    });

    const initial = formattedName ? formattedName.charAt(0) : '';
    document.querySelectorAll('.logged-user-initial').forEach(el => {
        el.textContent = initial;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupTableSearchAndSort();
    populateLoggedUser();
    initUserDropdown();
});
