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

            loadAdminProfile(token);
            checkBackendConnection(token);
            loadCustomers(token);
            loadEnquiries(token);

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



// LOAD LATEST ADMIN PROFILE
async function loadAdminProfile(token) {
    try {
        const response = await fetch(`${API_URL}/api/admin/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load Admin Profile.");
        }

        document.getElementById("welcomeMessage").textContent =
            `Welcome, ${data.admin.name}`;

        document.getElementById("adminName").textContent =
            data.admin.name;

        document.getElementById("adminEmail").textContent =
            data.admin.email;

        document.getElementById("adminRole").textContent =
            data.admin.role;

    } catch (error) {
        console.error("Admin Profile Error:", error);
    }
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


        // DISPLAY CUSTOMER SUMMARY

        const customers = data.customers;
        // EXPORT CUSTOMERS BUTTON

        document.getElementById("exportCustomersBtn").onclick = function () {
            exportCustomers(customers);
        };

        // REGISTRATION STATISTICS

        const today = new Date();

        // This Month Registrations
        const thisMonthCount = customers.filter(customer => {
            if (!customer.createdAt) return false;

            const date = new Date(customer.createdAt);

            return date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        }).length;

        // Last Month Registrations
        const lastMonthDate = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        );

        const lastMonthCount = customers.filter(customer => {
            if (!customer.createdAt) return false;

            const date = new Date(customer.createdAt);

            return date.getMonth() === lastMonthDate.getMonth() &&
                date.getFullYear() === lastMonthDate.getFullYear();
        }).length;

        // Growth Percentage
        let growthText;

        if (lastMonthCount === 0) {
            growthText = thisMonthCount === 0 ? "0%" : "N/A";
        } else {
            const growth = (
                (thisMonthCount - lastMonthCount) / lastMonthCount
            ) * 100;

            growthText = `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
        }

        // Display Statistics
        document.getElementById("thisMonthRegistrations").textContent = thisMonthCount;

        document.getElementById("lastMonthRegistrations").textContent = lastMonthCount;

        document.getElementById("registrationGrowth").textContent = growthText;

        // DISPLAY MONTHLY REGISTRATION CHART
        renderRegistrationChart(customers);
        // DISPLAY CUSTOMER GROWTH CHART
        renderGrowthChart(customers);
        renderCustomerStatusChart(customers);
        renderRecentCustomers(customers);

        // RECENT CUSTOMER REGISTRATIONS

        function renderRecentCustomers(customers) {

            const tableBody = document.getElementById("recentCustomersTable");

            // Sort customers by registration date (newest first)
            const recentCustomers = [...customers]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            if (recentCustomers.length === 0) {
                tableBody.innerHTML = `
            <tr>
                <td colspan="3">No customer registrations found.</td>
            </tr>
        `;
                return;
            }

            tableBody.innerHTML = recentCustomers.map(customer => {

                const registrationDate = customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString("en-IN")
                    : "N/A";

                return `
            <tr>
                <td>${customer.name || "N/A"}</td>
                <td>${customer.email || "N/A"}</td>
                <td>${registrationDate}</td>
            </tr>
        `;

            }).join("");
        }


        const totalCustomers = customers.length;

        const activeCustomers = customers.filter(
            customer => (customer.status || "active").toLowerCase() === "active"
        ).length;

        const inactiveCustomers = customers.filter(
            customer => (customer.status || "active").toLowerCase() === "inactive"
        ).length;

        // UPDATE SUMMARY CARDS

        document.getElementById("totalCustomers").textContent =
            totalCustomers;

        document.getElementById("activeCustomers").textContent =
            activeCustomers;

        document.getElementById("inactiveCustomers").textContent =
            inactiveCustomers;


        // DISPLAY ALL CUSTOMERS INITIALLY
        displayCustomers(data.customers, token);

        if (data.customers.length === 0) {
            customerTableBody.textContent = "No customers found.";
            return;
        }


        // CUSTOMER SEARCH AND STATUS FILTER

        const searchInput = document.getElementById("customerSearch");
        const statusFilter = document.getElementById("statusFilter");

        function filterCustomers() {

            const searchText = searchInput.value.trim().toLowerCase();
            const selectedStatus = statusFilter.value;

            const filteredCustomers = data.customers.filter(customer => {

                const matchesSearch =
                    (customer.name || "").toLowerCase().includes(searchText) ||
                    (customer.email || "").toLowerCase().includes(searchText);

                const customerStatus = (customer.status || "active").toLowerCase();

                const matchesStatus =
                    selectedStatus === "all" ||
                    customerStatus === selectedStatus;

                return matchesSearch && matchesStatus;
            });

            displayCustomers(filteredCustomers, token);
        }

        searchInput.oninput = filterCustomers;
        statusFilter.onchange = filterCustomers;



    } catch (error) {

        customerTableBody.textContent = error.message;

    }
}

// DISPLAY CUSTOMER RECORDS
function displayCustomers(customers, token) {

    const customerTableBody =
        document.getElementById("customerTableBody");

    customerTableBody.innerHTML = "";

    if (customers.length === 0) {
        customerTableBody.innerHTML =
            "<tr><td colspan='5'>No customers found.</td></tr>";
        return;
    }

    customers.forEach(customer => {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = customer.name || "N/A";

        const emailCell = document.createElement("td");
        emailCell.textContent = customer.email || "N/A";

        // REGISTRATION DATE
        const dateCell = document.createElement("td");

        dateCell.textContent = customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString()
            : "N/A";


        // ACCOUNT STATUS BADGE
        const statusCell = document.createElement("td");

        const status = (customer.status || "active").toLowerCase();

        const statusBadge = document.createElement("span");

        statusBadge.textContent =
            status.charAt(0).toUpperCase() + status.slice(1);

        statusBadge.className = `status-badge ${status}`;

        statusCell.appendChild(statusBadge);


        const actionCell = document.createElement("td");

        // VIEW BUTTON
        const viewButton = document.createElement("button");

        viewButton.textContent = "View";
        viewButton.className = "view-btn";
        viewButton.dataset.id = customer._id;

        // VIEW CUSTOMER DETAILS
        viewButton.addEventListener("click", function () {

            alert(
                "Customer Details\n\n" +
                "Name: " + customer.name + "\n" +
                "Email: " + customer.email + "\n" +
                "Role: " + customer.role + "\n" +
                "Registration Date: " +
                new Date(customer.createdAt).toLocaleDateString()
            );

        });

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


        // ACTIVATE / DEACTIVATE BUTTON

        const statusButton = document.createElement("button");

        statusButton.textContent =
            customer.status === "inactive" ? "Activate" : "Deactivate";

        statusButton.className =
            customer.status === "inactive" ? "activate-btn" : "deactivate-btn";

        statusButton.addEventListener("click", async function () {

            const newStatus =
                customer.status === "inactive" ? "active" : "inactive";

            const confirmChange = confirm(
                `Are you sure you want to ${newStatus} this customer?`
            );

            if (!confirmChange) return;

            try {
                const response = await fetch(
                    `${API_URL}/api/admin/customers/${customer._id}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to change account status.");
                }

                alert(`Customer account ${newStatus} successfully!`);

                loadCustomers(token);

            } catch (error) {
                alert(error.message);
            }
        });


        actionCell.appendChild(viewButton);
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        actionCell.appendChild(statusButton);

        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        customerTableBody.appendChild(row);

    });
}

let registrationChartInstance = null;

// MONTHLY CUSTOMER REGISTRATION CHART

function renderRegistrationChart(customers) {

    const ctx = document.getElementById("registrationChart");

    const today = new Date();

    // Last 6 months
    const months = [];

    for (let i = 5; i >= 0; i--) {

        const date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
        );

        months.push({
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: date.toLocaleString("en-US", {
                month: "short",
                year: "numeric"
            }),
            count: 0
        });
    }

    // Count customer registrations
    customers.forEach(customer => {

        if (!customer.createdAt) return;

        const date = new Date(customer.createdAt);

        const key = `${date.getFullYear()}-${date.getMonth()}`;

        const month = months.find(item => item.key === key);

        if (month) {
            month.count++;
        }
    });

    // Destroy previous chart before creating a new one
    if (registrationChartInstance) {
        registrationChartInstance.destroy();
    }

    // Create bar chart
    registrationChartInstance = new Chart(ctx, {

        type: "bar",

        data: {
            labels: months.map(month => month.label),

            datasets: [{
                label: "Customer Registrations",
                data: months.map(month => month.count),
                backgroundColor: "#174a7e",
                borderRadius: 6
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


// CUSTOMER GROWTH TREND CHART

let growthChartInstance = null;

function renderGrowthChart(customers) {

    const ctx = document.getElementById("growthChart");

    const today = new Date();
    const months = [];

    // Get the last 6 months
    for (let i = 5; i >= 0; i--) {

        const date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
        );

        months.push({
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: date.toLocaleString("en-US", {
                month: "short",
                year: "numeric"
            }),
            count: 0
        });
    }

    // Count monthly registrations
    customers.forEach(customer => {

        if (!customer.createdAt) return;

        const date = new Date(customer.createdAt);

        const key = `${date.getFullYear()}-${date.getMonth()}`;

        const month = months.find(item => item.key === key);

        if (month) {
            month.count++;
        }
    });

    // Remove previous chart
    if (growthChartInstance) {
        growthChartInstance.destroy();
    }

    // Create line chart
    growthChartInstance = new Chart(ctx, {

        type: "line",

        data: {
            labels: months.map(month => month.label),

            datasets: [{
                label: "Customer Registrations",
                data: months.map(month => month.count),
                borderColor: "#198754",
                backgroundColor: "rgba(25, 135, 84, 0.15)",
                fill: true,
                tension: 0.3
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


// CUSTOMER ACCOUNT STATUS DOUGHNUT CHART

let customerStatusChartInstance = null;

function renderCustomerStatusChart(customers) {

    const ctx = document.getElementById("customerStatusChart");

    const activeCount = customers.filter(customer =>
        (customer.status || "active").toLowerCase() === "active"
    ).length;

    const inactiveCount = customers.filter(customer =>
        (customer.status || "active").toLowerCase() === "inactive"
    ).length;

    if (customerStatusChartInstance) {
        customerStatusChartInstance.destroy();
    }

    customerStatusChartInstance = new Chart(ctx, {
        type: "doughnut",

        data: {
            labels: ["Active Customers", "Inactive Customers"],

            datasets: [{
                data: [activeCount, inactiveCount],
                backgroundColor: ["#198754", "#dc3545"],
                borderWidth: 2
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


// EXPORT CUSTOMERS TO CSV

function exportCustomers(customers) {

    if (!customers || customers.length === 0) {
        alert("No customer records available to export.");
        return;
    }

    const headers = [
        "Customer Name",
        "Email Address",
        "Registration Date",
        "Account Status"
    ];

    const rows = customers.map(customer => {

        const registrationDate = customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString("en-IN")
            : "N/A";

        return [
            customer.name || "N/A",
            customer.email || "N/A",
            registrationDate,
            customer.status || "active"
        ];
    });

    const csvContent = [
        headers,
        ...rows
    ].map(row =>
        row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
    ).join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "Krushil_Customers.csv");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


// OPEN CHANGE ADMIN PASSWORD FORM
document.getElementById("changeAdminPasswordBtn").onclick = function () {

    document.getElementById("changeAdminPasswordForm").style.display = "block";

};

// CANCEL CHANGE ADMIN PASSWORD
document.getElementById("cancelAdminPasswordBtn").onclick = function () {

    document.getElementById("changeAdminPasswordForm").style.display = "none";

    document.getElementById("currentAdminPassword").value = "";
    document.getElementById("newAdminPassword").value = "";
    document.getElementById("confirmAdminPassword").value = "";

    document.getElementById("adminPasswordMessage").textContent = "";

};


// SAVE NEW ADMIN PASSWORD
document.getElementById("saveAdminPasswordBtn").onclick = async function () {

    const currentPassword =
        document.getElementById("currentAdminPassword").value;

    const newPassword =
        document.getElementById("newAdminPassword").value;

    const confirmPassword =
        document.getElementById("confirmAdminPassword").value;

    const message =
        document.getElementById("adminPasswordMessage");

    const token = sessionStorage.getItem("authToken");

    // CHECK EMPTY FIELDS
    if (!currentPassword || !newPassword || !confirmPassword) {
        message.textContent = "Please fill in all password fields.";
        message.style.color = "red";
        return;
    }

    // CHECK PASSWORD LENGTH
    if (newPassword.length < 8) {
        message.textContent = "New password must be at least 8 characters.";
        message.style.color = "red";
        return;
    }

    // CHECK PASSWORD MATCH
    if (newPassword !== confirmPassword) {
        message.textContent = "New Password and Confirm Password do not match.";
        message.style.color = "red";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/api/admin/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to change password.");
        }

        message.textContent = "Admin password changed successfully!";
        message.style.color = "green";

        document.getElementById("currentAdminPassword").value = "";
        document.getElementById("newAdminPassword").value = "";
        document.getElementById("confirmAdminPassword").value = "";

    } catch (error) {

        message.textContent = error.message;
        message.style.color = "red";

    }

};


// OPEN EDIT ADMIN PROFILE FORM

document.getElementById("editAdminProfileBtn").onclick = function () {

    document.getElementById("editAdminName").value =
        document.getElementById("adminName").textContent;

    document.getElementById("editAdminEmail").value =
        document.getElementById("adminEmail").textContent;

    document.getElementById("editAdminProfileForm").style.display = "block";

};


// CANCEL EDIT ADMIN PROFILE

document.getElementById("cancelAdminProfileBtn").onclick = function () {

    document.getElementById("editAdminProfileForm").style.display = "none";

    document.getElementById("adminProfileMessage").textContent = "";

};


// SAVE UPDATED ADMIN PROFILE

document.getElementById("saveAdminProfileBtn").onclick = async function () {

    const name = document.getElementById("editAdminName").value.trim();
    const email = document.getElementById("editAdminEmail").value.trim();

    const message = document.getElementById("adminProfileMessage");

    const token = sessionStorage.getItem("authToken");

    if (!name || !email) {
        message.textContent = "Please enter Admin Name and Email.";
        message.style.color = "red";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/api/admin/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                email: email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update profile.");
        }

        // UPDATE PROFILE DISPLAY
        document.getElementById("adminName").textContent = data.admin.name;
        document.getElementById("adminEmail").textContent = data.admin.email;
        document.getElementById("welcomeMessage").textContent =
            `Welcome, ${data.admin.name}`;

        message.textContent = "Admin profile updated successfully!";
        message.style.color = "green";

        document.getElementById("editAdminProfileForm").style.display = "none";

    } catch (error) {

        message.textContent = error.message;
        message.style.color = "red";

    }

};



// SHOW / HIDE PASSWORD
function togglePassword(inputId, icon) {

    const passwordInput = document.getElementById(inputId);

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {

        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }
}


// SIDEBAR MENU NAVIGATION

const sidebarLinks = document.querySelectorAll(".sidebar-link[data-section]");

const adminSections = document.querySelectorAll(".admin-section");

sidebarLinks.forEach(link => {

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const targetSection = this.getAttribute("data-section");
        // SHOW PASSWORD FORM WHEN PASSWORD SIDEBAR IS CLICKED
        if (targetSection === "passwordSection") {
            document.getElementById("changeAdminPasswordForm").style.display = "block";
        }

        // Hide all sections
        adminSections.forEach(section => {
            section.classList.remove("active");
        });

        // Show selected section
        document.getElementById(targetSection).classList.add("active");

        // Update active menu
        sidebarLinks.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});


// LOAD CUSTOMER ENQUIRIES
async function loadEnquiries(token) {

    const enquiryTableBody = document.getElementById("enquiriesTable");

    try {

        const response = await fetch(`${API_URL}/api/enquiries`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load enquiries.");
        }

        const enquiries = data.enquiries;

        if (!enquiries || enquiries.length === 0) {
            enquiryTableBody.innerHTML = `
                <tr>
                    <td colspan="8">No enquiries found.</td>
                </tr>
            `;
            return;
        }

        // DISPLAY ENQUIRIES
        enquiryTableBody.innerHTML = enquiries.map(enquiry => {

            const enquiryDate = enquiry.createdAt
                ? new Date(enquiry.createdAt).toLocaleDateString("en-IN")
                : "N/A";

            return `
                <tr>
                    <td>${enquiry.name || "N/A"}</td>
                    <td>${enquiry.email || "N/A"}</td>
                    <td>${enquiry.phone || "N/A"}</td>
                    <td>${enquiry.subject || "N/A"}</td>
                    <td>${enquiry.message || "N/A"}</td>
                    <td>${enquiryDate}</td>
                    <td>${enquiry.status || "new"}</td>
                    <td>Enquiry received</td>
                </tr>
            `;

        }).join("");

    } catch (error) {

        enquiryTableBody.innerHTML = `
            <tr>
                <td colspan="8">${error.message}</td>
            </tr>
        `;

    }
}





