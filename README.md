# friendzone.

A static, Tinder-inspired photo deck for your friend. Swipe right to save a favorite, left to pass. Supports touch/mouse gestures, arrow keys, undo, shuffle, and a liked count stored in the visitor's browser. The card layout is capped at 420px wide on desktop.

## Add pictures

Put images directly in `photos/`. JPG, PNG, WebP, AVIF, and GIF are supported. Filenames become captions, with hyphens and underscores replaced by spaces. The demo photos are replaced automatically when real images are present. No upload service, database, or account is needed.

## Local development

```sh
bun install
bun run dev
```

Open http://localhost:3000. Add photos and refresh to see them.

```sh
bun run check   # type checking, focused tests, and static build
bun run build   # produces dist/, ready for any static host
```

## GitHub Pages

Push this repo to GitHub. Under **Settings → Pages → Build and deployment**, choose **GitHub Actions**. The included workflow deploys `dist/` on pushes to `main`, or when manually triggered. Relative asset paths support both repository and custom-domain sites.

## Details

- No frontend dependencies or build bundler; HTML, CSS, and JavaScript run directly in the browser.
- Bun is used only for local serving, discovering images, tests, and copying the static output.
- Demo photos load from Unsplash. Real repo photos and all other assets are served locally by the site.
- Favorites are per browser and reference filenames. Renaming an image resets its saved favorite identity. Passing never deletes a previous like. Undo reverses the most recent action.
- No pictures are uploaded by the UI. On a public Pages site, committed images are publicly accessible.
