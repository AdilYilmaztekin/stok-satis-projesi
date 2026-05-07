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