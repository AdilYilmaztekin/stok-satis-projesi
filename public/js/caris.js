const API_BASE_URL = "http://localhost:3000/api";

// DOM
const carisTableBody = document.getElementById("carisTableBody");

const addCariForm = document.getElementById("addCariForm");
const addCariModal = new bootstrap.Modal(document.getElementById("addCariModal"));

const editCariModal = new bootstrap.Modal(document.getElementById("editCariModal"));
const editCariForm = document.getElementById("editCariForm");

document.getElementById("openAddCariModalBtn")
.addEventListener("click", () => addCariModal.show());


// =====================
// LIST
// =====================
async function loadCaris() {
    const res = await fetch(`${API_BASE_URL}/caris`);
    const data = await res.json();

    carisTableBody.innerHTML = "";

    if (!data.length) {
        carisTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Henüz cari bulunmuyor
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(cari => {

        const typeBadge = getTypeBadge(cari.type);

        const row = `
        <tr data-id="${cari.id}">

            <td>${typeBadge}</td>

            <td class="fw-semibold">
                ${cari.name || "-"}
            </td>

            <td>${cari.phone || "-"}</td>
            <td>${cari.email || "-"}</td>

            <td class="text-end">

                <!-- EDIT -->
                <button 
                    class="btn btn-sm btn-outline-primary rounded-pill me-2"
                    data-bs-toggle="tooltip"
                    title="Düzenle"
                    onclick='openEditCari(${JSON.stringify(cari)})'
                >
                    <i class="bi bi-pencil"></i>
                </button>

                <!-- DELETE -->
                <button 
                    class="btn btn-sm btn-outline-danger rounded-pill"
                    data-bs-toggle="tooltip"
                    title="Sil"
                    onclick="deleteCari(${cari.id})"
                >
                    <i class="bi bi-trash"></i>
                </button>

            </td>
        </tr>
        `;

        carisTableBody.innerHTML += row;
    });

    initTooltips();
}


// =====================
// TYPE BADGE (RENKLİ SİSTEM)
// =====================
function getTypeBadge(type) {
    if (type === "musteri") {
        return `<span class="badge bg-primary px-3 py-2">Müşteri</span>`;
    }
    if (type === "tedarikci") {
        return `<span class="badge bg-warning text-dark px-3 py-2">Tedarikçi</span>`;
    }
    if (type === "personel") {
        return `<span class="badge bg-success px-3 py-2">Personel</span>`;
    }
    if (type === "yonetici") {
        return `<span class="badge bg-info px-3 py-2">Yönetici</span>`;
    }
    return `<span class="badge bg-secondary px-3 py-2">-</span>`;
}


// =====================
// ADD
// =====================
addCariForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    await fetch(`${API_BASE_URL}/caris/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: cariType.value,
            name: cariName.value,
            phone: cariPhone.value,
            email: cariEmail.value,
            address: cariAddress.value,
            description: cariDesc.value
        })
    });

    addCariForm.reset();
    addCariModal.hide();
    loadCaris();

    showToast("Cari eklendi", "success");
});


// =====================
// OPEN EDIT (DEPODAKİ GİBİ)
// =====================
function openEditCari(cari) {

    document.getElementById("editCariId").value = cari.id;
    document.getElementById("editCariType").value = cari.type;
    document.getElementById("editCariName").value = cari.name;
    document.getElementById("editCariPhone").value = cari.phone;
    document.getElementById("editCariEmail").value = cari.email;
    document.getElementById("editCariAddress").value = cari.address;
    document.getElementById("editCariDesc").value = cari.description;

    editCariModal.show();
}


// =====================
// UPDATE
// =====================
editCariForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editCariId").value;

    await fetch(`${API_BASE_URL}/caris/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: editCariType.value,
            name: editCariName.value,
            phone: editCariPhone.value,
            email: editCariEmail.value,
            address: editCariAddress.value,
            description: editCariDesc.value
        })
    });

    editCariModal.hide();
    loadCaris();

    showToast("Cari güncellendi", "success");
});


// =====================
// DELETE (CONFIRM MODAL - DEPODAKİ GİBİ)
// =====================
function deleteCari(id) {

    showConfirm(
        "Cari Sil",
        "Bu cariyi silmek istediğine emin misin?",
        async () => {

            await fetch(`${API_BASE_URL}/caris/delete/${id}`, {
                method: "DELETE"
            });

            loadCaris();
            showToast("Cari silindi", "success");
        }
    );
}


// =====================
// TOOLTIP
// =====================
function initTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
        .forEach(el => new bootstrap.Tooltip(el));
}


// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", loadCaris);