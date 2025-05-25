"use client";

import React, { useState, useRef } from "react";
import {
  Menu,
  X,
  Check,
  Printer,
  Info,
  LayoutTemplate,
  ListChecks,
  Truck,
  Globe,
  MapPin,
  UserPlus,
  ShoppingBag,
  PaintBucket,
  Store,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { CoverageMap } from "@/components/CoverageMap";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useLocale } from "next-intl";

// Animation variants - move these outside the component
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [activeStep, setActiveStep] = useState(1);
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const isRTL = locale === "tn";
  // Refs for scrolling to sections
  const functionalitiesRef = useRef<HTMLElement>(null);
  const whyMPRef = useRef<HTMLElement>(null);
  const templatesRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const partnersRef = useRef<HTMLElement>(null);

  // Function to scroll to a section - fixed to handle null refs
  const scrollToSection = (
    sectionRef: React.RefObject<HTMLElement | null>,
    sectionId: string
  ) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  // Steps data with icons
  const steps = [
    {
      step: 1,
      title: t("step1_title"),
      description: t("step1_desc"),
      icon: <UserPlus className="w-6 h-6" />,
      color: "from-blue-600 to-blue-400",
    },
    {
      step: 2,
      title: t("step2_title"),
      description: t("step2_desc"),
      icon: <Store className="w-6 h-6" />,
      color: "from-green-600 to-green-400",
    },
    {
      step: 3,
      title: t("step3_title"),
      description: t("step3_desc"),
      icon: <PaintBucket className="w-6 h-6" />,
      color: "from-pink-600 to-pink-400",
    },
    {
      step: 4,
      title: t("step4_title"),
      description: t("step4_desc"),
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "from-purple-600 to-purple-400",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white border-b shadow-sm"
      >
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img src="/icons/mp.png" alt="mp logo" width={40} height={40} />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                MonkeyPrint
              </span>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full lg:hidden bg-blue-100 text-blue-600"
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              <span className="sr-only"></span>
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center lg:gap-6">
              <motion.button
                onClick={() =>
                  scrollToSection(functionalitiesRef, "functionalities")
                }
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-full ${
                  activeSection === "functionalities"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("functionalities")}
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(whyMPRef, "whyMP")}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-full ${
                  activeSection === "whyMP"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("whyMP")}
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(templatesRef, "templates")}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-full ${
                  activeSection === "templates"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("templates")}
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(stepsRef, "steps")}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-full ${
                  activeSection === "steps"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("steps")}
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(partnersRef, "partners")}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-full ${
                  activeSection === "partners"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("Dpartners")}
              </motion.button>
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <motion.a
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("login")}
              </motion.a>
              <motion.a
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-full bg-blue-600 hover:bg-blue-700"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 10px rgba(37, 99, 235, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {t("register")}
              </motion.a>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 z-40 bg-white border-b shadow-lg lg:hidden"
          >
            <nav className="container px-4 py-4 mx-auto">
              <div className="flex flex-col space-y-4">
                <motion.button
                  onClick={() =>
                    scrollToSection(functionalitiesRef, "functionalities")
                  }
                  className="py-2 font-medium text-left"
                  whileTap={{ scale: 0.95 }}
                >
                  {t("functionalities")}
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection(whyMPRef, "whyMP")}
                  className="py-2 font-medium text-left"
                  whileTap={{ scale: 0.95 }}
                >
                  {t("whyMP")}
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection(templatesRef, "templates")}
                  className="py-2 font-medium text-left"
                  whileTap={{ scale: 0.95 }}
                >
                  {t("templates")}
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection(stepsRef, "steps")}
                  className="py-2 font-medium text-left"
                  whileTap={{ scale: 0.95 }}
                >
                  {t("steps")}
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection(partnersRef, "partners")}
                  className="py-2 font-medium text-left"
                  whileTap={{ scale: 0.95 }}
                >
                  {t("Dpartners")}
                </motion.button>

                <div className="flex flex-col gap-3 pt-4 mt-4 border-t">
                  <motion.a
                    href="/auth/login"
                    className="inline-flex items-center justify-center w-full h-12 px-6 font-medium transition-colors border rounded-full text-blue-600 border-blue-600 hover:bg-blue-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("login")}
                  </motion.a>
                  <motion.a
                    href="/auth/register"
                    className="inline-flex items-center justify-center w-full h-12 px-6 font-medium text-white transition-colors rounded-full bg-blue-600 hover:bg-blue-700"
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("register")}
                  </motion.a>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* Main Content */}
      <main
        className={`flex-1 ${isMenuOpen ? "opacity-50 lg:opacity-100" : ""}`}
      >
        {/* Hero Section */}
        <section
          className="relative py-12 md:py-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/home.jpg')" }}
        >
          {/* Stronger Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20"></div>

          <div className="container px-4 mx-auto text-center relative z-10 text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md"
            >
              {t("createSell")} <br />
              <span className="bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
                {t("customP")}
              </span>
            </motion.h1>

            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeIn}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg"
              >
                <Check className="w-5 h-5 text-blue-300" />
                <span className="font-medium">{t("free")}</span>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg"
              >
                <Check className="w-5 h-5 text-blue-300" />
                <span className="font-medium">{t("products")}</span>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg"
              >
                <Check className="w-5 h-5 text-blue-300" />
                <span className="font-medium">{t("globalD")}</span>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.a
                href="/auth/register"
                className="inline-flex items-center justify-center w-full max-w-xs h-14 px-8 mb-3 font-medium text-white transition-colors rounded-full md:w-auto bg-blue-600 hover:bg-blue-700"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {t("getStarted")}
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* MP Functionalities Section */}
        <AnimatedSection
          ref={functionalitiesRef}
          id="functionalities"
          className="py-12 bg-blue-50"
        >
          <div className="container px-4 mx-auto">
            <motion.h2
              variants={fadeIn}
              className="mb-8 text-3xl font-bold text-center"
            >
              {t("functionalities")}
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <FeatureCard
                icon={<Printer className="w-6 h-6 text-blue-600" />}
                title={t("pod_title")}
                description={t("pod_desc")}
              />
              <FeatureCard
                icon={<LayoutTemplate className="w-6 h-6 text-blue-600" />}
                title={t("design_title")}
                description={t("design_desc")}
              />
              <FeatureCard
                icon={<Truck className="w-6 h-6 text-blue-600" />}
                title={t("shipping_title")}
                description={t("shipping_desc")}
              />
              <FeatureCard
                icon={<ListChecks className="w-6 h-6 text-blue-600" />}
                title={t("order_title")}
                description={t("order_desc")}
              />
              <FeatureCard
                icon={<Info className="w-6 h-6 text-blue-600" />}
                title={t("analytics_title")}
                description={t("analytics_desc")}
              />
              <FeatureCard
                icon={<Store className="w-6 h-6 text-blue-600" />}
                title={t("store_title")}
                description={t("store_desc")}
              />
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Why MP Section */}
        <AnimatedSection ref={whyMPRef} id="whyMP" className="py-12">
          <div className="container px-4 mx-auto">
            <motion.h2
              variants={fadeIn}
              className="mb-8 text-3xl font-bold text-center"
            >
              {t("whyMP")}
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-2"
            >
              <motion.div
                variants={scaleUp}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <h3
                  className={`mb-4 text-xl font-medium text-blue-600 ${isRTL ? "text-right" : ""}`}
                >
                  {t("quality")}
                </h3>
                <p
                  className={`mb-4 text-gray-600 ${isRTL ? "text-right" : ""}`}
                >
                  {t("p1")}
                </p>
                <ul className="space-y-2">
                  {[
                    t("quality_point1"),
                    t("quality_point2"),
                    t("quality_point3"),
                    t("quality_point4"),
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Check
                        className={`w-5 h-5 text-blue-600 !fill-none ${isRTL ? "ml-1" : "mr-1"}`}
                      />
                      <span className={isRTL ? "text-right" : ""}>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                variants={scaleUp}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <h3
                  className={`mb-4 text-xl font-medium text-blue-600 ${isRTL ? "text-right" : ""}`}
                >
                  {t("business")}
                </h3>
                <p
                  className={`mb-4 text-gray-600 ${isRTL ? "text-right" : ""}`}
                >
                  {t("p2")}
                </p>
                <ul className="space-y-2">
                  {[
                    t("business_point1"),
                    t("business_point2"),
                    t("business_point3"),
                    t("business_point4"),
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Check
                        className={`w-5 h-5 mt-0.5 text-blue-600 !fill-none ${isRTL ? "ml-1" : "mr-1"}`}
                      />
                      <span className={isRTL ? "text-right" : ""}>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Templates Preview Section - Simplified */}
        <AnimatedSection
          ref={templatesRef}
          id="templates"
          className="py-16 bg-gradient-to-b from-blue-50 to-white"
        >
          <div className="container px-4 mx-auto">
            <motion.div
              variants={fadeIn}
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <h2 className="text-3xl font-bold mb-4">{t("templates")}</h2>
              <p className="text-gray-600">{t("p3")} </p>
            </motion.div>

            {/* Featured Templates - Single Row */}
            <motion.div
              variants={staggerContainer}
              className="grid gap-8 grid-cols-1 md:grid-cols-3"
            >
              {[
                {
                  id: 2,
                  title: "Simple",
                  category: "T-Shirts",
                  popular: true,
                },
                { id: 1, title: "Modern", category: "Mugs", popular: false },
                {
                  id: 3,
                  title: "Premuim",
                  category: "Hoodies",
                  popular: true,
                },
              ].map((template) => (
                <motion.div
                  key={template.id}
                  variants={scaleUp}
                  className="group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300"
                  whileHover={{
                    y: -10,
                    boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {template.popular && (
                    <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t("popular")}
                    </div>
                  )}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <img
                        src={`/images/template-${template.id}.jpg`}
                        alt={template.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <motion.button
                        className="bg-white text-blue-600 font-medium px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t("design")}
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-lg">{template.title}</h3>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{t("pro")}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((user) => (
                          <div
                            key={user}
                            className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-500 overflow-hidden"
                          >
                            {user}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Steps to Create Section - REDESIGNED */}
        <AnimatedSection
          ref={stepsRef}
          id="steps"
          className="py-16 bg-gradient-to-br from-gray-50 to-white overflow-hidden"
        >
          <div className="container px-4 mx-auto">
            <motion.div
              variants={fadeIn}
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">{t("how")}</h2>
              <p className="text-gray-600">{t("p4")}</p>
            </motion.div>

            {/* Interactive Steps - Desktop */}
            <div className="hidden lg:block relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: "0%" }}
                  whileInView={{
                    width:
                      activeStep === 1
                        ? "0%"
                        : activeStep === 2
                          ? "33%"
                          : activeStep === 3
                            ? "66%"
                            : "100%",
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="grid grid-cols-4 gap-6 relative z-10">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    onHoverStart={() => setActiveStep(step.step)}
                  >
                    {/* Step Circle */}
                    <motion.div
                      className={`relative flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-white shadow-lg border-2 ${
                        activeStep >= step.step
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {/* Background Circle Animation */}
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: activeStep === step.step ? 1 : 0,
                          opacity: activeStep === step.step ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Step Number */}
                      <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 -mt-2 -mr-2 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md">
                        {step.step}
                      </div>

                      {/* Icon */}
                      <motion.div
                        className="relative z-10"
                        animate={{
                          color:
                            activeStep === step.step
                              ? "white"
                              : "rgb(37, 99, 235)",
                        }}
                      >
                        {step.icon}
                      </motion.div>
                    </motion.div>

                    {/* Step Content */}
                    <motion.div
                      className="text-center"
                      animate={{
                        scale: activeStep === step.step ? 1.05 : 1,
                      }}
                    >
                      <h3 className="mb-2 text-xl font-medium">{step.title}</h3>
                      <p className="text-gray-600 max-w-xs mx-auto">
                        {step.description}
                      </p>
                    </motion.div>

                    {/* Arrow to next step */}
                    {step.step < 4 && (
                      <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <ArrowRight className="w-6 h-6 text-blue-400" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile Steps - Vertical Timeline */}
            <div className="lg:hidden">
              <div className="relative pl-10">
                {/* Vertical Line */}
                <div className="absolute top-0 bottom-0 left-4 w-1 bg-gray-200">
                  <motion.div
                    className="w-full bg-blue-500"
                    initial={{ height: "0%" }}
                    whileInView={{ height: "100%" }}
                    transition={{ duration: 1.5 }}
                  />
                </div>

                {steps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    className="relative mb-12"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    {/* Step Circle */}
                    <motion.div
                      className={`absolute left-0 top-0 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border-2 ${
                        index === 0 ? "border-blue-500" : "border-gray-200"
                      }`}
                      whileInView={{
                        borderColor: "rgb(59, 130, 246)",
                        transition: { delay: index * 0.3 },
                      }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color}`}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.3 + 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                      />
                      <span className="relative z-10 text-xs font-bold text-white">
                        {step.step}
                      </span>
                    </motion.div>

                    {/* Step Content */}
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="mr-3 p-2 rounded-full bg-blue-100 text-blue-600">
                          {step.icon}
                        </div>
                        <h3 className="text-lg font-medium">{step.title}</h3>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.a
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 font-medium text-white transition-all duration-300 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{t("start")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-right"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </motion.a>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Delivery Partners Section */}
        <AnimatedSection
          ref={partnersRef}
          id="partners"
          className="py-12 bg-blue-50"
        >
          <div className="container px-4 mx-auto">
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="grid md:grid-cols-2">
                <div className="p-6 flex flex-col justify-center">
                  {/* Header with conditional RTL class */}
                  <div
                    className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse justify-start" : ""}`}
                  >
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-medium">
                      {t("local_coverage")}
                    </h3>
                  </div>
                  {/* Description with conditional alignment */}
                  <p
                    className={`text-gray-600 mb-4 ${isRTL ? "text-right" : ""}`}
                  >
                    {t("p6")}
                  </p>
                  {/* Cities list with conditional direction */}
                  <div
                    className={`flex flex-col-reverse mb-3  ${isRTL ? "flex-col-reverse justify-end" : ""}`}
                  >
                    {[
                      t("city_tunis"),
                      t("city_sousse"),
                      t("city_sfax"),
                      t("city_ariana"),
                      t("city_beja"),
                      t("city_gabes"),
                    ].map((city, index) => (
                      <motion.div
                        key={city}
                        className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-start" : ""}`}
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{city}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Map stays the same */}
                <div className="h-64 md:h-auto relative">
                  <div className="absolute inset-0">
                    <CoverageMap />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Trust Section */}
        <AnimatedSection className="py-12">
          <div className="container px-4 mx-auto text-center">
            <motion.div
              variants={fadeIn}
              className="flex flex-col items-center justify-center gap-4 md:flex-row"
            >
              <span className="font-medium">Trusted by 1M+ sellers</span>
              <div className="flex items-center gap-2">
                <motion.div
                  className="flex"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <motion.svg
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </motion.div>
                <span className="font-medium">4.8</span>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="py-20 bg-blue-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            {/* Company Info */}
            <div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <img
                  src="/icons/mp.png"
                  alt="MonkeyPrint Logo"
                  className="w-10 h-8 rounded-full"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  MonkeyPrint
                </span>
              </motion.div>
              <p className="text-sm text-gray-600 mb-6 mt-5">
                Create and sell custom products with print-on-demand services.
                No inventory, no hassle.
              </p>
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <motion.a
                  href="#"
                  className="text-blue-500 hover:text-blue-600"
                  aria-label="Facebook"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-facebook"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </motion.a>
                <motion.a
                  href="#"
                  className="text-blue-500 hover:text-blue-600"
                  aria-label="Twitter"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-twitter"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </motion.a>
                <motion.a
                  href="#"
                  className="text-blue-500 hover:text-blue-600"
                  aria-label="Instagram"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-instagram"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </motion.a>
                <motion.a
                  href="#"
                  className="text-blue-500 hover:text-blue-600"
                  aria-label="LinkedIn"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-linkedin"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </motion.a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Products</h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Apparel & Clothing",
                  "Home & Living",
                  "Accessories",
                  "Wall Art",
                  "Phone Cases",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.a
                      href="#"
                      className="text-gray-600 hover:text-blue-600"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Design Templates",
                  "Tutorials",
                  "Blog",
                  "Success Stories",
                  "Integration Guides",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.a
                      href="#"
                      className="text-gray-600 hover:text-blue-600"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                {[
                  "About Us",
                  "Contact",
                  "Careers",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.a
                      href="#"
                      className="text-gray-600 hover:text-blue-600"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
            className="pt-8 mt-5 border-t border-gray-200 text-center text-sm text-gray-500 mx-auto"
          >
            <p className="mb-2">© 2025 MonkeyPrint. All rights reserved.</p>
            <p>Trusted by creators, entrepreneurs, and businesses worldwide.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

// Properly type the AnimatedSection component
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const AnimatedSection = React.forwardRef<HTMLElement, AnimatedSectionProps>(
  ({ children, className, id }, ref) => {
    const [inViewRef, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    // Merge refs
    const setRefs = React.useCallback(
      (node: HTMLElement | null) => {
        // Ref from forwardRef
        if (ref) {
          if (typeof ref === "function") {
            ref(node);
          } else {
            ref.current = node;
          }
        }
        // Ref for intersection observer
        inViewRef(node);
      },
      [inViewRef, ref]
    );

    return (
      <section ref={setRefs} id={id} className={className}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </section>
    );
  }
);

AnimatedSection.displayName = "AnimatedSection";

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const locale = useLocale();
  const isRTL = locale === "tn";

  return (
    <motion.div
      variants={scaleUp}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      }}
      className="p-6 bg-white rounded-lg shadow-sm transition-all duration-300"
    >
      <div className={`${isRTL ? "text-right" : ""}`}>
        {icon && (
          <motion.div
            className={`flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full ${
              isRTL ? "ml-auto" : ""
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {icon}
          </motion.div>
        )}
        <h3 className="mb-2 text-lg font-medium text-blue-600">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}
