# Your friend's photos

Put JPG, JPEG, PNG, WebP, AVIF, or GIF images directly in this directory. Photos are discovered automatically by `bun run dev` and `bun run build`, in filename order. No manifest to maintain.

Filenames provide accessible image labels. The visible anime titles and blurbs are generated procedurally in the browser each time a card appears, so no captions need to be written. Demo photos disappear when this folder contains at least one supported image.

Prefer reasonably sized images (around 1200px on the long edge). Images are displayed as portrait cards with a center crop; the original files aren't modified.

Photos deployed to a public GitHub Pages site are public. Favorites are stored only in each visitor's browser.
