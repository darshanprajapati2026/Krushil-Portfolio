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
            loadCustomers(token);

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


// LOAD CUSTOMER RECORDS
async function loadCustomers(token) {

    const customerTableBody = document.getElementById("customerTableBody");

    try {

        const response = await fetch(`${API_URL}/api/admin/customers`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load customers.");
        }

        customerTableBody.innerHTML = "";

        if (data.customers.length === 0) {
            customerTableBody.textContent = "No customers found.";
            return;
        }

        data.customers.forEach(customer => {

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = customer.name || "N/A";

            const emailCell = document.createElement("td");
            emailCell.textContent = customer.email || "N/A";

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";
            editButton.dataset.id = customer._id;


            editButton.addEventListener("click", async function () {

                const newName = prompt("Enter updated customer name:", customer.name);

                if (newName === null) return;

                const newEmail = prompt("Enter updated customer email:", customer.email);

                if (newEmail === null) return;

                if (!newName.trim() || !newEmail.trim()) {
                    alert("Name and email are required.");
                    return;
                }

                try {

                    const response = await fetch(
                        `${API_URL}/api/admin/customers/${customer._id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                name: newName.trim(),
                                email: newEmail.trim()
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Unable to update customer.");
                    }

                    alert("Customer updated successfully!");

                    loadCustomers(token);

                } catch (error) {
                    alert(error.message);
                }

            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.dataset.id = customer._id;


            deleteButton.addEventListener("click", async function () {

                const confirmDelete = confirm(
                    `Are you sure you want to delete ${customer.name}?`
                );

                if (!confirmDelete) return;

                try {

                    const response = await fetch(
                        `${API_URL}/api/admin/customers/${customer._id}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Unable to delete customer.");
                    }

                    alert("Customer deleted successfully!");

                    loadCustomers(token);

                } catch (error) {
                    alert(error.message);
                }

            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);

            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(actionCell);

            customerTableBody.appendChild(row);

        });

    } catch (error) {

        customerTableBody.textContent = error.message;

    }
}
