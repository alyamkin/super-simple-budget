const ID_LENGTH = 10;

/** `"c_"` + 10 base-36 characters, the format of custom row ids (Spec §6.2). */
export const CUSTOM_ID_PATTERN = /^c_[0-9a-z]{10}$/;

/** A new random custom row id from `crypto.getRandomValues`. */
export function customId(): `c_${string}` {
  const values = crypto.getRandomValues(new Uint32Array(ID_LENGTH));
  let id = "";
  for (const value of values) id += (value % 36).toString(36);
  return `c_${id}`;
}

export function isCustomId(value: unknown): value is `c_${string}` {
  return typeof value === "string" && CUSTOM_ID_PATTERN.test(value);
}
