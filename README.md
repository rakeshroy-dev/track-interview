# Interview Tracker (PWA)

Track interviews, HR contacts and follow-ups. Installable on your phone, works offline.

## Files (all in the project root, flat)
| File | Purpose |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `config.js` | Supabase keys + your profile details |
| `supabase_schema.sql` | 2 tables (`companies`, `interviews`) with RLS |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA install + offline |
| `Rakesh_Roy_Python_Developer_5YOE.pdf` | Resume (keep in root; update `PROFILE.resume` in config.js if renamed) |

## Setup
1. **Supabase**: create a project, open SQL Editor, paste `supabase_schema.sql`, Run.
   (Authentication → Providers → Email: turn off "Confirm email" if you want instant sign-up for personal use.)
2. **config.js**: fill `SUPABASE_URL` and `SUPABASE_ANON_KEY` (Project Settings → API). The anon key is safe to publish because RLS limits rows to the signed-in owner.
   Leave both empty to try the app in local demo mode (data stays in the browser).
3. **Host over HTTPS** (needed for install, service worker and sharing the resume file). Easiest: GitHub Pages
   (new repo, push these files, Settings → Pages), or Netlify / Vercel drag-and-drop.
4. Open the URL on your phone → browser menu → **Add to Home screen / Install app**.
5. First launch: **Create account**, then sign in. Use the same account on every device.

## Using it
- **Interviews**: add company, role, round, date/time, status, follow-up date. Cards show Call / WhatsApp / Follow up.
- **Follow-up**: choose an interview and a situation (confirm, thank you, ask update, next round, reschedule, cancel, share resume, ask details, reminder). The message auto-fills from the interview and HR contact; edit, then Send mail / WhatsApp / Copy / Share resume PDF. A template is suggested from the status. Set the next follow-up date right there.
- **Contacts**: HR name, phone, email per company; tap to call or mail.
- **Share**: tick phone / email / portfolio / LinkedIn / resume link, then Copy, WhatsApp, Mail or system Share. "Share PDF" sends the actual resume file on phones that support file sharing.

## Maintaining
- Add or rename a status: edit `STATUS` in `app.js` and the `check` constraint in the SQL (instructions at the bottom of the schema file).
- Edit message wording in `TEMPLATES` in `app.js`.
- After changing files, bump `VERSION` in `sw.js` so installed apps refresh.
