# PulmoAI research website (R26-IT-065)

Academic information website for the research project
**Multi-Modal Pulmonary Disease Detection System**, Sri Lanka Institute of Information Technology.

It documents the research (literature survey, research gap, problem and solution, objectives,
methodology, technologies, milestones, downloads, team and contact). It is not a copy of the
PulmoAI product itself.

Plain HTML, CSS and JavaScript. No build step and no frameworks.

## Folder structure

```
index.html          the whole page
css/style.css       all styles (colours are at the top, in :root)
js/main.js          animations, menu, tabs, slider, milestones, image zoom, contact form
images/
  hero/             the four films in the hero
  c1/ c2/ c3/ c4/   figures for each component
  system/           platform screenshots
  team/             member and supervisor photos (480 x 480)
```

## Publish on GitHub Pages

1. Create a public repository, for example `pulmoai-research`.
2. Upload everything in this folder (keep the folder structure, `index.html` must be at the top).
3. Go to **Settings > Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<your-username>.github.io/pulmoai-research/`.

## Common updates

| What | Where |
|---|---|
| Google Drive links | `index.html`, section `DOWNLOADS`. Make sure each Drive folder is shared as "Anyone with the link can view". |
| Milestone dates | `index.html`, section `MILESTONES`. Each item has `data-end="YYYY-MM-DD"`. "Completed" and "Up next" are set automatically from today's date. |
| YouTube videos | `index.html`, section `VIDEOS`. Change `data-yt` (video ID) and `data-url`. |
| Results and numbers | `index.html`, the four component tabs inside `METHODOLOGY`. |
| Contact email | `index.html`, `data-email` on the contact form, plus the visible email links. |
| Colours | `css/style.css`, the `:root` block at the top. |

## Notes

- The contact form opens the visitor's email app with the message filled in (mailto). No server is needed.
- Videos load from YouTube only when the visitor presses play.
- Animations are turned off automatically for visitors who ask their device for reduced motion.
- Images are already resized and compressed. If you add new ones, keep them under about 300 KB each.
