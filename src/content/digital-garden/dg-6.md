---
title: 'Linux & ProxMox Commands'
description: Troubleshooting
publishDate: 'Dec 12 2025'
---

Create a new folder path in your project: .github/workflows/ (Note the dot at the start of .github)

    Create a new file inside that folder named deploy.yml.

    Paste this code into deploy.yml:



    YAML


    ---

name: Deploy to GitHub Pages

on:
  # Trigger the workflow every time you push to the `main` branch
  push:
    branches: [ main ]
  # Allows you to run this workflow manually from the Actions tab on GitHub.
  workflow_dispatch:

# Sets the permissions granted to the `GITHUB_TOKEN` for the actions in this job.
permissions:
  contents: read
  pages: write
  id-token: write

# Allow one concurrent deployment
concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3
        # with:
          # path: . # The root location of your Astro project inside the repository. (optional)
          # node-version: 20 # The specific version of Node that should be used to build your site. Defaults to 20. (optional)
          # package-manager: pnpm@latest # The Node package manager that should be used to install dependencies and build your site. Automatically detected based on your lockfile. (optional)

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4



---




        Push this new file to GitHub:
Bash

git add .
git commit -m "Add deploy workflow"
git push

Configure GitHub Settings:

    Go to your repository on GitHub.

    Click Settings (top tab).

    Click Pages (sidebar on the left).

    Under Build and deployment > Source, select GitHub Actions. (It might be set to "Deploy from a branch" by default).