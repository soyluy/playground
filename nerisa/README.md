# Nerisa

JavaFX week planner built for a friend who works as a **DSP** (Demand Supply Planner).

Early / WIP: pick a date (or jump previous / this / next week) and see the ISO week number, year, and date range. Meant to grow into something more useful for weekly planning on the job.

## Current behavior

- Date picker with ← / → week navigation
- Presets: Previous week, This week, Next week
- Displays week number, week-based year, and start–end range (ISO weeks)

## Planned (rough)

- Attach notes / data to weeks for quick lookup
- Surface plan-affecting events (e.g. scraping or external calendars)

## Stack

Java 21 · JavaFX 21 · Maven

## Run

```bash
cd nerisa
mvn javafx:run
```

Main class: `soyluy.nerisa.App` (window title: "Nerisa - Week Planner").
