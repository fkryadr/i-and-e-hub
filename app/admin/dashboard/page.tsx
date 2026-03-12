import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Calendar, 
  Ticket, 
  Award, 
  Users, 
  TrendingUp, 
  Activity, 
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { getContract } from "thirdweb";
import { client, chain } from "@/lib/thirdweb";
import { redirect } from "next/navigation";

// Dashboard is a Server Component, so we can fetch directly from Prisma
export default async function AdminDashboardPage() {
  
  // 1. Fetch metrics in parallel
  const [
    totalEvents,
    totalTickets,
    totalCertificates,
    totalUniqueUsers
  ] = await Promise.all([
    // Count all events
    prisma.tb_event.count(),
    
    // Count all tickets sold
    prisma.tb_transaksi_tiket.count(),
    
    // Count all issued certificates
    prisma.tb_sertifikat.count(),
    
    // Count unique users who have connected/bought tickets
    prisma.tb_user.count()
  ]);

  // 2. Fetch "Most Popular Event" (Event with most tickets sold)
  // We can group by event_id in tb_transaksi_tiket and order by count
  const popularEventStats = await prisma.tb_transaksi_tiket.groupBy({
    by: ['event_id'],
    _count: {
      event_id: true,
    },
    orderBy: {
      _count: {
        event_id: 'desc'
      }
    },
    take: 1
  });

  let mostPopularEvent = null;
  if (popularEventStats.length > 0) {
    const popularEventId = popularEventStats[0].event_id;
    const event = await prisma.tb_event.findUnique({
      where: { id: popularEventId },
      select: { title: true }
    });
    
    if (event) {
      mostPopularEvent = {
        title: event.title,
        ticketCount: popularEventStats[0]._count.event_id
      };
    }
  }

  // 3. Fetch Recent Activity (Tickets & Certificates merged)
  // Fetch latest 5 tickets
  const recentTickets = await prisma.tb_transaksi_tiket.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    select: { id: true, wallet_address: true, tx_hash: true, created_at: true },
  });

  // Fetch latest 5 minted certificates
  const recentCertificates = await prisma.tb_sertifikat.findMany({
    take: 5,
    orderBy: { minted_at: 'desc' },
    select: { id: true, wallet_address: true, tx_hash: true, minted_at: true },
  });

  // Merge and Sort
  type ActivityItem = {
    id: string;
    type: 'Ticket' | 'Certificate';
    wallet_address: string;
    fullTxHash: string | null;
    date: Date;
  };

  const combinedActivity: ActivityItem[] = [
    ...recentTickets.map(t => ({
      id: `ticket-${t.id}`,
      type: 'Ticket' as const,
      wallet_address: t.wallet_address,
      fullTxHash: t.tx_hash,
      date: t.created_at,
    })),
    ...recentCertificates.map(c => ({
      id: `cert-${c.id}`,
      type: 'Certificate' as const,
      wallet_address: c.wallet_address,
      fullTxHash: c.tx_hash,
      date: c.minted_at,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const truncateHash = (hash: string | null) => {
    if (!hash) return '';
    return hash.slice(0, 6) + '...' + hash.slice(-4);
  };

  // Data for the metrics grid
  const metrics = [
    {
      title: "Total Events",
      value: totalEvents,
      icon: Calendar,
      color: "text-blue-400",
      bgClasses: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Tickets Sold",
      value: totalTickets,
      icon: Ticket,
      color: "text-purple-400",
      bgClasses: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Certificates Minted",
      value: totalCertificates,
      icon: Award,
      color: "text-green-400",
      bgClasses: "bg-green-500/10 border-green-500/20",
    },
    {
      title: "Active Users",
      value: totalUniqueUsers,
      icon: Users,
      color: "text-pink-400",
      bgClasses: "bg-pink-500/10 border-pink-500/20",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl glass border-purple-500/30 p-8">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, Admin! 👋
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Here&apos;s an overview of your DApp&apos;s performance. Manage your events, monitor ticket sales, and issue certificates.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="glass border-gray-800 backdrop-blur-md overflow-hidden hover:border-purple-500/30 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgClasses} border transition-colors group-hover:scale-110 duration-300`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-gray-400 font-medium">{item.title}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Popular Event */}
        <Card className="glass border-purple-500/20 backdrop-blur-md">
          <CardHeader className="border-b border-gray-800/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-cyan-400" />
              Most Popular Event
            </CardTitle>
            <CardDescription className="text-gray-400">
              The event with the highest ticket sales in the database
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {mostPopularEvent ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                <div>
                  <h4 className="font-bold text-lg text-white mb-1">{mostPopularEvent.title}</h4>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <Ticket className="w-4 h-4" /> {mostPopularEvent.ticketCount} attendees registered
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/10 inner-glow">
                  <span className="text-cyan-400 font-bold">#1</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No events with ticket sales found yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass border-purple-500/20 backdrop-blur-md flex flex-col h-full">
          <CardHeader className="border-b border-gray-800/50 pb-4 shrink-0">
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-green-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest ticket purchases and minted certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            {combinedActivity.length > 0 ? (
              <div className="space-y-4">
                {combinedActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                        activity.type === 'Certificate' 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-indigo-500/10 border-indigo-500/20'
                      }`}>
                        {activity.type === 'Certificate' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Ticket className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {activity.type === 'Certificate' ? 'Certificate Minted' : 'Ticket Purchased'}
                        </p>
                        <p className="text-gray-400 text-xs font-mono">
                          {activity.wallet_address.slice(0, 6)}...{activity.wallet_address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                      {activity.fullTxHash ? (
                        (() => {
                          const cleanTxHash = activity.fullTxHash.split('-')[0];
                          return (
                            <a 
                              href={`https://amoy.polygonscan.com/tx/${cleanTxHash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-end gap-1 mt-0.5"
                            >
                              {truncateHash(cleanTxHash)} ↗
                            </a>
                          );
                        })()
                      ) : (
                        <span className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-0.5 cursor-not-allowed">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 h-full flex flex-col items-center justify-center">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No recent transactions found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
