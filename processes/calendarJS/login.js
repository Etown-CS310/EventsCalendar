
"use strict";

// EventsCalendar - Login Page JavaScript
// FRONT-END DEMONSTRATION ONLY
// This does not provide secure authentication.

// Demo account for testing
const demoEmail = "student@etown.edu";
const demoPassword = "Etown123!";

// Get HTML elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");

// Show a message on the page
function showMessage(message, type) {
    loginMessage.textContent = message;

    loginMessage.className =
        "alert alert-" + type;
}

// Show or hide password
togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "Hide";
        togglePassword.setAttribute("aria-label", "Hide password");
        togglePassword.setAttribute("aria-pressed", "true");
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "Show";
        togglePassword.setAttribute("aria-label", "Show password");
        togglePassword.setAttribute("aria-pressed", "false");
    }

});

// Handle login
loginForm.addEventListener("submit", function (event) {

    // Prevent the page from refreshing
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Check for empty fields
    if (email === "" || password === "") {
        showMessage("Please fill in all fields.", "danger");
        return;
    }

    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showMessage("Please enter a valid email address.", "danger");
        return;
    }

    // Check demo credentials
    if (email === demoEmail && password === demoPassword) {

        showMessage("Demo login successful! Redirecting...", "success");

        // Redirect to EventsCalendar homepage
        setTimeout(function () {
            window.location.href = "index.html";
        }, 1200);

    } else {
        showMessage("Incorrect demo email or password.", "danger");
    }

});
