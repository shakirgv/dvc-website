"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Send, ChevronRight, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n-context";

export default function ContactPage() {
  const params = useParams();
  const locale = params?.locale || "az";
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ name: "", email: "", subject: t('contact.subject1'), message: "" });
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setFormData({ name: "", email: "", subject: t('contact.subject1'), message: "" });
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">{t('navbar.home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{t('footer.contact')}</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t('contact.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Info & Map */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-8">{t('contact.infoTitle')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('contact.addressLabel')}</h4>
                    <a href="https://www.google.com/maps/place/%22Youth+Inc%22+Business+Incubation+Center/@40.3670862,49.8368808,21z/data=!4m14!1m7!3m6!1s0x40307db9f653a013:0x68c12e788800424c!2s%22Youth+Inc%22+Business+Incubation+Center!8m2!3d40.3671002!4d49.8369556!16s%2Fg%2F11bw_59jmb!3m5!1s0x40307db9f653a013:0x68c12e788800424c!8m2!3d40.3671002!4d49.8369556!16s%2Fg%2F11bw_59jmb?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary transition-colors cursor-pointer">{t('contact.addressVal')}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('contact.phoneLabel')}</h4>
                    <a href="tel:+994120000000" className="font-bold text-lg hover:text-primary transition-colors cursor-pointer">+994 12 000 00 00</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('contact.emailLabel')}</h4>
                    <a href="mailto:info@dvc.az" className="font-bold text-primary hover:text-primary-neon cursor-pointer transition-colors">info@dvc.az</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm h-[300px] relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.4284901456345!2d49.8670924!3d40.4092617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d40a035a6b5%3A0x6b44c8c7d6bc6a5e!2sBaku%2C%20Azerbaijan!5e0!3m2!1sen!2s!4v1716300000000!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl font-bold mb-6">{t('contact.formTitle')}</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('contact.nameLabel')}</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('contact.emailLabel')}</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('contact.subjectLabel')}</label>
                <select 
                  className="w-full bg-background border border-border rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  <option>{t('contact.subject1')}</option>
                  <option>{t('contact.subject2')}</option>
                  <option>{t('contact.subject3')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('contact.messageLabel')}</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder={t('contact.messagePlaceholder')}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold rounded-xl py-4 hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2 group mt-4"
              >
                {t('contact.send')} <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>

        </div>
      </div>

      {/* Custom Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-50 flex items-center gap-3 bg-card border-2 border-primary/30 p-4 rounded-2xl shadow-2xl"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="mr-6">
              <h4 className="font-bold text-foreground">{t('contact.toastTitle')}</h4>
              <p className="text-xs text-muted-foreground">{t('contact.toastDesc')}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
