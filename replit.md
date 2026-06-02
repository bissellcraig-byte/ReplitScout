# Scout Content Studio

## Overview

Static marketing website for Scout Content Studio, built on the Spectral template
(HTML5 UP). Plain HTML/CSS/JS — no build step, no backend, no database.

## Project Structure

- `index.html` — Home (landing layout)
- `services.html` — Services
- `project-examples.html` — Project examples
- `work-with-us.html` — Work with us (project note form)
- `about.html` — Redirects to `index.html#one`
- `privacy.html` — Privacy policy
- `generic.html`, `elements.html` — Template reference pages
- `assets/` — CSS, JS, fonts, Sass sources
- `images/` — Site imagery

## Running Locally (Replit)

A lightweight Node static file server (`server.js`) serves the site.

- Workflow: `Start application` runs `npm start` (→ `node server.js`)
- Host/port: `0.0.0.0:5000`
- The server sends no-cache headers in development so the preview always reflects
  the latest files.

## Deployment

Configured as a **static** deployment with `publicDir: "."`. Replit serves the
HTML/CSS/JS files directly; `server.js` is only used for the dev workflow.

## User Preferences

(none recorded yet)
