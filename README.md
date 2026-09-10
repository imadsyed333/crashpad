# CrashPad

Document a collision on this device. No account. No server.

CrashPad is an installable web app you can use at the scene: safety checklist, what happened, photos, the other vehicles, witnesses. After the first visit it works offline. Reports and media stay in the browser, encrypted, and never get sent anywhere unless you export them yourself.

Save your own car once so new reports start with that filled in. You can leave a draft and finish later. When you're done, download, print, or share a PDF.

## Privacy

Everything lives in this origin's IndexedDB (AES-GCM). GPS only runs if you tap for it. If you're online, those coordinates are sent to crashpad-locate to fill a nearby-place description; if that request fails, only the coordinates are kept on the device. There is no mapping SDK. Camera and files are the same: asked for when you use them, stored locally.

No analytics, no third-party scripts, no accounts.

A browser can still wipe site data. Private/incognito is gone when the session ends. iOS will sometimes evict unused PWAs. Install it and open it once in a while if you want reports to stick around.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Camera, location, and the service worker need HTTPS in a real install; `localhost` is fine for development.

`npm run build` also runs the storage and media self-checks.

Next.js, Zustand, Zod, Serwist.
