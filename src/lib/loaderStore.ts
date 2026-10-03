"use client";

import { useSyncExternalStore } from "react";

/** Tiny shared store between the scroll sequence (producer) and the preloader (consumer). */
type LoaderState = { progress: number; ready: boolean };

let state: LoaderState = { progress: 0, ready: false };
const listeners = new Set<() => void>();

export const loaderStore = {
  set(next: Partial<LoaderState>) {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  },
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const serverState: LoaderState = { progress: 0, ready: false };

export function useLoader(): LoaderState {
  return useSyncExternalStore(loaderStore.subscribe, loaderStore.get, () => serverState);
}
