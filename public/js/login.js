document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;
    const messageBox = document.getElementById("loginMessage");

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        messageBox.className = "login-message show";

        if (data.success) {
            messageBox.classList.add("success");
            messageBox.textContent = "Başarılı giriş yapılıyor...";

            setTimeout(() => {
                messageBox.className = "login-message";
                messageBox.textContent = "";

                window.location.href = "/index.html";
            }, 1000);

        } else {
            messageBox.classList.add("error");
            messageBox.textContent = "Geçersiz kullanıcı adı veya şifre";
        }

    } catch (error) {
        console.error(error);

        messageBox.className = "login-message show error";
        messageBox.textContent = "Sunucuya bağlanılamadı";
    }
});