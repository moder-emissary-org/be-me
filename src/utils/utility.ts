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