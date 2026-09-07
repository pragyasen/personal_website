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
npm install
npm run build    # fetches latest Medium posts → data/blog.json
npx serve .      # preview at http://localhost:3000
```

## Deployment

The site deploys automatically via GitHub Actions when you push to `main`. Medium posts are also refreshed daily by a scheduled workflow.

### First-time GitHub Pages setup

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Build and deployment**, set Source to **GitHub Actions**
4. Push to `main` and the workflow will build and deploy

Your site will be live at `https://pragyasen.github.io/personal_website/`

## Custom domain (optional)

Add a `CNAME` file with your domain and configure DNS in your domain registrar. See [GitHub Pages custom domains docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
