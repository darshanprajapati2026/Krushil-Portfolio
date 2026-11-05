
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 0. BACKEND API URL
    // =====================================
    const API_URL = "https://krushil-auth-system-1.onrender.com";


    // =====================================
    // 1. SMOOTH SCROLLING
    // =====================================
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const href = this.getAttribute("href");

            if (!href || href === "#") return;

            const target = document.querySelector(href);

            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    // =====================================
    // 2. DARK / LIGHT THEME
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
    // 3. NAVBAR SEARCH
    // =====================================
    const navbarSearch = document.getElementById("navbar-search");
    const searchInput = document.getElementById("search-input");

    if (navbarSearch && searchInput) {
        navbarSearch.addEventListener("submit", function (e) {
            e.preventDefault();

            const searchText =
                searchInput.value.trim().toLowerCase();

            if (!searchText) return;

            const sections = document.querySelectorAll("section");
            let found = false;

            sections.forEach(function (section) {
                const content = section.innerText.toLowerCase();

                if (!found && content.includes(searchText)) {
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
    // 4. LOGIN / REGISTER POPUP
    // =====================================
    const profileBtn = document.getElementById("profile-btn");
    const authOverlay = document.getElementById("auth-overlay");
    const closeAuth = document.getElementById("close-auth");

    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    const showRegisterLink = document.getElementById("show-register");
    const showLoginLink = document.getElementById("show-login");


    // Open popup
    if (profileBtn && authOverlay) {
        profileBtn.addEventListener("click", function () {
            authOverlay.classList.add("active");
        });
    }


    // Close popup
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


    // Show Login form
    function showLogin() {
        if (!loginForm || !registerForm) return;

        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        if (loginTab) loginTab.classList.add("active");
        if (registerTab) registerTab.classList.remove("active");
    }


    // Show Register form
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
    // 5. LOGIN FORM - RENDER BACKEND
    // =====================================
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // These IDs must match your Login form HTML.
            const emailInput = document.getElementById("login-email");
            const passwordInput = document.getElementById("login-password");
            const message = document.getElementById("login-message");

            if (!emailInput || !passwordInput) {
                console.error(
                    'Login inputs not found. Expected IDs: "login-email" and "login-password".'
                );

                if (message) {
                    message.textContent =
                        "Login form fields could not be found. Please check the HTML.";
                } else {
                    alert("Login form fields could not be found. Please check the HTML.");
                }
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                if (message) {
                    message.textContent = "Please enter your email and password.";
                } else {
                    alert("Please enter your email and password.");
                }
                return;
            }

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

                if (!response.ok) {
                    const errorMessage =
                        data.message || "Login failed. Please check your details.";

                    if (message) {
                        message.textContent = errorMessage;
                    } else {
                        alert(errorMessage);
                    }
                    return;
                }

                // Save login token and user details in this browser tab.
                sessionStorage.setItem("authToken", data.token);
                sessionStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(data.user)
                );

                if (message) {
                    message.textContent =
                        "Login successful! Welcome " + data.user.name;
                } else {
                    alert("Login successful! Welcome " + data.user.name);
                }

                loginForm.reset();

                // Close popup after successful login.
                if (authOverlay) {
                    authOverlay.classList.remove("active");
                }

            } catch (error) {
                console.error("Login Error:", error);

                const errorMessage =
                    "Unable to connect to the server. Please try again.";

                if (message) {
                    message.textContent = errorMessage;
                } else {
                    alert(errorMessage);
                }
            }
        });
    }


    // =====================================
    // 6. REGISTER FORM - MONGODB BACKEND
    // =====================================
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name =
                document.getElementById("register-name")?.value.trim();

            const email =
                document.getElementById("register-email")?.value.trim();

            const password =
                document.getElementById("register-password")?.value;

            const confirmPassword =
                document.getElementById("confirm-password")?.value;

            const message =
                document.getElementById("register-message");

            if (!name || !email || !password || !confirmPassword) {
                if (message) {
                    message.textContent = "Please fill in all fields.";
                }
                return;
            }

            if (password !== confirmPassword) {
                if (message) {
                    message.textContent = "Passwords do not match!";
                }
                return;
            }

            if (password.length < 8) {
                if (message) {
                    message.textContent =
                        "Password must contain at least 8 characters.";
                }
                return;
            }

            if (message) {
                message.textContent = "Registering...";
            }

            try {
                const response = await fetch(
                    `${API_URL}/api/auth/register`,
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

                if (message) {
                    message.textContent =
                        data.message || "Registration completed.";
                }

                if (response.ok) {
                    registerForm.reset();
                }

            } catch (error) {
                console.error("Registration Error:", error);

                if (message) {
                    message.textContent =
                        "Unable to connect to server. Please try again.";
                }
            }
        });
    }

});
















// document.addEventListener("DOMContentLoaded", function () {

//     // =====================================
//     // 1. SMOOTH SCROLLING
//     // =====================================

//     document.querySelectorAll('a[href^="#"]').forEach(function (link) {

//         link.addEventListener("click", function (event) {

//             const href = this.getAttribute("href");

//             if (!href || href === "#") return;

//             const target = document.querySelector(href);

//             if (target) {
//                 event.preventDefault();

//                 target.scrollIntoView({
//                     behavior: "smooth",
//                     block: "start"
//                 });
//             }
//         });

//     });


//     // =====================================
//     // 2. DARK / LIGHT THEME
//     // =====================================

//     const themeToggle = document.getElementById("theme-toggle");

//     if (themeToggle) {

//         const savedTheme =
//             localStorage.getItem("website-theme") || "light";

//         document.documentElement.setAttribute("data-theme", savedTheme);

//         themeToggle.textContent =
//             savedTheme === "dark" ? "☀️" : "🌙";

//         themeToggle.addEventListener("click", function () {

//             const currentTheme =
//                 document.documentElement.getAttribute("data-theme");

//             const newTheme =
//                 currentTheme === "dark" ? "light" : "dark";

//             document.documentElement.setAttribute(
//                 "data-theme",
//                 newTheme
//             );

//             localStorage.setItem("website-theme", newTheme);

//             themeToggle.textContent =
//                 newTheme === "dark" ? "☀️" : "🌙";

//         });

//     }


// =====================================
// 3. NAVBAR SEARCH
// =====================================

const navbarSearch = document.getElementById("navbar-search");
const searchInput = document.getElementById("search-input");

if (navbarSearch && searchInput) {

    navbarSearch.addEventListener("submit", function (e) {

        e.preventDefault();

        const searchText =
            searchInput.value.trim().toLowerCase();

        if (!searchText) return;

        const sections = document.querySelectorAll("section");

        let found = false;

        sections.forEach(function (section) {

            const content = section.innerText.toLowerCase();

            if (!found && content.includes(searchText)) {

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
// 4. LOGIN / REGISTER POPUP
// =====================================

const profileBtn = document.getElementById("profile-btn");
const authOverlay = document.getElementById("auth-overlay");
const closeAuth = document.getElementById("close-auth");

const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");


// Open popup
if (profileBtn && authOverlay) {

    profileBtn.addEventListener("click", function () {
        authOverlay.classList.add("active");
    });

}


// Close popup
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


// Show Login form
function showLogin() {

    if (!loginForm || !registerForm) return;

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    if (loginTab) loginTab.classList.add("active");
    if (registerTab) registerTab.classList.remove("active");

}


// Show Register form
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
// 5. REGISTER FORM - MONGODB BACKEND
// =====================================

const registerFormElement =
    document.getElementById("register-form");

if (registerFormElement) {

    registerFormElement.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name =
            document.getElementById("register-name")?.value.trim();

        const email =
            document.getElementById("register-email")?.value.trim();

        const password =
            document.getElementById("register-password")?.value;

        const confirmPassword =
            document.getElementById("confirm-password")?.value;

        const message =
            document.getElementById("register-message");

        if (!name || !email || !password || !confirmPassword) {

            if (message) {
                message.textContent = "Please fill in all fields.";
            }

            return;
        }

        if (password !== confirmPassword) {

            if (message) {
                message.textContent = "Passwords do not match!";
            }

            return;
        }

        if (password.length < 8) {

            if (message) {
                message.textContent =
                    "Password must contain at least 8 characters.";
            }

            return;
        }

        if (message) {
            message.textContent = "Registering...";
        }

        try {

            // IMPORTANT:
            // Replace this URL with your deployed backend URL.
            const API_URL = "https://krushil-auth-system-1.onrender.com";

            const response = await fetch(
                `${API_URL}/api/auth/register`,
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

            if (message) {
                message.textContent =
                    data.message || "Registration completed.";
            }

            if (response.ok) {

                registerFormElement.reset();

            }

        } catch (error) {

            console.error("Registration Error:", error);

            if (message) {
                message.textContent =
                    "Unable to connect to server. Please try again.";
            }

        }

    });

}

});


// document.querySelectorAll('a[href^="#"]').forEach(function (link) {
//     link.addEventListener("click", function (event) {
//         const target = document.querySelector(this.getAttribute("href"));

//         if (target) {
//             event.preventDefault();
//             target.scrollIntoView({
//                 behavior: "smooth",
//                 block: "start"
//             });
//         }
//     });
// });


// const themeToggle = document.getElementById("theme-toggle");

// if (themeToggle) {

//     // Load previously selected theme
//     const savedTheme = localStorage.getItem("website-theme") || "light";

//     document.documentElement.setAttribute("data-theme", savedTheme);

//     themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

//     // Switch theme on button click
//     themeToggle.addEventListener("click", function () {

//         const currentTheme =
//             document.documentElement.getAttribute("data-theme");

//         const newTheme = currentTheme === "dark" ? "light" : "dark";

//         document.documentElement.setAttribute("data-theme", newTheme);

//         localStorage.setItem("website-theme", newTheme);

//         themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";

//     });
// }

// document.getElementById("navbar-search").addEventListener("submit", function (e) {
//     e.preventDefault();

//     const searchText = document.getElementById("search-input")
//         .value.trim().toLowerCase();

//     const sections = document.querySelectorAll("section");

//     let found = false;

//     sections.forEach(function (section) {
//         const content = section.innerText.toLowerCase();

//         if (!found && content.includes(searchText) && searchText !== "") {
//             section.scrollIntoView({
//                 behavior: "smooth"
//             });
//             found = true;
//         }
//     });

//     if (!found && searchText !== "") {
//         alert("No matching content found!");
//     }
// });

// const registerForm = document.getElementById("register-form");

// registerForm.addEventListener("submit", async function (e) {

//     e.preventDefault();

//     const name = document.getElementById("register-name").value.trim();
//     const email = document.getElementById("register-email").value.trim();
//     const password = document.getElementById("register-password").value;
//     const confirmPassword = document.getElementById("confirm-password").value;

//     const message = document.getElementById("register-message");

//     if (password !== confirmPassword) {
//         message.textContent = "Passwords do not match!";
//         return;
//     }

//     message.textContent = "Registering...";

//     try {

//         const response = await fetch(
//             "http://localhost:5000/api/auth/register",
//             {
//                 method: "POST",

//                 headers: {
//                     "Content-Type": "application/json"
//                 },

//                 body: JSON.stringify({
//                     name: name,
//                     email: email,
//                     password: password
//                 })
//             }
//         );

//         const data = await response.json();

//         message.textContent = data.message;

//         if (response.ok) {
//             registerForm.reset();
//         }

//     } catch (error) {

//         message.textContent =
//             "Unable to connect to server. Please try again.";

//         console.error(error);
//     }

// });


// document.addEventListener("DOMContentLoaded", function () {

//     const profileBtn = document.getElementById("profile-btn");
//     const authOverlay = document.getElementById("auth-overlay");
//     const closeAuth = document.getElementById("close-auth");

//     const loginTab = document.getElementById("login-tab");
//     const registerTab = document.getElementById("register-tab");

//     const loginForm = document.getElementById("login-form");
//     const registerForm = document.getElementById("register-form");

//     if (!profileBtn || !authOverlay || !closeAuth) {
//         console.error("Profile button or popup HTML is missing!");
//         return;
//     }

//     // Open popup
//     profileBtn.addEventListener("click", function () {
//         authOverlay.classList.add("active");
//     });

//     // Close popup
//     closeAuth.addEventListener("click", function () {
//         authOverlay.classList.remove("active");
//     });

//     // Close when clicking outside popup
//     authOverlay.addEventListener("click", function (e) {
//         if (e.target === authOverlay) {
//             authOverlay.classList.remove("active");
//         }
//     });

//     // Show Login
//     function showLogin() {
//         loginForm.classList.remove("hidden");
//         registerForm.classList.add("hidden");

//         loginTab.classList.add("active");
//         registerTab.classList.remove("active");
//     }

//     // Show Register
//     function showRegister() {
//         registerForm.classList.remove("hidden");
//         loginForm.classList.add("hidden");

//         registerTab.classList.add("active");
//         loginTab.classList.remove("active");
//     }

//     loginTab.addEventListener("click", showLogin);
//     registerTab.addEventListener("click", showRegister);

//     document.getElementById("show-register").addEventListener("click", function (e) {
//         e.preventDefault();
//         showRegister();
//     });

//     document.getElementById("show-login").addEventListener("click", function (e) {
//         e.preventDefault();
//         showLogin();
//     });

// });
