# ⬡ CampusBazaar

**Buy & Sell on Campus with Crypto.**  
A peer-to-peer, carbon-negative campus marketplace powered by **Algorand**.

---

## 📖 Overview

**CampusBazaar** is a decentralized marketplace designed exclusively for university students. It solves the problem of cash-heavy, high-fee, or cumbersome on-campus trading by leveraging the **Algorand TestNet** for instant, low-fee (<0.001 ALGO), and carbon-negative transactions. 

Whether you're selling last semester's Calculus textbook, hunting for a cheap cycle, or buying lab equipment, CampusBazaar makes it seamless and secure.

### ✨ Key Features

- **⚡ Lightning-Fast Crypto Payments:** Built on Algorand. Send and receive funds instantly using Pera Wallet.
- **🎓 Student Verification:** An integrated student email verification system ensures only legitimate campus members can sell items, reducing spam and external scams.
- **📍 Interactive Campus Maps:** Integrated with Leaflet, allowing buyers and sellers to agree on exact geolocation meetup spots (e.g., Library, Student Union) on a campus map.
- **💬 Real-Time Chat System:** Integrated chat drawer to negotiate or ask questions directly to the seller before initiating a transaction.
- **🌿 Carbon-Negative Tracking:** Aligned with Algorand's eco-friendly mission, the app tracks and displays the estimated CO₂ saved by buying second-hand items.
- **⭐ Reputation System:** Post-transaction star rating system to build community trust.
- **🔖 Wishlist & Smart Filtering:** Filter by price, condition, or category (Books, Cycles, Electronics, etc.), and save your favorite listings.

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite
- **Web3 / Blockchain:** Algorand SDK (`algosdk`), Pera Wallet Connect (`@perawallet/connect`)
- **Mapping:** React Leaflet (`react-leaflet`, `leaflet`)
- **Network:** Algorand TestNet (via Algonode API)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- **Pera Wallet** mobile app (iOS/Android) connected to **Algorand TestNet**.
- Standard Web Browser (Chrome/Firefox/Brave)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sparsh712/campusbazaar.git
   cd campusbazaar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the App:**  
   Navigate to `http://localhost:5173`. Connect your Pera Wallet configured to TestNet, get some test ALGOs from the [Algorand Dispenser](https://bank.testnet.algorand.network/), and start trading!

---

## 💡 How It Works (The Flow)

1. **Onboarding & Verification:**
   - User connects Pera Wallet.
   - To list an item, the user must undergo "Verification" (entering a `.edu` email).
2. **Browsing & Chat:**
   - Buyers can search for items by name, category, or condition.
   - A buyer can open the **Chat Drawer** to communicate with the seller about the item.
3. **Checkout & Maps:**
   - When choosing to buy, the buyer selects a **Pick-up Location** using an interactive map.
   - The transaction is simulated and routed through Pera Wallet for user signature.
4. **On-Chain Settlement:**
   - The React app uses `algosdk.makePaymentTxnWithSuggestedParamsFromObject` to craft the transaction.
   - Wait for Algorand network confirmation (typically ~3.3 seconds).
   - Once confirmed, the order becomes part of the user's history and UI updates the "CO₂ saved" metric.
5. **Post-Sale:**
   - The buyer meets the seller, picks up the item, and leaves a rating.

---

## 🏆 Hackathon Submission Details

- **Track/Theme:** Web3 / Decentralized Applications (dApps) / Sustainability
- **Problem Solved:** Providing a secure, localized, low-friction micro-economy for college campuses using blockchain technology, while promoting sustainability (re-using items).
- **Why Algorand?**
  - High throughput and fast finality perfectly suit a marketplace where students want instant confirmation.
  - Minimal transaction fees make micro-transactions viable.
  - Carbon-negative footprint aligns perfectly with a sustainability-focused second-hand marketplace.

---

## 🤝 Future Enhancements
- **Smart Contract Escrow:** Moving from direct payments to PyTeal/TealScript escrow for atomic swaps.
- **Multi-Asset Support:** Support for USDCa and dedicated Campus Tokens.
- **AI Categorization:** Auto-tagging listings based on image uploads.

---

*Built with by Team Vectôr.*
#
