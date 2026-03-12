export interface Event {
  id: string;
  title: string;
  date: string;
  bannerImage: string;
  description: string;
  longDescription: string;
  venue: string;
  category: string;
  availableQuota: number;
  totalQuota: number;
  priceInPOL: string;
  organizer: string;
  features: string[];
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Web3 Innovation Summit 2026",
    date: "March 15, 2026 • 2:00 PM GMT",
    bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    description: "Join industry leaders and innovators for the biggest Web3 event of the year.",
    longDescription: "The Web3 Innovation Summit brings together the brightest minds in blockchain, DeFi, and decentralized technologies. This groundbreaking event features keynote speeches from industry pioneers, interactive workshops, networking sessions, and exclusive insights into the future of Web3. Whether you're a developer, investor, entrepreneur, or enthusiast, this summit offers unparalleled opportunities to learn, connect, and shape the future of the decentralized web.",
    venue: "Grand Convention Center, London",
    category: "Conference",
    availableQuota: 150,
    totalQuota: 500,
    priceInPOL: "0.05",
    organizer: "Web3 Foundation",
    features: [
      "Keynote speeches from industry leaders",
      "Hands-on workshops and tutorials",
      "Networking sessions with investors",
      "Exclusive NFT certificate upon completion",
      "Access to recorded sessions",
      "VIP dinner with speakers"
    ]
  },
  {
    id: "2",
    title: "NFT Art Gallery Opening",
    date: "March 22, 2026 • 6:00 PM GMT",
    bannerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    description: "Experience the future of digital art in this immersive NFT gallery showcase.",
    longDescription: "Step into the metaverse at our exclusive NFT Art Gallery Opening. This event showcases groundbreaking digital artworks from renowned and emerging NFT artists. Explore interactive installations, participate in live minting sessions, and engage with artists in intimate Q&A sessions. Each attendee receives a commemorative NFT ticket and exclusive access to private art sales. Join us for an unforgettable evening celebrating the intersection of art and blockchain technology.",
    venue: "Digital Arts Museum, New York",
    category: "Art & Culture",
    availableQuota: 45,
    totalQuota: 200,
    priceInPOL: "0.08",
    organizer: "CryptoArt Collective",
    features: [
      "Curated NFT art exhibitions",
      "Meet-and-greet with featured artists",
      "Live minting demonstrations",
      "Exclusive early access to art drops",
      "Complimentary refreshments",
      "VR gallery experience"
    ]
  },
  {
    id: "3",
    title: "Blockchain Developer Conference",
    date: "April 5, 2026 • 9:00 AM GMT",
    bannerImage: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=1200&auto=format&fit=crop",
    description: "Level up your blockchain development skills with expert-led sessions and hands-on coding.",
    longDescription: "The Blockchain Developer Conference is the premier gathering for developers building the future of Web3. This intensive, full-day event features technical workshops, code reviews, architecture deep-dives, and the latest tools and frameworks in blockchain development. Learn best practices from experts at leading Web3 companies, participate in hackathon challenges, and connect with fellow developers. All skill levels welcome, from beginners to advanced blockchain architects.",
    venue: "Tech Hub Conference Center, San Francisco",
    category: "Technology",
    availableQuota: 320,
    totalQuota: 1000,
    priceInPOL: "0.12",
    organizer: "DevDAO",
    features: [
      "Advanced smart contract workshops",
      "Security audit masterclasses",
      "Open-source collaboration sessions",
      "Hackathon with prizes",
      "Job fair with top Web3 companies",
      "Lifetime access to learning materials"
    ]
  }
];

export function getEventById(id: string): Event | undefined {
  return mockEvents.find(event => event.id === id);
}
