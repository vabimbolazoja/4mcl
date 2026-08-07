import LegalPageShell from "@/components/legal-page-shell";
import {
  BUSINESS,
  canadaAddressLine,
  nigeriaAddressLine,
} from "@/lib/business-info";
import { Link } from "wouter";

export default function Refund() {
  return (
    <LegalPageShell
      title="Refund"
      highlight="Policy"
      description="Clear terms for returns, cancellations, and refunds on 4marketdays orders."
    >
      <h2>1. Overview</h2>
      <p>
        At {BUSINESS.name}, we want you to be satisfied with your authentic
        African food products. This Refund Policy explains when you can cancel
        an order, request a return, and how refunds are processed.
      </p>
      <p>
        This policy forms part of our{" "}
        <Link href="/terms">Terms & Conditions</Link>.
      </p>

      <h2>2. Cancellations</h2>
      <p>
        You may request cancellation of an order before it is shipped or handed
        to our logistics partner. Contact us as soon as possible at{" "}
        {BUSINESS.email} or {BUSINESS.supportEmail} with your order reference.
      </p>
      <p>
        Once an order has been packed, shipped, or is in transit, it generally
        cannot be cancelled. In that case, you may be eligible for a return
        under the rules below (where the products qualify).
      </p>
      <p>
        We may cancel an order if payment fails, a product is unavailable, we
        cannot verify the order, or shipping to your address is not possible. If
        we cancel after you have paid, we will refund the amount charged for
        the cancelled items.
      </p>

      <h2>3. Returns — eligibility</h2>
      <p>
        We offer a <strong>14-day return window</strong> from the delivery date
        for eligible <strong>non-perishable</strong> items, provided they are:
      </p>
      <ul>
        <li>Unused and in original, unopened packaging where applicable</li>
        <li>In resalable condition with seals and labels intact</li>
        <li>Accompanied by proof of purchase (order reference or receipt)</li>
      </ul>
      <p>
        <strong>Perishable foods</strong>, opened packages, refrigerated or
        frozen goods, and items damaged due to improper storage after delivery
        are generally <strong>not eligible</strong> for return, except where
        the product arrived damaged, spoiled, or incorrect due to our error.
      </p>

      <h2>4. Damaged, incorrect, or missing items</h2>
      <p>
        If your order arrives damaged, incomplete, or not as described, notify
        us within <strong>48 hours</strong> of delivery at {BUSINESS.email}
        with:
      </p>
      <ul>
        <li>Your order reference</li>
        <li>Photos of the product and packaging (where relevant)</li>
        <li>A short description of the issue</li>
      </ul>
      <p>
        After we verify the issue, we will offer a replacement (subject to
        stock) or a refund for the affected items, including related shipping
        where the fault is ours.
      </p>

      <h2>5. How to request a return or refund</h2>
      <ol>
        <li>
          Email {BUSINESS.email} or use our{" "}
          <Link href="/contact">Contact Us</Link> form with your order
          reference and reason for return.
        </li>
        <li>
          Wait for our confirmation and return instructions (if a physical
          return is required).
        </li>
        <li>
          Ship the eligible items as instructed. Return shipping costs for
          change-of-mind returns are the customer’s responsibility unless we
          advise otherwise.
        </li>
      </ol>

      <h2>6. Refund processing</h2>
      <p>
        Approved refunds are issued to the original payment method. Processing
        typically takes <strong>5–10 business days</strong> after we approve the
        refund (or receive and inspect returned goods), depending on your bank
        or card issuer. You will receive confirmation by email when the refund
        is initiated.
      </p>
      <p>
        Shipping fees are refundable only when the return is due to our error
        (wrong item, damaged in transit attributable to us, or cancelled by us
        before shipping).
      </p>

      <h2>7. Exchanges</h2>
      <p>
        We do not guarantee exchanges for a different product. If you wish to
        exchange an eligible item, contact us; we may process a refund and ask
        you to place a new order for the preferred product.
      </p>

      <h2>8. Chargebacks</h2>
      <p>
        Please contact us first so we can resolve issues quickly. Unjustified
        chargebacks may result in order restrictions. We cooperate with our
        payment partners to investigate disputed transactions.
      </p>

      <h2>9. Contact for returns and refunds</h2>
      <p>
        <strong>Email:</strong> {BUSINESS.email} / {BUSINESS.supportEmail}
        <br />
        <strong>Phone:</strong> {BUSINESS.phones.join(" · ")}
        <br />
        <strong>Canada:</strong> {canadaAddressLine}
        <br />
        <strong>Nigeria:</strong> {nigeriaAddressLine}
      </p>
      <p>
        Business hours: {BUSINESS.hours.weekday}; {BUSINESS.hours.saturday}.
      </p>
    </LegalPageShell>
  );
}
