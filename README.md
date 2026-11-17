# Dominykasia

A static, Tinder-inspired photo deck for your friend. Swipe right to like a photo, left to pass. Supports touch/mouse gestures, arrow keys, and a liked count for the current visit. The deck automatically reshuffles and repeats after the last photo. Every load starts a newly shuffled deck; no progress or likes are stored between visits. The card layout is capped at 420px wide on desktop.

## Add pictures

Put images directly in `photos/`. JPG, PNG, WebP, AVIF, and GIF are supported. Each card gets a procedurally generated anime title and absurd lore blurb, with fresh text whenever it appears—even on repeat loops. The generator rotates through different narrative formats, avoids recent exact repeats, and uses distinct odd-sized word and template banks. This runs entirely in the browser, without an AI service. Filenames are used only as accessible photo labels, with hyphens and underscores replaced by spaces. The demo photos are replaced automatically when real images are present. No upload service, database, or account is needed.

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

## GitHub Pages and dominyk.asia

The intended address is **https://dominyk.asia**. `CNAME` records this domain in the repository and is copied into `dist/`. This project deploys with GitHub Actions, so GitHub ignores the `CNAME` file for domain routing: an administrator must also save the domain in repository settings.

1. Merge the app PR into `main` when ready to publish.
2. Open [repository Pages settings](https://github.com/Thomasvdam/dominykasia/settings/pages). Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Under **Custom domain**, enter `dominyk.asia` and click **Save**, before pointing DNS at GitHub.
4. At the domain's DNS provider, add these records. `@` means the root domain (`dominyk.asia`). Use the provider's default/automatic TTL.

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | thomasvdam.github.io |

The `www` record is optional; it lets GitHub redirect `www.dominyk.asia` to the canonical root domain. Replace conflicting parking or old hosting records for `@` and `www`; preserve unrelated records such as email MX/TXT records. Remove old `AAAA` records pointing to other hosts if present.

5. Wait for the DNS check and certificate issuance in Pages settings, then enable **Enforce HTTPS** when available. DNS propagation can take up to 24 hours.

The included workflow deploys `dist/` on pushes to `main`, or when manually triggered from the Actions tab. If Pages was enabled after the merge and the initial deployment failed, rerun the deployment workflow.

Reference: [GitHub's custom-domain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

The agent's current GitHub connection has repository **write** access but cannot administer Pages; an administrator must perform steps 2–3 and the HTTPS setting. No DNS records or live Pages settings have been changed by this implementation.

## Details

- No frontend dependencies or build bundler; HTML, CSS, and JavaScript run directly in the browser.
- Bun is used only for local serving, discovering images, tests, and copying the static output.
- Demo photos load from Unsplash. Real repo photos and all other assets are served locally by the site.
- Likes are kept in memory for the current visit, including across automatic repeats. Liking the same photo again counts it only once. Reloading resets the liked count.
- No pictures are uploaded by the UI. On a public Pages site, committed images are publicly accessible.
