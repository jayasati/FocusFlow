import { headers } from "next/headers";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

export async function POST(req: Request) {
  if (!SIGNING_SECRET) {
    console.error("CLERK_WEBHOOK_SIGNING_SECRET is not set.");
    return new Response("Webhook not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const body = await req.text();

  let evt: WebhookEvent;
  try {
    evt = new Webhook(SIGNING_SECRET).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;
        const email = email_addresses?.[0]?.email_address;
        if (!email) {
          return new Response("Missing email on user event", { status: 200 });
        }
        const name =
          [first_name, last_name].filter(Boolean).join(" ") || null;

        await db.user.upsert({
          where: { clerkId: id },
          update: { email, name, imageUrl: image_url ?? null },
          create: { clerkId: id, email, name, imageUrl: image_url ?? null },
        });
        break;
      }
      case "user.deleted": {
        const { id } = evt.data;
        if (!id) break;
        await db.user.deleteMany({ where: { clerkId: id } });
        break;
      }
      default:
        // Ignore other event types (organizations, sessions, etc.)
        break;
    }
  } catch (err) {
    console.error(`Failed processing Clerk event ${evt.type}:`, err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
