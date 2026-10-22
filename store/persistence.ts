import { addListener } from "@reduxjs/toolkit";
import { BUCKET_IDS, type BucketId } from "@/domain/catalog/buckets";
import type { ItemId } from "@/domain/catalog/items";
import { toBudgetFile } from "@/features/files/exportJson";
import { readBudgetData } from "@/features/files/importJson";
import { sanitizeView } from "@/features/files/sanitize";
import { APP_ID, CURRENT_VERSION, isRecord } from "@/features/files/schema";
import {
  clampStep,
  PERSISTED_UI_KEYS,
  type PersistedUi,
} from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import { hydrated, type HydratedPayload } from "./hydrated";
import type { AppDispatch, AppStore, RootState } from "./makeStore";

export const STORAGE_KEY = "ssb:state";

/** Where the artifact kept its state; read once, then removed. */
export const LEGACY_STORAGE_KEY = "bp-pickplan-v3";

export const SAVE_DELAY_MS = 400;

export type PersistenceOptions = {
  /** Language of the labels written with each row. */
  locale: Locale;
  itemLabel: (id: ItemId) => string;
  /** Defaults to `window.localStorage`. */
  storage?: () => Storage;
};

const addAppListener = addListener.withTypes<RootState, AppDispatch>();

const timestamp = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/** Keeps the valid persisted ui fields of stored JSON. */
export function readUi(value: unknown): Partial<PersistedUi> {
  if (!isRecord(value)) return {};
  const ui: Partial<PersistedUi> = {
    view: sanitizeView(value.view),
    lastFileSaveAt: timestamp(value.lastFileSaveAt),
    changedAt: timestamp(value.changedAt),
    noticeSnoozedUntil: timestamp(value.noticeSnoozedUntil),
  };
  if (typeof value.step === "number") ui.step = clampStep(value.step);
  if (isRecord(value.showAllChips)) {
    const chips = value.showAllChips;
    ui.showAllChips = Object.fromEntries(
      BUCKET_IDS.filter((bucket) => chips[bucket] === true).map(
        (bucket): [BucketId, boolean] => [bucket, true],
      ),
    );
  }
  return ui;
}

function readJson(storage: Storage, key: string): unknown {
  try {
    return JSON.parse(storage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

/** `ssb:state` (Spec §6.4), read through the same pipeline as files. */
function readCurrent(stored: unknown): HydratedPayload | null {
  if (!isRecord(stored)) return null;
  const budget = isRecord(stored.budget) ? stored.budget : {};
  const result = readBudgetData({ ...budget, app: APP_ID });
  return {
    budget: result.ok ? result.budget : null,
    ui: readUi(stored.ui),
  };
}

/** The artifact's state: a v1 file plus its ui fields. Its demo is ignored. */
function readLegacy(stored: unknown): HydratedPayload | null {
  if (!isRecord(stored) || !isRecord(stored.picked) || stored.isExample) {
    return null;
  }
  const result = readBudgetData({ ...stored, app: APP_ID, version: 1 });
  if (!result.ok) return null;
  return {
    budget: result.budget,
    ui: readUi({
      step: stored.step,
      view: stored.view,
      showAllChips: stored.more,
      lastFileSaveAt: stored.lastBackup,
      changedAt: stored.changedAt,
      noticeSnoozedUntil: stored.snooze,
    }),
  };
}

function toStoredJson(state: RootState, options: PersistenceOptions): string {
  const { version, minReaderVersion, locale, view, buckets } = toBudgetFile(
    state.budget,
    { locale: options.locale, view: state.ui.view, itemLabel: options.itemLabel },
  );
  const ui = Object.fromEntries(
    PERSISTED_UI_KEYS.map((key) => [key, state.ui[key]]),
  );
  return JSON.stringify({
    schema: CURRENT_VERSION,
    budget: { version, minReaderVersion, locale, view, buckets },
    ui,
  });
}

const persistedChanged = (current: RootState, previous: RootState) =>
  current.budget !== previous.budget ||
  PERSISTED_UI_KEYS.some((key) => current.ui[key] !== previous.ui[key]);

function getStorage(options: PersistenceOptions): Storage | null {
  try {
    return options.storage?.() ?? window.localStorage;
  } catch {
    return null; // Blocked storage (privacy settings) throws on access.
  }
}

/**
 * Hydrates the store from local storage, then saves every change to it,
 * debounced, flushing when the page is hidden or left. Call after mount;
 * returns the cleanup, which flushes and removes every listener and timer.
 */
export function startPersistence(
  store: AppStore,
  options: PersistenceOptions,
): () => void {
  const storage = getStorage(options);
  let legacy: unknown = null;
  let payload: HydratedPayload | null = null;
  let fromLegacy = false;
  if (storage) {
    payload = readCurrent(readJson(storage, STORAGE_KEY));
    legacy = readJson(storage, LEGACY_STORAGE_KEY);
    if (!payload) {
      payload = readLegacy(legacy);
      fromLegacy = payload !== null;
    }
  }
  store.dispatch(hydrated(payload ?? { budget: null, ui: {} }));
  if (!storage) return () => {};

  let timer: ReturnType<typeof setTimeout> | undefined;
  const write = () => {
    clearTimeout(timer);
    timer = undefined;
    try {
      storage.setItem(STORAGE_KEY, toStoredJson(store.getState(), options));
    } catch {
      // Quota exceeded or private mode: the budget stays in memory only.
    }
  };
  const flush = () => {
    if (timer !== undefined) write();
  };

  // Moved to the current key once; the artifact's demo is just dropped.
  if (fromLegacy) write();
  if (legacy !== null) {
    try {
      storage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Read-only storage: the legacy state is read again next time.
    }
  }

  const unsubscribe = store.dispatch(
    addAppListener({
      predicate: (_action, current, previous) =>
        persistedChanged(current, previous),
      effect: () => {
        clearTimeout(timer);
        timer = setTimeout(write, SAVE_DELAY_MS);
      },
    }),
  );

  const controller = new AbortController();
  const { signal } = controller;
  window.addEventListener("pagehide", flush, { signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") flush();
    },
    { signal },
  );

  return () => {
    controller.abort();
    unsubscribe();
    flush();
  };
}
