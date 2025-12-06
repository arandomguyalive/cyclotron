"use client";

import Link from "next/link";

import { useState } from "react";

import { motion } from "framer-motion";

import { Settings, Grid, Film, Heart, MessageCircle } from "lucide-react";

import { SettingsModal } from "@/components/profile/SettingsModal";

import { useSonic } from "@/lib/SonicContext";



export default function ProfilePage() {

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { playClick } = useSonic();



  const handleButtonClick = () => {

    playClick(300, 0.05, 'square'); // A softer click for general buttons

    if (navigator.vibrate) {

      navigator.vibrate(20); // Even shorter vibration

    }

  };



  return (

    <div className="min-h-screen bg-cyber-black text-white pb-24">

      {/* Header / Cover */}

      <div className="h-40 bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-pink opacity-50 relative">

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />

      </div>



      {/* Profile Info */}

      <div className="px-4 -mt-12 relative z-10">

        <div className="flex justify-between items-end">

          <motion.div 

            initial={{ scale: 0 }}

            animate={{ scale: 1 }}

            className="w-24 h-24 rounded-full border-4 border-cyber-black bg-black overflow-hidden"

          >

            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User123" alt="Profile" className="w-full h-full" />

          </motion.div>

          <div className="flex gap-2">

            <Link 

              href="/chat" 

              onClick={handleButtonClick}

              className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"

            >

              <MessageCircle className="w-6 h-6 text-white" />

            </Link>

            <button 

              onClick={() => {

                setIsSettingsOpen(true);

                handleButtonClick();

              }}

              className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"

            >

              <Settings className="w-6 h-6 text-white" />

            </button>

          </div>

        </div>



        <div className="mt-4">

          <h1 className="text-2xl font-bold">Cyber Drifter</h1>

          <p className="text-cyber-blue">@neon_genesis</p>

          <p className="mt-2 text-sm text-gray-400 leading-relaxed">

            Building digital dreams in the void. 

            <br/>

            Full-stack Developer | UI Enthusiast

          </p>

        </div>



        {/* Stats */}

        <div className="flex gap-6 mt-6 py-4 border-y border-white/5">

          <Stat label="Following" value="245" />

          <Stat label="Followers" value="12.4K" />

          <Stat label="Likes" value="84.2K" />

        </div>



        {/* Tabs */}

        <div className="flex mt-4 gap-4">

          <button 

            onClick={handleButtonClick}

            className="flex-1 py-2 border-b-2 border-cyber-blue text-cyber-blue flex justify-center"

          >

            <Grid className="w-5 h-5" />

          </button>

          <button 

            onClick={handleButtonClick}

            className="flex-1 py-2 border-b-2 border-transparent text-gray-500 flex justify-center"

          >

            <Heart className="w-5 h-5" />

          </button>

        </div>



        {/* Grid Content */}

        <div className="grid grid-cols-3 gap-1 mt-4">

          {Array.from({ length: 9 }).map((_, i) => (

            <div key={i} className="aspect-square bg-white/5 relative overflow-hidden group">

                <div className={`absolute inset-0 bg-gradient-to-br ${

                    ['from-pink-500 to-purple-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500'][i % 3]

                } opacity-50 group-hover:opacity-80 transition-opacity`}/>

            </div>

          ))}

        </div>

      </div>



      {/* Settings Modal */}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

    </div>

  );

}



function Stat({ label, value }: { label: string, value: string }) {

  return (

    <div className="flex flex-col">

      <span className="font-bold text-lg">{value}</span>

      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>

    </div>

  );

}