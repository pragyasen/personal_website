# Pragya Sen | Personal Website

Portfolio site for [Pragya Sen](https://medium.com/@pragya_sen1), built with HTML/CSS/JS and deployed on GitHub Pages.

**Live site:** https://pragyasen.github.io/personal_website/

## Sections

- **Home**
- **Education**
- **Experience**
- **Skills**
- **Projects**
- **Blog**
- **Dance**

## Local development

```bash
npx serve .
```

Preview at http://localhost:3000.

To update featured blog or dance posts, edit `data/blog.json` or `data/dance.json` and add images under `assets/`.

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
