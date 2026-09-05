# Narayani Modular Drawing Atlas v0.3 — DEVELOPMENT

This branch/package is the modular successor to the verified v0.2 GitHub Pages status publication.

## Safety and authority
- Production v0.2 remains untouched until explicit promotion.
- Private Google Drive identifiers/links are excluded from this public payload.
- Engineering states are preserved; website rendering does not create new engineering approval.
- M80 remains CODAL_NOT_VERIFIED / HOLD / user-deferred.

## Modular rule
The root `index.html` calls `data/navigation.json` and loads each work package as an independent module. Each stage has separate `index.html`, `stage.css`, `stage.js`, `stage-data.json`, and `meta.json`.

## Source lineage
Exact private source Drive IDs are retained only in the governed Drive-side INTERNAL_LINEAGE control record and are deliberately not published. Public `meta.json` files retain source artifact names and SHA-256 hashes for byte-level provenance without exposing private Drive routes.

## Promotion
Do not change the GitHub Pages source from `narayani-pages-v0.2:/` until this development branch has passed remote tree/file verification, functional QA, public-safety scan, and explicit promotion authorization.
