"use client";

import { useTranslation } from "@/lib/i18n-context";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 mb-12"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-2">
              {t('terms_of_service.title')}
            </h1>
            <p className="text-muted-foreground text-lg">DVC - Vətəndaş Cəmiyyətində Debat İctimai Birliyi</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl border border-black/5 dark:border-white/10 p-8 md:p-12 shadow-xl"
        >
          <div className="space-y-12">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms_of_service.section1_title')}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('terms_of_service.section1_content')}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms_of_service.section2_title')}</h2>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('terms_of_service.section2_item1')}</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('terms_of_service.section2_item2')}</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms_of_service.section3_title')}</h2>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('terms_of_service.section3_item1')}</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('terms_of_service.section3_item2')}</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms_of_service.section4_title')}</h2>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('terms_of_service.section4_item1')}</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('terms_of_service.section4_item2')}</span>
                </li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
