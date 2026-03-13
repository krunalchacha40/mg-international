import { useState } from "react";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const initialOrders = [
  // AGENCY
  {
    id: "MG-001", orderType: "agency", date: "2026-03-01",
    seller: "Rajdhani Textiles", buyer: "Shree Finishing Mills",
    fabric: "Grey Cotton Poplin", qty: 5000, unit: "meters", rate: 42,
    paymentTerms: "30 days", deliveryDays: "7",
    dispatches: [
      { date: "2026-03-05", qty: 2000, invoiceNo: "RAJ/26/1041", invoiceDate: "2026-03-05", invoiceAmt: "84000", bags: "40", grossWt: "1020", netWt: "1000", paymentDays: "30", transportName: "Shiv Transport", lrNo: "LR-4421" },
      { date: "2026-03-09", qty: 2000, invoiceNo: "RAJ/26/1058", invoiceDate: "2026-03-09", invoiceAmt: "84000", bags: "40", grossWt: "1018", netWt: "998",  paymentDays: "30", transportName: "Om Carrier",     lrNo: "LR-4489" },
    ],
  },
  // OWN — PURCHASE
  {
    id: "MG-002", orderType: "own", ownType: "purchase", date: "2026-03-04",
    seller: "Krishna Weaving", buyer: "MG INTERNATIONAL", soldTo: "Balaji Dyeing Works",
    fabric: "Grey PC Shirting", qty: 8000, unit: "meters", rate: 35,
    paymentTerms: "45 days", deliveryDays: "5",
    dispatches: [
      { date: "2026-03-06", qty: 8000, invoiceNo: "KW/26/0210", invoiceDate: "2026-03-06", invoiceAmt: "280000", bags: "160", grossWt: "4100", netWt: "4000", paymentDays: "45", transportName: "Jai Mata Di Transport", lrNo: "LR-3310" },
    ],
  },
  // OWN — SALES
  {
    id: "MG-003", orderType: "own", ownType: "sales", date: "2026-03-05",
    seller: "MG INTERNATIONAL", buyer: "Balaji Dyeing Works",
    fabric: "Grey PC Shirting", qty: 8000, unit: "meters", rate: 38,
    paymentTerms: "30 days", deliveryDays: "3",
    dispatches: [
      { date: "2026-03-08", qty: 8000, invoiceNo: "MGI/26/0031", invoiceDate: "2026-03-08", invoiceAmt: "304000", bags: "160", grossWt: "4100", netWt: "4000", paymentDays: "30", transportName: "Jai Mata Di Transport", lrNo: "LR-3318" },
    ],
  },
  // AGENCY — pending
  {
    id: "MG-004", orderType: "agency", date: "2026-03-07",
    seller: "Krishna Weaving", buyer: "Modern Processors",
    fabric: "Grey Cambric", qty: 12000, unit: "meters", rate: 31,
    dispatches: [],
  },
];

const EMPTY_DISPATCH = { date: "", qty: "", invoiceNo: "", invoiceDate: "", invoiceAmt: "", bags: "", grossWt: "", netWt: "", paymentDays: "", transportName: "", lrNo: "" };
const EMPTY_ORDER    = { orderType: "agency", ownType: "purchase", date: "", seller: "", buyer: "", soldTo: "", fabric: "", qty: "", unit: "meters", rate: "", paymentTerms: "", deliveryDays: "", remarks: "" };

// ─── CONFIGS ─────────────────────────────────────────────────────────────────
const SC = {
  pending:   { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,.13)" },
  partial:   { label: "In Transit", color: "#3b82f6", bg: "rgba(59,130,246,.13)" },
  completed: { label: "Completed",  color: "#10b981", bg: "rgba(16,185,129,.13)" },
};
const OT = {
  agency:   { label: "Agency",   color: "#a78bfa", bg: "rgba(167,139,250,.13)" },
  purchase: { label: "Purchase", color: "#f97316", bg: "rgba(249,115,22,.13)"  },
  sales:    { label: "Sales",    color: "#10b981", bg: "rgba(16,185,129,.13)"  },
};

const getDispatched = o => o.dispatches.reduce((s, d) => s + d.qty, 0);
const getStatus     = o => { const d = getDispatched(o); return d === 0 ? "pending" : d >= o.qty ? "completed" : "partial"; };
const payDue = (date, days) => {
  if (!date || !days) return null;
  const d = new Date(date); d.setDate(d.getDate() + parseInt(days));
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const typeTag = o => o.orderType === "agency" ? OT.agency : o.ownType === "purchase" ? OT.purchase : OT.sales;

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [orders,  setOrders]  = useState(initialOrders);
  const [sel,     setSel]     = useState(null);
  const [selDisp, setSelDisp] = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [showOF,  setShowOF]  = useState(false);
  const [showDF,  setShowDF]  = useState(false);
  const [nO,      setNO]      = useState(EMPTY_ORDER);
  const [nD,      setND]      = useState(EMPTY_DISPATCH);
  const [toast,   setToast]   = useState(null);

  const notify  = m => { setToast(m); setTimeout(() => setToast(null), 2400); };
  const filtered = orders.filter(o => filter === "all" || getStatus(o) === filter);

  const saveOrder = () => {
    if (!nO.date || !nO.seller || !nO.buyer || !nO.fabric || !nO.qty) return notify("Fill all * fields");
    const id = `MG-${String(orders.length + 1).padStart(3, "0")}`;
    setOrders(p => [...p, { ...nO, id, qty: +nO.qty, rate: +nO.rate || 0, dispatches: [] }]);
    setNO(EMPTY_ORDER); setShowOF(false); notify("Order created!");
  };

  const saveDispatch = () => {
    if (!nD.date || !nD.qty) return notify("Date & qty required");
    const rem = sel.qty - getDispatched(sel);
    if (+nD.qty > rem) return notify(`Only ${rem} ${sel.unit} remaining`);
    const updated = orders.map(o =>
      o.id === sel.id ? { ...o, dispatches: [...o.dispatches, { ...nD, qty: +nD.qty }] } : o
    );
    setOrders(updated); setSel(updated.find(o => o.id === sel.id));
    setND(EMPTY_DISPATCH); setShowDF(false); notify("Dispatch saved!");
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#0c0c11", minHeight: "100vh", color: "#e4e2ef", maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .inp{background:#181820;border:1.5px solid #26263a;border-radius:10px;padding:11px 13px;color:#e4e2ef;font-size:14px;width:100%;font-family:'DM Sans',sans-serif;outline:none;transition:border .15s}
        .inp:focus{border-color:#7c6af7}
        .inp::placeholder{color:#3e3e55}
        select.inp option{background:#181820}
        .card{background:#111119;border:1px solid #1e1e2c;border-radius:13px;padding:13px;transition:transform .12s}
        .card:active{transform:scale(.985)}
        .pill{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600}
        .pbar{height:5px;background:#1e1e2c;border-radius:99px;overflow:hidden;margin-top:7px}
        .pfill{height:100%;border-radius:99px;transition:width .4s}
        .sheet{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:#0f0f18;border-top:1px solid #1e1e2c;border-radius:20px 20px 0 0;padding:18px 16px 46px;z-index:100}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99}
        .btn{background:linear-gradient(135deg,#7c6af7,#a78bfa);color:#fff;border:none;border-radius:11px;padding:13px;font-size:14px;font-weight:700;width:100%;font-family:'DM Sans',sans-serif;cursor:pointer}
        .chip{background:#181820;border:1.5px solid #26263a;border-radius:999px;padding:5px 13px;font-size:12px;font-weight:600;color:#555;cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif}
        .chip.on{background:linear-gradient(135deg,#7c6af7,#a78bfa);border-color:transparent;color:#fff}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .row{display:flex;gap:8px}
        .sbox{background:#13131e;border:1px solid #1e1e2c;border-radius:11px;padding:12px 13px;margin-bottom:9px}
        .seg{display:flex;background:#181820;border:1.5px solid #26263a;border-radius:11px;overflow:hidden}
        .seg-btn{flex:1;padding:10px 6px;text-align:center;font-size:13px;font-weight:700;cursor:pointer;border:none;background:transparent;font-family:'DM Sans',sans-serif;color:#555;transition:all .15s}
        .seg-btn.on{color:#fff}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: "16px 15px 12px", background: "#0c0c11", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #16161f" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {(sel || selDisp)
            ? <button onClick={() => { if (selDisp) setSelDisp(null); else setSel(null); }}
                style={{ background: "#181820", border: "1px solid #26263a", color: "#888", borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ← Back
              </button>
            : <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, background: "linear-gradient(135deg,#a78bfa,#7c6af7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MG INTERNATIONAL</div>
                <div style={{ fontSize: 10, color: "#363650", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 1 }}>Textile Agent · Order Tracker</div>
              </div>
          }
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {sel && !selDisp && <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>{sel.id}</span>}
            {selDisp && <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>Lot {sel.dispatches.indexOf(selDisp) + 1}</span>}
            {!sel && !selDisp && (
              <button onClick={() => setShowOF(true)}
                style={{ background: "linear-gradient(135deg,#7c6af7,#a78bfa)", border: "none", borderRadius: 11, width: 37, height: 37, color: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>+</button>
            )}
          </div>
        </div>
      </div>

      {/* ══ ORDER LIST ══ */}
      {!sel && !selDisp && (
        <div style={{ padding: "13px 13px 90px" }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 7, marginBottom: 13 }}>
            {[
              { label: "Total",      val: orders.length,                                          color: "#a78bfa" },
              { label: "Pending",    val: orders.filter(o => getStatus(o) === "pending").length,   color: "#f59e0b" },
              { label: "In Transit", val: orders.filter(o => getStatus(o) === "partial").length,   color: "#3b82f6" },
              { label: "Done",       val: orders.filter(o => getStatus(o) === "completed").length, color: "#10b981" },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: "#111119", border: "1px solid #1e1e2c", borderRadius: 11, padding: "9px 4px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: "#363650", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 3, marginBottom: 13 }}>
            {["all","pending","partial","completed"].map(f => (
              <button key={f} className={`chip${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All Orders" : f === "partial" ? "In Transit" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0
              ? <div style={{ textAlign: "center", color: "#363650", padding: "50px 0", fontSize: 13 }}>No orders found</div>
              : filtered.map(o => {
                  const st  = getStatus(o);
                  const d   = getDispatched(o);
                  const pct = Math.round(d / o.qty * 100);
                  const tag = typeTag(o);
                  return (
                    <div key={o.id} className="card" style={{ cursor: "pointer" }} onClick={() => setSel(o)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 800, color: "#a78bfa" }}>{o.id}</span>
                            <span className="pill" style={{ background: tag.bg, color: tag.color }}>{tag.label}</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{o.fabric}</div>
                          <div style={{ fontSize: 11, color: "#363650", marginTop: 1 }}>{o.date}</div>
                        </div>
                        <span className="pill" style={{ background: SC[st].bg, color: SC[st].color }}>{SC[st].label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 9 }}>
                        <div style={{ background: "#181820", borderRadius: 7, padding: "5px 9px", flex: 1 }}>
                          <div style={{ fontSize: 9, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>From</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#bbb" }}>{o.seller}</div>
                        </div>
                        <span style={{ color: "#2e2e3e", fontSize: 14 }}>→</span>
                        <div style={{ background: "#181820", borderRadius: 7, padding: "5px 9px", flex: 1 }}>
                          <div style={{ fontSize: 9, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>To</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#bbb" }}>{o.buyer}</div>
                        </div>
                      </div>
                      {o.orderType === "own" && o.ownType === "purchase" && o.soldTo && (
                        <div style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 8, padding: "5px 10px", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: ".06em" }}>Sold To</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>{o.soldTo}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#444" }}>
                        <span>{d.toLocaleString()} / {o.qty.toLocaleString()} {o.unit}</span>
                        <span style={{ color: SC[st].color, fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div className="pbar"><div className="pfill" style={{ width: `${pct}%`, background: SC[st].color }} /></div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}

      {/* ══ ORDER DETAIL ══ */}
      {sel && !selDisp && (() => {
        const st  = getStatus(sel);
        const d   = getDispatched(sel);
        const rem = sel.qty - d;
        const pct = Math.round(d / sel.qty * 100);
        const tag = typeTag(sel);
        return (
          <div style={{ padding: "13px 13px 90px" }}>
            <div className="card" style={{ cursor: "default", marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span className="pill" style={{ background: tag.bg, color: tag.color }}>{tag.label}</span>
                    <span className="pill" style={{ background: SC[st].bg, color: SC[st].color }}>{SC[st].label}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{sel.fabric}</div>
                  <div style={{ fontSize: 11, color: "#363650", marginTop: 1 }}>{sel.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {sel.rate > 0 && <div style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa" }}>₹{sel.rate}<span style={{ fontSize: 10, color: "#555" }}>/{sel.unit}</span></div>}
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{sel.qty.toLocaleString()} {sel.unit}</div>
                </div>
              </div>
              <div className="g2" style={{ marginBottom: 11 }}>
                {[
                  { l: sel.orderType === "own" && sel.ownType === "purchase" ? "Seller (Mill)" : "From (Seller)", v: sel.seller },
                  { l: sel.orderType === "own" && sel.ownType === "sales"    ? "Buyer (Mill)"  : "To (Buyer)",   v: sel.buyer  },
                  ...(sel.orderType === "own" && sel.ownType === "purchase" && sel.soldTo ? [{ l: "Sold To", v: sel.soldTo, accent: true }] : []),
                  { l: "Total Qty",   v: `${sel.qty.toLocaleString()} ${sel.unit}` },
                  { l: "Rate",        v: sel.rate ? `₹${sel.rate}/${sel.unit}` : "—" },
                  { l: "Dispatched",  v: `${d.toLocaleString()} ${sel.unit}` },
                  { l: "Remaining",   v: `${rem.toLocaleString()} ${sel.unit}`, warn: rem > 0 },
                  ...(sel.paymentTerms ? [{ l: "Payment Terms", v: sel.paymentTerms }] : []),
                  ...(sel.deliveryDays ? [{ l: "Delivery Days",  v: `${sel.deliveryDays} days` }] : []),
                ].map(x => (
                  <div key={x.l} style={{ background: "#181820", borderRadius: 9, padding: "9px 12px", ...(x.full ? { gridColumn: "1/-1" } : {}) }}>
                    <div style={{ fontSize: 10, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>{x.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: x.accent ? "#10b981" : x.warn ? "#f59e0b" : "#ddd" }}>{x.v}</div>
                  </div>
                ))}
              </div>
              {sel.remarks && (
                <div style={{ background: "#181820", borderRadius: 9, padding: "9px 12px", marginBottom: 11 }}>
                  <div style={{ fontSize: 10, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>📝 Remarks</div>
                  <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6 }}>{sel.remarks}</div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#444", marginBottom: 5 }}>
                <span>Dispatch Progress</span>
                <span style={{ color: SC[st].color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <div className="pbar" style={{ height: 7 }}>
                <div className="pfill" style={{ width: `${pct}%`, background: SC[st].color }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".08em" }}>
                Dispatches ({sel.dispatches.length})
              </span>
              {rem > 0 && (
                <button onClick={() => setShowDF(true)}
                  style={{ background: "rgba(124,106,247,.14)", border: "1px solid #7c6af7", color: "#a78bfa", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  + Add Dispatch
                </button>
              )}
            </div>

            {sel.dispatches.length === 0
              ? <div style={{ textAlign: "center", color: "#363650", padding: "28px 0", background: "#111119", borderRadius: 12, border: "1px dashed #1e1e2c", fontSize: 13 }}>No dispatches recorded yet</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {sel.dispatches.map((d, i) => {
                    const due = payDue(d.date, d.paymentDays);
                    return (
                      <div key={i} className="card" style={{ cursor: "pointer" }} onClick={() => setSelDisp(d)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ background: "rgba(167,139,250,.15)", color: "#a78bfa", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Lot {i + 1}</span>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{d.qty.toLocaleString()} {sel.unit}</span>
                          </div>
                          <span style={{ fontSize: 11, color: "#555" }}>{d.date}</span>
                        </div>
                        <div className="g2" style={{ gap: 6 }}>
                          {d.invoiceNo  && <IB label="📋 Invoice No."  value={d.invoiceNo} accent />}
                          {d.invoiceAmt && <IB label="💰 Invoice Amt"  value={`₹${Number(d.invoiceAmt).toLocaleString()}`} />}
                          {d.lrNo       && <IB label="📄 LR No."       value={d.lrNo} />}
                          {due          && <IB label="📅 Payment Due"  value={due} warn />}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 11, color: "#444", textAlign: "right" }}>Tap for full details →</div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        );
      })()}

      {/* ══ DISPATCH DETAIL ══ */}
      {selDisp && sel && (() => {
        const lotNo = sel.dispatches.indexOf(selDisp) + 1;
        const due   = payDue(selDisp.date, selDisp.paymentDays);
        return (
          <div style={{ padding: "13px 13px 90px" }}>
            <div style={{ background: "rgba(124,106,247,.08)", border: "1px solid rgba(124,106,247,.2)", borderRadius: 13, padding: "14px", marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#a78bfa", marginBottom: 3 }}>{sel.id} · Lot {lotNo}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selDisp.qty.toLocaleString()} {sel.unit}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{sel.fabric} · {selDisp.date}</div>
                </div>
                {selDisp.invoiceAmt && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>₹{Number(selDisp.invoiceAmt).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Invoice Amt</div>
                  </div>
                )}
              </div>
              {due && (
                <div style={{ marginTop: 10, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 8, padding: "7px 11px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Payment Due ({selDisp.paymentDays} days)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{due}</span>
                </div>
              )}
            </div>
            <div className="sbox"><SH icon="📋" t="Invoice Details" />
              <div className="g2">
                <IB label="Invoice No."  value={selDisp.invoiceNo}   accent />
                <IB label="Invoice Date" value={selDisp.invoiceDate} />
                <IB label="Invoice Amt"  value={selDisp.invoiceAmt ? `₹${Number(selDisp.invoiceAmt).toLocaleString()}` : null} />
                <IB label="Payment Days" value={selDisp.paymentDays ? `${selDisp.paymentDays} days` : null} warn />
              </div>
            </div>
            <div className="sbox"><SH icon="📦" t="Packing Details" />
              <div className="g2">
                <IB label="Bags / Bundles / Thaan" value={selDisp.bags}    full />
                <IB label="Gross Weight"           value={selDisp.grossWt ? `${selDisp.grossWt} kg` : null} />
                <IB label="Net Weight"             value={selDisp.netWt   ? `${selDisp.netWt} kg`   : null} />
              </div>
            </div>
            <div className="sbox"><SH icon="🚛" t="Transport Details" />
              <div className="g2">
                <IB label="Transporter" value={selDisp.transportName} full />
                <IB label="LR No."      value={selDisp.lrNo} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ ADD ORDER SHEET ══ */}
      {showOF && (
        <>
          <div className="overlay" onClick={() => setShowOF(false)} />
          <div className="sheet">
            <div style={{ width: 32, height: 4, background: "#26263a", borderRadius: 2, margin: "0 auto 15px" }} />
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 13 }}>New Order</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "72vh", overflowY: "auto", paddingRight: 2 }}>

              {/* ── Step 1: Order Type ── */}
              <div className="sbox" style={{ marginBottom: 0 }}>
                <SH icon="📂" t="Order Type" />
                <div className="seg">
                  <button className={`seg-btn${nO.orderType === "agency" ? " on" : ""}`}
                    style={nO.orderType === "agency" ? { background: "linear-gradient(135deg,#7c6af7,#a78bfa)" } : {}}
                    onClick={() => setNO({ ...nO, orderType: "agency" })}>
                    🤝 Agency
                  </button>
                  <button className={`seg-btn${nO.orderType === "own" ? " on" : ""}`}
                    style={nO.orderType === "own" ? { background: "linear-gradient(135deg,#f97316,#fb923c)" } : {}}
                    onClick={() => setNO({ ...nO, orderType: "own" })}>
                    🏢 Own
                  </button>
                </div>

                {/* Sub-type for Own */}
                {nO.orderType === "own" && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>Own Order Type</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setNO({ ...nO, ownType: "purchase", buyer: "MG INTERNATIONAL", seller: "" })}
                        style={{
                          flex: 1, padding: "11px 8px", borderRadius: 10, border: "1.5px solid",
                          borderColor: nO.ownType === "purchase" ? "#f97316" : "#26263a",
                          background:  nO.ownType === "purchase" ? "rgba(249,115,22,.1)" : "#181820",
                          color:       nO.ownType === "purchase" ? "#f97316" : "#555",
                          cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13,
                          transition: "all .15s"
                        }}>
                        <div style={{ fontSize: 18, marginBottom: 3 }}>📥</div>
                        Purchase Order
                        <div style={{ fontSize: 10, fontWeight: 500, marginTop: 3, opacity: .8 }}>MG buys from mill</div>
                      </button>
                      <button
                        onClick={() => setNO({ ...nO, ownType: "sales", seller: "MG INTERNATIONAL", buyer: "" })}
                        style={{
                          flex: 1, padding: "11px 8px", borderRadius: 10, border: "1.5px solid",
                          borderColor: nO.ownType === "sales" ? "#10b981" : "#26263a",
                          background:  nO.ownType === "sales" ? "rgba(16,185,129,.1)" : "#181820",
                          color:       nO.ownType === "sales" ? "#10b981" : "#555",
                          cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13,
                          transition: "all .15s"
                        }}>
                        <div style={{ fontSize: 18, marginBottom: 3 }}>📤</div>
                        Sales Order
                        <div style={{ fontSize: 10, fontWeight: 500, marginTop: 3, opacity: .8 }}>MG sells to mill</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Step 2: Order Details ── */}
              <div className="sbox" style={{ marginBottom: 0 }}>
                <SH icon="📝" t="Order Details" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input className="inp" type="date" placeholder="Order Date *" value={nO.date} onChange={e => setNO({ ...nO, date: e.target.value })} />

                  {/* Seller field */}
                  {nO.orderType === "agency" || nO.ownType === "purchase"
                    ? <input className="inp" placeholder={nO.orderType === "own" ? "Seller Mill (Grey Cloth) *" : "Seller Mill *"} value={nO.seller} onChange={e => setNO({ ...nO, seller: e.target.value })} />
                    : <div className="inp" style={{ color: "#10b981", fontWeight: 600, cursor: "default" }}>📤 MG INTERNATIONAL (Seller)</div>
                  }

                  {/* Buyer field */}
                  {nO.orderType === "agency" || nO.ownType === "sales"
                    ? <input className="inp" placeholder={nO.orderType === "own" ? "Buyer Mill (Finishing) *" : "Buyer Mill *"} value={nO.buyer} onChange={e => setNO({ ...nO, buyer: e.target.value })} />
                    : <div className="inp" style={{ color: "#f97316", fontWeight: 600, cursor: "default" }}>📥 MG INTERNATIONAL (Buyer)</div>
                  }

                  {/* Sold To — only for Purchase Orders */}
                  {nO.orderType === "own" && nO.ownType === "purchase" && (
                    <div>
                      <div style={{ fontSize: 10, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Sold To (optional)</div>
                      <input className="inp" placeholder="Which mill is this sold to?" value={nO.soldTo} onChange={e => setNO({ ...nO, soldTo: e.target.value })}
                        style={{ borderColor: nO.soldTo ? "rgba(16,185,129,.5)" : "#26263a" }} />
                    </div>
                  )}

                  <input className="inp" placeholder="Fabric Type *" value={nO.fabric} onChange={e => setNO({ ...nO, fabric: e.target.value })} />
                  <div className="row">
                    <input className="inp" type="number" placeholder="Quantity *" value={nO.qty} onChange={e => setNO({ ...nO, qty: e.target.value })} style={{ flex: 2 }} />
                    <select className="inp" style={{ flex: 1 }} value={nO.unit} onChange={e => setNO({ ...nO, unit: e.target.value })}>
                      <option>meters</option><option>kg</option><option>thaan</option>
                    </select>
                  </div>
                  <input className="inp" type="number" placeholder="Rate ₹ (optional)" value={nO.rate} onChange={e => setNO({ ...nO, rate: e.target.value })} />
                  <div className="row">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Payment Terms</div>
                      <select className="inp" value={nO.paymentTerms} onChange={e => setNO({ ...nO, paymentTerms: e.target.value })}>
                        <option value="">Select</option>
                        <option>Against Delivery</option>
                        <option>7 days</option>
                        <option>15 days</option>
                        <option>30 days</option>
                        <option>45 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Delivery Days</div>
                      <input className="inp" type="number" placeholder="e.g. 7" value={nO.deliveryDays} onChange={e => setNO({ ...nO, deliveryDays: e.target.value })} />
                    </div>
                  </div>
                  <textarea className="inp" rows={2} placeholder="Remarks (optional)" value={nO.remarks}
                    onChange={e => setNO({ ...nO, remarks: e.target.value })}
                    style={{ resize: "none", lineHeight: 1.6 }} />
                </div>
              </div>

              <button className="btn" onClick={saveOrder}>Create Order</button>
            </div>
          </div>
        </>
      )}

      {/* ══ ADD DISPATCH SHEET ══ */}
      {showDF && sel && (
        <>
          <div className="overlay" onClick={() => setShowDF(false)} />
          <div className="sheet">
            <div style={{ width: 32, height: 4, background: "#26263a", borderRadius: 2, margin: "0 auto 15px" }} />
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 3 }}>Add Dispatch</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 13 }}>
              Remaining: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{(sel.qty - getDispatched(sel)).toLocaleString()} {sel.unit}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, maxHeight: "72vh", overflowY: "auto", paddingRight: 2 }}>
              <div className="row">
                <input className="inp" type="date"   placeholder="Dispatch Date *"       value={nD.date} onChange={e => setND({ ...nD, date: e.target.value })} style={{ flex: 1 }} />
                <input className="inp" type="number" placeholder={`Qty (${sel.unit}) *`} value={nD.qty}  onChange={e => setND({ ...nD, qty:  e.target.value })} style={{ flex: 1 }} />
              </div>
              <div className="sbox">
                <SH icon="📋" t="Invoice Details" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="row">
                    <input className="inp" placeholder="Invoice No."  value={nD.invoiceNo}   onChange={e => setND({ ...nD, invoiceNo:   e.target.value })} style={{ flex: 1 }} />
                    <input className="inp" type="date" placeholder="Invoice Date" value={nD.invoiceDate} onChange={e => setND({ ...nD, invoiceDate: e.target.value })} style={{ flex: 1 }} />
                  </div>
                  <div className="row">
                    <input className="inp" type="number" placeholder="Invoice Amount ₹" value={nD.invoiceAmt}   onChange={e => setND({ ...nD, invoiceAmt:   e.target.value })} style={{ flex: 1 }} />
                    <input className="inp" type="number" placeholder="Payment Days"      value={nD.paymentDays} onChange={e => setND({ ...nD, paymentDays: e.target.value })} style={{ flex: 1 }} />
                  </div>
                  {nD.invoiceDate && nD.paymentDays && (
                    <div style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 8, padding: "7px 11px", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#888" }}>Payment Due Date</span>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>{payDue(nD.invoiceDate, nD.paymentDays)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="sbox">
                <SH icon="📦" t="Packing Details" />
                <div className="row">
                  <input className="inp" type="number" placeholder="Bags / Bundles / Thaan" value={nD.bags}    onChange={e => setND({ ...nD, bags:    e.target.value })} style={{ flex: 1 }} />
                  <input className="inp" type="number" placeholder="Gross Wt (kg)"           value={nD.grossWt} onChange={e => setND({ ...nD, grossWt: e.target.value })} style={{ flex: 1 }} />
                  <input className="inp" type="number" placeholder="Net Wt (kg)"              value={nD.netWt}   onChange={e => setND({ ...nD, netWt:   e.target.value })} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sbox">
                <SH icon="🚛" t="Transport Details" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input className="inp" placeholder="Transporter Name" value={nD.transportName} onChange={e => setND({ ...nD, transportName: e.target.value })} />
                  <input className="inp" placeholder="LR No."           value={nD.lrNo}          onChange={e => setND({ ...nD, lrNo:          e.target.value })} />
                </div>
              </div>
              <button className="btn" onClick={saveDispatch}>Save Dispatch</button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#181820", border: "1px solid #2a2a3e", color: "#e4e2ef", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 6px 24px rgba(0,0,0,.6)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function SH({ icon, t }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, color: "#6c60e0", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
      {icon} {t}
    </div>
  );
}

function IB({ label, value, accent, warn, full }) {
  if (!value) return null;
  return (
    <div style={{ background: "#181820", borderRadius: 9, padding: "9px 12px", ...(full ? { gridColumn: "1/-1" } : {}) }}>
      <div style={{ fontSize: 10, color: "#3e3e55", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent ? "#a78bfa" : warn ? "#f59e0b" : "#ddd" }}>{value}</div>
    </div>
  );
}
