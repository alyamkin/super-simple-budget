import { isRecord } from "../schema";

/**
 * Version 1, written by the artifact (Spec §11.2): picked ids per bucket,
 * values by id, rough totals and custom rows in separate maps.
 *
 * Never edit this migration: files written in v1 must keep opening the same.
 */
export function v1ToV2(file: Record<string, unknown>): Record<string, unknown> {
  const picked = isRecord(file.picked) ? file.picked : {};
  const values = isRecord(file.v) ? file.v : {};
  const estimates = isRecord(file.est) ? file.est : {};
  const custom = isRecord(file.custom) ? file.custom : {};

  const valueOf = (id: unknown) => {
    const value = typeof id === "string" && isRecord(values[id]) ? values[id] : {};
    return { amount: value.a, frequency: value.f };
  };

  const buckets: Record<string, { rows: unknown[]; estimate?: unknown }> = {};
  const bucketFor = (bucket: string) => (buckets[bucket] ??= { rows: [] });

  // The artifact listed a bucket's catalog rows first, then its custom rows.
  for (const [bucket, ids] of Object.entries(picked)) {
    if (!Array.isArray(ids)) continue;
    bucketFor(bucket).rows.push(
      ...ids.map((id) => ({ id, label: "", ...valueOf(id) })),
    );
  }
  for (const [bucket, rows] of Object.entries(custom)) {
    if (!Array.isArray(rows)) continue;
    bucketFor(bucket).rows.push(
      ...rows.filter(isRecord).map((row) => ({
        id: row.id,
        custom: true,
        label: row.l,
        ...valueOf(row.id),
      })),
    );
  }
  for (const [bucket, estimate] of Object.entries(estimates)) {
    if (!isRecord(estimate)) continue;
    bucketFor(bucket).estimate = {
      enabled: Boolean(estimate.on),
      amount: estimate.a,
      frequency: estimate.f,
    };
  }

  return {
    app: file.app,
    version: 2,
    minReaderVersion: 2,
    savedAt: file.savedAt,
    locale: file.lang,
    view: file.view,
    buckets,
  };
}
