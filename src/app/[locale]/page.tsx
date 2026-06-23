import { getDictionary, Locale } from "@/lib/i18n";
import { ClientHome } from "./client-home";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return <ClientHome dict={dict} />;
}
