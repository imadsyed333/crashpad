"use client";

import { ScreenContainer } from "@/components/ScreenContainer";

export default function PrivacyPage() {
  return (
    <ScreenContainer title="Privacy" description="How CrashPad stores data on the web">
      <article className="privacy">
        <p>
          All form data in CrashPad stays in this browser, on this device. There is no account and no
          CrashPad server. Reports leave the origin only if you print, download, or share them.
        </p>
        <h2>Encrypted storage in this browser</h2>
        <p>
          Collisions, your saved vehicle, theme, and media are encrypted with AES-GCM and stored in
          IndexedDB. A wrapping key lives in the same origin. This is not native OS keychain storage.
          Another site cannot read it; a script on this origin, a browser extension, or profile sync
          can.
        </p>
        <h2>Location</h2>
        <p>
          CrashPad asks before reading GPS from this device. Coordinates stay on the device. CrashPad
          does not call a geocoding service or any third-party location SDK, so a street address is
          never fetched from the network.
        </p>
        <h2>Photos and videos</h2>
        <p>
          Camera and library access happen only after you tap Camera or Library. Files are encrypted
          into IndexedDB. They are not uploaded.
        </p>
        <h2>What we cannot control</h2>
        <ul>
          <li>Chrome or other browsers may sync site data with your account. Turn that off for this site if you do not want a copy on another machine.</li>
          <li>iOS can evict unused PWA storage. Open CrashPad regularly, or export a report you need to keep.</li>
          <li>Private / incognito windows usually delete site data when the session ends.</li>
        </ul>
        <h2>Delete everything</h2>
        <p>
          Home includes “Delete all CrashPad data.” That wipes IndexedDB, cached files, and the
          wrapping key for this origin.
        </p>
      </article>
    </ScreenContainer>
  );
}
