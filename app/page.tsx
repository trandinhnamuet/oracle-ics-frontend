"use client"

import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/homepage/hero-section"
import { ServicesSection } from "@/components/homepage/services-section"
import { PricingSection } from "@/components/homepage/pricing-section"
import { Footer } from "@/components/layout/footer"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

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

export default function HomePage() {
  return (
    <div className="min-h-screen">
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
    </div>
  )
}
