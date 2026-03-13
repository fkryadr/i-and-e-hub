"use client";

import Link from "next/link";
import { Ticket, Award } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const floatingVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-4">
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to
            </span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              I&E Hub
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
        >
          Experience the future of event ticketing with blockchain technology.
          Secure, transparent, and truly yours.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto"
        >
          <motion.div
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            className="glass glass-hover rounded-2xl p-6 border border-purple-500/20"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Ticket className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">NFT Tickets</h3>
            <p className="text-sm text-gray-400">
              Mint and own your event tickets as unique NFTs on the blockchain
            </p>
          </motion.div>

          <motion.div
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            className="glass glass-hover rounded-2xl p-6 border border-cyan-500/20"
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Award className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Digital Certificates
            </h3>
            <p className="text-sm text-gray-400">
              Earn verifiable NFT certificates for attending events
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center"
        >
          <Link href="/events">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
            >
              Explore Events
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-purple-400 rounded-full"
            animate={{
              y: [0, 16, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
