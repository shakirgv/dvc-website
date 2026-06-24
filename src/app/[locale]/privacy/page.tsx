"use client";

import { useTranslation } from "@/lib/i18n-context";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-2">
              {t('privacy_policy.title')}
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
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy_policy.section1_title')}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('privacy_policy.section1_content')}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy_policy.section2_title')}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                {t('privacy_policy.section2_intro')}
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('privacy_policy.section2_item1')}</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('privacy_policy.section2_item2')}</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground leading-relaxed text-lg">{t('privacy_policy.section2_item3')}</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy_policy.section3_title')}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('privacy_policy.section3_content')}
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy_policy.section4_title')}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('privacy_policy.section4_content')}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
