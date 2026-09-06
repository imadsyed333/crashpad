# CrashLog Next.js PWA Plan

A plan to ship a **new** Next.js progressive web app that copies CrashLog: same product, same guided flow, same privacy promise, fully usable offline.

This is a **sibling app**, not a rewrite of the Expo project. Keep the native app. Copy the portable pieces (types, schemas, store shapes, screen flow, theme tokens). Do not share a monorepo or package until something actually needs to stay in sync.

---

## 1. What CrashLog is today

CrashLog is an Expo / React Native app that helps a driver document a collision on-device, without an account or a server.

**Privacy promise (must hold on the web):**

- All form data stays on the user's device.
- Location is fetched only after an explicit permission prompt, via the device GPS — no third-party location SDK.
- Photos / videos are added only after camera or library permission, and stay on-device.

**Security model today:**

- A random encryption key is created with `expo-crypto` and stored in `expo-secure-store` (OS keychain / keystore).
- Zustand persisted state (collisions, saved vehicle, theme) lives in an MMKV instance encrypted with that key (`lib/storage.ts`).
- No backend, no analytics of form data, no cloud sync.
- `expo-secure-store` is configured with Face ID wording, but the app does not currently lock itself behind biometrics.

**Feature set to copy:**

| Area | Behavior |
| --- | --- |
| Home | "My Vehicle" + "My Collisions" + FAB to start a report |
| Saved vehicle | CRUD one personal vehicle + driver; new reports pre-fill it |
| Safety screen | 911 / checklist gate before documenting |
| Details | Location text, optional GPS + reverse geocode, description, date/time |
| Media | Camera or library; images and videos; video thumbnails; view / delete |
| Vehicles | List, add/edit, per-vehicle driver dialog, vehicle drafts |
| Witnesses | List + dialog (name, phone, address) |
| Review | Full summary, block submit if draft vehicles remain, persist |
| Drafts | Save collision mid-wizard with `savePoint`; resume from that route |
| View / edit | Detail page, section edit (`?mode=edit`), delete with confirm |
| PDF | HTML report via print/share |
| Theme | Light / dark, persisted |
| Validation | Zod schemas + `validator.isMobilePhone`; Ontario-style license / phone masks |
| Empty states | No vehicle, no collisions, collision-not-found |

**Data model** (`lib/types.ts`): `Collision` (date, location + optional coords, description, vehicles, media, witnesses, `officer: Officer \| null`), `Vehicle` + optional `Driver`, `Witness`, `Media` (`image` \| `video` + optional `thumbnailUri`). Drafts add `savePoint`.

`officer` is on the type and in the PDF template, but there is **no officer UI**. Carry the field so the PDF stays compatible; do not add officer forms unless we decide to later.

**Wizard order (create):**

1. Safety → 2. Details → 3. Media → 4. Vehicles → 5. Witnesses → 6. Review → home

Edit jumps into a single step and returns to review.

---

## 2. Why a separate Next.js PWA

The native app is already offline-first. A PWA is for install-from-browser, desktop, and phones that will not install from a store.

Do **not** turn the Expo app into a web export. Expo web cannot match the security and offline bar we need (encrypted storage, service worker control, media persistence). A dedicated Next.js app is the smaller, clearer path.

---

## 3. Target architecture (smallest thing that works)

**Stack**

- Next.js (App Router) + TypeScript
- Client-only app: no auth, no API routes for collision data
- Zustand + persist (same store API as today)
- Zod + the same schemas / validators
- CSS variables copied from `lib/themes.ts` — no UI kit unless the first screen proves we need one
- Serwist (Workbox for Next) for the service worker
- Web Crypto (`AES-GCM`) + IndexedDB for encrypted persistence
- Web APIs for camera, files, geolocation, share/print

**App shape**

```
crashlog-web/
  app/
    layout.tsx              # hydrate secure storage, theme, SW registration
    page.tsx                # home
    vehicle/page.tsx
    collisions/
      [id]/page.tsx
      form/
        safety/page.tsx
        details/page.tsx
        media/page.tsx
        vehicles/page.tsx
        vehicle/page.tsx
        witnesses/page.tsx
        review/page.tsx
    manifest.ts
    sw.ts                   # Serwist worker
  lib/                      # types, schemas, validators, storage, pdf, media
  store/                    # collision, vehicle, form, theme — same names
  components/               # ported UI, web primitives
```

**Routing:** keep the current step names and `mode=edit` query so draft `savePoint` values stay simple (`/collisions/form/details`, etc.).

**Rendering:** every product page is a Client Component. Use `output: "export"` (or Serwist's static-friendly App Router setup) so the service worker can precache **every** route. If a feature later needs a server, add one route then — not now.

**Reuse from this repo (copy, don't import):**

- `lib/types.ts`, `lib/schemas.ts`, `lib/validators.ts`
- Zustand store interfaces and mutations
- Theme color tokens
- PDF HTML in `lib/utils.ts` (escape user text first — see §7)
- Screen copy (safety checklist, empty states, labels)

Replace every Expo / RN module with a web equivalent. Do not wrap React Native Web.

---

## 4. Offline: "fully usable" definition

The app is fully usable offline when a user who has **opened it once on a network** can, with the network off:

1. Launch it (homescreen or browser, last-used origin).
2. Read, edit, delete collisions and the saved vehicle.
3. Start a new report, including drafts, and finish it.
4. Attach photos/videos from the device (camera / file picker).
5. Capture GPS coordinates if the OS will provide them without a network.
6. Export or print a PDF of a report.
7. Keep light/dark theme.

**Allowed to require a network (same as native, just more visible):**

- First visit / install (must download the app shell).
- Reverse-geocoding a street address from coordinates. Native `expo-location` reverse geocode is not a guaranteed offline API either. Offline: keep coords + the user's typed description (description is already the required field). When online, optionally fill the description from `navigator.geolocation` + a **first-party or browser** geocoder — never a third-party location SDK, to match the privacy policy.

**What we cache**

| What | Where | Strategy |
| --- | --- | --- |
| HTML, JS, CSS, fonts, icons, manifest | Cache Storage | Precache on install; cache-first |
| App navigations | Service worker | Navigate fallback → cached `/` or the requested page |
| Collisions, vehicle, theme | Encrypted IndexedDB | Always local |
| Photos / videos / thumbnails | Encrypted IndexedDB (blobs) | Write **into IDB on attach**; never depend on ephemeral `blob:` URLs |

**Media persistence (easy to get wrong):** `<input type="file">` and `URL.createObjectURL` URLs die on refresh. On attach, read the file into an `ArrayBuffer`, store it under the media `id`, and serve it later via `URL.createObjectURL` from the stored blob (revoke on unmount). Video thumbnails: draw frame 0 onto a `<canvas>` and store that blob too. If the browser blocks canvas capture, show a play-icon placeholder (native already allows missing `thumbnailUri`).

**Installability**

- Web app manifest: `standalone`, name CrashLog, theme colors, maskable icons (192 / 512).
- `start_url: "/"`, `scope: "/"`.
- iOS: `apple-mobile-web-app-capable`, apple touch icon. Document that iOS Safari can evict unused site data — see §8.

**No background sync, no push.** There is nothing to sync.

---

## 5. Feature-for-feature web mapping

| Native | Web |
| --- | --- |
| Expo Router screens | App Router pages |
| `expo-secure-store` + encrypted MMKV | Web Crypto AES-GCM + IndexedDB; key wrap in §6 |
| Zustand persist + `skipHydration` | Same; gate UI until storage unlocks / hydrates |
| `expo-location` | `navigator.geolocation.getCurrentPosition` after a user gesture; permission denied → same alert copy |
| Reverse geocode | Optional, online-only; never block the form |
| `expo-image-picker` camera | `<input capture>` and/or `getUserMedia` + a tiny capture UI |
| `expo-image-picker` library | `<input type="file" accept="image/*,video/*" multiple>` |
| `expo-video-thumbnails` | Canvas frame grab |
| `expo-print` + `expo-sharing` | Existing HTML → `window.print()` and/or `jspdf` / browser PDF; `navigator.share` when available |
| Date/time pickers | `<input type="datetime-local">` or two native date/time inputs |
| `react-native-mask-text` | One small mask helper (license `A9999-99999-99999`, phone `(999) 999-9999`) |
| Paper FAB / dialogs / cards | HTML + the existing color tokens |
| Swipe / hardware back | Browser back + explicit header back; honor `savePoint` the same way `ScreenContainer` honors `backHref` |
| `uuid` / nanoid | `crypto.randomUUID()` |

**Permissions UX:** request only on the button press (location pin, Camera, Library). Explain why in the same sentences the native app uses. If denied, the rest of the form still works.

**PDF:** keep the current HTML template. Escape every interpolated field (description, names, etc.) so a collision note cannot break out of the HTML. Media stays referenced, not embedded, unless embedding proves cheap later.

---

## 6. Security: match CrashLog as closely as a browser allows

Native CrashLog encrypts at rest so other apps and casual filesystem reads cannot see collision data. The web threat model is different (same-origin is the boundary; XSS is game over). Aim for the same **user-facing guarantees**, and be honest where the platform is weaker.

### 6.1 Non-negotiable product rules

- No accounts, no server storage, no crash-report telemetry that includes form data.
- No third-party location, analytics, or font CDNs in the product path. Self-host fonts.
- HTTPS only (required for SW, geolocation, camera, crypto).
- Data never leaves the origin except when the user exports / prints / shares.

### 6.2 Encrypted storage (the MMKV equivalent)

On first run:

1. `crypto.subtle.generateKey` — AES-GCM 256, extractable only long enough to wrap.
2. Wrap that data key (see unlock, below).
3. Persist ciphertext records in IndexedDB (`crashlog-storage`). Same logical keys as today: `collision-storage`, `vehicle-storage`, `theme-preference`.
4. Zustand `createJSONStorage` talks only to this adapter. UI waits on hydrate (same as `_layout.tsx`).

Media blobs are encrypted the same way (chunked AES-GCM), or stored as separate ciphertext records keyed by media id. Do not put plaintext images in Cache Storage.

**Unlock / key wrap** (pick the first that holds):

1. **Device-bound, no extra UX (closest to current CrashLog):** generate the data key, wrap it with a non-extractable wrapping key stored in IndexedDB. This is origin isolation + encryption-at-rest against casual export of IDB dumps. It does **not** survive XSS and is weaker than OS keychain. Acceptable as v1 if we also ship a tight CSP.
2. **Optional PIN / passcode (stronger, more CrashLog-like for theft of an unlocked laptop):** wrap the data key with a key derived via PBKDF2 or Argon2id from a user PIN. Unlock screen on launch. Mark the KDF iteration count as something we can raise later.
3. **WebAuthn (closest to the unused Face ID config):** unlock with platform biometrics / passkey; use the PRF extension where available to wrap the data key. Add this only if PIN unlock feels worse than the native "just open the app" UX.

Recommendation: **ship (1) + CSP for v1**, design the storage API so (2) can drop in without a data migration story that we have not written. If we add (2), encrypt-then-migrate existing records once.

### 6.3 XSS is the real web risk

Encrypted IDB is useless if a script on the origin can call `decrypt()`. Treat XSS as data loss.

- Strict Content-Security-Policy: default-src `'self'`; script-src `'self'` (no `'unsafe-inline'` — Next must be configured for nonces or hashes); object-src `'none'`; base-uri `'none'`; form-action `'self'`; frame-ancestors `'none'`.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` allowing only `camera`, `microphone`, `geolocation` on self.
- Zero third-party scripts.
- Sanitize / escape anything that becomes HTML (PDF).
- Do not use `dangerouslySetInnerHTML` in the app UI.

These headers require a host that can set them (or a tiny `_headers` / middleware file). A GitHub Pages dump with no headers is not "the same security."

### 6.4 Other web-specific controls

- Storage is origin-scoped. Do not put the app on a shared origin with other products.
- Do not enable iCloud / Chrome profile sync of site data if we can document "turn off sync for this site" — we cannot disable it ourselves. Mention it in the privacy text.
- Clear-site-data is a user choice; provide a single "Delete all CrashLog data" action that wipes IDB + Cache Storage + the wrapping key.
- File inputs: accept only image/video MIME types; enforce a sane size cap per file (e.g. 50 MB) so a huge video cannot silently brick IDB.

### 6.5 Honest gaps vs native

| Native | Web |
| --- | --- |
| Hardware-backed SecureStore | No equivalent on all browsers; IDB keys are software |
| Other apps cannot read the DB | Other *sites* cannot; extensions and XSS can |
| OS backup rules via SecureStore plugin | Browser backup / profile sync is outside our control |
| Face ID plugin (unused) | WebAuthn is the analogue, not shipped in v1 |
| iOS/Android permission sheets | Browser permission prompts; can be sticky-denied |
| App Store install | Add to Home Screen; iOS storage eviction (see §8) |

The privacy policy for the PWA should say "encrypted storage in this browser, on this device" — not "native secure storage."

---

## 7. Implementation phases

Do not start UI chrome before storage and the service worker exist. An offline app with a pretty form that loses photos on refresh is not CrashLog.

### Phase 0 — Scaffold

- Create `crashlog-web` next to this repo (`create-next-app`, TypeScript, App Router, no auth starter).
- Add Serwist, web manifest, icons, theme CSS variables from `lib/themes.ts`.
- Copy types, schemas, validators.
- Confirm: first load online, reload offline, homescreen icon opens `/`.

### Phase 1 — Secure storage + stores

- Implement `initializeSecureStorage` / `getSecureStorage` / Zustand `StateStorage` against encrypted IDB.
- Port `collisionStore`, `vehicleStore`, `themeStore` (persist + `skipHydration`) and the in-memory form stores.
- Hydrate in the root layout; show a short splash until ready (do not render `null` forever on failure — show a recover/delete-data path).
- One self-check: write a collision, reload, assert it decrypts. Fail the build or a `node`/`vitest` script if the adapter round-trip breaks.

### Phase 2 — Screens (feature parity)

Port in wizard order, matching copy and validation:

1. Home (vehicle card, collision list, empty states, FAB, theme toggle)
2. My Vehicle + driver dialog
3. Safety
4. Details + date/time + location button
5. Media grid + capture/library + viewer
6. Vehicle list/form + vehicle drafts
7. Witnesses
8. Review (draft-vehicle guard) + view + edit + delete
9. Collision drafts + `savePoint` resume

Keep confirm dialogs for delete / draft-saved. Block submit while `"savePoint" in vehicle`.

### Phase 3 — Device APIs

- Geolocation + optional online reverse geocode.
- Camera / library + IDB blob storage + thumbnails.
- PDF generate + print / share.
- Masked license and phone inputs.

### Phase 4 — Offline hardening

- Precache all routes and static assets.
- Offline navigation smoke test for every page in §3.
- Kill remaining network: no Google Fonts, no analytics, no uncached dynamic import on the critical path.
- Media still visible after airplane-mode relaunch.

### Phase 5 — Security hardening

- CSP + the other headers on the real host.
- HTML-escape the PDF template.
- Delete-all-data control.
- File type/size guards.
- Privacy policy page that restates the web storage model (required if we ship publicly).

### Phase 6 — Install UX + polish

- "Install CrashLog" hint when `beforeinstallprompt` fires; iOS share-sheet instructions when it does not.
- Accessible labels on location / camera / delete (native already has some `accessibilityLabel`s).
- Mobile and desktop layouts: the native app is phone-first; the PWA should stay usable on a narrow viewport first, then a readable desktop column. Do not redesign.

---

## 8. Platform ceilings (do not pretend otherwise)

Mark these in code with a `ponytail:` comment if we cut the corner:

- **iOS PWA storage eviction.** Unused PWAs can lose IndexedDB. Mitigation: open-often copy, optional user backup later (encrypted file export). Do not build cloud backup in v1.
- **Private / incognito.** Storage dies when the session ends. Detect if we can; warn if we cannot persist.
- **Reverse geocode offline.** Manual description + coords only.
- **Safari camera / file quirks.** Prefer a file input with `capture` before a custom `getUserMedia` studio.
- **Desktop share.** `navigator.share` is spotty; always keep Download / Print.
- **Browser profile sync.** We cannot stop Chrome from syncing site data to the user's Google account. Privacy text must say so.

---

## 9. What we are not building

- Accounts, sync, or a backend
- Officer form (field stays on the type)
- Map tiles or a third-party map
- Push notifications
- A design-system package
- Sharing code with the Expo app via a workspace
- React Native Web
- Embedding original photos in the PDF (native does not)

---

## 10. Done when

A reviewer on a phone can:

1. Install the PWA, toggle airplane mode, and complete a full collision (vehicle, photo, witness, draft resume, submit).
2. Relaunch offline and still see that collision and its photo.
3. Export a PDF and delete the report.
4. Confirm DevTools → Application that collision JSON is not sitting in plaintext localStorage, and that the service worker precaches the app shell.
5. Confirm the document does not load any third-party script or location SDK.

That is feature and security parity for a browser. Anything beyond that is a different product.
