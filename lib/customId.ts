const ID_LENGTH = 10;

/** `"c_"` + 10 base-36 characters, the format of custom row ids. */
export const CUSTOM_ID_PATTERN = /^c_[0-9a-z]{10}$/;

/** A new random custom row id from `crypto.getRandomValues`. */
export function customId(): `c_${string}` {
  const values = crypto.getRandomValues(new Uint32Array(ID_LENGTH));
  let id = "";
  for (const value of values) id += (value % 36).toString(36);
  return `c_${id}`;
}
