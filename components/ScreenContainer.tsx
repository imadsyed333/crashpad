"use client";

import { useNav, usePath } from "@/lib/nav";
import { reportStep } from "@/lib/screens";
import { ArrowLeft } from "lucide-react";
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
  const router = useNav();
  const step = reportStep(usePath());

  const handleBack = () => {
    if (backHref) router.replace(backHref);
    else router.back();
  };

  return (
    <div className="shell">
      <header className="header">
        {backButton && (
          <button type="button" className="icon-btn" onClick={handleBack} aria-label="Go back">
            <ArrowLeft />
          </button>
        )}
        <div className="header-text">
          <h1>{title}</h1>
          {step && (
            <p className="report-step">
              {step.label}
              <span aria-hidden="true"> · </span>
              {step.index + 1} of {step.total}
              <span className="step-track" aria-hidden="true">
                {Array.from({ length: step.total }, (_, i) => (
                  <span key={i} className={i <= step.index ? "on" : undefined} />
                ))}
              </span>
            </p>
          )}
          {description && <p className="desc">{description}</p>}
        </div>
        <ThemeToggle />
      </header>
      <div className="shell-body">{children}</div>
      {footer ? <footer className="shell-footer">{footer}</footer> : null}
    </div>
  );
}
