const cheerio = require('cheerio');
const { getDBConnection } = require('./db');

const URL = 'https://www.etown.edu/offices/registration-records/academic-calendar-2026-27.aspx';

async function syncAcademic() {
    const response = await fetch(URL);

    if (!response.ok) {
        throw new Error(`Failed to fetch calendar: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('Academic calendar tables found:', $('table').length);

    const academicEvents = [];

    $('table').each((tableIndex, table) => {
        let currentMonth = '';

        let year = tableIndex === 2 ? 2027 : 2026;

        $(table).find('tr').each((rowIndex, row) => {
            const cells = $(row)
                .find('th, td')
                .map((i, cell) =>
                    $(cell).text().trim().replace(/\s+/g, ' ')
                )
                .get();

            if (cells.length < 4) return;

            const [month, day, time, title] = cells;

            if (month) {
                currentMonth = month;

                if (tableIndex === 1 && currentMonth === 'January') {
                    year = 2027;
                }
            }

            if (!day || !title) return;

            academicEvents.push({
                month: currentMonth,
                day,
                year,
                time,
                title
            });
        });
    });

    console.log('\nTotal academic events:', academicEvents.length);

    console.log('\nFirst 5 events:');
    console.log(academicEvents.slice(0, 5));

    console.log('\nUnique day formats:');
    console.log(
        [...new Set(academicEvents.map(event => event.day))]
            .filter(day => !/^\d{1,2}$/.test(day))
    );
    console.log('\nMonths and years:');

    console.log(
        [...new Set(
            academicEvents.map(event => `${event.month} ${event.year}`)
        )]
    );
    const monthNumbers = {
        January: 1, February: 2, March: 3,
        April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9,
        October: 10, November: 11, December: 12
    };

    const formattedEvents = academicEvents.map(event => {
        const [startDay, endDay = startDay] = event.day.split('-').map(Number);
        const month = monthNumbers[event.month];

        const startDate = new Date(Date.UTC(event.year, month - 1, startDay));
        const endDate = new Date(Date.UTC(event.year, month - 1, endDay + 1));

        return {
            title: event.title,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            category: 'Academic'
        };
    });

    console.log('\nFirst 5 formatted events:');
    console.log(formattedEvents.slice(0, 5));
    
    const db = await getDBConnection();

    try {
        let imported = 0;
        let updated = 0;

        for (const event of formattedEvents) {
            if (!Number.isFinite(Date.parse(event.start))) {
                console.warn('Skipping invalid event:', event.title);
                continue;
            }

            const source = 'etown-academic';
            const sourceId = `${event.start}:${event.title}`;

            const existing = await db.get(
                `SELECT id FROM events
                WHERE source = ? AND source_event_id = ?`,
                [source, sourceId]
            );

            await db.run(
                `INSERT INTO events (
                    title, description, start_time, end_time,
                    location, category, source,
                    source_event_id, last_synced
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source, source_event_id)
                DO UPDATE SET
                    title = excluded.title,
                    start_time = excluded.start_time,
                    end_time = excluded.end_time,
                    last_synced = excluded.last_synced`,
                [
                    event.title,
                    '',
                    event.start,
                    event.end,
                    '',
                    'Academic',
                    source,
                    sourceId,
                    new Date().toISOString()
                ]
            );

            if (existing) updated++;
            else imported++;
        }

        console.log(
            `Academic events: Imported ${imported}, Updated ${updated}`
        );
    } finally {
        await db.close();
    }

}

syncAcademic().catch(console.error);

