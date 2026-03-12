# 🚀 Quick Start Checklist

## ✅ Pre-Flight Checklist

### 1. Get Your Thirdweb Client ID (Required)
- [ ] Go to https://thirdweb.com/dashboard
- [ ] Sign in or create an account
- [ ] Create a new project (or select existing)
- [ ] Copy your **Client ID**

### 2. Configure Environment
- [ ] Open `.env.local` file
- [ ] Replace `your-client-id-here` with your actual Client ID
- [ ] Save the file

### 3. Verify Installation
- [ ] Run `npm install` (if you haven't already)
- [ ] Wait for all dependencies to install

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Your Browser
- [ ] Navigate to http://localhost:3000
- [ ] You should see the animated Hero section!

### 6. Test Wallet Connection
- [ ] Click "Connect Wallet" button in the navbar
- [ ] Select your preferred wallet (MetaMask, Coinbase, etc.)
- [ ] Make sure you're on Sepolia testnet
- [ ] Connect your wallet

### 7. Get Sepolia Test ETH (Optional, for testing)
- [ ] Go to https://sepoliafaucet.com/
- [ ] Or use https://faucet.quicknode.com/ethereum/sepolia
- [ ] Request test ETH for transactions

---

## 🎯 What Should Work

### ✅ Navigation
- Logo click returns to home
- Active page indicator (purple underline)
- Smooth transitions between pages

### ✅ Wallet Connection
- Connect button styled with gradient
- Shows connected address when connected
- Network switching to Sepolia
- Disconnect functionality

### ✅ Animations
- Hero text slides in smoothly
- Feature cards float gently
- Background blobs pulse and rotate
- Buttons scale on hover
- Scroll indicator bounces

### ✅ Responsive Design
- Mobile menu (if screen is small)
- Tablet layout adjustments
- Desktop full experience

---

## 🐛 Troubleshooting

### Issue: "Client ID not found"
**Solution**: Make sure you've added your Client ID to `.env.local` and restarted the dev server.

### Issue: Wallet won't connect
**Solution**: 
1. Check if you're on Sepolia testnet
2. Make sure your wallet extension is unlocked
3. Clear browser cache and try again

### Issue: Animations not working
**Solution**: 
1. Check console for errors
2. Ensure Framer Motion is installed: `npm install framer-motion`
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Styles look broken
**Solution**: 
1. Verify Tailwind CSS is installed
2. Check if `globals.css` is imported in layout
3. Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`

### Issue: TypeScript errors
**Solution**: 
1. Check `tsconfig.json` has correct path aliases
2. Run `npm install @types/node @types/react @types/react-dom`
3. Restart TypeScript server in VSCode

---

## 📝 Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Install new package
npm install <package-name>

# Clear cache and restart
rm -rf .next node_modules
npm install
npm run dev
```

---

## 🎨 Customization Tips

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --purple-deep: #6b21a8;  /* Your color here */
  --purple-light: #a855f7; /* Your color here */
  --blue-deep: #1e3a8a;    /* Your color here */
}
```

### Change Network
Edit `lib/thirdweb.ts`:
```typescript
import { mainnet } from "thirdweb/chains"; // or any chain
export const chain = mainnet;
```

### Add More Navigation Links
Edit `components/Navbar.tsx`:
```typescript
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" }, // Add this
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
];
```

---

## 🎉 You're Ready!

Once you complete this checklist, your dApp should be running smoothly. Time to build something amazing! 🚀

**Need help?** Check the documentation:
- [Next.js Docs](https://nextjs.org/docs)
- [Thirdweb Docs](https://portal.thirdweb.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
