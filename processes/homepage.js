
window.addEventListener("load", function () {
    $("#navbar").load("navbar.html", function () {
        const searchInput = document.querySelector("#navbar .search-bar input");

        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                const searchText = searchInput.value.trim();

                window.location.href = "events.html?search=" + encodeURIComponent(searchText);
            }
        });
    });

    loadEvents();
});

async function loadEvents() {
    const eventList = document.getElementById("event-list");

    if (!eventList) return;

    eventList.textContent = "Loading events...";

    try {
        const response = await fetch("/api/events");

        if (!response.ok) {
            throw new Error("Failed to load events");
        }

        const events = await response.json();
        const now = new Date();

        const upcomingEvents = events
            .filter(event => new Date(event.end_time || event.start_time) >= now)
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
            .slice(0, 10);

        eventList.innerHTML = "";

        if (upcomingEvents.length === 0) {
            eventList.textContent = "No upcoming events found.";
            return;
        }

        upcomingEvents.forEach(event => {
            const card = document.createElement("div");
            card.className = "event-card";

            const title = document.createElement("h3");
            title.textContent = event.title;

            const date = document.createElement("p");
            date.textContent = new Date(event.start_time).toLocaleString();

            const location = document.createElement("p");
            location.textContent = event.location || "Location not specified";

            card.append(title, date, location);
            eventList.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        eventList.textContent = "Unable to load events.";
    }
}
