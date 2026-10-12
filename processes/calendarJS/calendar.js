// 
// 
// 

(function () {
    let calendarElm;

    const CATEGORY_COLORS = {
        "OSA Activities": "#1565c0",
        "Weekender": "#8e24aa",
        "Lectures": "#ef6c00",
        "Traditions": "#c62828",
        "Athletics": "#2e7d32"
    };

    window.addEventListener("load", init);

    function init() {
        $("#navbar").load("navbar.html");
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
            title: "Lax Game", start: "2026-10-15", category: "Athletics",
            extendedProps: {
                time: "3:00 PM",
                description: "Home game vs. State",
                picture: "images/test_pic.jpg"
            }
        },
        {
            title: "Movie Night", start: "2026-10-20", category: "Weekender",
            extendedProps: {
                time: "7:30 PM",
                description: "Back to the Future on the Dell",
                //picture: "images/lax.jpg"
            }
        },
        {
            title: "Cooking Demo", start: "2026-10-18", category: "OSA Activities",
            extendedProps: {
                time: "5:00 PM",
                description: "Vodka Penne Pasta",
                //picture: "images/lax.jpg"
            }
        },
        {
            title: "Swim meet", start: "2026-10-26", category: "Athletics",
            extendedProps: {
                time: "3:00 PM",
                description: "Home vs. Dickinson",
                //picture: "images/lax.jpg"
            }
        },
        {
            title: "Open Mic Night", start: "2026-10-15", category: "OSA Activities",
            extendedProps: {
                time: "8:00 PM",
                description: "Student performers in the Bowers lounge",
            }
        },
        {
            title: "Fall Festival", start: "2026-10-17", category: "Traditions",
            extendedProps: {
                time: "11:00 AM",
                description: "Food trucks, games, and live music on the quad",
            }
        },
        {
            title: "Women's Soccer", start: "2026-10-17", category: "Athletics",
            extendedProps: {
                time: "2:00 PM",
                description: "Home vs. Messiah",
            }
        },
        {
            title: "Chickies Rock Hike", start: "2026-10-18", category: "Weekender",
            extendedProps: {
                time: "9:00 AM",
                description: "Guided fall foliage hike, shuttle leaves from the Dell",
            }
        },
        {
            title: "Cybersecurity Careers Talk", start: "2026-10-21", category: "Lectures",
            extendedProps: {
                time: "4:00 PM",
                description: "Guest speaker from the industry, Q&A to follow",
            }
        },
        {
            title: "Pumpkin Carving", start: "2026-10-23", category: "OSA Activities",
            extendedProps: {
                time: "6:00 PM",
                description: "Supplies provided, prizes for best design",
            }
        },
        {
            title: "Field Hockey", start: "2026-10-24", category: "Athletics",
            extendedProps: {
                time: "12:00 PM",
                description: "Home vs. Albright",
            }
        },
        {
            title: "Haunted Hayride", start: "2026-10-24", category: "Weekender",
            extendedProps: {
                time: "8:00 PM",
                description: "Tickets at the student center, limited seating",
            }
        },
        {
            title: "Climate and Policy Lecture", start: "2026-10-27", category: "Lectures",
            extendedProps: {
                time: "7:00 PM",
                description: "Public lecture in the Gibble Auditorium",
            }
        },
        {
            title: "Halloween Costume Ball", start: "2026-10-30", category: "Traditions",
            extendedProps: {
                time: "9:00 PM",
                description: "Costume contest at 10:30, DJ all night",
            }
        },
        {
            title: "Civic Engagement Panel", start: "2026-11-03", category: "Lectures",
            extendedProps: {
                time: "6:00 PM",
                description: "Faculty and student panel on getting involved locally",
            }
        },
        {
            title: "Trivia Night", start: "2026-11-06", category: "OSA Activities",
            extendedProps: {
                time: "7:00 PM",
                description: "Teams of up to five, prizes for the top three",
            }
        },
        {
            title: "Apple Picking Trip", start: "2026-11-07", category: "Weekender",
            extendedProps: {
                time: "9:00 AM",
                description: "Van departs from the main lot, cider donuts included",
            }
        },
        {
            title: "Basketball Season Opener", start: "2026-11-07", category: "Athletics",
            extendedProps: {
                time: "1:00 PM",
                description: "Home opener, free student giveaway at the door",
            }
        },
        {
            title: "Founders' Day Convocation", start: "2026-11-12", category: "Traditions",
            extendedProps: {
                time: "11:00 AM",
                description: "Annual ceremony in the chapel",
            }
        }];

        applyCategoryColors(tempData);
        renderCalendar(tempData);
        renderUpcomingList(tempData);
        renderLegend();
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

    function applyCategoryColors(events) {
        events.forEach(function (e) {
            e.color = CATEGORY_COLORS[e.category] || "#3788d8";
        });
    }

    function renderLegend() {
        let legend = document.getElementById("legend");
        legend.innerHTML = "";

        Object.keys(CATEGORY_COLORS).forEach(function (name) {
            let row = document.createElement("div");
            row.className = "legend-item";

            let dot = document.createElement("span");
            dot.className = "legend-dot";
            dot.style.backgroundColor = CATEGORY_COLORS[name];

            let label = document.createElement("span");
            label.textContent = name;

            row.appendChild(dot);
            row.appendChild(label);
            legend.appendChild(row);
        });
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

    function renderUpcomingList(events) {
        let list = document.getElementById("upcomingList");
        list.innerHTML = "";

        let today = getTodayString();
        let upcoming = events
            .filter(function (e) { return e.start.slice(0, 10) >= today; })
            .sort(function (a, b) { return a.start.localeCompare(b.start); })
            .slice(0, 10);

        if (upcoming.length === 0) {
            list.textContent = "No upcoming events.";
            return;
        }

        let currentDate = "";
        upcoming.forEach(function (e) {
            let dateKey = e.start.slice(0, 10);

            // new date heading whenever the date changes
            if (dateKey !== currentDate) {
                currentDate = dateKey;
                let heading = document.createElement("div");
                heading.className = "upcoming-date";
                heading.textContent = formatHeading(dateKey);
                list.appendChild(heading);
            }

            let item = document.createElement("div");
            item.className = "upcoming-event";
            item.style.backgroundColor = e.color || "#3788d8";

            let title = document.createElement("div");
            title.className = "upcoming-event-title";
            title.textContent = e.title;

            let time = document.createElement("div");
            time.className = "upcoming-event-time";
            time.textContent = e.extendedProps.time;

            item.appendChild(title);
            item.appendChild(time);
            list.appendChild(item);
        });
    }


    function getTodayString() {
        let d = new Date();
        let month = String(d.getMonth() + 1).padStart(2, "0");
        let day = String(d.getDate()).padStart(2, "0");
        return d.getFullYear() + "-" + month + "-" + day;
    }

    function formatHeading(dateKey) {
        // adding T00:00:00 keeps the date in local time instead of shifting a day
        return new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "long", day: "numeric"
        });
    }
})();