import { Webhook } from "svix";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { createUserFromClerkWebhook_Service } from "@/services/User/User.service.js";

export const clerkWebhook_Controller = asyncHandler(async (req, res) => {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!CLERK_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const body = req.body as Buffer;
  const svixId = req.headers["svix-id"] as string | undefined;
  const svixTimestamp = req.headers["svix-timestamp"] as string | undefined;
  const svixSignature = req.headers["svix-signature"] as string | undefined;
  if (!body || !svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: "Missing webhook headers or body" });
  }

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: { type: string; data: Record<string, unknown> };
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch {
    return res.status(400).json({ error: "Webhook verification failed" });
  }

  if (evt.type !== "user.created") {
    return res.status(200).json({ received: true });
  }

  const data = evt.data as {
    id?: string;
    email_addresses?: Array<{ email_address?: string }>;
    public_metadata?: Record<string, unknown>;
  };

  const clerkUserId = data.id;
  const email = (data.email_addresses as Array<{ email_address?: string }> | undefined)?.[0]?.email_address;
  const metadata = data.public_metadata as
    | { societyId: string; role: string; invitedBy: string }
    | undefined;

  if (!clerkUserId || !email) {
    return res.status(200).json({ received: true });
  }

  // const societyId = metadata?.societyId as string;
  // const role = metadata?.role as "resident" | "guard";
  if (!metadata?.societyId) {
    console.error("Webhook missing societyId", { data });
    return res.status(200).json({ received: true });
  }
  const societyId = metadata.societyId;

  const role =
    metadata.role === "resident" || metadata.role === "guard"
      ? metadata.role
      : "resident";

  const invitedBy = metadata.invitedBy as string;

  console.log("before hitting the createUserFromClerkWebhook_Service : ", { societyId, role, invitedBy })
  const payload: Parameters<typeof createUserFromClerkWebhook_Service>[0] = {
    clerkUserId,
    email,
    role: role ?? "resident",
    societyId: societyId,
  };
  if (invitedBy !== undefined) payload.invitedBy = invitedBy;

  try {
    console.log("just hitting the createUserFromClerkWebhook_Service")
    await createUserFromClerkWebhook_Service(payload);
  } catch (err) {
    console.error("Webhook user creation failed:", err);
    // Log but return 200 so Clerk does not retry indefinitely for bad data
    return res.status(200).json({ received: true });
  }

  return res.status(200).json({ received: true });
});
