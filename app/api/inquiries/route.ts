import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SECTORS: Record<string, string> = {
  bank: "Bank / بنك",
  wallet: "Digital wallet / محفظة رقمية",
  telecom: "Telecom / اتصالات",
  other: "Other / أخرى",
};

let ses: SESv2Client | undefined;
function getSes() {
  ses ??= new SESv2Client({ region: process.env.SES_REGION || process.env.AWS_REGION });
  return ses;
}

export async function POST(request: Request) {
  const fail = (error: string, status = 400) => Response.json({ error }, { status });

  if (Number(request.headers.get("content-length") || 0) > 16000) return fail("حجم الطلب أكبر من المسموح.", 413);
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return fail("مصدر الطلب غير صالح.", 403);

  try {
    const raw = await request.text();
    if (raw.length > 16000) return fail("حجم الطلب أكبر من المسموح.", 413);

    let b: Record<string, unknown>;
    try {
      b = JSON.parse(raw);
    } catch {
      return fail("بيانات الطلب غير صالحة.");
    }
    if (!b || typeof b !== "object") return fail("بيانات الطلب غير صالحة.");

    const v = (k: string, n: number) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, n) : "");
    // Honeypot field: real visitors never fill it in.
    if (v("website", 200)) return fail("تعذر تسجيل الطلب.");

    const name = v("name", 100),
      company = v("company", 150),
      sector = v("sector", 20),
      email = v("email", 254).toLowerCase(),
      phone = v("phone", 40),
      message = v("message", 1500);

    if (
      name.length < 2 ||
      company.length < 2 ||
      !(sector in SECTORS) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      b.consent !== true
    ) {
      return fail("يرجى إكمال بيانات المؤسسة والموافقة على سياسة الخصوصية.");
    }

    const to = process.env.INQUIRY_TO_EMAIL;
    const from = process.env.INQUIRY_FROM_EMAIL;
    if (!to || !from) {
      console.error("Inquiry email is not configured: set INQUIRY_TO_EMAIL and INQUIRY_FROM_EMAIL");
      return fail("تعذر تسجيل الطلب الآن. حاول لاحقًا.", 503);
    }

    const reference = `BC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const body = [
      `New institutional inquiry ${reference}`,
      "",
      `Name: ${name}`,
      `Company: ${company}`,
      `Sector: ${SECTORS[sector]}`,
      `Email: ${email}`,
      `Phone: ${phone || "-"}`,
      `Received: ${new Date().toISOString()}`,
      "",
      "Message:",
      message || "-",
    ].join("\n");

    await getSes().send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: to.split(",").map((s) => s.trim()).filter(Boolean) },
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: { Data: `Black Cloud inquiry ${reference} — ${company}`.slice(0, 200), Charset: "UTF-8" },
            Body: { Text: { Data: body, Charset: "UTF-8" } },
          },
        },
      }),
    );

    return Response.json({ ok: true, reference }, { status: 201 });
  } catch (error) {
    console.error("Institutional inquiry could not be sent", error instanceof Error ? `${error.name}: ${error.message}` : "Error");
    return fail("تعذر تسجيل الطلب الآن. حاول مرة أخرى.", 500);
  }
}
