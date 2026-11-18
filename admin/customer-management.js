
const API_URL = "https://krushil-auth-system-1.onrender.com";

// CHECK ADMIN LOGIN
const token = sessionStorage.getItem("authToken");
const savedUser = sessionStorage.getItem("loggedInUser");

if (!token || !savedUser) {
    window.location.href = "admin-login.html";
} else {
    try {
        const user = JSON.parse(savedUser);

        if (user.role !== "admin") {
            throw new Error("Admin access required.");
        }

        loadCustomers();

    } catch (error) {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "admin-login.html";
    }
}


// FETCH CUSTOMERS FROM BACKEND
async function loadCustomers() {
    const tableBody = document.getElementById("customerTableBody");
    const totalCustomers = document.getElementById("totalCustomers");
    const message = document.getElementById("customerMessage");

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

        totalCustomers.textContent = data.totalCustomers;

        displayCustomers(data.customers);
        allCustomers = data.customers || [];

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">${error.message}</td>
            </tr>
        `;

        message.textContent = "Please check your backend connection.";
        message.style.color = "red";
    }
}


// DISPLAY CUSTOMERS
function displayCustomers(customers) {
    const tableBody = document.getElementById("customerTableBody");

    tableBody.innerHTML = "";

    if (!customers || customers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">No customers registered yet.</td>
            </tr>
        `;
        return;
    }

    customers.forEach((customer, index) => {
        const row = document.createElement("tr");

        const values = [
            index + 1,
            customer.name || "",
            customer.email || "",
            customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString("en-IN")
                : "Not available"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}


// SEARCH CUSTOMERS
let allCustomers = [];

async function loadCustomersForSearch() {
    const response = await fetch(`${API_URL}/api/admin/customers`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (response.ok) {
        allCustomers = data.customers || [];
    }
}

const searchInput = document.getElementById("customerSearch");

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const searchText = this.value.toLowerCase();

        const filteredCustomers = allCustomers.filter(customer =>
            customer.name.toLowerCase().includes(searchText) ||
            customer.email.toLowerCase().includes(searchText)
        );

        displayCustomers(filteredCustomers);
    });
}


// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("loggedInUser");

        window.location.href = "admin-login.html";
    });
}

// Load customer data for search
loadCustomersForSearch();
