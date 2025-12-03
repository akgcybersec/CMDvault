# CMDvault

Personal command and notes vault for IT engineers built with **Next.js**, **TypeScript**, and **SQLite**.

## Demo

[![Watch the video](https://github.com/akgcybersec/CMDvault/blob/main/video/thumbnail.png)](https://github.com/akgcybersec/CMDvault/raw/refs/heads/main/video/MovieGithub.m4v)

The app has two main faces:

- **Vault** – where you quickly search, filter, and copy commands and notes.
- **Editor** – where you manage commands, tags, placeholders, placeholder sets, and notes.

---

## Features

- 🔐 **Login**
  - Simple username/password login (default: `admin` / `admin`). Change these via "profile page".
  - Client-side session flag + server-side credential check.

- 🧰 **Commands Vault**
  - Create, edit, delete commands.
  - Rich metadata: description, tags, optional multi-step commands with comments per step.
  - Real-time **search** across name, description, and command body.
  - **Tag filter**: click tags in the filter row to narrow both commands and notes.
  - **Hover expand** in compact mode: when *Expand view* is off, moving your cursor over a command smoothly expands it; leaving collapses it.
  - **Per-line copy**: each sub-command/step has a hover-only copy icon so you can copy a single line.
  - **Main copy**: compact icon in the title row copies the full (placeholder-resolved) command.

- 📝 **Notes**
  - Markdown-enabled notes with title + content.
  - Notes can be tagged using the same tag system as commands.
  - Global search covers note titles and content.
  - When *Expand view* is off, collapsed notes show only the title; when on, they show a short content snippet.

- 🏷️ **Tags**
  - Central tag library managed in the **Editor**.
  - Tags can be attached to both commands and notes.
  - Global tag filter at the top of the Vault filters commands and notes together.

- 🔄 **Placeholders & Sets**
  - Define placeholders (e.g. `target`, `ip`, `port`, `url`).
  - Define **placeholder sets** (e.g. `lab`, `prod`) and specify default values per placeholder.
  - Commands can reference placeholders using `{{placeholder_name}}` syntax.
  - In the Vault you can pick a placeholder set; commands preview and copy with those values substituted.

- 🌓 **UI / UX**
  - Dark, terminal-inspired UI.
  - Compact vs expanded view toggle for Vault.
  - Smooth animations on command expansion.
  - Clean Editor with tabbed navigation (Commands, Notes, Tags, Placeholders, Placeholder Sets).

---

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript, React client components where needed).
- **Database**: SQLite via `better-sqlite3` (single-file DB under `data/database.db`).
- **UI**: Tailwind CSS + custom components.

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended).

### Install dependencies

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Then open:

- `http://localhost:3000/login` – login screen.
- `http://localhost:3000/vault` – main vault (after login).

### Default credentials

- **Username**: `admin`
- **Password**: `admin`

> Change these for any real use.

---

## Usage Overview

### Vault

- Use the **search bar** to search commands and notes simultaneously.
- Use the **View** dropdown to toggle between Commands / Notes when you are not searching.
- Use the **tag filter row** to filter by tags (affects both commands and notes).
- Use the **Expand view** toggle:
  - Off (default): compact cards; commands expand on hover, notes show only titles.
  - On: commands and notes show more detail by default.

### Editor

Open the **Editor** from the Vault header.

- **Commands tab**
  - Add/edit/delete commands.
  - Assign multiple tags using pill-style selectors.
  - Toggle multi-step mode to break a command into steps, each with optional comments.

- **Notes tab**
  - Add/edit/delete Markdown notes.
  - Attach tags via pill-style selectors.

- **Tags tab**
  - Manage tag names used across commands and notes.

- **Placeholders / Placeholder Sets tabs**
  - Define placeholder names.
  - Create sets and default values for each placeholder.

---

## Data & Persistence

- SQLite database lives in the `data/` directory as `database.db`.
- Tables include users, commands, command_steps, notes, tags, command_tags, note_tags, placeholders, placeholder_sets, and placeholder_values.
- Back up `data/database.db` to preserve all commands, notes, tags, and configuration.

---

## Security Notes

- Change default credentials before using on any non-local environment.
- This project is designed primarily for **local use** by a single pentester or a small team.
- If exposing beyond localhost, ensure you:
  - Use HTTPS/behind a VPN or tunnel.
  - Protect the SQLite file and server.
  - Add proper authentication/session hardening as needed for your environment.

---

## License / Status

This project is a work-in-progress utility for personal pentesting workflows. Adapt it to your needs, extend the schema, or integrate it into your own tooling as desired.
