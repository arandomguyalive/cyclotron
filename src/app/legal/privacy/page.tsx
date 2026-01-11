"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-brand-cyan/30">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/profile" className="inline-flex items-center gap-2 text-brand-cyan hover:text-brand-cyan/80 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono uppercase tracking-widest">Return to Grid</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
            Protocol <span className="text-brand-cyan">Privacy</span>
          </h1>
          <p className="text-sm font-mono text-gray-500 mb-12 uppercase tracking-widest">
            Last Updated: January 2026 // Sector 7 Compliance
          </p>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-cyan/10 rounded-lg">
                  <Shield className="w-6 h-6 text-brand-cyan" />
                </div>
                <h2 className="text-xl font-bold text-white">1. Data Minimization Doctrine</h2>
              </div>
              <p className="leading-relaxed">
                ABHED operates on a "Need-to-Know" basis. We do not sell your data. We do not track you across the open web. 
                Our systems only retain information explicitly required for your neural signature and faction allegiance.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                  <Database className="w-6 h-6 text-brand-purple" />
                </div>
                <h2 className="text-xl font-bold text-white">2. Information Collection</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-2 marker:text-brand-purple">
                <li><strong className="text-white">Identity:</strong> Handle, Email, and Phone Hash (for Sybil resistance).</li>
                <li><strong className="text-white">Telemetry:</strong> Device type and network latency (for Vortex optimization).</li>
                <li><strong className="text-white">Interaction:</strong> Likes, Comments, and Faction status.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-hot-pink/10 rounded-lg">
                  <Lock className="w-6 h-6 text-brand-hot-pink" />
                </div>
                <h2 className="text-xl font-bold text-white">3. End-to-End Encryption</h2>
              </div>
              <p className="leading-relaxed">
                Direct neural links (DMs) are encrypted locally before transmission. 
                Even system architects cannot decrypt your private comms without the private key held exclusively on your device.
                <span className="block mt-2 text-xs text-brand-hot-pink font-mono uppercase"> // WARNING: Loss of device key results in permanent data entropy.</span>
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-orange/10 rounded-lg">
                  <Eye className="w-6 h-6 text-brand-orange" />
                </div>
                <h2 className="text-xl font-bold text-white">4. Third-Party Interception</h2>
              </div>
              <p className="leading-relaxed">
                We integrate with zero external ad networks. 
                "Signals" (Ads) within the Vortex are native, privacy-preserving, and do not leak user context to third parties.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              For forensic inquiries or data purge requests: <br/>
              <a href="mailto:legal@abhed.network" className="text-brand-cyan hover:underline">legal@abhed.network</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
