export const resolveFullName = (
    fullName: string | null,
    email: string
) => {
    return fullName && fullName.trim() ? fullName : email;
};