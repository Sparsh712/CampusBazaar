import React, { useState, useRef, useEffect, useCallback } from "react";
import { truncate } from "./Shared";

/* ── Smart reply engine ───────────────────────────── */
const REPLY_MAP = {
    available: [
        "Yes, it's still available! 😊",
        "Yep, haven't sold it yet. Interested?",
        "Still available! Want to set up a meetup?",
    ],
    price: [
        "I can offer a small discount if you pick it up today!",
        "The price is firm, but I can throw in free delivery on campus.",
        "How about we meet in the middle? Make me an offer!",
    ],
    meet: [
        "I'm usually near the library — does that work?",
        "We can meet at the Student Union cafeteria, I'm there most afternoons.",
        "Campus gate or hostel mess works for me. Your call!",
    ],
    time: [
        "I'm free after 4 PM today, or anytime tomorrow!",
        "Mornings work best for me. How about 10 AM?",
        "I'm flexible — just name a time!",
    ],
    generic: [
        "Sure, that works for me! 👍",
        "Sounds good. Let me know if you have more questions!",
        "Great, let's finalize the deal!",
        "Let me check and get back to you shortly.",
        "Thanks for your interest! Feel free to ask anything.",
    ],
};

function pickReply(category) {
    const pool = REPLY_MAP[category] || REPLY_MAP.generic;
    return pool[Math.floor(Math.random() * pool.length)];
}

function classifyMessage(text) {
    const t = text.toLowerCase();
    if (/available|still have|in stock/i.test(t)) return "available";
    if (/price|cost|lower|discount|cheaper|deal/i.test(t)) return "price";
    if (/where|meet|location|pickup|campus/i.test(t)) return "meet";
    if (/when|time|free|schedule|today|tomorrow/i.test(t)) return "time";
    return "generic";
}

/* ── Extract a number (price) from free-text ──────── */
function extractPrice(text) {
    const match = text.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
}

/* ── Quick action definitions ─────────────────────── */
const QUICK_ACTIONS = [
    { label: "📦 Still available?", text: "Is this still available?" },
    { label: "💰 Lower price?", text: "Can you lower the price a bit?" },
    { label: "📍 Where to meet?", text: "Where can we meet on campus?" },
    { label: "🕐 When free?", text: "When are you free to meet?" },
];

/* ── Timestamp formatter ──────────────────────────── */
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Typing indicator component ───────────────────── */
function TypingIndicator() {
    return (
        <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "10px 16px", background: "#1f2937", borderRadius: "12px 12px 12px 4px", animation: "fadeIn .2s ease" }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#6b7280",
                    display: "inline-block", animation: `typingDots 1.4s ease-in-out ${i * 0.2}s infinite`,
                }} />
            ))}
        </div>
    );
}

/* ── Main ChatDrawer ──────────────────────────────── */
export default function ChatDrawer({ listing, accountAddress, onClose, onBuy }) {
    const [messages, setMessages] = useState([
        { from: "system", text: `Chat about "${listing.title}" — be respectful & negotiate fairly! 🤝`, time: new Date() }
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [showOffer, setShowOffer] = useState(false);
    const [offerPrice, setOfferPrice] = useState("");
    const [unread, setUnread] = useState(0);
    const [agreedPrice, setAgreedPrice] = useState(null);
    const endRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

    const pushSellerReply = useCallback((category) => {
        setTyping(true);
        const delay = 900 + Math.random() * 1400;
        setTimeout(() => {
            setTyping(false);
            setMessages(prev => [...prev, { from: "seller", text: pickReply(category), time: new Date() }]);
            setUnread(prev => prev + 1);
        }, delay);
    }, []);

    const send = useCallback((text) => {
        const msg = (text || input).trim();
        if (!msg) return;
        setMessages(prev => [...prev, { from: "buyer", text: msg, time: new Date() }]);
        setInput("");
        setUnread(0);
        const cat = classifyMessage(msg);

        // If buyer mentions a price in free text, treat it like an implicit offer
        const mentionedPrice = extractPrice(msg);
        if (mentionedPrice && mentionedPrice > 0 && (cat === "price" || cat === "generic")) {
            setTyping(true);
            const delay = 900 + Math.random() * 1400;
            setTimeout(() => {
                setTyping(false);
                const accepted = mentionedPrice >= listing.price * 0.85;
                const reply = accepted
                    ? `Sure, that works for me! ${mentionedPrice} ALGO is a deal. 👍`
                    : `Hmm, ${mentionedPrice} ALGO is a bit low. How about ${(listing.price * 0.9).toFixed(2)} ALGO?`;
                if (accepted) setAgreedPrice(mentionedPrice);
                setMessages(prev => [...prev, {
                    from: "seller",
                    type: accepted ? "offer-accepted" : "offer-counter",
                    text: reply,
                    time: new Date()
                }]);
                setUnread(prev => prev + 1);
            }, delay);
        } else {
            pushSellerReply(cat);
        }
    }, [input, pushSellerReply, listing.price]);

    const sendOffer = useCallback(() => {
        const price = parseFloat(offerPrice);
        if (isNaN(price) || price <= 0) return;
        setMessages(prev => [...prev, {
            from: "buyer", type: "offer", text: `💰 Offer: ${price} ALGO`, price, time: new Date()
        }]);
        setOfferPrice("");
        setShowOffer(false);
        setUnread(0);
        // Seller responds to offer
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            const accepted = price >= listing.price * 0.85;
            const reply = accepted
                ? `That works for me! ${price} ALGO it is. Let's finalize! ✅`
                : `Hmm, ${price} ALGO is a bit low. How about ${(listing.price * 0.9).toFixed(2)} ALGO?`;
            if (accepted) setAgreedPrice(price);
            setMessages(prev => [...prev, {
                from: "seller",
                type: accepted ? "offer-accepted" : "offer-counter",
                text: reply,
                time: new Date()
            }]);
            setUnread(prev => prev + 1);
        }, 1200 + Math.random() * 800);
    }, [offerPrice, listing.price]);

    const handleBuyNow = () => {
        onClose();
        const finalListing = agreedPrice ? { ...listing, price: agreedPrice } : listing;
        onBuy?.(finalListing);
    };

    const displayPrice = agreedPrice ?? listing.price;

    /* ── Message bubble renderer ── */
    const renderBubble = (m, i) => {
        const isBuyer = m.from === "buyer";
        const isSystem = m.from === "system";
        const isOffer = m.type === "offer" || m.type === "offer-accepted" || m.type === "offer-counter";

        let bg, borderRad;
        if (isSystem) {
            bg = "#1f293799";
            borderRad = 8;
        } else if (m.type === "offer") {
            bg = "linear-gradient(135deg, #6366f1, #7c3aed)";
            borderRad = "14px 14px 4px 14px";
        } else if (m.type === "offer-accepted") {
            bg = "linear-gradient(135deg, #059669, #10b981)";
            borderRad = "14px 14px 14px 4px";
        } else if (m.type === "offer-counter") {
            bg = "linear-gradient(135deg, #d97706, #f59e0b)";
            borderRad = "14px 14px 14px 4px";
        } else if (isBuyer) {
            bg = "linear-gradient(135deg, #6366f1, #8b5cf6)";
            borderRad = "14px 14px 4px 14px";
        } else {
            bg = "#1f2937";
            borderRad = "14px 14px 14px 4px";
        }

        return (
            <div key={i} style={{ alignSelf: isBuyer ? "flex-end" : isSystem ? "center" : "flex-start", maxWidth: isSystem ? "90%" : "78%", animation: "fadeIn .3s ease" }}>
                <div style={{
                    background: bg,
                    color: isSystem ? "#9ca3af" : "#f9fafb",
                    borderRadius: borderRad,
                    padding: isOffer ? "12px 16px" : isSystem ? "6px 14px" : "10px 14px",
                    fontSize: isSystem ? 12 : 14,
                    fontStyle: isSystem ? "italic" : "normal",
                    fontWeight: isOffer ? 700 : 400,
                }}>
                    {m.text}
                </div>
                {!isSystem && (
                    <div style={{ fontSize: 10, color: "#4b5563", marginTop: 3, textAlign: isBuyer ? "right" : "left", fontFamily: "'DM Mono', monospace", paddingLeft: isBuyer ? 0 : 4, paddingRight: isBuyer ? 4 : 0 }}>
                        {formatTime(m.time)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ width: "100%", maxWidth: 420, background: "#0f172a", borderLeft: "1px solid #1f2937", display: "flex", flexDirection: "column", animation: "slideInRight .3s ease" }}>

                {/* ── Header ── */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", gap: 12, background: "#0d1321" }}>
                    <span style={{ fontSize: 28 }}>{listing.image}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#f9fafb", fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                            {listing.title}
                            {unread > 0 && (
                                <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800, fontFamily: "'DM Mono', monospace", animation: "scaleIn .2s ease" }}>{unread}</span>
                            )}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                            Seller: {truncate(listing.seller)}
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b98188" }} />
                            <span style={{ fontSize: 10, color: "#10b981" }}>Online</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer", transition: "color .2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
                        onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>✕</button>
                </div>

                {/* ── Listing context card ── */}
                <div style={{ margin: "12px 16px 0", padding: "12px 16px", background: "#111827", border: "1px solid #1f2937", borderRadius: 12, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 36, background: "#1f2937", borderRadius: 10, padding: "8px 12px" }}>{listing.image}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", marginBottom: 2 }}>{listing.title}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: agreedPrice ? "#10b981" : "#a5b4fc", fontFamily: "'DM Mono', monospace" }}>{displayPrice} ALGO</span>
                            {agreedPrice && (
                                <span style={{ fontSize: 12, color: "#6b7280", textDecoration: "line-through", fontFamily: "'DM Mono', monospace" }}>{listing.price} ALGO</span>
                            )}
                            {agreedPrice && (
                                <span style={{ fontSize: 10, background: "#10b98122", color: "#10b981", border: "1px solid #10b98155", borderRadius: 6, padding: "1px 6px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>DEAL ✓</span>
                            )}
                            <span style={{ fontSize: 11, background: "#6366f122", color: "#a5b4fc", border: "1px solid #6366f144", borderRadius: 6, padding: "1px 6px", fontFamily: "'DM Mono', monospace" }}>{listing.condition}</span>
                        </div>
                    </div>
                    <button onClick={handleBuyNow}
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", transition: "opacity .2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        Buy Now
                    </button>
                </div>

                {/* ── Quick actions ── */}
                <div style={{ display: "flex", gap: 6, padding: "10px 16px 0", flexWrap: "wrap" }}>
                    {QUICK_ACTIONS.map(qa => (
                        <button key={qa.label} onClick={() => send(qa.text)}
                            style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: "5px 12px", color: "#9ca3af", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace", transition: "all .15s", whiteSpace: "nowrap" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#a5b4fc"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#9ca3af"; }}>
                            {qa.label}
                        </button>
                    ))}
                    <button onClick={() => { setShowOffer(s => !s); setTimeout(() => inputRef.current?.focus(), 100); }}
                        style={{ background: showOffer ? "#6366f122" : "#1f2937", border: `1px solid ${showOffer ? "#6366f1" : "#374151"}`, borderRadius: 16, padding: "5px 12px", color: showOffer ? "#a5b4fc" : "#9ca3af", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace", transition: "all .15s", whiteSpace: "nowrap" }}>
                        🏷️ Make Offer
                    </button>
                </div>

                {/* ── Make offer widget ── */}
                {showOffer && (
                    <div style={{ margin: "8px 16px 0", padding: "10px 14px", background: "#111827", border: "1px solid #6366f144", borderRadius: 12, display: "flex", gap: 8, alignItems: "center", animation: "scaleIn .2s ease" }}>
                        <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'DM Mono', monospace" }}>ALGO</span>
                        <input ref={inputRef} type="number" step="0.01" min="0" value={offerPrice} onChange={e => setOfferPrice(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendOffer()}
                            placeholder="Your price…"
                            style={{ flex: 1, background: "#0f172a", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#f9fafb", fontSize: 14, outline: "none", fontFamily: "'DM Mono', monospace" }} />
                        <button onClick={sendOffer}
                            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                            Send Offer
                        </button>
                    </div>
                )}

                {/* ── Messages ── */}
                <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    {messages.map(renderBubble)}
                    {typing && <TypingIndicator />}
                    <div ref={endRef} />
                </div>

                {/* ── Input ── */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #1f2937", display: "flex", gap: 8, background: "#0d1321" }}>
                    <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        placeholder="Type a message…"
                        style={{ flex: 1, background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "10px 14px", color: "#f9fafb", fontSize: 14, outline: "none", transition: "border-color .2s" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#6366f1"; setUnread(0); }}
                        onBlur={e => e.currentTarget.style.borderColor = "#374151"} />
                    <button onClick={() => send()}
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16, transition: "opacity .2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
