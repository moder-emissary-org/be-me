type ClerkInvitationErrorType =
  | "DUPLICATE"
  | "ALREADY_ACCEPTED"
  | "REVOKED"
  | "UNKNOWN";

export const mapClerkInvitationError = (err: any): ClerkInvitationErrorType => {
  const codes = err?.errors?.map((e: any) => e.code) || [];

  if (codes.includes("duplicate_record")) return "DUPLICATE";
  if (codes.includes("invitation_already_accepted")) return "ALREADY_ACCEPTED";
  if (codes.includes("invitation_already_revoked")) return "REVOKED";

  return "UNKNOWN";
};