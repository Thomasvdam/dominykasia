# Your friend's photos

Put JPG, JPEG, PNG, WebP, AVIF, or GIF images directly in this directory. Photos are discovered automatically by `bun run dev` and `bun run build`, in filename order. No manifest to maintain.

Use descriptive filenames: `01-the-golden-hour-one.jpg` becomes “01 the golden hour one.” Avoid a numeric prefix if you don't want it in the caption. Demo photos disappear when this folder contains at least one supported image.

Prefer reasonably sized images (around 1200px on the long edge). Images are displayed as portrait cards with a center crop; the original files aren't modified.

Photos deployed to a public GitHub Pages site are public. Favorites are stored only in each visitor's browser.
