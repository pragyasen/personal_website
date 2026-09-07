# Pragya Sen | Personal Website

Portfolio site for [Pragya Sen](https://medium.com/@pragya_sen1), built with HTML/CSS/JS and deployed on GitHub Pages.

**Live site:** https://pragyasen.github.io/personal_website/

## Sections

- **Home**
- **Education** / **Experience** / **Skills**
- **Projects**
- **Blog**
- **Random**
  - **Dance**
  - **Music**
  - **Travel**
  - **Content**
- **Sky**
- **Contact**

## Content updates

- Featured blog posts: edit `data/blog.json` and add images under `assets/blog/`
- Dance reels: edit `data/dance.json` and add images under `assets/dance/`
- Music photos: add files under `assets/music/` and point to them from the Music tab in `index.html`
- Search snippet: edit the `<meta name="description">` tag in `index.html`

The Sky visit count is stored on [Abacus](https://abacus.jsn.cam), not in this repo. The page increments a public counter (`pragyasen-github-io` / `personal-website-sky`) once per browser tab session.

## Local development

```bash
npx serve .
```

Preview at http://localhost:3000.

## Deployment

The site deploys automatically via GitHub Actions when you push to `main`.

### First-time GitHub Pages setup

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Build and deployment**, set Source to **GitHub Actions**
4. Push to `main` and the workflow will build and deploy

Your site will be live at `https://pragyasen.github.io/personal_website/`

## Custom domain (optional)

Add a `CNAME` file with your domain and configure DNS in your domain registrar. See [GitHub Pages custom domains docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
