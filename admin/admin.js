
const API_URL = "https://krushil-auth-system-1.onrender.com";

// ADMIN LOGIN
const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");
        const loginBtn = document.getElementById("loginBtn");

        message.textContent = "Please wait...";
        message.style.color = "#174a7e";
        loginBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            if (!data.token || !data.user) {
                throw new Error("Invalid login response from server.");
            }

            if (data.user.role !== "admin") {
                throw new Error("Access denied. Admin account required.");
            }

            sessionStorage.setItem("authToken", data.token);
            sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(data.user)
            );

            message.textContent = "Login successful. Opening dashboard...";
            message.style.color = "green";

            window.location.href = "admin-dashboard.html";

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";
        } finally {
            loginBtn.disabled = false;
        }
    });
}


// ADMIN DASHBOARD
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    const token = sessionStorage.getItem("authToken");
    const savedUser = sessionStorage.getItem("loggedInUser");

    // Redirect if admin is not logged in
    if (!token || !savedUser) {
        window.location.href = "admin-login.html";
    } else {
        try {
            const user = JSON.parse(savedUser);

            if (user.role !== "admin") {
                throw new Error("Admin access required.");
            }

            document.getElementById("welcomeMessage").textContent =
                `Welcome, ${user.name || "Admin"}`;

            document.getElementById("adminName").textContent =
                user.name || "Not available";

            document.getElementById("adminEmail").textContent =
                user.email || "Not available";

            document.getElementById("adminRole").textContent =
                user.role || "Not available";

            checkBackendConnection(token);

        } catch (error) {
            sessionStorage.clear();
            window.location.href = "admin-login.html";
        }
    }

    // LOGOUT
    logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("loggedInUser");

        window.location.href = "admin-login.html";
    });
}


// CHECK BACKEND CONNECTION
async function checkBackendConnection(token) {
    const status = document.getElementById("backendStatus");

    try {
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Backend connection failed.");
        }

        status.textContent = "Connected Successfully";
        status.style.color = "green";

    } catch (error) {
        status.textContent = error.message;
        status.style.color = "red";
    }
}
