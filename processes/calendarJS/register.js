
"use strict";

// EventsCalendar - Signup Page JavaScript
// Connects the signup form to the backend authentication API.

// Get HTML elements
const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const registerMessage = document.getElementById("registerMessage");
const registerBtn = document.getElementById("registerBtn");

// Show a message on the page
function showMessage(message, type) {
    registerMessage.textContent = message;

    registerMessage.className =
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

// Handle signup
registerForm.addEventListener("submit", async function (event) {

    // Prevent the page from refreshing
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Check for empty fields
    if (
        name === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        showMessage("Please fill in all fields.", "danger");
        return;
    }

    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showMessage("Please enter a valid email address.", "danger");
        return;
    }

    // Check password length
    if (password.length < 8) {
        showMessage(
            "Password must be at least 8 characters.",
            "danger"
        );
        return;
    }

    // Check that passwords match
    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "danger");
        return;
    }

    // Disable signup button while the request is processing
    registerBtn.disabled = true;
    registerBtn.textContent = "Creating account...";

    try {

        // Send signup information to the backend API
        const response = await fetch("/api/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        // Read the server response
        const data = await response.json();

        // Check if signup was unsuccessful
        if (!response.ok) {
            showMessage(
                data.error || data.message || "Unable to create account.",
                "danger"
            );

            registerBtn.disabled = false;
            registerBtn.textContent = "Create Account";
            return;
        }

        // Signup was successful
        showMessage(
            "Account created successfully! Redirecting to login...",
            "success"
        );

        // Redirect to login page
        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {

        console.error("Signup error:", error);

        showMessage(
            "Unable to create account. Please try again.",
            "danger"
        );

        registerBtn.disabled = false;
        registerBtn.textContent = "Create Account";
    }

});
