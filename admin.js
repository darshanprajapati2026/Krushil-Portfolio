
const API_URL = "https://krushil-auth-system-1.onrender.com";

// =====================================
// ADMIN LOGIN
// =====================================

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");
        const loginBtn = document.getElementById("loginBtn");

        message.textContent = "Checking login...";
        message.style.color = "blue";
        loginBtn.disabled = true;

        try {

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            // Check Admin Role
            if (!data.user || data.user.role !== "admin") {
                throw new Error("Access denied. Admin account required.");
            }

            // Save Admin Session
            sessionStorage.setItem("authToken", data.token);

            sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(data.user)
            );

            message.textContent = "Login successful!";
            message.style.color = "green";

            // Open Dashboard
            window.location.href = "admin-dashboard.html";

        } catch (error) {

            message.textContent = error.message;
            message.style.color = "red";

        } finally {

            loginBtn.disabled = false;

        }

    });

}


// =====================================
// ADMIN DASHBOARD
// =====================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    async function loadAdminDashboard() {

        const token = sessionStorage.getItem("authToken");

        if (!token) {
            window.location.href = "admin-login.html";
            return;
        }

        const backendMessage = document.getElementById("backendMessage");

        backendMessage.textContent = "Checking backend connection...";
        backendMessage.style.color = "blue";

        try {

            const response = await fetch(`${API_URL}/api/admin/dashboard`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to access dashboard.");
            }

            // Display Admin Details
            document.getElementById("welcomeMessage").textContent =
                `Welcome, ${data.admin.name}!`;

            document.getElementById("adminName").textContent =
                data.admin.name;

            document.getElementById("adminEmail").textContent =
                data.admin.email;

            document.getElementById("adminRole").textContent =
                data.admin.role;

            backendMessage.textContent =
                "Connected Successfully!";

            backendMessage.style.color = "green";

        } catch (error) {

            backendMessage.textContent = error.message;
            backendMessage.style.color = "red";

            // Clear invalid session
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("loggedInUser");

            setTimeout(() => {
                window.location.href = "admin-login.html";
            }, 2000);

        }

    }

    // Load Dashboard
    loadAdminDashboard();


    // =====================================
    // ADMIN LOGOUT
    // =====================================

    logoutBtn.addEventListener("click", function () {

        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("loggedInUser");

        window.location.href = "admin-login.html";

    });

}
