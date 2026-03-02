import React from "react";
import { Badge, truncate, statusColor } from "./Shared";

export default function OrderRow({ order, onRate }) {
    return (
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "14px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center", animation: "fadeIn .3s ease" }}>
            <div style={{ fontSize: 28 }}>{order.image}</div>
            <div>
                <div style={{ fontWeight: 700, color: "#f9fafb", fontSize: 15 }}>{order.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                    To: {truncate(order.receiver)} · {new Date(order.date).toLocaleDateString()}
                    {order.pickupLocation && <div>Pickup: {order.pickupLocation}</div>}
                </div>
                {order.txId && (
                    <a href={`https://lora.algokit.io/testnet/transaction/${order.txId}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: "#6366f1", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>
                        {truncate(order.txId)} ↗
                    </a>
                )}
                {/* Rating */}
                {order.status === "Confirmed" && !order.rated && (
                    <div style={{ marginTop: 6, display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => onRate?.(order.id, star)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, transition: "transform .15s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                                ☆
                            </button>
                        ))}
                        <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6, lineHeight: "20px" }}>Rate this</span>
                    </div>
                )}
                {order.rated && (
                    <div style={{ marginTop: 4, fontSize: 12, color: "#f59e0b" }}>
                        {"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)} <span style={{ color: "#6b7280" }}>Rated</span>
                    </div>
                )}
            </div>
            <div style={{ fontWeight: 700, color: "#a5b4fc", fontFamily: "'DM Mono', monospace", textAlign: "right" }}>
                {order.amount} ALGO
            </div>
            <div>
                <Badge text={order.status} color={statusColor[order.status]} />
            </div>
        </div>
    );
}
