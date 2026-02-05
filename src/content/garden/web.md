---
title: 'Website Update'
description: Website Update
created: '2025-12-13'
status: 'seeds'
tags:
  - Github
  - Astro
  - Website
---

<p>
Thursday, February 05, 2026
I've deleted the page links and added a few things. Mostly done by AI, Antigravity and Claude Code.
I've started listening to "How to Take Smart Notes by:Sönke Ahrens". Sort of listening i should say. It's kinda boring. I will have to listen to it again. It definitely doesnt hold my attention like a fiction book does. I've also started researching my Symptons/Diagnosis, and the way the mind, nuerons, gut, food and medications work. I'll have to dig deeper into nicotine/smoking and the mind and medications further. I've also added a link to my personal digital garden in the favorites page. I'ts less organized and more personal. 
</p>

---

<p>Wednesday, December 17, 2025
Oh man, I went to codeberg with my site, contemplated going  to gitlab, but went to codeberg. I couldnt get my domain name to work with anything i did. Soooo,,, I'm back with github. The domain name is working and im setting everything up again.
</p>

---

<p>Sunday December 14, 2025
I've went from 11ty to Hugo to Jekyll to Astro. 11ty was probably the easiest to setup. Jekyll had works with Github and Astro.js I thought would be more fun because the sites looked more active. All given it is a static site generator, they all seem about the same. Different languages, different file systems but still an SSG.</p>

<p>11ty is supposed to not care about the file system as much. Astro.js only loads called for .js to make the site run faster. Jekyll has Github and Hugo has been around longer i think. I'm with Astro.js right now but the file system is large and confusing. I've been useing AI to help with building it. I'm kinda new to SSG's and a noob-like to GIT and Obsidian. Refreshing my knowledge i guess you could say.</p>

---

<p>Saturday, December 13, 2025
Okay, update. The domain names digi.yo and the other were handshake names. Dont know anything about them but they dont work in browsers. I returned them for this domain name abs-garden.com. It’s a little bit longer but its .com. Took forever. I guess the translators were down or something.</p>

---



<p>This is for Astro.js SSG
Create a new folder path in your project: .github/workflows/ (Note the dot at the start of .github)

Create a new file inside that folder named deploy.yml.

Paste this code into deploy.yml:</p>

```yaml
name: Deploy to GitHub Pages

on:
  # Trigger the workflow every time you push to the `main` branch
  push:
    branches: [main]
  # Allows you to run this workflow manually from the Actions tab on GitHub.
  workflow_dispatch:

# Sets the permissions granted to the `GITHUB_TOKEN` for the actions in this job.
permissions:
  contents: read
  pages: write
  id-token: write

# Allow one concurrent deployment
concurrency:
  group: 'pages'
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
```
