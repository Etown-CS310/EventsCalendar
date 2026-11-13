
const ical = require('node-ical');
const { getDBConnection } = require('./db');

async function syncEvents() {
    const sources = [
        {
            name: 'campus-connections',
            category: 'Arts & Culture',
            url: 'https://25livepub.collegenet.com/calendars/cultural-events.ics'
        },
        {
            name: 'etown-athletics',
            category: 'Athletics',
            url: 'https://etownbluejays.com/calendar.ashx/calendar.ics?sport_id=0'
        }
    ];

    const db = await getDBConnection();

    try {
        for (const sourceConfig of sources) {
            console.log(`Syncing ${sourceConfig.name}...`);

            try {
                const events = sourceConfig.url
                    ? await ical.async.fromURL(sourceConfig.url)
                    : await ical.async.parseFile(sourceConfig.file);

                let imported = 0;
                let updated = 0;

                for (const event of Object.values(events)) {
                    if (event.type !== 'VEVENT') continue;
                    if (!event.uid || !event.start) continue;

                    const title = (event.summary || 'Untitled Event')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#8220;/g, '“')
                        .replace(/&#8221;/g, '”');

                    const description = event.description || '';
                    const start = event.start.toISOString();
                    const end = event.end
                        ? event.end.toISOString()
                        : null;
                    const location = event.location || '';
                    const source = sourceConfig.name;
                    const sourceId = event.uid;

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
                            description = excluded.description,
                            start_time = excluded.start_time,
                            end_time = excluded.end_time,
                            location = excluded.location,
                            category = excluded.category,
                            last_synced = excluded.last_synced`,
                        [
                            title,
                            description,
                            start,
                            end,
                            location,
                            sourceConfig.category,
                            source,
                            sourceId,
                            new Date().toISOString()
                        ]
                    );

                    if (existing) {
                        updated++;
                    } else {
                        imported++;
                    }
                }

                console.log(
                    `${sourceConfig.name}: Imported ${imported}, Updated ${updated}`
                );

            } catch (error) {
                console.error(
                    `Failed to sync ${sourceConfig.name}:`,
                    error
                );
            }
        }
    } finally {
        await db.close();
    }
}

module.exports = { syncEvents };

if (require.main === module) {
    syncEvents().catch(console.error);
}
