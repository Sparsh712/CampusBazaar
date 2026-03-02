import React, { useEffect, useState, useMemo } from "react";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import { Toast, Badge, truncate, inputStyle } from "./components/Shared";
import ListingCard from "./components/ListingCard";
import OrderRow from "./components/OrderRow";
import SellModal from "./components/SellModal";
import CheckoutModal from "./components/CheckoutModal";
import ChatDrawer from "./components/ChatDrawer";
import VerifyModal from "./components/VerifyModal";
import MapModal from "./components/MapModal";

const peraWallet = new PeraWalletConnect();
const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

const CATEGORIES = ["All", "Books", "Electronics", "Clothing", "Furniture", "Cycles", "Lab Equipment", "Notes", "Misc"];

const INITIAL_LISTINGS = [
  { id: 1, title: "Calculus: Early Transcendentals", category: "Books", price: 0.1, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "📘", description: "8th edition, barely used. Perfect for MATH 101/201.", condition: "Good", date: "2024-01-10", rating: 4.5, ratingCount: 12 },
  { id: 2, title: "TI-84 Plus Calculator", category: "Electronics", price: 0.1, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "🖩", description: "Works perfectly, includes USB cable and case.", condition: "Excellent", date: "2024-01-12", rating: 4.8, ratingCount: 8 },
  { id: 3, title: "Ergonomic Desk Chair", category: "Furniture", price: 5.0, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "🪑", description: "Mesh back, lumbar support. Moving out sale!", condition: "Good", date: "2024-01-14", rating: 3.9, ratingCount: 4 },
  { id: 4, title: "MacBook Pro 2021 Charger", category: "Electronics", price: 1.2, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "🔌", description: "140W USB-C power adapter. Original Apple.", condition: "Like New", date: "2024-01-15", rating: 5.0, ratingCount: 3 },
  { id: 5, title: "Organic Chemistry Textbook", category: "Books", price: 0.6, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "📗", description: "Clayden 2nd ed. Highlights in chapters 1-5 only.", condition: "Fair", date: "2024-01-16", rating: 4.2, ratingCount: 6 },
  { id: 6, title: "Campus Hoodie (M)", category: "Clothing", price: 0.9, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "👕", description: "University merch, worn twice. Navy blue.", condition: "Like New", date: "2024-01-17", rating: 4.0, ratingCount: 2 },
  { id: 7, title: "Mechanical Keyboard", category: "Electronics", price: 3.2, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "⌨️", description: "Keychron K2, brown switches. Great for coding.", condition: "Good", date: "2024-01-18", rating: 4.7, ratingCount: 15 },
  { id: 8, title: "Physics for Scientists Vol.1", category: "Books", price: 0.5, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "📙", description: "Serway & Jewett 10th ed. No markings.", condition: "Excellent", date: "2024-01-19", rating: 4.4, ratingCount: 9 },
  { id: 9, title: "Hero Sprint Cycle", category: "Cycles", price: 8.5, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "🚲", description: "21-gear, lightly used for 1 semester. Minor scratches.", condition: "Good", date: "2024-01-20", rating: 4.1, ratingCount: 5 },
  { id: 10, title: "Lab Coat + Goggles Set", category: "Lab Equipment", price: 0.3, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "🥼", description: "Chemistry lab essentials. Fits M-L. Clean.", condition: "Good", date: "2024-01-21", rating: 3.8, ratingCount: 3 },
  { id: 11, title: "DSA Handwritten Notes", category: "Notes", price: 0.2, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "📝", description: "Complete DSA notes. Covers arrays, trees, graphs, DP.", condition: "Like New", date: "2024-01-22", rating: 4.9, ratingCount: 22 },
  { id: 12, title: "Wireless Mouse (Logitech)", category: "Electronics", price: 0.4, seller: "SZJEXURXMHK3BNE7EEDHNEOXKTF7HD6QLJAUXCWRI44APPGI65ZXYFGQMY", image: "🖱️", description: "Logitech M235. Battery lasts months. Smooth scroll.", condition: "Excellent", date: "2024-01-23", rating: 4.3, ratingCount: 7 },
];

export default function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem("campusbazaar_listings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_LISTINGS; }
    }
    return INITIAL_LISTINGS;
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("campusbazaar_orders");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [tab, setTab] = useState("browse");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [condFilter, setCondFilter] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [showSell, setShowSell] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [chatListing, setChatListing] = useState(null);
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [verified, setVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [greenTrades, setGreenTrades] = useState(0);

  const showToast = (message, type = "info") => setToast({ message, type });

  useEffect(() => {
    peraWallet.reconnectSession().then(accounts => { if (accounts.length) setAccountAddress(accounts[0]); }).catch(() => { });
    peraWallet.connector?.on("disconnect", () => setAccountAddress(null));
  }, []);

  // Fetch balance from Algorand TestNet
  const fetchBalance = async (addr) => {
    if (!addr) { setBalance(null); return; }
    try {
      const accountInfo = await algodClient.accountInformation(addr).do();
      const microAlgos = accountInfo.amount ?? accountInfo["amount"];
      setBalance(Number(microAlgos) / 1e6);
    } catch (e) {
      console.error("Failed to fetch balance:", e);
      setBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance(accountAddress);
    // Refresh balance every 15 seconds while connected
    if (accountAddress) {
      const interval = setInterval(() => fetchBalance(accountAddress), 15000);
      return () => clearInterval(interval);
    }
  }, [accountAddress]);

  useEffect(() => {
    localStorage.setItem("campusbazaar_listings", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem("campusbazaar_orders", JSON.stringify(orders));
  }, [orders]);

  const connectWallet = async () => {
    try {
      const accounts = await peraWallet.connect();
      setAccountAddress(accounts[0]);
      showToast("Wallet connected!", "success");
      fetchBalance(accounts[0]);
    }
    catch { showToast("Connection cancelled", "error"); }
  };

  const disconnectWallet = () => { peraWallet.disconnect(); setAccountAddress(null); setBalance(null); showToast("Wallet disconnected"); };

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const CONDITIONS = ["All", "Like New", "Excellent", "Good", "Fair"];

  const filteredListings = useMemo(() => {
    let res = listings.filter(l => {
      const isPurchased = orders.some(o => o.title === l.title);
      if (isPurchased) return false;

      const matchCat = category === "All" || l.category === category;
      const matchCond = condFilter === "All" || l.condition === condFilter;
      const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase());
      const matchPrice = l.price >= priceRange[0] && l.price <= priceRange[1];
      return matchCat && matchCond && matchSearch && matchPrice;
    });
    if (sortBy === "newest") res = [...res].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === "price-asc") res = [...res].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") res = [...res].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") res = [...res].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return res;
  }, [listings, orders, category, condFilter, search, sortBy, priceRange]);

  const wishlistListings = useMemo(() => listings.filter(l => wishlist.includes(l.id)), [listings, wishlist]);

  const handlePayment = async (pickupLocation) => {
    const listing = checkoutItem;
    try {
      console.log("[CampusBazaar] Starting payment for:", listing.title);
      const suggestedParams = await algodClient.getTransactionParams().do();
      console.log("[CampusBazaar] Got suggested params:", suggestedParams);
      const amount = algosdk.algosToMicroalgos(listing.price);
      console.log("[CampusBazaar] Amount in microAlgos:", amount);
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: accountAddress, receiver: listing.seller, amount, suggestedParams,
        note: new TextEncoder().encode(`CampusBazaar: ${listing.title}`),
      });
      console.log("[CampusBazaar] Transaction created, requesting Pera signature...");
      const signedTxn = await peraWallet.signTransaction([[{ txn, signers: [accountAddress] }]]);
      console.log("[CampusBazaar] Got signed txn, sending to network...");

      // algosdk v3: sendRawTransaction returns the txid directly on the response
      const sendResponse = await algodClient.sendRawTransaction(signedTxn).do();
      const txid = sendResponse.txid || sendResponse.txId || sendResponse["txId"];
      console.log("[CampusBazaar] Sent! txid:", txid);

      const orderId = Date.now();
      const newOrder = { id: orderId, title: listing.title, image: listing.image, amount: listing.price, receiver: listing.seller, txId: txid, status: "Pending", date: new Date().toISOString(), rated: false, rating: 0, pickupLocation };
      setOrders(prev => [newOrder, ...prev]);
      setCheckoutItem(null);
      setTab("orders");
      showToast("Payment sent! Confirming on-chain…", "info");

      let confirmed = false;
      try {
        const confirmation = await algosdk.waitForConfirmation(algodClient, txid, 10);
        if (confirmation && (confirmation.confirmedRound || confirmation["confirmed-round"])) {
          confirmed = true;
        }
      } catch (e) {
        console.warn("[CampusBazaar] Confirmation timeout or error:", e);
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: confirmed ? "Confirmed" : "Failed" } : o));
      if (confirmed) setGreenTrades(prev => prev + 1);
      // Refresh balance after payment
      fetchBalance(accountAddress);
      showToast(confirmed ? "Payment confirmed on-chain! ✓" : "TX submitted but confirmation timed out.", confirmed ? "success" : "error");
    } catch (e) {
      console.error("[CampusBazaar] Payment error:", e);
      console.error("[CampusBazaar] Error name:", e?.name, "Error message:", e?.message);
      console.error("[CampusBazaar] Error data:", e?.data);
      setCheckoutItem(null);
      const cancelled = e.message?.includes("cancel") || e.message?.includes("rejected") || e.message?.includes("CONNECT_CANCELLED");
      if (!cancelled) {
        setOrders(prev => [{ id: Date.now(), title: listing.title, image: listing.image, amount: listing.price, receiver: listing.seller, txId: null, status: "Failed", date: new Date().toISOString(), rated: false, rating: 0, pickupLocation }, ...prev]);
      }
      showToast(cancelled ? "Transaction cancelled" : `Payment failed: ${e.message || "Unknown error"}`, "error");
    }
  };

  const handleRate = (orderId, rating) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rated: true, rating } : o));
    showToast(`Rated ${rating} stars! Thanks for your feedback.`, "success");
  };

  const co2Saved = (greenTrades * 0.0002).toFixed(4);

  const tabStyle = (t) => ({
    padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
    background: tab === t ? "#6366f1" : "none", color: tab === t ? "#fff" : "#6b7280",
    fontFamily: "'DM Mono', monospace", transition: "all .2s",
  });

  return (
    <>
      {/* ── Header ── */}
      <header style={{ background: "#0a0f1edd", backdropFilter: "blur(12px)", borderBottom: "1px solid #1f2937", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 64, flexWrap: "wrap" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f9fafb", letterSpacing: -0.5, flexShrink: 0, cursor: "pointer" }} onClick={() => setTab("browse")}>
            <span style={{ color: "#6366f1" }}>⬡</span> CampusBazaar
          </div>

          {/* Green Trades */}
          {greenTrades > 0 && (
            <div style={{ background: "#064e3b33", border: "1px solid #06543555", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#10b981", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
              🌿 {co2Saved} kg CO₂ saved
            </div>
          )}

          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {["browse", "orders", "wishlist"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
                {t === "browse" ? "Browse" : t === "orders" ? `Orders ${orders.length ? `(${orders.length})` : ""}` : `♡ ${wishlist.length || ""}`}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Map */}
            {accountAddress && (
              <button onClick={() => setShowMap(true)} title="Campus Meetup Map"
                style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, transition: "border-color .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#374151"}>
                📍
              </button>
            )}
            {/* Verify */}
            {accountAddress && !verified && (
              <button onClick={() => setShowVerify(true)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #f59e0b55", background: "#f59e0b15", color: "#f59e0b", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                🎓 Verify
              </button>
            )}
            {verified && (
              <div style={{ background: "#10b98122", border: "1px solid #10b98155", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#10b981", fontFamily: "'DM Mono', monospace" }}>
                ✓ Verified
              </div>
            )}
            {/* Sell */}
            {accountAddress && (
              <button onClick={() => { if (!verified) { showToast("Please verify your student email first!", "error"); setShowVerify(true); return; } setShowSell(true); }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #6366f1", background: "none", color: "#6366f1", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'DM Mono', monospace", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#6366f122"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                + Sell
              </button>
            )}
            {/* Wallet */}
            {!accountAddress ? (
              <button onClick={connectWallet} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>
                Connect Pera
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {balance !== null && (
                  <div style={{ background: "linear-gradient(135deg, #064e3b44, #065f4644)", border: "1px solid #10b98155", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    💰 {balance.toFixed(3)} ALGO
                  </div>
                )}
                <div style={{ background: "#1f2937", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#a5b4fc", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  {truncate(accountAddress)}
                </div>
                <button onClick={disconnectWallet} style={{ background: "none", border: "1px solid #374151", borderRadius: 8, padding: "6px 12px", color: "#6b7280", cursor: "pointer", fontSize: 13 }}>↩</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* BROWSE TAB */}
        {tab === "browse" && (
          <>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", background: "#6366f122", border: "1px solid #6366f144", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#a5b4fc", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
                ⚡ Powered by Algorand TestNet · Carbon-Negative Blockchain
              </div>
              <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16, background: "linear-gradient(135deg,#f9fafb 40%,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Buy &amp; Sell on Campus<br />with Crypto
              </h1>
              <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
                Peer-to-peer marketplace for students. Low fees ({'<'}₹0.10), instant settlement, full transparency on Algorand.
              </p>
              {/* Stats */}
              <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 28, flexWrap: "wrap" }}>
                {[["📦", listings.length, "Listings"], ["⚡", "<0.001 ALGO", "Txn Fee"], ["🌿", "Carbon-Negative", "Network"], ["🎓", verified ? "Verified" : "Open", "Status"]].map(([icon, val, label]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#a5b4fc", fontFamily: "'DM Mono', monospace" }}>{val}</div>
                    <div style={{ fontSize: 11, color: "#4b5563" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search & Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <input style={{ ...inputStyle, flex: "1 1 240px", background: "#111827" }} placeholder="🔍 Search listings…" value={search} onChange={e => setSearch(e.target.value)} />
              <select style={{ ...inputStyle, width: "auto", background: "#111827" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Price Range */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace" }}>Price:</span>
              <input type="range" min="0" max="50" step="0.5" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                style={{ flex: "0 1 200px", accentColor: "#6366f1" }} />
              <span style={{ fontSize: 12, color: "#a5b4fc", fontFamily: "'DM Mono', monospace" }}>0 – {priceRange[1]} ALGO</span>
            </div>

            {/* Category Pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${category === c ? "#6366f1" : "#1f2937"}`, background: category === c ? "#6366f122" : "none", color: category === c ? "#a5b4fc" : "#6b7280", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s" }}>
                  {c}
                </button>
              ))}
            </div>
            {/* Condition Pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              {CONDITIONS.map(c => (
                <button key={c} onClick={() => setCondFilter(c)}
                  style={{ padding: "4px 12px", borderRadius: 14, border: `1px solid ${condFilter === c ? "#8b5cf6" : "#1f2937"}`, background: condFilter === c ? "#8b5cf622" : "none", color: condFilter === c ? "#c4b5fd" : "#4b5563", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Grid */}
            {filteredListings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#4b5563" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>No listings found</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Try a different search or category</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {filteredListings.map(l => (
                  <ListingCard key={l.id} listing={l} accountAddress={accountAddress} onBuy={setCheckoutItem}
                    wishlist={wishlist} onToggleWishlist={toggleWishlist} onChat={setChatListing} />
                ))}
              </div>
            )}

            {!accountAddress && (
              <div style={{ textAlign: "center", marginTop: 40, padding: 24, background: "#111827", borderRadius: 16, border: "1px dashed #374151" }}>
                <p style={{ color: "#6b7280", marginBottom: 12 }}>Connect your Pera Wallet to buy or sell items</p>
                <button onClick={connectWallet} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                  Connect Pera Wallet
                </button>
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>My Orders</h2>
            <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 14 }}>Track your purchase history and transaction status</p>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#4b5563" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>No orders yet</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Your purchases will appear here</div>
                <button onClick={() => setTab("browse")} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Browse Listings</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.map(o => <OrderRow key={o.id} order={o} onRate={handleRate} />)}
              </div>
            )}
          </>
        )}

        {/* WISHLIST TAB */}
        {tab === "wishlist" && (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>♡ Wishlist</h2>
            <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 14 }}>Items you've saved for later</p>
            {wishlistListings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#4b5563" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💭</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Your wishlist is empty</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Tap the heart icon on any listing to save it</div>
                <button onClick={() => setTab("browse")} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Browse Listings</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {wishlistListings.map(l => (
                  <ListingCard key={l.id} listing={l} accountAddress={accountAddress} onBuy={setCheckoutItem}
                    wishlist={wishlist} onToggleWishlist={toggleWishlist} onChat={setChatListing} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Modals ── */}
      {checkoutItem && <CheckoutModal listing={checkoutItem} accountAddress={accountAddress} balance={balance} onClose={() => setCheckoutItem(null)} onConfirm={handlePayment} />}
      {showSell && <SellModal accountAddress={accountAddress} onClose={() => setShowSell(false)} onList={l => { setListings(prev => [l, ...prev]); showToast("Item listed successfully!", "success"); }} />}
      {showVerify && <VerifyModal onClose={() => setShowVerify(false)} onVerify={(email) => { setVerified(true); setVerifiedEmail(email); showToast("Student verified! You can now sell items.", "success"); }} />}
      {showMap && <MapModal onClose={() => setShowMap(false)} />}
      {chatListing && <ChatDrawer listing={chatListing} accountAddress={accountAddress} onClose={() => setChatListing(null)} onBuy={setCheckoutItem} />}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}
