"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import EventCard from "./EventCard";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  priceInPOL: string;
  totalQuota: number;
  availableQuota: number;
  bannerImage: string;
}

interface FeaturedEventsClientProps {
  events: Event[];
}

export default function FeaturedEventsClient({ events }: FeaturedEventsClientProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm">
              Featured Events
            </span>
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Discover Amazing Events
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore upcoming events, mint your NFT tickets, and be part of the Web3 revolution
          </p>
        </motion.div>

        {/* Events Grid */}
        {events.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map((event) => (
              <EventCard
                key={event._id}
                id={event._id}
                title={event.title}
                date={event.date}
                bannerImage={event.bannerImage}
                availableQuota={event.availableQuota}
                totalQuota={event.totalQuota}
                priceInPOL={event.priceInPOL}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Events Yet</h3>
            <p className="text-gray-400 text-lg">
              Check back soon for exciting Web3 events!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
