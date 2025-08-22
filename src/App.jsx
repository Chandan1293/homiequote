import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
import logo from "/logo.png";

/* ---------- Helpers ---------- */
const currency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ---------- Data ---------- */
const defaultProducts = [
  { id: 1, name: "Washing Machine", price: 700 },
  { id: 2, name: "Refrigerator", price: 700 },
  { id: 3, name: "Cot", price: 700 },
  { id: 4, name: "Mattress", price: 600 },
  { id: 5, name: "Water Purifier", price: 700 },
  { id: 6, name: "Smart TV 32 inch", price: 700 },
  { id: 7, name: "Smart TV 43 inch", price: 1400 },
  { id: 8, name: "Dressing Table", price: 350 },
  { id: 9, name: "Cupboard", price: 500 },
  { id: 10, name: "Table", price: 300 },
  { id: 11, name: "Chair", price: 350 },
  { id: 12, name: "Cycle", price: 800 },
  { id: 13, name: "Induction Stove", price: 200 },
  { id: 14, name: "Cylinder and Stove", price: 600 },
  { id: 15, name: "Microwave Oven", price: 400 },
  { id: 16, name: "Mixer Grinder", price: 300 },
  { id: 17, name: "Single Cot", price: 400 },
  { id: 18, name: "Single Mattress", price: 400 },
];

const TERMS = [
  "Minimum rental period: 6 months",
  "Refundable deposit: 2 months’ rent",
  "Early termination: 1 month notice",
  "Service support included",
  "No sub-leasing allowed",
  "All prices are inclusive of 18% GST",
];

export default function App() {
  /* ---------- State ---------- */
  const [rows, setRows] = useState([]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");

  // Discount: only “none” or “rupees”
  const [discountType, setDiscountType] = useState("none"); // "none" | "rupees"
  const [discountValue, setDiscountValue] = useState(0);    // rupee amount

  // Quote text + editor controls
  const [quoteText, setQuoteText] = useState("Quotation\n\nNo products selected.");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [manuallyEdited, setManuallyEdited] = useState(false);

  useEffect(() => {
    setRows(defaultProducts.map((p) => ({ ...p, qty: 0 })));
  }, []);

  /* ---------- Totals ---------- */
  const totals = useMemo(() => {
    const lineItems = rows
      .filter((r) => r.qty > 0)
      .map((r) => ({ ...r, lineTotal: r.qty * r.price }));

    const subtotal = lineItems.reduce((s, r) => s + r.lineTotal, 0);

    const discountApplied =
      discountType === "rupees" ? Math.min(subtotal, Number(discountValue) || 0) : 0;

    const total = Math.max(0, subtotal - discountApplied);
    const deposit = total * 2;

    return { lineItems, subtotal, discountApplied, total, deposit };
  }, [rows, discountType, discountValue]);

  /* ---------- Auto-build quote ---------- */
  useEffect(() => {
    if (!autoUpdate) return;

    const today = new Date();
    const validTill = new Date(today);
    validTill.setDate(validTill.getDate() + 7);

    let text = "Quotation\n\n";
    if (customer.trim()) text += `Customer: ${customer.trim()}\n`;
    text += `Date: ${fmtDate(today)}  (Valid until: ${fmtDate(validTill)})\n\n`;

    if (totals.lineItems.length === 0) {
      text += "No products selected.\n";
    } else {
      totals.lineItems.forEach((r, i) => {
        text += `${i + 1}. ${r.name} – Qty: ${r.qty} × ₹${r.price} = ₹${r.lineTotal}\n`;
      });
      text += `\nSubtotal: ${currency(totals.subtotal)}\n`;
      if (totals.discountApplied > 0) {
        text += `Discount: -${currency(totals.discountApplied)}\n`;
      }
      text += `Total rent per month: ${currency(totals.total)}\n`;
      text += `Security deposit (refundable): ${currency(totals.deposit)}\n`;
    }

    text += `\nTerms & Conditions:\n`;
    TERMS.forEach((t) => (text += `• ${t}\n`));

    setQuoteText(text);
    setManuallyEdited(false);
  }, [customer, rows, totals, autoUpdate]);

  /* ---------- Handlers ---------- */
  const inc = (id, delta) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, qty: Math.max(0, r.qty + delta) } : r)));

  const resetAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, qty: 0 })));
    setCustomer("");
    setDiscountType("none");
    setDiscountValue(0);
    setAutoUpdate(true);
    setManuallyEdited(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(quoteText);
    alert("Quotation copied to clipboard!");
  };

  const openWhatsApp = () => {
    const plain = quoteText.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?p>/gi, "\n");
    const base = phone.trim()
      ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone.trim())}`
      : `https://api.whatsapp.com/send`;
    const url = `${base}&text=${encodeURIComponent(plain)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ---------- UI ---------- */
  return (
    <>
      <header className="topbar">
        <div className="header">
          <img src={logo} alt="Homie Logo" className="logo" />
          <h1>Quotation Generator</h1>
        </div>
      </header>

      <div className="container">
        {/* Customer + Discount + Reset */}
        <div className="actions" style={{ marginTop: 0 }}>
          <input
            className="input"
            placeholder="Customer name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            style={{ width: 340 }}
          />

          <div
            className="discount-controls"
            style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
          >
            <span style={{ fontWeight: 600 }}>Discount:</span>

            <label className="pill">
              <input
                type="radio"
                name="disc"
                value="none"
                checked={discountType === "none"}
                onChange={() => {
                  setDiscountType("none");
                  setDiscountValue(0);
                }}
              />
              None
            </label>

            <label className="pill">
              <input
                type="radio"
                name="disc"
                value="rupees"
                checked={discountType === "rupees"}
                onChange={() => setDiscountType("rupees")}
              />
              ₹
            </label>

            <input
              className="input"
              style={{ width: 140 }}
              type="number"
              min="0"
              placeholder="Discount (₹)"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              disabled={discountType !== "rupees"}
            />

            <button className="btn-info" onClick={resetAll}>Reset / Clear All</button>
          </div>
        </div>

        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product</th>
              <th>Price (₹)</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td style={{ textAlign: "left" }}>{r.name}</td>
                <td>{currency(r.price).replace("₹", "")}</td>
                <td>{r.qty}</td>
                <td className="controls">
                  <button className="btn-plus" onClick={() => inc(r.id, +1)}>+</button>
                  <button className="btn-minus" onClick={() => inc(r.id, -1)}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Live totals */}
        {totals.subtotal > 0 && (
          <div className="totals">
            <p><strong>Subtotal:</strong> {currency(totals.subtotal)}</p>
            <p><strong>Discount:</strong> {currency(totals.discountApplied)}</p>
            <p><strong>Total / month:</strong> {currency(totals.total)}</p>
            <p><strong>Security Deposit:</strong> {currency(totals.deposit)}</p>
          </div>
        )}

        {/* Auto-update toggle */}
        <div className="actions" style={{ marginTop: 10, marginBottom: 8 }}>
          <label className="pill" title="If you type in the quote box, auto-update pauses.">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
            Auto-update
          </label>
          {manuallyEdited && !autoUpdate && (
            <span className="note">Manual edits detected — auto-update is paused.</span>
          )}
        </div>

        {/* Editable quotation */}
        <textarea
          className="quote-editor card"
          value={quoteText}
          onChange={(e) => {
            setQuoteText(e.target.value);
            setManuallyEdited(true);
            setAutoUpdate(false);
          }}
          rows={12}
        />

        {/* Actions */}
        <div className="actions">
          <input
            className="input"
            placeholder="WhatsApp number (e.g. 919876543210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="btn-info" onClick={copyToClipboard}>Copy Text</button>
          <button className="btn-wa" onClick={openWhatsApp} disabled={totals.lineItems?.length === 0}>
            Send to WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
