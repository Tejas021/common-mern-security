import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Shop({ runAction }) {
  const [shop, setShop] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  async function refresh() {
    setLoading(true); setError("");
    try { setShop(await api("/shop")); }
    catch (e) { setError(e.message); throw e; }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh().catch(() => {}); }, []);
  async function buy(product) {
    setPending(true);
    try {
      const result = await runAction(async () => {
        const purchase = await api("/shop/purchase", "POST", { productId: product.id, price: product.price });
        setNotice(`Order placed · ${purchase.chargedPoints} points`);
        await refresh();
        return purchase;
      });
      if (!result) setNotice("");
    } finally { setPending(false); }
  }
  async function claimReward() {
    setPending(true);
    try {
      const result = await runAction(async () => {
        await api("/rewards/claim", "POST", {});
        setNotice("Reward claimed. Enjoy!");
        await refresh();
        return true;
      });
      if (!result) setNotice("");
    } finally { setPending(false); }
  }
  if (!shop) return <section className="shop-page"><h1>Shop</h1>{error ? <div role="alert">{error}<p><button onClick={() => refresh().catch(() => {})}>Try again</button></p></div> : <p>{loading ? "Loading the shop…" : ""}</p>}</section>;
  return <section className="shop-page">
    <p className="eyebrow">Common market</p>
    <h1>Shop</h1>
    <p className="muted">Your balance: <strong>{shop.points} points</strong></p>
    {notice && <p role="status" className="notice">{notice}</p>}
    <div className="shop-grid">
      {shop.products.map((product) => <article className="shop-card" key={product.id}>
        <div className="sticker-art" aria-hidden="true">✦</div>
        <p className="eyebrow">Community goods</p>
        <h2>{product.name}</h2>
        <p>{product.price} points</p>
        <button className="primary" disabled={pending} onClick={() => buy(product)}>Buy</button>
      </article>)}
    </div>
    <section className="reward-card">
      <div><p className="eyebrow">Community giveaway</p><h2>A little thank-you</h2><p>{shop.reward.stock > 0 ? "One thank-you gift is available for a community member." : "This thank-you gift has been claimed."}</p><p className="muted">Your gifts claimed: {shop.reward.claims}</p></div>
      <button disabled={pending || shop.reward.stock < 1} onClick={claimReward}>Claim gift</button>
    </section>
    {shop.purchases.length > 0 && <section className="order-history"><h2>Recent orders</h2>{shop.purchases.map((purchase) => <p key={purchase._id}>{shop.products.find((product) => product.id === purchase.productId)?.name ?? "Community goods"} · {purchase.chargedPoints} points</p>)}</section>}
  </section>;
}
