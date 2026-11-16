const API_URL = "https://krushil-auth-system-1.onrender.com";

fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: email,
        password: password
    })
})
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Login Error:", error);
    });