// 
// 
// 

(function () {
    let calendarElm;
    window.addEventListener("load", init);

    function init() {
        calendarElm = document.getElementById("calendar");

        //Card close listeners
        document.getElementById("eventCardClose").addEventListener("click", closeEventCard);

        document.addEventListener("click", function (e) {
            let card = document.getElementById("eventCard");
            if (!card.contains(e.target)) {
                closeEventCard();
            }
        });

        let tempData = [{
            title: "Lax Game", start: "2026-10-05",
            extendedProps: {
                time: "3:00 PM",
                description: "Home game vs. State",
                picture: "images/test_pic.jpg"
            }
        },
        {
            title: "Movie Night", start: "2026-10-06",
            extendedProps: {
                time: "7:30 PM",
                description: "Back to the Future on the Dell",
                //picture: "images/lax.jpg"
            }
        },
        {
            title: "Cooking Demo", start: "2026-10-11",
            extendedProps: {
                time: "5:00 PM",
                description: "Vodka Penne Pasta",
                //picture: "images/lax.jpg"
            }
        },
        {
            title: "Swim meet", start: "2026-10-10",
            extendedProps: {
                time: "3:00 PM",
                description: "Home vs. Dickinson",
                //picture: "images/lax.jpg"
            }
        }];
        renderCalendar(tempData);
    }

    function renderCalendar(events) {
        let calendar = new FullCalendar.Calendar(calendarElm, {
            initialView: "dayGridMonth",
            events: events,
            eventClick: showEventCard,
            eventMouseEnter: handleEventHover,
            eventMouseLeave: handleEventUnhover
        });
        calendar.render();
    }



    // Card code
    function showEventCard(info) {
        document.getElementById("cardTitle").textContent = info.event.title;
        document.getElementById("cardDate").textContent = "Date: " + info.event.startStr;
        document.getElementById("cardTime").textContent = "Time: " + info.event.extendedProps.time;
        document.getElementById("cardDesc").textContent = "Description: " + info.event.extendedProps.description;

        let picEl = document.getElementById("cardPic");
        if (info.event.extendedProps.picture) {
            picEl.src = info.event.extendedProps.picture;
            picEl.style.display = "block";
        } else {
            picEl.style.display = "none";
        }

        let card = document.getElementById("eventCard");
        let cardWidth = 280;
        let clickX = info.jsEvent.pageX;
        let clickY = info.jsEvent.pageY;

        // flip to the left side if it would run off the right edge of the screen
        if (clickX + cardWidth > window.innerWidth) {
            card.style.left = (clickX - cardWidth) + "px";
        } else {
            card.style.left = clickX + "px";
        }
        card.style.top = clickY + "px";

        card.style.display = "block";

        // stop this same click from immediately triggering the document listener below
        info.jsEvent.stopPropagation();
    }

    function closeEventCard() {
        document.getElementById("eventCard").style.display = "none";
    }

    //Hover functions
    function handleEventHover(info) {
        info.el.classList.add("event-hover");
    }

    function handleEventUnhover(info) {
        info.el.classList.remove("event-hover");
    }
})();