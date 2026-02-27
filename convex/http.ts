import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();
const internalAny = internal as any;

// Clerk webhook handler
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get headers
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    // Get body
    const body = await request.text();

    // Verify webhook
    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address || "";
      const name = `${first_name || ""} ${last_name || ""}`.trim() || email;

      // Store user in Convex
      await ctx.runMutation(internalAny.users.store, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url || "",
      });
    }

    return new Response("Webhook processed", { status: 200 });
  }),
});

export default http;
