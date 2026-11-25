# Deploying the AI Video Studio website — GitHub, then Vercel

This guide takes the site from this folder to a live website, step by step.
No coding knowledge is needed. You need a GitHub account (Bobby already has
one: **Stevey3**). Vercel signs in with that same GitHub account, so there
is only one login to manage.

The plan: put the files on GitHub (Step 1–2), then connect Vercel to the
GitHub repository (Step 3) and Vercel puts the site live. GitHub Pages
(Step 4) is an optional free backup; you only need one of them live.

---

## What you are deploying

```
ai-video-studio/
├── index.html          Home (with two playable trailers)
├── portfolio.html      Portfolio (23 pieces, filterable, 13 playable films)
├── services.html       Services (8 service areas)
├── team.html           Team (Olaboboye Fasemire, Alex V., David V.)
├── contact.html        Order form (opens the visitor's email app)
├── styles.css          All design (black + gold)
├── script.js           Animations, 3D tilt, filter, lightbox
└── assets/             Images, plus videos/ (13 finished films)
                        and posters/ (a still frame for each film)
```

---

## Step 1 — Create the repository

1. Go to **https://github.com** and sign in as **Stevey3**.
2. Click the **+** at the top right, then **New repository**.
3. Repository name: `ai-video-studio` (or any name you like).
4. Set it to **Public**.
5. Tick **Add a README file** (optional, it does not affect the site).
6. Click **Create repository**.

## Step 2 — Upload the files

1. On the new repository page, click **Add file** → **Upload files**.
2. Select **all** the files and folders from the `ai-video-studio` folder
   on your computer: `index.html`, `portfolio.html`, `services.html`,
   `team.html`, `contact.html`, `styles.css`, `script.js`, and the whole
   `assets` folder.
   - Tip: drag the whole `ai-video-studio` folder contents (not the folder
     itself) into the upload area. The files must sit at the **top level**
     of the repository, not inside a subfolder.
3. Click **Commit changes**.

## Step 3 — Deploy on Vercel (the live site)

1. Go to **https://vercel.com** and click **Sign Up** or **Log In**.
2. Choose **Continue with GitHub** and approve with the **Stevey3** account.
3. On the Vercel dashboard, click **Add New…** → **Project**.
4. Find **ai-video-studio** in the list of GitHub repositories and click
   **Import**. (If Vercel asks for permission to see your repositories,
   approve it for this repository.)
5. Leave every setting as it is: no framework, no build command, root
   folder. This is a plain static site.
6. Click **Deploy**. In about a minute Vercel gives you a live address
   like **https://ai-video-studio.vercel.app**. That is the link to send
   to authors.
7. From now on, every time the GitHub repository changes, Vercel rebuilds
   and updates the live site automatically.

## Step 4 — (Optional backup) Turn on GitHub Pages

1. In the repository, click **Settings** (top menu).
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to `/ (root)`.
5. Click **Save**.

## Step 4b — Open your GitHub Pages backup

1. Wait about 1–2 minutes.
2. Refresh the Pages settings page. GitHub shows a green box:
   **"Your site is live at https://stevey3.github.io/ai-video-studio/"**
3. Open that link. Your backup copy is live.

---

## Step 5 — Updating the site later

1. Change a file on your computer (for example, add a new portfolio film
   and a new card in `portfolio.html`).
2. On GitHub, open the file, click the pencil icon, paste the new version,
   and **Commit changes**. Or upload the changed file again.
3. Vercel (and GitHub Pages, if enabled) update the live site
   automatically within a minute or two.

---

## Notes

- **Custom domain (optional, later):** if you buy a domain name, add it in
  Settings → Pages → Custom domain. The site works fine without one.
- **Prices:** the site deliberately lists no prices. Add them only when you
  decide them.
- **Contact form:** it opens the visitor's email app addressed to
  `contactmadelinemiller@gmail.com`. There is no server and nothing to
  maintain.
- **Images:** all portfolio images are original samples made for this site,
  plus one live project (the Heeresma storyboard). No Pinterest images were
  used.
- **Placeholders to fill in when ready:** David V.'s exact role on the Team
  page, and a studio name if you ever want one different from your own name.
