# I & E Hub - Web3 Event Ticketing & NFT Certificate dApp

A modern Web3 application for event ticketing and NFT certificates built with Next.js, Thirdweb SDK v5, and Tailwind CSS.

## Features

- 🎫 NFT-based event tickets on Sepolia testnet
- 🏆 Digital certificates as NFTs
- ⚡ Instant ticket transfers
- 🎨 Modern glassmorphism UI with dark mode
- 🔐 Secure wallet connection with Thirdweb
- ✨ Smooth animations with Framer Motion

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Web3**: Thirdweb SDK v5
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Blockchain**: Sepolia Testnet

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Thirdweb account and client ID

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd i-and-e-hub
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id-here
```

To get your Thirdweb client ID:
- Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
- Create a new project or use an existing one
- Copy your client ID

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
i-and-e-hub/
├── app/
│   ├── layout.tsx          # Root layout with ThirdwebProvider
│   ├── page.tsx            # Home page with Hero
│   ├── profile/            # Profile page
│   ├── admin/              # Admin dashboard
│   └── globals.css         # Global styles
├── components/
│   ├── Navbar.tsx          # Navigation with ConnectButton
│   └── Hero.tsx            # Animated hero section
├── lib/
│   └── thirdweb.ts         # Thirdweb client configuration
└── public/                 # Static assets
```

## Configuration

### Thirdweb Setup

The app is configured to use Sepolia testnet. You can change the chain in `lib/thirdweb.ts`:

```typescript
import { sepolia } from "thirdweb/chains";

export const chain = sepolia; // Change to your preferred chain
```

### Styling

The app uses a custom glassmorphism design with:
- Deep purples and blues
- Neon cyan accents
- Blur effects and gradients
- Smooth hover animations

Customize colors in `app/globals.css`.

## Building for Production

```bash
npm run build
npm start
```

## Deployment

Deploy easily with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Don't forget to add your environment variables in the Vercel dashboard!

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
