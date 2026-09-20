# LeafyLand Master Blueprint - Technical Implementation Plan

This plan details the necessary architectural and technical changes required to transition the existing LeafyLand platform to the new **Environmental & organic-first commerce** vision outlined in the master blueprint. 

## User Review Required

> [!IMPORTANT]
> This plan introduces major database schema changes and architectural additions to support complex B2B/B2C/C2C models, RFQs, Auctions, and the AI Agents layer. Please review the proposed database models and Vendor Radar logic to ensure it aligns with your exact vision.

## Open Questions

> [!WARNING]
> 1. **Vendor Radar Logic**: For "first-qualified-acceptance deal locking", how is a vendor deemed "qualified"? Is it based on their profile, rating, or do they need to submit specific documentation when accepting the deal?
> 2. **AI Agents Layer**: Should the AI Agents be integrated via external webhooks (e.g., calling out to a Python microservice), or will we implement them natively using Node.js AI SDKs (like Vercel AI SDK)?
> 3. **Metro-City Architecture**: Do we want to restrict certain products/services to specific metro zones strictly using geospatial queries (PostGIS), or is a simple City/Pincode matching sufficient for the MVP?

## Proposed Changes

---

### 1. Database Schema & Architecture Updates (Prisma)

To support B2B, B2C, Bulk, and Auctions, we must extend our Prisma schema significantly.

#### [MODIFY] `prisma/schema.prisma`

**1. Commerce Types & Pricing Models**
Currently, `Product` only supports a single `price` and `mrp`. We need to adapt this for bulk, B2B, and retail.
* Add `commerceType` to products (enum: B2C, B2B, BOTH, C2C).
* Replace scalar `price` with a relation to `PricingTier[]` to support bulk purchasing (e.g., 1-10 units = ₹100, 11-100 units = ₹80).
* Support for import/export flags and HSN/SAC codes.

**2. Metro-City Architecture**
* Introduce `ServiceZone` and `MetroCity` models.
* Link `Store`, `Product`, and `Service` to specific operational zones for localized discovery.

**3. RFQ, Tender & Auction Flow**
* **[NEW] `RequestForQuote (RFQ)` Model**: Buyers can submit requirements (quantity, target price) that broadcast to matched vendors.
* **[NEW] `Auction` & `Bid` Models**: Sellers can list products for auction; buyers submit bids. Includes start time, end time, and reserve price.
* **[NEW] `Tender` Model**: For large-scale service/landscaping contracts where vendors submit proposals.

**4. Vendor Radar & Deal Locking**
* **[NEW] `DealRadar` Model**: Represents a broadcasted lead or RFQ to multiple vendors.
* **[NEW] `DealAcceptance` Model**: Tracks vendor responses. Includes the logic for `first-qualified-acceptance`: Once a vendor with a passing qualification score clicks "Accept", the DealRadar status changes to `LOCKED`, preventing others from claiming it.

---

### 2. Vendor Radar & "First-Qualified-Acceptance" Deal Engine

#### [NEW] `lib/deal-engine.ts`
Implement the core logic for broadcasting leads to vendors based on category and metro-city. 
* Uses WebSockets or Server-Sent Events (SSE) to push live deals to the Vendor Dashboard.
* Transactional locking using Prisma's `update` with `where: { status: 'OPEN' }` to guarantee no race conditions when multiple vendors try to accept the same deal simultaneously.

#### [NEW] `app/store/radar/page.tsx`
* A live dashboard for vendors showing active leads, RFQs, and Tenders in their category and region.
* "Accept Deal" action that locks the opportunity instantly if they meet the criteria.

---

### 3. AI Agents Integration Layer

#### [NEW] `app/api/agents/route.ts`
* Create a dedicated API namespace for the AI layer.
* **AI Sales Agent**: Monitors abandoned carts and user browsing history to generate personalized push notifications and emails.
* **AI Procurement Agent**: Automatically reviews vendor RFQ bids and ranks them based on price, rating, and delivery time.
* **AI Content Agent**: Automatically generates SEO-optimized product descriptions and taglines for vendors when they upload an image of a plant or product.
* **AI Support Agent**: Integrated chatbot for B2C/B2B users to resolve basic queries (order tracking, product recommendations).

---

### 4. UI/UX Transformation (Premium Green-Commerce)

#### [MODIFY] `tailwind.config.ts` / `app/globals.css`
* Overhaul the design system. Replace generic styles with a rich, modern "Eco-Premium" aesthetic.
* Implement dynamic color palettes: Earthy tones (Moss Green, Sage, Terracotta) mixed with glassmorphism for a modern web feel.
* Add micro-animations using Framer Motion for cart interactions, Vendor Radar deal popups, and AI agent chat interfaces.

#### [MODIFY] `app/(public)/layout.tsx` & `app/(public)/page.tsx`
* Redesign the homepage to act as a central hub (Wrapper) directing users to B2B, B2C, or Services depending on their intent.
* Introduce a dynamic search bar that categorizes results into Retail, Bulk, Auctions, and Services instantly.

---

### 5. Payments, Fulfillment & Order Engine Updates

#### [MODIFY] `lib/razorpay.ts` & `lib/payouts.ts`
* Support Escrow-like payments for Tenders and B2B orders (milestone-based payments).
* Integrate dynamic shipping logic based on bulk vs retail (e.g., calculating freight LTL costs for bulk plant orders).

---

## Verification Plan

### Automated Tests
- Test transactional safety of the Vendor Radar: `npm run test -- deal-locking` (simulate 10 vendors clicking "Accept" simultaneously to ensure only one wins).
- Validate PricingTier logic for bulk B2B purchases.
- Verify API Agent webhook responses and formatting.

### Manual Verification
- Deploy the updated schema locally and seed it with dummy B2B/B2C data, Tenders, and Auctions.
- Navigate to the Vendor Radar in the Vendor Dashboard and visually confirm real-time deal popping and locking.
- Verify the new "Eco-Premium" UI/UX styling on the storefront.
