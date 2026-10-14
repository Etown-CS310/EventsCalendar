document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("event-search");
    const eventCards = document.querySelectorAll(".event-card");

    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search");

    if (initialSearch) {
        searchInput.value = initialSearch;
    }

    function filterEvents() {
        const searchText = searchInput.value.toLowerCase().trim();

        eventCards.forEach(function (card) {
            const eventText = card.textContent.toLowerCase();
            card.style.display = eventText.includes(searchText) ? "" : "none";
        });
    }

    searchInput.addEventListener("input", filterEvents);

    filterEvents();
});