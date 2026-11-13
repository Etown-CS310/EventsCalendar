
"use strict";

// EventsCalendar - Login Page JavaScript
// Connects the login form to the backend authentication API.

// Get HTML elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");
const loginBtn = document.getElementById("loginBtn");

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
loginForm.addEventListener("submit", async function (event) {

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

    // Disable login button while the request is processing
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        // Send login information to the backend API
        const response = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Read the server response
        const data = await response.json();

        // Check if login was unsuccessful
        if (!response.ok) {
            showMessage(
                data.error || data.message || "Incorrect email or password.",
                "danger"
            );

            loginBtn.disabled = false;
            loginBtn.textContent = "Log In";
            return;
        }

        // Login was successful
        showMessage("Login successful! Redirecting...", "success");

        // Redirect to EventsCalendar homepage
        setTimeout(function () {
            window.location.href = "index.html";
        }, 1200);

    } catch (error) {

        console.error("Login error:", error);

        showMessage(
            "Unable to log in. Please try again.",
            "danger"
        );

        loginBtn.disabled = false;
        loginBtn.textContent = "Log In";
    }

});
