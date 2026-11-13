
/**
 * Events at Etown - All Events Page
 * Loads events from SQLite through the Express API.
 * Supports live searching through the shared navbar.
 */

document.addEventListener("DOMContentLoaded", function () {
    const eventContainer = document.getElementById("event-list");

    let searchInput = null;
    let allEvents = [];

    if (!eventContainer) {
        console.error("Event list container not found.");
        return;
    }

    // Get search query from URL
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";

    // Load the shared navbar
    $("#navbar").load("navbar.html", function () {
        searchInput = document.querySelector("#navbar .search-bar input");

        if (searchInput) {
            searchInput.value = initialSearch;

            // Search as the user types
            searchInput.addEventListener("input", displayEvents);

            // Also support pressing Enter
            searchInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    displayEvents();
                }
            });
        }

        displayEvents();
    });

    // Retrieve events from Express API
    async function loadEvents() {
        eventContainer.textContent = "Loading events...";

        try {
            const response = await fetch("/api/events");

            if (!response.ok) {
                throw new Error("Unable to retrieve events.");
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid event data received.");
            }

            const now = new Date();

            // Keep only current and upcoming events
            allEvents = data.filter(function (event) {
                const eventDate = new Date(
                    event.end_time || event.start_time
                );

                return !isNaN(eventDate.getTime()) &&
                       eventDate >= now;
            });

            // Sort events from soonest to latest
            allEvents.sort(function (a, b) {
                return new Date(a.start_time) -
                       new Date(b.start_time);
            });

            displayEvents();

        } catch (error) {
            console.error("Error loading events:", error);

            eventContainer.textContent =
                "Unable to load events. Please try again later.";
        }
    }

    // Display events and apply search filter
    function displayEvents() {
        const searchText = (
            searchInput ? searchInput.value : initialSearch
        ).toLowerCase().trim();

        const filteredEvents = allEvents.filter(function (event) {
            const searchableText = [
                event.title,
                event.description,
                event.location,
                event.category
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchText);
        });

        // Clear existing cards
        eventContainer.innerHTML = "";

        if (filteredEvents.length === 0) {
            eventContainer.textContent = "No matching events found.";
            return;
        }

        filteredEvents.forEach(function (event) {
            // Create event card
            const card = document.createElement("div");
            card.className = "event-card";

            // Event title
            const title = document.createElement("h3");
            title.textContent = event.title || "Untitled Event";

            // Event date and time
            const date = document.createElement("p");
            const startDate = new Date(event.start_time);

            date.textContent = startDate.toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            });

            // Event location
            const location = document.createElement("p");
            location.textContent =
                event.location || "Location not specified";

            // Add elements to card
            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(location);

            // Add card to list
            eventContainer.appendChild(card);
        });
    }

    // Load database events when the page opens
    loadEvents();
});
