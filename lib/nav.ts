"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function notify() {
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function toUrl(href: string) {
  return new URL(href, window.location.origin);
}

export function push(href: string) {
  const url = toUrl(href);
  window.history.pushState(null, "", `${url.pathname}${url.search}`);
  notify();
}

export function replace(href: string) {
  const url = toUrl(href);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  notify();
}

export function back() {
  window.history.back();
}

export function useNav() {
  return { push, replace, back };
}

export function usePath() {
  return useSyncExternalStore(subscribe, () => window.location.pathname, () => "/");
}

export function useSearch() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}
