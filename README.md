# Black Cloud

Bilingual (Arabic / English) marketing website for Black Cloud, built with
**Next.js 16 (App Router) + React 19 + TypeScript**, deployed on **AWS Amplify Hosting**.
The contact form sends inquiries by email through **Amazon SES**.

## Run locally

Requirements: Node.js 22.13+ and pnpm (`corepack enable` sets up the pinned version).

```bash
pnpm install
cp .env.example .env.local   # optional: only needed to test the contact form
pnpm dev                     # http://localhost:3000
```

`pnpm build && pnpm start` runs the production build locally.

## Environment variables

| Name | Purpose |
| --- | --- |
| `INQUIRY_TO_EMAIL` | Address(es) that receive contact-form inquiries (comma-separated). |
| `INQUIRY_FROM_EMAIL` | Sender address. Must be a verified identity in Amazon SES. |
| `SES_REGION` | AWS region where the SES identities are verified, e.g. `eu-central-1`. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for social-share metadata. |

## Deploy on AWS Amplify

1. **Amazon SES** (in the region you'll use for `SES_REGION`):
   - Verify the sender: a domain identity (recommended) or the `INQUIRY_FROM_EMAIL` address.
   - New SES accounts start in the *sandbox*, which only delivers to verified addresses.
     Either verify `INQUIRY_TO_EMAIL` too, or request production access.
2. **IAM compute role** so the server can call SES:
   - IAM → Roles → Create role → trusted entity *AWS service*, use case **Amplify**.
   - Attach a policy allowing `ses:SendEmail` (and `ses:SendRawEmail`).
3. **Amplify app**: Amplify console → *Create new app* → GitHub → `hookshubapp/black-cloud`, branch `main`.
   Amplify detects Next.js SSR and uses the included `amplify.yml`.
4. In the app's settings:
   - *Hosting → Environment variables*: add the four variables above.
   - *App settings → IAM roles → Compute role*: select the role from step 2.
5. Deploy (or redeploy after changing variables). Every push to `main` deploys automatically.
6. Optional: *Hosting → Custom domains* to attach your domain, then update `NEXT_PUBLIC_SITE_URL`.

## Project layout

- `app/components/Site.tsx` — Arabic interface (default, RTL)
- `app/components/EnglishSite.tsx` — English interface (`/en`)
- `app/globals.css` — styling and animation
- `app/api/inquiries/route.ts` — contact-form API (validates input, emails via SES)
- `public/assets/` — logo and self-hosted fonts
- `components/ui/` — vendored shadcn/ui components (currently unused by the site)
- `amplify.yml` — Amplify build settings

Partner logos and report figures marked as demonstrations are illustrative.
Third-party license notices remain in their files.
