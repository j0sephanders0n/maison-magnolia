# Maison Magnolia User Manual — Map Version

A simplified private guide designed to look like part of the Maison Magnolia website.

## Files

- `index.html` — complete manual
- `assets/css/manual.css` — layout and responsive styling
- `assets/js/manual.js` — active navigation
- `assets/img/` — Maison Magnolia, GitHub, Cloudflare, VS Code, YouTube, W3Schools, and homepage diagram assets
- `robots.txt` — blocks crawler access
- `_headers` — sends noindex and security headers on Cloudflare Pages

## Local preview

Install **Live Server** in VS Code, trust the folder, open `index.html`, then click **Go Live**.

You can also run:

```powershell
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## Recommended deployment

Use a separate GitHub repository and a separate Cloudflare Pages project.

Suggested private address:

```text
guide.maisonmagnolia.com
```

Do not add the guide to the public website navigation.

The included `noindex` rules discourage search indexing. For real privacy, protect the subdomain with **Cloudflare Access** and allow only approved email addresses.

## Video buttons

Each green play button currently opens a relevant YouTube search. Replace any `href` in `index.html` with the final tutorial or screen-recording URL when the custom videos are ready.


## HandBrake compression lesson

The media section now includes the saved `CORRECT FOR WEB WITH AUDIO` preset and all seven supplied screenshots. The guide uses it for direct WebM uploads to R2 and distinguishes those files from Cloudflare Stream uploads.


## Final homepage and HandBrake revisions

- The homepage lesson now contains the complete supplied homepage screenshot inside a scrollable window.
- Landing, Introduction, Explore, About, Collaborations, Experts, and Contact labels activate as the screenshot scrolls.
- Each label is clickable and jumps to its approximate position in the screenshot.
- The HandBrake lesson no longer assumes the preset already exists.
- Every setting from Summary, Dimensions, Filters, Video, Audio, Subtitles, and Chapters is written out.
- The seven supplied screenshots remain beside the written settings for visual confirmation.
- The guide explains how to save the finished setup as `CORRECT FOR WEB WITH AUDIO`.


## Revision summary

- Replaced the screenshot-based Homepage Map with a scrollable coded homepage structure.
- Added a link to the live Maison Magnolia homepage.
- Added matching color coding between the repository tree and file map.
- Added Git, GitHub Desktop, VS Code, and Live Server installation links.
- Added copyable Git commands for cloning, branching, committing, and pushing.
- Renamed Team Workflow to Workflow.
- Renamed Brand Pages + Credits to Brand Pages + Experts.
- Clarified the HandBrake/R2 instructions.
- Removed the private-subdomain maintenance card.
- Added an official Resources section for W3Schools, VS Code, Git, GitHub, Cloudflare, Live Server, and HandBrake.
- Changed the Internet lesson video to https://www.youtube.com/watch?v=RI9np1LWzqw.

- Reduced the main introduction heading size for a quieter, more editorial appearance.
