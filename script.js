
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            event.preventDefault();
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});


const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {

    // Load previously selected theme
    const savedTheme = localStorage.getItem("website-theme") || "light";

    document.documentElement.setAttribute("data-theme", savedTheme);

    themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

    // Switch theme on button click
    themeToggle.addEventListener("click", function () {

        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);

        localStorage.setItem("website-theme", newTheme);

        themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";

    });
}

document.getElementById("navbar-search").addEventListener("submit", function (e) {
    e.preventDefault();

    const searchText = document.getElementById("search-input")
        .value.trim().toLowerCase();

    const sections = document.querySelectorAll("section");

    let found = false;

    sections.forEach(function (section) {
        const content = section.innerText.toLowerCase();

        if (!found && content.includes(searchText) && searchText !== "") {
            section.scrollIntoView({
                behavior: "smooth"
            });
            found = true;
        }
    });

    if (!found && searchText !== "") {
        alert("No matching content found!");
    }
});

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    const message = document.getElementById("register-message");

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        return;
    }

    message.textContent = "Registering...";

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            registerForm.reset();
        }

    } catch (error) {

        message.textContent =
            "Unable to connect to server. Please try again.";

        console.error(error);
    }

});


document.addEventListener("DOMContentLoaded", function () {

    const profileBtn = document.getElementById("profile-btn");
    const authOverlay = document.getElementById("auth-overlay");
    const closeAuth = document.getElementById("close-auth");

    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (!profileBtn || !authOverlay || !closeAuth) {
        console.error("Profile button or popup HTML is missing!");
        return;
    }

    // Open popup
    profileBtn.addEventListener("click", function () {
        authOverlay.classList.add("active");
    });

    // Close popup
    closeAuth.addEventListener("click", function () {
        authOverlay.classList.remove("active");
    });

    // Close when clicking outside popup
    authOverlay.addEventListener("click", function (e) {
        if (e.target === authOverlay) {
            authOverlay.classList.remove("active");
        }
    });

    // Show Login
    function showLogin() {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    }

    // Show Register
    function showRegister() {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");

        registerTab.classList.add("active");
        loginTab.classList.remove("active");
    }

    loginTab.addEventListener("click", showLogin);
    registerTab.addEventListener("click", showRegister);

    document.getElementById("show-register").addEventListener("click", function (e) {
        e.preventDefault();
        showRegister();
    });

    document.getElementById("show-login").addEventListener("click", function (e) {
        e.preventDefault();
        showLogin();
    });

});
