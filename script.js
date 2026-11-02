
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

