# CrashPad

CrashPad is an installable web app drivers organize critical information after a vehicle collision. The goal is to increase the accuracy of self-reported data, driving (pun intended) more informed efforts to reduce vehicle collisions.

## Features

A collision report is a short sequence: safety checklist first, then what happened, photos and video, the other vehicles, witnesses, and a review before it saves. You can stash a draft mid-way and come back to edit later.

Your own vehicle lives on the home screen so you aren't retyping insurance and plate info every time. When you need something you can send, export the report as a PDF from the device.

It's a PWA, so you can install it. There's a dark theme as well.

NOTE: Currently, CrashPad is intended to be used in Ontario, Canada, with reverse-geocoding (offered by [crashpad-locate](https://github.com/imadsyed333/crashpad-locate)) working best in Toronto.

## Privacy

Everything lives in the device's IndexedDB (AES-GCM). GPS only runs if you tap for it. If you're online, those coordinates are sent to [crashpad-locate](https://github.com/imadsyed333/crashpad-locate) to fetch the nearest street intersection; if that request fails, only the coordinates are kept on the device. There is no mapping SDK. Camera and files are the same: asked for when you use them, stored locally.

No analytics, no third-party scripts, no accounts.

A browser can still wipe site data. Private/incognito is gone when the session ends. iOS will sometimes evict unused PWAs. Install it and open it once in a while if you want reports to stick around.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Camera, location, and the service worker need HTTPS in a real install; `localhost` is fine for development.

`npm run build` also runs the storage and media self-checks.

## Tech stack

- **Next.js** (App Router) and **React 19**
- **TypeScript**
- **Tailwind**
- **Zustand** for client state
- **Zod** for the forms
- **Serwist** for the service worker, so it can install and keep working offline
- **IndexedDB** + **Web Crypto** (AES-GCM) for encrypted storage
- Homemade PDF export — no extra library
- **Lucide** for icons
