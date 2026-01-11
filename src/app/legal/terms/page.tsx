"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Gavel, AlertTriangle, UserCheck, Zap } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-brand-hot-pink/30">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/profile" className="inline-flex items-center gap-2 text-brand-hot-pink hover:text-brand-hot-pink/80 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono uppercase tracking-widest">Return to Grid</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
            Terms of <span className="text-brand-hot-pink">Service</span>
          </h1>
          <p className="text-sm font-mono text-gray-500 mb-12 uppercase tracking-widest">
            Effective: January 2026 // Binding Protocol
          </p>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-hot-pink/10 rounded-lg">
                  <Gavel className="w-6 h-6 text-brand-hot-pink" />
                </div>
                <h2 className="text-xl font-bold text-white">1. Acceptance of Protocol</h2>
              </div>
              <p className="leading-relaxed">
                By accessing the ABHED network ("The Grid"), you agree to these Terms. 
                If you do not agree, disconnect immediately. Continued signal transmission constitutes absolute acceptance.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-cyan/10 rounded-lg">
                  <UserCheck className="w-6 h-6 text-brand-cyan" />
                </div>
                <h2 className="text-xl font-bold text-white">2. Eligibility & Identity</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-2 marker:text-brand-cyan">
                <li>You must be at least 13 years of solar age.</li>
                <li>You are responsible for maintaining the security of your Neural Key (Password).</li>
                <li>Impersonation of System Architects (Admins) results in immediate account termination.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-orange/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-brand-orange" />
                </div>
                <h2 className="text-xl font-bold text-white">3. Code of Conduct</h2>
              </div>
              <p className="leading-relaxed mb-4">
                The following actions trigger an automatic ban:
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-400">
                <p>1. Hate speech or harassment of other operatives.</p>
                <p>2. Distribution of malware or unauthorized signal interference.</p>
                <p>3. Attempting to reverse-engineer the Vortex algorithm.</p>
                <p>4. Automating interactions (Botting) without Architect clearance.</p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                  <Zap className="w-6 h-6 text-brand-purple" />
                </div>
                <h2 className="text-xl font-bold text-white">4. Content Ownership</h2>
              </div>
              <p className="leading-relaxed">
                You retain ownership of all content you upload to the Vortex. 
                However, you grant ABHED a worldwide, royalty-free license to host, display, and distribute your content within the network.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Liability Limiter</h2>
              <p className="leading-relaxed text-gray-400 text-sm">
                THE NETWORK IS PROVIDED "AS IS". WE ARE NOT LIABLE FOR DATA LOSS, DOWNTIME, OR PSYCHIC DAMAGE RESULTING FROM EXPOSURE TO HIGH-FIDELITY CYBERSPACE.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              <a href="mailto:legal@abhed.network" className="text-brand-hot-pink hover:underline">legal@abhed.network</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
