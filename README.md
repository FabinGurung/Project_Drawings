# Project Drawings — Governed AEC Project Hub

Shared public-safe project portal for multiple construction/AEC projects.

## Architecture

The repository now follows the same portal → subpage pattern used by the MSc Structural Engineering study system:

- `/index.html` — project registry / landing page
- `/projects/narayani-parajuli/` — Narayani Parajuli Residence
- `/projects/ramachandra-devkota/` — 14 One Storey House — Ramachandra Devkota
- `/data/projects.json` — public-safe project registry

Future projects should be added as sibling routes under `/projects/<project-slug>/` rather than creating separate repositories/sites unless a separate authority explicitly requires it.

## Authority model

Google Drive/A9 remains the engineering and project-data authority. GitHub is the public-safe view/publication layer and records website code plus publication history.

The repository must not expose private Drive identifiers, private source URLs, internal checkpoint/register links, or unapproved client/contact information. Approved Docs/Sheets may be linked later only after their access/publication classification explicitly permits publication.

## GitHub publication ledger

Each governed publication should record at minimum:

- source A9 project/event or release identifier
- candidate branch
- commit SHA and tree SHA
- tag
- GitHub Release
- deployment/Pages state
- public-safe manifest
- rollback target

A9 Local/Main libraries should preserve typed lineage between the project artifact and the GitHub publication event. GitHub is evidence of publication, not a replacement for the engineering authority.

## Current candidate

- Candidate branch: `project-hub-v0.1`
- Parent branch/commit: `narayani-pages-v0.2` / `8b306c27e77942d9f38adc6ad1b0d1dde2e2ac18`
- Purpose: convert the single-project Narayani staging bundle into a multi-project hub while preserving Narayani as a subpage and adding Ramachandra Devkota as the second project route.
- Publication state: candidate only until provider readback, A9 registration, tag/release, and deployment verification are complete.
