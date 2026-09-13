import { useCallback, useSyncExternalStore } from "react";

export interface Actor {
  id: string;
  role: string | null;
}

const STORAGE_KEY = "employee-portal:actor";
const listeners = new Set<() => void>();
const EMPTY_ACTOR: Actor = { id: "", role: null };

// useSyncExternalStore requires getSnapshot() to return a referentially-stable value when
// the underlying store hasn't changed - returning a freshly-parsed object every call (even
// with identical contents) makes React think the store changes on every render, which loops
// forever ("Maximum update depth exceeded"). Cache by the raw string so the same Actor
// object is returned until localStorage actually changes.
let cachedRaw: string | null | undefined;
let cachedActor: Actor = EMPTY_ACTOR;

/**
 * PLACEHOLDER identity mechanism (matches the backend's `requireActor` middleware, which
 * reads `x-actor-id`/`x-actor-role` headers pending real authentication - see
 * constitution.md § Security Posture, JWT specifics `[Open]`). Lets the app be used and
 * tested end-to-end now; swap for real auth-derived identity later without touching
 * page/component code.
 */
function readActor(): Actor {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) {
    return cachedActor;
  }
  cachedRaw = raw;
  if (!raw) {
    cachedActor = EMPTY_ACTOR;
  } else {
    try {
      cachedActor = JSON.parse(raw) as Actor;
    } catch {
      cachedActor = EMPTY_ACTOR;
    }
  }
  return cachedActor;
}

function writeActor(actor: Actor): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(actor));
  listeners.forEach((l) => l());
}

export function useActor(): [Actor, (actor: Actor) => void] {
  const actor = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    readActor
  );
  const setActor = useCallback((next: Actor) => writeActor(next), []);
  return [actor, setActor];
}
