"use strict";

// EventsCalendar - Navbar Authentication

async function updateAuthNavbar() {
    const authNavBtn = document.getElementById("authNavBtn");

    if (!authNavBtn) {
        return;
    }

    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        if (data.user) {
            authNavBtn.textContent = "Log Out";
            authNavBtn.href = "#";

            authNavBtn.addEventListener("click", async function (event) {
                event.preventDefault();

                try {
                    const response = await fetch("/api/logout", {
                        method: "POST"
                    });

                    if (response.ok) {
                        window.location.href = "index.html";
                    } else {
                        alert("Unable to log out. Please try again.");
                    }
                } catch (error) {
                    console.error("Logout error:", error);
                }
            });
        }
    } catch (error) {
        console.error("Authentication check failed:", error);
    }
}

// Wait for the dynamically loaded navbar
const navbarObserver = new MutationObserver(function () {
    if (document.getElementById("authNavBtn")) {
        navbarObserver.disconnect();
        updateAuthNavbar();
    }
});

navbarObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Also check if the navbar is already loaded
if (document.getElementById("authNavBtn")) {
    navbarObserver.disconnect();
    updateAuthNavbar();
}