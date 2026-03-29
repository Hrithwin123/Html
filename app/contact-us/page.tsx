"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MapPin, Send, ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success state
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <MainLayout navigationDelay={0}>
      <div className="min-h-screen bg-white px-4 py-8 pb-32 relative overflow-hidden">
        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* Back Button */}
          <motion.a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-16 transition-colors group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </motion.a>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Left Column — Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-black mb-8 leading-none tracking-tight">
                Get in
                <br />
                touch
              </h1>
              <div className="w-24 h-1 bg-black mb-12" />

              <p className="text-xl text-gray-500 leading-relaxed mb-16 max-w-md">
                Have a question about our platform? Want to explore enterprise
                partnerships? Or just want to say hello? We&apos;d love to hear
                from you.
              </p>

              {/* Contact Details */}
              <div className="space-y-8">
                <motion.div
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:hello@personalabs.ai"
                      className="text-lg text-black hover:text-gray-600 transition-colors"
                    >
                      hello@personalabs.ai
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                      Location
                    </p>
                    <p className="text-lg text-black">
                      Bengaluru, India
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <ArrowRight size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                      Response Time
                    </p>
                    <p className="text-lg text-black">
                      Within 24 hours
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column — Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-start"
            >
              <form
                onSubmit={handleSubmit}
                className="w-full bg-gray-50 rounded-3xl p-10 md:p-12 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-black mb-8">
                  Send us a message
                </h2>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors text-base"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors text-base"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you're thinking…"
                      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors text-base resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={sent}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                      sent
                        ? "bg-green-600 text-white"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {sent ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ✓
                        </motion.div>
                        Message Sent
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Bottom Accent */}
          <motion.div
            className="mt-24 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="w-2 h-2 bg-black rounded-full" />
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
