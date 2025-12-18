---
title: 'Git Commands & Repository Setup'
description: Git Commands & Website Setup
created: '2025-12-11'
status: 'seeds'
tags:
  - Git
  - Website
---


## Start
Create your repository in GitHub, name it "your-repo-name".

cd into the folder.

### To establish who is working on these files
```bash
git config --global user.name "your-name"
```

### posted with your commits
```bash
git config --global user.email "your-email"
```

### To set the color of git in CLI (optional)
```bash
git config --global color.ui auto
```

### To establish a local repository on your pc
```bash
git init
```

### Establish the remote repository
```bash
git remote add origin [https://github.com/your-username/your-repo-name.git]
```

### Add and commit
```bash
git add .
git commit -m "Your first meaningful commit message"
```

### Push to GitHub (use -u only on the first push)
```bash
git push -u origin main