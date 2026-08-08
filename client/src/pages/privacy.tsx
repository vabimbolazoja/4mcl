import LegalPageShell from "@/components/legal-page-shell";
import {
  BUSINESS,
  // canadaAddressLine,
  nigeriaAddressLine,
} from "@/lib/business-info";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <LegalPageShell
      title="Privacy"
      highlight="Policy"
      description="How 4marketdays collects, uses, and protects your personal information when you shop with us."
    >
      <h2>1. Introduction</h2>
      <p>
        {BUSINESS.name} (“we”, “us”, or “our”) respects your privacy. This
        Privacy Policy explains what personal data we collect when you use our
        website and services, why we collect it, how we protect it, and your
        choices.
      </p>
      <p>
        By using our platform, you acknowledge this Policy. For questions,
        contact {BUSINESS.email}.
      </p>

      <h2>2. Who we are</h2>
      <p>
        <strong>Business:</strong> {BUSINESS.legalName}
        <br />
        <strong>Email:</strong> {BUSINESS.email}
        <br />
        <strong>Phone:</strong> {BUSINESS.phones.join(" · ")}
        <br />
        {/* <strong>Canada:</strong> {canadaAddressLine}
        <br /> */}
        <strong>Nigeria:</strong> {nigeriaAddressLine}
      </p>

      <h2>3. Information we collect</h2>
      <p>We may collect:</p>
      <ul>
        <li>
          <strong>Identity and contact data</strong> — name, email address,
          phone number, shipping and billing addresses
        </li>
        <li>
          <strong>Account data</strong> — login credentials and profile details
          you provide when registering
        </li>
        <li>
          <strong>Order and transaction data</strong> — products purchased,
          amounts, currency, payment status, and delivery details
        </li>
        <li>
          <strong>Payment data</strong> — processed by our payment partners
          (such as Flutterwave). We do not store full card numbers on our
          servers; card details are handled by the payment processor under their
          security standards
        </li>
        <li>
          <strong>Technical data</strong> — IP address, browser type, device
          information, and pages visited, used to operate and improve the site
        </li>
        <li>
          <strong>Communications</strong> — messages you send via contact forms
          or email
        </li>
      </ul>

      <h2>4. How we use your information</h2>
      <p>We use personal data to:</p>
      <ul>
        <li>Process and fulfill orders, payments, and deliveries</li>
        <li>Create and manage your account</li>
        <li>Respond to customer service requests and disputes</li>
        <li>Send order confirmations, shipping updates, and service notices</li>
        <li>Improve our website, products, and security</li>
        <li>Comply with legal, tax, and payment-provider requirements</li>
        <li>
          Detect and prevent fraud, abuse, or unauthorized transactions
        </li>
      </ul>
      <p>
        We do not sell your personal information to third parties for their
        marketing.
      </p>

      <h2>5. Legal bases (where applicable)</h2>
      <p>
        Depending on your location, we process data based on contract
        performance (fulfilling your order), legitimate interests (security and
        service improvement), consent (where required), and legal obligations.
      </p>

      <h2>6. Sharing your information</h2>
      <p>We may share data with:</p>
      <ul>
        <li>
          <strong>Payment processors</strong> (including Flutterwave) to
          complete card and international payments securely
        </li>
        <li>
          <strong>Shipping and logistics partners</strong> to deliver your
          orders
        </li>
        <li>
          <strong>IT and hosting providers</strong> that help us run the
          platform under confidentiality obligations
        </li>
        <li>
          <strong>Authorities</strong> when required by law or to protect our
          rights and customers
        </li>
      </ul>

      <h2>7. International transfers</h2>
      <p>
        Because we serve customers across the{" "}
        {BUSINESS.shippingRegions.join(", ")}, your data may be processed in
        countries other than your own. We take reasonable steps so that
        recipients protect your information appropriately.
      </p>

      <h2>8. Data security</h2>
      <p>
        We use reasonable technical and organizational measures to protect
        personal data against unauthorized access, loss, or misuse. Payment card
        data is handled by PCI-DSS compliant payment partners. No method of
        transmission over the internet is 100% secure; please use a strong
        password and keep your account details private.
      </p>

      <h2>9. Data retention</h2>
      <p>
        We keep order and account records for as long as needed to fulfill
        orders, provide support, meet legal and accounting requirements, and
        resolve disputes. When data is no longer needed, we delete or anonymize
        it where practicable.
      </p>

      <h2>10. Cookies and similar technologies</h2>
      <p>
        We may use cookies and similar tools for essential site functions
        (session, cart, authentication) and to understand how the site is used.
        You can control cookies through your browser settings. Disabling
        essential cookies may affect checkout and login.
      </p>

      <h2>11. Your rights</h2>
      <p>
        Subject to applicable law, you may request access to, correction of, or
        deletion of your personal data, or object to certain processing. To
        exercise these rights, email {BUSINESS.email} with enough detail for us
        to verify your identity and respond.
      </p>

      <h2>12. Children’s privacy</h2>
      <p>
        Our services are not directed to children under 18. We do not knowingly
        collect personal data from children. If you believe a child has provided
        us data, contact us and we will take appropriate steps.
      </p>

      <h2>13. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy periodically. The “Last updated” date
        reflects the latest version. Material changes will be posted on this
        page.
      </p>

      <h2>14. Contact</h2>
      <p>
        For privacy questions or requests: {BUSINESS.email} ·{" "}
        {BUSINESS.phones.join(" · ")} · or our{" "}
        <Link href="/contact">Contact Us</Link> page.
      </p>
    </LegalPageShell>
  );
}
