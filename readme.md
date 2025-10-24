# Casino Society Website Base

## Overview
This is the foundational structure for the "Casino Society" website, an NFT project site built with HTML5, CSS3, and vanilla JavaScript. It's optimized for high traffic, performance, SEO, accessibility (WCAG 2.1 AA), and responsiveness across Desktop, Mobile, and Tablet. The theme features luxury casino elements with a color palette of #E6D39E (gold), #141414 (dark), and #C8102E (red), using Arial for body text and Playfair Display for headings, embodying the "No Crying in the Casino" ethos of stoicism and exclusivity.

**Updates**:
- Single-page layout (`index.html`) with Hero, About, Ethos, NFT Collections, Memes, Games (Solitaire), and FAQ sections.
- Added NFT gallery page (`NFTs/index.html`) with all collections.
- Removed `about.html`, `blog.html`, `contact.html`.
- Fixed mobile hamburger menu to show all nav links (About, Ethos, NFT Collections, Memes, FAQ).
- Removed sticky header.
- Updated About section with exact text.
- Updated NFT Collections: images/names only, centered "View Full NFT Gallery" button linking to `NFTs/`.
- Added social buttons under hero (X, Discord, NFTs), side-by-side on Desktop/Tablet, stacked on Mobile.
- Added Casino Cards NFT collection (`assets/casino_cards_nft_thumbnail.png`).
- Added memes carousel (10 placeholder images, 200x200px).
- Updated Games section with Solitaire (`assets/solitaire_game.png`, links to `Solitaire/`).
- Added collapsible FAQ section.
- Updated footer: “© 2025 Casino Society. All rights reserved. Send ourselves and each other higher. No Crying in the Casino.”
- Images in `assets/` folder (`casino_brand.png`, `b_garlinghouse.png`, `banner_collection_brand.png`, `casino_cards_nft_thumbnail.png`, `solitaire_game.png`).

## Setup Instructions
1. **Clone or Download**: Get files from [https://github.com/anthonyzNFT/casino_society_website](https://github.com/anthonyzNFT/casino_society_website).
2. **Add Images**:
   - Ensure `casino_brand.png`, `b_garlinghouse.png`, `banner_collection_brand.png`, `casino_cards_nft_thumbnail.png`, `solitaire_game.png`, `404-placeholder.webp`, `meme1.png` to `meme10.png` are in `assets/`.
   - Optimize to WebP for performance using [Squoosh](https://squoosh.app/).
   - Alternatively, upload to a CDN (e.g., Cloudinary) and update HTML with URLs.
3. **Serve Locally**: Use `live-server` (`npm install -g live-server`) to test.
4. **Dependencies**: No frameworks. Google Fonts linked for typography.
5. **Testing**: Verify on Desktop (1920px), Tablet (768px), Mobile (375px) using Chrome DevTools. Run Lighthouse audits.

## How to Customize
- **Images**: Replace meme placeholders (`assets/meme1.png` to `assets/meme10.png`) with actual files.
- **Content**: Add FAQ questions/answers or roadmap for credibility.
- **Theming**: Edit CSS variables in `:root` (e.g., `--gold`, `--red`).
- **Features**:
  - **API**: Add xrp.cafe API for live NFT stats (script.js placeholder).
  - **Analytics**: Add Google Analytics to HTML.
  - **Animations**: Enhance NFT/meme images with hover effects.
- **CSS**: Uses BEM naming for scalability.
- **JS**: Add carousel auto-slide or live stats.

## Deployment Tips
- **Hosting**: Current GitHub Pages [](https://anthonyznft.github.io/casino_society_website/). For better performance, use Vercel or Netlify.
  - **Vercel**: Connect repo, set root to project folder. Images at `https://yourdomain.com/assets/casino_brand.png`.
  - **Netlify**: Similar setup.
- **Performance**: Minify CSS/JS with cssnano/uglify-js. Enable HTTPS.
- **SEO**: Submit `sitemap.xml` to Google Search Console. Update meta tags with real image URLs.
- **Scalability**: Add backend (e.g., Node.js) for dynamic features. Use Cloudflare for caching.
- **Security**: Ensure HTTPS.

## Image Integration
- **Files**: `casino_brand.png`, `b_garlinghouse.png`, `banner_collection_brand.png`, `casino_cards_nft_thumbnail.png`, `solitaire_game.png`, `404-placeholder.webp`, `meme1.png` to `meme10.png` in `assets/`.
- **Upload**:
  ```bash
  git add assets/casino_brand.png assets/b_garlinghouse.png assets/banner_collection_brand.png assets/casino_cards_nft_thumbnail.png assets/solitaire_game.png
  git commit -m "Added hero, NFT, and Solitaire game images"
  git push origin main
