export function diffMedia<T extends { id: string }>(original: T[], working: T[]) {
  const originalIds = new Set(original.map((m) => m.id));
  const workingIds = new Set(working.map((m) => m.id));
  return {
    added: working.filter((m) => !originalIds.has(m.id)),
    removed: original.filter((m) => !workingIds.has(m.id)),
  };
}

/** Delete now unless this item is on the saved collision (discard would restore it). */
export function shouldDeleteBlobOnRemove(
  mediaId: string,
  original: { id: string }[] | undefined,
): boolean {
  return !original?.some((m) => m.id === mediaId);
}
