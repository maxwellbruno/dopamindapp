# Wellness Store: cart, checkout, and admin store dashboard

## What you'll get

**For shoppers**
- Three new supplements added: Lion's Mane, Ginkgo Biloba, and Ashwagandha, each KES 2,500.
- All store prices shown in Kenyan Shillings (KES). Your existing products get KES prices you can change later in the admin area.
- Products come from your saved catalog instead of a fixed list, so your price changes and stock updates show right away. Sold-out items are labeled gently and can't be added.
- A cart that slides in from the side: change quantities, remove items, see the total.
- Checkout page: name, phone, delivery address, and a choice of payment:
  - **Card / M-Pesa / bank**, through your existing Paystack account in KES.
  - **Crypto**, paid in USDC from the Dopamind wallet. The shilling total is converted to dollars using a rate you set.
- An "My orders" page where shoppers can see each order's status (Paid, Packed, Shipped, Delivered).

**Calm shopping**
- Soft colours, plenty of space, slow fade-ins. No countdown timers, "only 2 left!" pressure, or pop-up upsells.
- Each product shows a short "how it supports you" note (for example, sleep, focus, calm).
- An optional pause before payment: "Take a breath. Is this something that serves you?" with a one-tap continue.
- After a successful order, a short thank-you with a breathing prompt and a gratitude note.
- Supplements carry a small note: "Not medical advice. Check with a healthcare provider."

**For you (admin only)**
- A new "Wellness Store" card in the Admin dashboard opens a store management area with:
  - **Overview:** revenue, orders waiting to ship, low-stock items.
  - **Orders:** filter by status, view items and the delivery address, then move orders through Paid → Packed → Shipped → Delivered, or cancel. You can add a tracking note.
  - **Products:** edit name, description, price, category, emoji or photo, and stock. Turn items on or off, and add new products.
  - **Settings:** the KES-to-USD rate used for crypto checkout.

## Technical details
- New tables (with grants and row-level security):
  - `store_products`: anyone can read active products; only admins can change them. Seeded with the 12 existing items plus the 3 new ones.
  - `store_orders` and `store_order_items`: buyers can read their own orders; admins can read and update all of them. Orders are only created by backend functions, never directly from the browser.
  - `store_settings`: holds the KES-to-USD rate. Anyone can read it; only admins can change it.
- New backend functions:
  - `store-create-order`: rechecks prices and stock from the database, works out the total, and creates a pending order. For card payments it starts a Paystack payment in KES (tagged with `metadata.type = 'store_order'`) and returns the checkout link. For crypto it returns the USDC amount and the platform wallet address.
  - `store-confirm-crypto`: checks the USDC transfer on Base to `PLATFORM_ESCROW_ADDRESS` (same check as therapy payments). Then it marks the order paid and reduces stock.
  - `paystack-webhook`: add a branch for store orders that marks them paid and reduces stock. Subscription handling stays as it is.
- Frontend:
  - Cart stored in a React context and saved in localStorage.
  - New pages: `/store/checkout`, `/store/orders`, `/admin/store`.
  - Admin pages use the existing admin check.
  - All colours use the app's existing theme, so light and dark mode both work.
- USDC is the only crypto offered. No other payment providers are added.
