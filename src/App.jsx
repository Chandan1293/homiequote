import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

import logo from "/logo.png"; // Place your homie logo in public/logo.png


const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

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
  { id: 18, name: "Single Mattress", price: 400 }
];

export default function App() {
  const [rows, setRows] = useState([]);
  const [quoteText, setQuoteText] = useState("Quotation\n\nNo products selected.");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/products.json");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        setRows(data.map((p) => ({ ...p, qty: 0 })));
      } catch {
        setRows(defaultProducts.map((p) => ({ ...p, qty: 0 })));
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const lineItems = rows.filter((r) => r.qty > 0).map((r) => ({ ...r, lineTotal: r.qty * r.price }));
    const total = lineItems.reduce((s, r) => s + r.lineTotal, 0);
    const deposit = total * 2;
    return { lineItems, total, deposit };
  }, [rows]);

  const inc = (id, delta) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, qty: Math.max(0, r.qty + delta) } : r))
    );

  const generateQuote = () => {
  let text = "Quotation\n\n";
  if (totals.lineItems.length === 0) {
    text += "No products selected.";
    setQuoteText(text);
    return;
  }
  totals.lineItems.forEach((r, i) => {
    text += `${i + 1}. ${r.name} – Qty: ${r.qty} × ₹${r.price} = ₹${r.lineTotal}\n`;
  });
  text += `\nTotal rent amount per month :* ₹${totals.total}\n`;
  text += `Security deposit :* ₹${totals.deposit}`;
  setQuoteText(text);
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


  return (
    <div className="container">
      <header className="topbar">
        <div className="header">
         <img src={logo} alt="Homie Logo" className="logo" />
         <h1>Quotation Generator</h1>
        </div>
      </header>

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
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">Loading products…</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="actions">
        <button className="btn-primary" onClick={generateQuote}>Generate Quote</button>
        <input
          className="input"
          placeholder="WhatsApp number (e.g. 919876543210) — optional"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

     <div className="card" style={{ minHeight: 120 }}>{quoteText}</div>



      <div className="actions">
        <button className="btn-info" onClick={copyToClipboard}>Copy Text</button>
        <button className="btn-wa" onClick={openWhatsApp}>Send to WhatsApp</button>
      </div>
    </div>
  );
}
