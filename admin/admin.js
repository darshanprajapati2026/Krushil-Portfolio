

const API_URL = "https://krushil-auth-system-1.onrender.com";

// Admin Login Form
const adminLoginForm = document.getElementById("adminLoginForm");

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
        // Connect to Backend Login API
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

        // Open Admin Dashboard
        window.location.href = "admin-dashboard.html";

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";

    } finally {
        loginBtn.disabled = false;
    }
});

