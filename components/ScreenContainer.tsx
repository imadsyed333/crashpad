"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function ScreenContainer({
  title,
  description,
  backButton = true,
  backHref,
  children,
  footer,
}: {
  title: string;
  description?: string;
  backButton?: boolean;
  backHref?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) router.replace(backHref);
    else router.back();
  };

  return (
    <div className="shell">
      <header className="header">
        {backButton && (
          <button type="button" className="icon-btn" onClick={handleBack} aria-label="Go back">
            ←
          </button>
        )}
        <div className="header-text">
          <h1>{title}</h1>
          {description && <p className="desc">{description}</p>}
        </div>
        <ThemeToggle />
      </header>
      <div className="grow">{children}</div>
      {footer}
    </div>
  );
}
