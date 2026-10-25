import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {default: 'BLACK CLOUD | نحمي اسم مؤسستك', template: '%s | BLACK CLOUD'},
  description: 'نرصد الصفحات المنتحلة للبنوك والمحافظ وشركات الاتصالات، نوثقها ونلاحق إزالتها. خدمة مؤسسية من شركة هوكس في رام الله.',
  openGraph: {title: 'BLACK CLOUD | نحمي اسم مؤسستك', description:'رصد الانتحال الرقمي. ملاحقة الصفحات. حماية الثقة.', locale:'ar_PS',type:'website'},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
