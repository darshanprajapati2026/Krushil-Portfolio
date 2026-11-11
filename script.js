
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. BACKEND API URL
    // =====================================
    const API_URL = "https://krushil-auth-system-1.onrender.com";


    // =====================================
    // 2. SMOOTH SCROLLING
    // =====================================
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");

            if (!href || href === "#") return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    // =====================================
    // 3. DARK / LIGHT THEME
    // =====================================
    const themeToggle = document.getElementById("theme-toggle");

    if (themeToggle) {

        const savedTheme =
            localStorage.getItem("website-theme") || "light";

        document.documentElement.setAttribute("data-theme", savedTheme);

        themeToggle.textContent =
            savedTheme === "dark" ? "☀️" : "🌙";

        themeToggle.addEventListener("click", function () {

            const currentTheme =
                document.documentElement.getAttribute("data-theme");

            const newTheme =
                currentTheme === "dark" ? "light" : "dark";

            document.documentElement.setAttribute("data-theme", newTheme);

            localStorage.setItem("website-theme", newTheme);

            themeToggle.textContent =
                newTheme === "dark" ? "☀️" : "🌙";
        });
    }


    // =====================================
    // 4. NAVBAR SEARCH
    // =====================================
    const navbarSearch = document.getElementById("navbar-search");
    const searchInput = document.getElementById("search-input");

    if (navbarSearch && searchInput) {

        navbarSearch.addEventListener("submit", function (e) {
            e.preventDefault();

            const searchText =
                searchInput.value.trim().toLowerCase();

            if (!searchText) return;

            const sections = document.querySelectorAll("main section");
            let found = false;

            sections.forEach(function (section) {

                if (
                    !found &&
                    section.innerText.toLowerCase().includes(searchText)
                ) {
                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    found = true;
                }
            });

            if (!found) {
                alert("No matching content found!");
            }
        });
    }


    // =====================================
    // 5. LOGIN / REGISTER ELEMENTS
    // =====================================
    const profileBtn = document.getElementById("profile-btn");
    const profileMenu = document.getElementById("profile-menu");
    const profileUserName = document.getElementById("profile-user-name");
    const logoutBtn = document.getElementById("logout-btn");

    const authOverlay = document.getElementById("auth-overlay");
    const closeAuth = document.getElementById("close-auth");

    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    const showRegisterLink = document.getElementById("show-register");
    const showLoginLink = document.getElementById("show-login");


    // =====================================
    // 6. SHOW LOGIN FORM
    // =====================================
    function showLogin() {

        if (!loginForm || !registerForm) return;

        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        if (loginTab) loginTab.classList.add("active");
        if (registerTab) registerTab.classList.remove("active");
    }


    // =====================================
    // 7. SHOW REGISTER FORM
    // =====================================
    function showRegister() {

        if (!loginForm || !registerForm) return;

        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");

        if (registerTab) registerTab.classList.add("active");
        if (loginTab) loginTab.classList.remove("active");
    }


    if (loginTab) {
        loginTab.addEventListener("click", showLogin);
    }

    if (registerTab) {
        registerTab.addEventListener("click", showRegister);
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener("click", function (e) {
            e.preventDefault();
            showRegister();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener("click", function (e) {
            e.preventDefault();
            showLogin();
        });
    }


    // =====================================
    // 8. UPDATE PROFILE AFTER LOGIN
    // =====================================
    function updateAuthUI() {

        const token = sessionStorage.getItem("authToken");
        const savedUser = sessionStorage.getItem("loggedInUser");

        if (token && savedUser) {

            try {
                const user = JSON.parse(savedUser);

                if (profileUserName) {
                    profileUserName.textContent =
                        "Welcome, " + (user.name || user.email || "User");
                }

            } catch (error) {

                sessionStorage.removeItem("authToken");
                sessionStorage.removeItem("loggedInUser");
            }
        }

        if (profileMenu) {
            profileMenu.hidden = true;
        }
    }


    // =====================================
    // 9. PROFILE ICON CLICK
    // =====================================
    if (profileBtn) {

        profileBtn.addEventListener("click", function () {

            const token = sessionStorage.getItem("authToken");

            if (token) {

                if (profileMenu) {
                    profileMenu.hidden = !profileMenu.hidden;
                }

            } else {

                if (authOverlay) {
                    authOverlay.classList.add("active");
                    showLogin();
                }
            }
        });
    }


    // Initial profile check
    updateAuthUI();


    // =====================================
    // 10. CLOSE LOGIN / REGISTER POPUP
    // =====================================
    if (closeAuth && authOverlay) {

        closeAuth.addEventListener("click", function () {
            authOverlay.classList.remove("active");
        });

        authOverlay.addEventListener("click", function (e) {

            if (e.target === authOverlay) {
                authOverlay.classList.remove("active");
            }
        });
    }


    // =====================================
    // 11. LOGIN API CONNECTION
    // =====================================
    if (loginForm) {

        loginForm.addEventListener("submit", async function (e) {

            e.preventDefault();

            const emailInput = document.getElementById("login-email");
            const passwordInput = document.getElementById("login-password");
            const message = document.getElementById("login-message");

            if (!emailInput || !passwordInput) {
                alert("Login email or password field is missing.");
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (message) {
                message.textContent = "Logging in...";
            }

            try {

                const response = await fetch(
                    `${API_URL}/api/auth/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.token) {

                    const errorMessage =
                        data.message || "Login failed. Please try again.";

                    if (message) {
                        message.textContent = errorMessage;
                    } else {
                        alert(errorMessage);
                    }

                    return;
                }

                // Save login session
                sessionStorage.setItem("authToken", data.token);

                sessionStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(data.user || { email: email })
                );

                // Update profile menu
                updateAuthUI();

                // Close Login popup
                if (authOverlay) {
                    authOverlay.classList.remove("active");
                }

                loginForm.reset();

                if (message) {
                    message.textContent = "";
                }

                alert(
                    "Login successful! Welcome " +
                    ((data.user && data.user.name) || email)
                );

            } catch (error) {

                console.error("Login Error:", error);

                if (message) {
                    message.textContent =
                        "Unable to connect to server. Please try again.";
                } else {
                    alert("Unable to connect to server. Please try again.");
                }
            }
        });
    }


    // =====================================
    // 12. REGISTER API CONNECTION
    // =====================================
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("register-name").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;
            const message = document.getElementById("register-message");

            if (password !== confirmPassword) {
                message.textContent = "Passwords do not match.";
                return;
            }

            if (password.length < 8) {
                message.textContent = "Password must contain at least 8 characters.";
                return;
            }

            message.textContent = "Registering...";

            try {
                const response = await fetch(
                    "https://krushil-auth-system-1.onrender.com/api/auth/register",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    message.textContent = data.message || "Registration failed.";
                    return;
                }

                message.textContent = "Registration successful! Please login.";
                registerForm.reset();

            } catch (error) {
                console.error("Registration Error:", error);

                message.textContent =
                    "Cannot connect to backend. Check Render service and CORS settings.";
            }
        });
    }



    // if (registerForm) {

    //     registerForm.addEventListener("submit", async function (e) {

    //         e.preventDefault();

    //         const name =
    //             document.getElementById("register-name").value.trim();

    //         const email =
    //             document.getElementById("register-email").value.trim();

    //         const password =
    //             document.getElementById("register-password").value;

    //         const confirmPassword =
    //             document.getElementById("confirm-password").value;

    //         const message =
    //             document.getElementById("register-message");

    //         if (!name || !email || !password || !confirmPassword) {

    //             if (message) {
    //                 message.textContent = "Please fill in all fields.";
    //             }

    //             return;
    //         }

    //         if (password !== confirmPassword) {

    //             if (message) {
    //                 message.textContent = "Passwords do not match!";
    //             }

    //             return;
    //         }

    //         if (password.length < 8) {

    //             if (message) {
    //                 message.textContent =
    //                     "Password must contain at least 8 characters.";
    //             }

    //             return;
    //         }

    //         if (message) {
    //             message.textContent = "Registering...";
    //         }

    //         try {

    //             const response = await fetch(
    //                 `${API_URL}/api/auth/register`,
    //                 {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json"
    //                     },
    //                     body: JSON.stringify({
    //                         name: name,
    //                         email: email,
    //                         password: password
    //                     })
    //                 }
    //             );

    //             const data = await response.json();

    //             if (message) {
    //                 message.textContent =
    //                     data.message ||
    //                     (response.ok
    //                         ? "Registration successful!"
    //                         : "Registration failed.");
    //             }

    //             if (response.ok) {
    //                 registerForm.reset();
    //             }

    //         } catch (error) {

    //             console.error("Registration Error:", error);

    //             if (message) {
    //                 message.textContent =
    //                     "Unable to connect to server. Please try again.";
    //             }
    //         }
    //     });
    // }


    // =====================================
    // 13. LOGOUT FUNCTION
    // =====================================
    if (logoutBtn) {

        logoutBtn.addEventListener("click", function () {

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (confirmLogout) {

                // Clear login session
                sessionStorage.removeItem("authToken");
                sessionStorage.removeItem("loggedInUser");

                // Hide profile menu
                if (profileMenu) {
                    profileMenu.hidden = true;
                }

                // Close authentication popup if open
                if (authOverlay) {
                    authOverlay.classList.remove("active");
                }

                // Update profile
                updateAuthUI();

                alert("You have successfully logged out!");
            }
        });
    }


    // =====================================
    // 14. CLOSE PROFILE MENU WHEN CLICKING OUTSIDE
    // =====================================
    document.addEventListener("click", function (e) {

        const profileContainer =
            document.querySelector(".profile-container");

        if (
            profileContainer &&
            !profileContainer.contains(e.target) &&
            profileMenu
        ) {
            profileMenu.hidden = true;
        }
    });

});
