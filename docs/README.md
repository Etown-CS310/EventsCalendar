# Events Calendar

## Description
Events at Etown is a website designed to be the central location for events happening on Elizabethtown College's campus. The goal is to make it easier for students, staff, and faculty to find campus events, including their dates, times, and locations.

The website allows users to browse upcoming events, search for specific events, view events on a calendar, and create new events.

## Technologies Used
- HTML, CSS, and JavaScript
- Bootstrap 5
- jQuery
- Node.js
- Express.js
- SQLite
- FullCalendar

## Run Locally

1. Clone or download the GitHub repository.
2. Open the `EventsCalendar` folder in VS Code.
3. Open a terminal in the project folder.
4. Install the required dependencies:

   `npm install`

5. Start the Express server:

   `node server.js`

6. Open the following URL in your browser:

   http://localhost:3000/index.html

**Note:** The Express server must be running for the website to retrieve and create events through the database.

## Summary of Implemented Features

### Login Page
- Email and password input fields
- Show/hide password button
- Error and success messages
- Navigation back to events

### Homepage
- Displays upcoming events retrieved from the SQLite database
- Event cards show event names, dates, times, and locations
- Navigation bar shared across pages
- Search functionality that directs users to the All Events page

### All Events Page
- Displays upcoming campus events from the database
- Search functionality using JavaScript
- Users can search by event name, description, location, or category
- Events are displayed in chronological order
- Event cards display the event name, date, time, and location

### Calendar Page
- Interactive calendar using FullCalendar
- Month navigation
- Events retrieved from the SQLite database
- Color-coded events based on category
- Event details