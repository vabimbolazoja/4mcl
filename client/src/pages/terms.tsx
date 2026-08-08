import LegalPageShell from "@/components/legal-page-shell";
import {
  BUSINESS,
  // canadaAddressLine,
  nigeriaAddressLine,
} from "@/lib/business-info";
import { Link } from "wouter";

export default function Terms() {
  return (
    <LegalPageShell
      title="Terms &"
      highlight="Conditions"
      description="The rules and guidelines that govern your use of the 4marketdays platform and purchases."
    >
      <h2>1. About these terms</h2>
      <p>
        These Terms & Conditions (“Terms”) govern your access to and use of the{" "}
        {BUSINESS.name} website and services, including browsing, creating an
        account, and placing orders for African food products and related goods.
        By using our platform, you agree to these Terms. If you do not agree,
        please do not use our services.
      </p>

      <h2>2. Who we are</h2>
      <p>
        {BUSINESS.name} is an online marketplace that sources and delivers
        authentic African foods and grocery products to customers in the{" "}
        {BUSINESS.shippingRegions.join(", ")}.
      </p>
      <p>
        <strong>Business name:</strong> {BUSINESS.legalName}
        <br />
        <strong>Email:</strong> {BUSINESS.email}
        <br />
        <strong>Phone:</strong> {BUSINESS.phones.join(" · ")}
        <br />
        {/* <strong>Canada address:</strong> {canadaAddressLine}
        <br /> */}
        <strong>Nigeria address:</strong> {nigeriaAddressLine}
      </p>
      <p>
        More about our business is available on our{" "}
        <Link href="/about">About Us</Link> and{" "}
        <Link href="/contact">Contact Us</Link> pages.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 18 years old (or the age of majority in your
        jurisdiction) to place an order. By placing an order, you confirm that
        the information you provide is accurate and that you are authorized to
        use the payment method selected.
      </p>

      <h2>4. Products and pricing</h2>
      <p>
        We aim to describe products accurately, including ingredients, sizes,
        and availability. Prices are shown in the currency selected at checkout
        (for example USD or NGN) and may change without notice before you
        complete a purchase. Product images are illustrative; actual packaging
        may vary.
      </p>
      <p>
        Perishable and specialty foods may have limited shelf life. We reserve
        the right to limit quantities, refuse orders, or cancel orders where
        products are unavailable, incorrectly priced, or prohibited for
        shipment to your location.
      </p>

      <h2>5. Orders and payment</h2>
      <p>
        An order is an offer to buy. We accept your offer when we confirm the
        order by email or in your account. Payment is processed through our
        payment partners (including card and other methods available at
        checkout). You authorize us and our payment processors to charge the
        total amount due, including shipping and applicable taxes.
      </p>
      <p>
        If payment fails, is declined, or is flagged as restricted by your bank
        or card issuer, the order may not be fulfilled until payment is
        successfully completed.
      </p>

      <h2>6. Shipping and delivery</h2>
      <p>
        We ship to selected regions including the{" "}
        {BUSINESS.shippingRegions.join(", ")}. Delivery times are estimates
        (typically 3–7 business days depending on destination) and may vary due
        to customs, weather, or carrier delays. Risk of loss passes to you upon
        delivery to the address you provide, except where required otherwise by
        law.
      </p>
      <p>
        You are responsible for providing a complete and accurate shipping
        address and for any customs duties, import taxes, or local fees that
        apply in your country.
      </p>

      <h2>7. Returns, cancellations, and refunds</h2>
      <p>
        Our returns, cancellations, and refund rules are set out in our{" "}
        <Link href="/refund">Refund Policy</Link>, which forms part of these
        Terms.
      </p>

      <h2>8. User accounts</h2>
      <p>
        You are responsible for keeping your account credentials confidential
        and for all activity under your account. Notify us promptly at{" "}
        {BUSINESS.email} if you suspect unauthorized access.
      </p>

      <h2>9. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the site for unlawful, fraudulent, or abusive purposes</li>
        <li>Interfere with site security or attempt unauthorized access</li>
        <li>
          Scrape, copy, or misuse product data or customer information beyond
          normal browsing and purchasing
        </li>
        <li>Misrepresent your identity or payment information</li>
      </ul>

      <h2>10. Intellectual property</h2>
      <p>
        All content on this site—including logos, text, images, and
        design—belongs to {BUSINESS.name} or its licensors. You may not copy,
        modify, or redistribute our content without prior written permission,
        except for personal, non-commercial use incidental to shopping.
      </p>

      <h2>11. Privacy</h2>
      <p>
        How we collect and use personal data is described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>12. Disclaimer and limitation of liability</h2>
      <p>
        Products are provided as described. To the fullest extent permitted by
        law, {BUSINESS.name} is not liable for indirect, incidental, special, or
        consequential damages arising from your use of the site or products.
        Our total liability for any claim related to an order is limited to the
        amount you paid for that order.
      </p>
      <p>
        Nothing in these Terms excludes liability that cannot be excluded under
        applicable law (including for death or personal injury caused by
        negligence, or fraud).
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The “Last updated” date at
        the top of this page will change when we do. Continued use of the site
        after changes constitutes acceptance of the updated Terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms? Contact us at {BUSINESS.email}, call{" "}
        {BUSINESS.phones.join(" or ")}, or visit our{" "}
        <Link href="/contact">Contact Us</Link> page.
      </p>
    </LegalPageShell>
  );
}
