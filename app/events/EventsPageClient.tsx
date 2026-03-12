"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Filter } from "lucide-react";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";

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

interface EventsPageClientProps {
  events: Event[];
}

type Category = "all" | "conference" | "workshop" | "art";

const categories = [
  { id: "all" as Category, label: "All Events", icon: Sparkles },
  { id: "conference" as Category, label: "Conferences", icon: Calendar },
  { id: "workshop" as Category, label: "Workshops", icon: Filter },
  { id: "art" as Category, label: "Art & Culture", icon: Sparkles },
];

export default function EventsPageClient({ events }: EventsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const filteredEvents =
    selectedCategory === "all"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      {/* Background decoration */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8247E5]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[#8247E5]" />
            <span className="text-[#8247E5] font-semibold uppercase tracking-wider text-sm">
              Event Catalog
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#8247E5] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Discover Web3 Events
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Browse through our curated collection of blockchain events, workshops, and conferences.
            Mint your NFT ticket and join the Web3 revolution.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#8247E5] to-purple-600 text-white shadow-lg shadow-[#8247E5]/30"
                    : "glass border border-purple-500/30 text-gray-300 hover:border-[#8247E5]/50 hover:bg-[#8247E5]/10"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </motion.div>

        {/* Event Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{filteredEvents.length}</span>{" "}
            {filteredEvents.length === 1 ? "event" : "events"}
          </p>
        </motion.div>

        {/* Events Grid */}
        {filteredEvents.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <EventCard
                  id={event._id}
                  title={event.title}
                  date={event.date}
                  bannerImage={event.bannerImage}
                  availableQuota={event.availableQuota}
                  totalQuota={event.totalQuota}
                  priceInPOL={event.priceInPOL}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400 mb-6">
              {events.length === 0 
                ? "No events have been created yet. Check back soon for exciting Web3 events!"
                : "No events match your selected category. Try a different filter!"}
            </p>
            {events.length > 0 && (
              <Button
                onClick={() => setSelectedCategory("all")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                View All Events
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
