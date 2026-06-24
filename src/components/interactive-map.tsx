"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n-context";

const MapComponent = dynamic(() => import("./map"), { 
  ssr: false, 
  loading: () => {
    // We can't use hooks directly in here if it's outside the component, but we can just use a simple loading text or we could use the hook inside a wrapper. 
    // To keep it simple, we'll just use a generic English/Azerbaijani loading text since it flashes quickly.
    return (
    <div className="w-full h-full rounded-3xl bg-card animate-pulse flex items-center justify-center border border-black/5 dark:border-white/5">
      <span className="text-muted-foreground font-medium flex items-center gap-2">
        <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
        Xəritə yüklənir... / Map is loading...
      </span>
    </div>
    );
  }
});

export function InteractiveMap() {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            {t('map.badge')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground tracking-tight"
          >
            {t('map.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl"
          >
            {t('map.subtitle')}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px]"
        >
          <MapComponent />
        </motion.div>
      </div>
    </section>
  );
}
