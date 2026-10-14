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
});