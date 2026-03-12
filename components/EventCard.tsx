"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Users, Zap } from "lucide-react";
import { MediaRenderer } from "thirdweb/react";
import { client } from "@/lib/thirdweb";

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  bannerImage: string;
  availableQuota: number;
  totalQuota: number;
  priceInPOL: string;
}

export default function EventCard({
  id,
  title,
  date,
  bannerImage,
  availableQuota,
  totalQuota,
  priceInPOL,
}: EventCardProps) {
  const isSoldOut = availableQuota === 0;
  const isLowStock = availableQuota > 0 && availableQuota <= totalQuota * 0.2;

  return (
    <Link href={`/event/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, y: -8 }}
        className="group relative glass rounded-2xl overflow-hidden cursor-pointer"
      >
        {/* Glowing border effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 blur-xl" />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:border-purple-500/50 transition-colors duration-300">
          {/* Banner Image */}
          <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
            <MediaRenderer
              client={client}
              src={bannerImage}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Status Badge */}
            {isSoldOut ? (
              <div className="absolute top-4 right-4 px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-red-400/50">
                Sold Out
              </div>
            ) : isLowStock ? (
              <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-orange-400/50 animate-pulse">
                Limited
              </div>
            ) : (
              <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-green-400/50">
                Available
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-4 left-4 px-4 py-2 glass rounded-full border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-lg font-bold text-white">{priceInPOL} POL</span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
              {title}
            </h3>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-300 mb-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm">{date}</span>
            </div>

            {/* Quota */}
            <div className="flex items-center gap-2 text-gray-300 mb-4">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">
                {availableQuota} / {totalQuota} tickets remaining
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(availableQuota / totalQuota) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isSoldOut
                    ? "bg-red-500"
                    : isLowStock
                    ? "bg-orange-500"
                    : "bg-gradient-to-r from-purple-500 to-cyan-500"
                }`}
              />
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSoldOut}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                isSoldOut
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
              }`}
            >
              {isSoldOut ? "Sold Out" : "Get Tickets"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
