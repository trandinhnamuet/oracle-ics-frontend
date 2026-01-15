"use client"

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getTodayExchangeRates } from "@/api/exchange-rate.api";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/homepage/hero-section";
import { ServicesSection } from "@/components/homepage/services-section";
import { PricingSection } from "@/components/homepage/pricing-section";
import { Footer } from "@/components/layout/footer";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { printEnv, userInfo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

// Khai báo type cho window.__gim để tránh lỗi TS
declare global {
  interface Window {
    __gim?: any;
  }
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}


function HomePageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast ? useToast() : { toast: undefined };
  useEffect(() => {
    // Hiển thị toast nếu có message logged-in
    if (searchParams.get("message") === "logged-in" && toast) {
      toast({
        title: "Bạn đã đăng nhập rồi.",
        description: "Hãy đăng xuất nếu muốn đăng ký/đăng nhập lại.",
        duration: 4000,
        variant: "info"
      });
    }
    const scrollTarget = searchParams.get("scroll");
    if (scrollTarget) {
      setTimeout(() => {
        let sectionId = "";
        if (scrollTarget === "services") sectionId = "services";
        if (scrollTarget === "pricing") sectionId = "pricing";
        if (scrollTarget === "support") {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          return;
        }
        if (sectionId) {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
    }
  }, [searchParams, toast]);

  return (
    <>
      <main>
        <AnimatedSection delay={0.1}>
          <HeroSection />
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <ServicesSection />
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <PricingSection />
        </AnimatedSection>
      </main>

    </>
  );
}

export default function HomePage() {
  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        const rates = await getTodayExchangeRates();
        // Chỉ lấy tỉ giá USD bán ra VND (direction: 'sell')
        const usdvnd_sell = Array.isArray(rates)
          ? rates.find(r => r.currency_from === 'USD' && r.currency_to === 'VND' && r.direction === 'sell')?.rate
          : undefined;
        if (usdvnd_sell) {
          localStorage.setItem("usdvnd_sell", String(usdvnd_sell));
        } else {
          localStorage.setItem("usdvnd_sell", "26500");
        }
      } catch (error) {
        localStorage.setItem("usdvnd_sell", "26500");
        console.error("Lỗi lấy tỉ giá:", error);
      }
    }
    fetchExchangeRate();

    // Expose utility functions to global window object for console access
    if (typeof window !== 'undefined') {
      (window as any).printEnv = printEnv;
      (window as any).userInfo = userInfo;

      // Tích hợp chatbot GIM
      if (!document.getElementById('gim-bot-sdk')) {
        (window as any).__gim = (window as any).__gim || {};
        (window as any).__gim.licenseId = "586508500633432247";
        const script = document.createElement('script');
        script.id = 'gim-bot-sdk';
        script.async = true;
        script.type = 'text/javascript';
        script.src = 'https://botsdk.stg.gim.beango.com/index.umd.js';
        document.head.appendChild(script);
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Suspense>
        <HomePageContent />
      </Suspense>
    </div>
  );
}
