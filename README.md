YoChat (Next.js + Clerk + Convex)


Real-time chat application built with **Next.js App Router**, **Clerk authentication**, and **Convex** for realtime data (messages, presence, typing, read receipts).<img width="1788" height="954" alt="Screenshot 2026-03-08 183946" src="https://github.com/user-attachments/assets/56e7e3f0-dec2-48dc-ae03-e6e571e597d2" />


## Features<img width="1898" height="912" alt="Screenshot 2026-03-08 184317" src="https://github.com/user-attachments/assets/e8be9609-791e-45f8-9f7e-72534bb7e8da" />


- **Auth**: Sign in / sign out via Clerk
- **1:1 conversations**: Start a direct chat with any user
- **Group chats**: Create a group, pick members, and chat together
- **Real-time messaging**: Messages update instantly via Convex queries
- **Typing indicators**: “X is typing…” (auto-expires)
- **Online presence**: Online dot + last-seen style staleness window
- **Read receipts (per conversation)**: Tracks last read timestamp per user
- **Replies**: Reply to a message with a preview context
- **Reactions**: Toggle emoji reactions on messages
- **Message deletion**: Soft delete (message remains, marked deleted)
- **Responsive UI**: Sidebar + chat layout optimized for mobile/desktop

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Auth**: Clerk (`@clerk/nextjs`)
- **Realtime backend**: Convex (`convex`)
- **Icons**: `lucide-react`

## Prerequisites

- Node.js (recommended: 18+)
- A **Clerk** application (publishable + secret keys)
- A **Convex** project/deployment (for `NEXT_PUBLIC_CONVEX_URL`)

## Project Structure (high level)

```txt
app/
  (auth)/                  # Auth routes (Clerk pages)
  (dashboard)/             # Authenticated chat area (layout + pages)
components/
  chat/                    # Chat header/list/input + message UI
  sidebar/                 # Conversation list, people search, group modal
convex/
  schema.ts                # Database tables + indexes
  messages.ts              # Send/list/delete/react
  conversations.ts         # DM + group creation/list
  presence.ts              # Online + typing + read receipts
  http.ts                  # Clerk webhook handler
```

## How It Works (architecture)

### Routing

- `app/page.tsx` redirects:
  - Signed-in users → `/dashboard`
  - Signed-out users → `/sign-in`

### Route protection (Clerk middleware)

- `middleware.ts` protects non-public routes using `auth.protect()`
- Public routes include `/`, `/sign-in`, `/sign-up`

### Providers

- `app/layout.tsx` wraps the app with:
  - `ClerkProvider` for authentication context
  - `ConvexProviderWithClerk` (via `components/provider.tsx`) so Convex requests are authorized using Clerk

### User sync + presence heartbeat

- `app/(dashboard)/layout.tsx`:
  - Upserts the current Clerk user into Convex (`api.users.upsertUser`)
  - Updates presence (`api.presence.updatePresence`) and sends periodic heartbeats

### Messages, reactions, replies

- `components/chat/MessageInput.tsx` sends messages using `api.messages.sendMessage` and supports reply-to
- `components/chat/MessageList.tsx` renders messages and marks reads using `api.presence.markAsRead`
- `components/chat/messageitem.tsx` handles reactions (`api.messages.toggleReaction`) and delete (`api.messages.deleteMessage`)

### Typing indicators

- `components/chat/MessageInput.tsx` calls `api.presence.setTyping` while the user is typing
- `convex/presence.ts` treats typing as active for a short TTL window (based on `updatedAt`)

### Clerk webhooks (optional but recommended)

- `convex/http.ts` exposes a Convex HTTP endpoint `/clerk-webhook`
- When Clerk sends `user.created` / `user.updated`, the webhook stores/updates the user in Convex

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` in the project root with:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=...
# Often used by Convex tooling (depending on your setup)
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_SITE_URL=...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_JWT_ISSUER_DOMAIN=...

# Only needed if you enable Clerk webhooks → Convex HTTP action
CLERK_WEBHOOK_SECRET=...
```

Notes:
- Never commit `.env.local` (it contains secrets).
- `NEXT_PUBLIC_*` values are exposed to the browser; keep secrets in non-public vars like `CLERK_SECRET_KEY`.

### 3) Run Convex (backend)

In one terminal:

```bash
npx convex dev
```

This starts Convex locally and keeps generated API types in `convex/_generated/` up to date.

### 4) Run Next.js (frontend)

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run ESLint

## Deployment Notes

- Deploy the Next.js app to Vercel (or similar).
- Use a hosted Convex deployment for production and set `NEXT_PUBLIC_CONVEX_URL` accordingly.
- If using Clerk webhooks, configure Clerk to send events to your deployed Convex HTTP endpoint:
  - `POST https://<your-convex-site>/clerk-webhook`
  - Provide `CLERK_WEBHOOK_SECRET` in Convex environment variables.

## Troubleshooting

- **Blank screen after sign-in**: verify Clerk keys and that Clerk URLs match your instance.
- **Convex queries failing**: ensure `NEXT_PUBLIC_CONVEX_URL` is correct and `npx convex dev` is running.
- **Presence/typing not updating**: confirm the `presence` and `typingIndicators` tables exist (schema deployed) and browser console has no auth errors.



