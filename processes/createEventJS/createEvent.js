// Create Event form logic.
(function () {
    // TODO: swap for the real endpoint once the team's API routes are finalized.
    const API_URL = "../api/event.js";
    const MAX_PICTURE_BYTES = 2 * 1024 * 1024; // 2 MB
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

    let form;

    window.addEventListener("load", init);

    function init() {
        $("#navbar").load("navbar.html");
        form = document.getElementById("eventForm");
        form.addEventListener("submit", handleSubmit);
    }

    function validatePicture() {
        let input = document.getElementById("picture");
        let feedback = document.getElementById("pictureFeedback");
        input.setCustomValidity("");

        if (input.files.length === 0) return true; // optional

        let file = input.files[0];
        if (ALLOWED_TYPES.indexOf(file.type) === -1) {
            input.setCustomValidity("bad type");
            feedback.textContent = "Please choose a PNG, JPG, GIF or WebP image.";
        } else if (file.size > MAX_PICTURE_BYTES) {
            input.setCustomValidity("too big");
            feedback.textContent = "Image must be 2 MB or smaller.";
        }
        return input.validity.valid;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        hideAlert();

        validatePicture();
        form.classList.add("was-validated");
        if (!form.checkValidity()) return;

        let btn = document.getElementById("submitBtn");
        btn.disabled = true;

        try {
            // FormData sends text fields + the image file as multipart/form-data
            let response = await fetch(API_URL, {
                method: "POST",
                body: new FormData(form)
                // TODO (login): add credentials: "include" or an Authorization header here
            });

            if (!response.ok) {
                let data = await response.json().catch(function () { return {}; });
                throw new Error(data.error || "Server returned " + response.status);
            }

            showAlert("success", "Event submitted! Redirecting to the calendar...");
            form.reset();
            form.classList.remove("was-validated");
            setTimeout(function () { window.location.href = "calendar.html"; }, 1500);
        } catch (err) {
            showAlert("danger", "Could not submit event: " + err.message);
            btn.disabled = false;
        }
    }

    function showAlert(type, message) {
        let box = document.getElementById("formAlert");
        box.className = "alert alert-" + type;
        box.textContent = message;
    }

    function hideAlert() {
        document.getElementById("formAlert").className = "alert d-none";
    }
})();