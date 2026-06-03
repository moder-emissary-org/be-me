export const resolveFullName = (
  fullName: string | null,
  email: string
) => {
  return fullName && fullName.trim() ? fullName : email;
};

export const trimString = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
}

export const GLOBAL_PAGINATION_LIMIT = 5;

export const parseCursor = (cursor: unknown): string | undefined => {
  const trimmedCursor = trimString(cursor);
  return trimmedCursor || undefined;
}

export const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;

  return undefined;
}

export const parseRoleQuery = (value: unknown): "resident" | "guard" | undefined => {
  if (value === "resident" || value === "guard") return value;
  return undefined;
}