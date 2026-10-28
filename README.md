# Interview Tracker (PWA)

Track job opportunities, recruiter calls, interviews and follow-ups. Installable on your phone, works offline.

**How the data fits together**

```
Company ──< Job opportunity ──< Calls            (call log)
                  └──────────< Interviews         (interview history, one row per round)
```

## Files (all in the project root, flat)
| File | Purpose |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `config.js` | Supabase keys + your profile details |
| `supabase_schema.sql` | 4 tables (`companies`, `opportunities`, `calls`, `interviews`) with RLS. Safe to re-run |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA install + offline |
| `Rakesh_Roy_Python_Developer_5YOE.pdf` | Resume (keep in root; update `PROFILE.resume` in config.js if renamed) |

## Setup
1. **Supabase**: create a project, open SQL Editor, paste `supabase_schema.sql`, Run.
   **Upgrading an existing project?** Just run the new `supabase_schema.sql` again. It only adds `opportunities`, `calls` and `interviews.opportunity_id`; your data is untouched.
   (Authentication → Providers → Email: turn off "Confirm email" if you want instant sign-up for personal use.)
2. **config.js**: fill `SUPABASE_URL` and `SUPABASE_ANON_KEY` (Project Settings → API). The anon key is safe to publish because RLS limits rows to the signed-in owner.
   Leave both empty to try the app in local demo mode (data stays in the browser).
3. **Host over HTTPS** (needed for install, service worker and sharing the resume file). Easiest: GitHub Pages
   (new repo, push these files, Settings → Pages), or Netlify / Vercel drag-and-drop.
4. Open the URL on your phone → browser menu → **Add to Home screen / Install app**.
5. First launch: **Create account**, then sign in. Use the same account on every device.

## Using it
- **Jobs (new)**: one card per job opportunity (company + role + source + status: Lead / In process / On hold / Offer / Closed).
  Tap one to open its page:
  - **Log call**: direction, who you spoke with, duration, outcome, notes and a *call back / follow up* date. Overdue callbacks show in red and in the *Callbacks due* tile/filter.
  - **Interview history**: every round linked to the opportunity, in order, with status. **Interview** adds a new round with company and role pre-filled. Logging a call with outcome *Interview scheduled* opens that form automatically.
  - A *Lead* moves to *In process* on its first positive call or interview.
  - Existing interviews from before this update: open **Jobs** and tap **Link automatically** (groups them by company + role). You can also pick the opportunity in any interview's form.
  - Deleting an opportunity removes its calls but keeps its interviews (unlinked).
- **Interviews**: add company, role, round, date/time, status, follow-up date. Cards show Call / WhatsApp / Follow up.
- **Follow-up**: choose an interview and a situation (confirm, thank you, ask update, next round, reschedule, cancel, share resume, ask details, reminder). The message auto-fills from the interview and HR contact; edit, then Send mail / WhatsApp / Copy / Share resume PDF. A template is suggested from the status. Set the next follow-up date right there.
- **Contacts**: HR name, phone, email per company; tap to call or mail.
- **Share**: tick phone / email / portfolio / LinkedIn / resume link, then Copy, WhatsApp, Mail or system Share. "Share PDF" sends the actual resume file on phones that support file sharing.

## Maintaining
- Add or rename a status: edit `STATUS` in `app.js` and the `check` constraint in the SQL (instructions at the bottom of the schema file).
- Edit message wording in `TEMPLATES` in `app.js`.
- After changing files, bump `VERSION` in `sw.js` so installed apps refresh.
