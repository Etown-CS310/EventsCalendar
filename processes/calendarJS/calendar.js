// 
// 
// 

(function () {
    let calendarElm;
    window.addEventListener("load", init);

    function init() {
        calendarElm = document.getElementById("calendar");

        let tempData = [{ title: "Lax Game", start: "2026-10-05" },
        { title: "Movie Night", start: "2026-10-06" },
        { title: "Movie Night", start: "2026-10-11" },
        { title: "Swim meet", start: "2026-10-10" }];
        renderCalendar(tempData);
    }

    function renderCalendar(events) {
        let calendar = new FullCalendar.Calendar(calendarElm, {
            initialView: "dayGridMonth",
            events: events
        });
        calendar.render();
    }




})();