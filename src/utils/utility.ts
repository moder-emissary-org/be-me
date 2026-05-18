export const resolveFullName = (
    fullName: string | null,
    email: string
) => {
    return fullName && fullName.trim() ? fullName : email;
};

export const trimString = (value: unknown): string  => {
    return typeof value === "string" ? value.trim() : "";
  }