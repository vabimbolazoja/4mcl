import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";

type LegalPageShellProps = {
  title: string;
  highlight?: string;
  description: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

const legalNav = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/contact", label: "Contact Us" },
  { href: "/about", label: "About Us" },
];

export default function LegalPageShell({
  title,
  highlight,
  description,
  lastUpdated = "August 7, 2026",
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-r from-primary-50 to-emerald-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
              {title}
              {highlight ? (
                <>
                  {" "}
                  <span className="text-primary-600">{highlight}</span>
                </>
              ) : null}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
            <p className="mt-4 text-sm text-slate-500">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="max-w-3xl mx-auto prose prose-slate prose-headings:text-slate-900 prose-a:text-primary-600">
            {children}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
