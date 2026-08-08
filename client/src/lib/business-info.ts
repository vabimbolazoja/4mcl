/** Shared business identity for Contact and legal pages (Flutterwave / compliance). */
export const BUSINESS = {
  name: "4marketdays",
  legalName: "4marketdays",
  email: "customerservice@4marketdays.com",
  supportEmail: "support@4marketdays.com",
  phones: [
    // "+1 (506) 650 8084", // international — commented off
    "08062943817",
  ],
  addresses: {
    // canada: {
    //   label: "Canada",
    //   lines: ["661 Millidge Ave", "Saint John, NB", "Canada"],
    // },
    nigeria: {
      label: "Nigeria",
      lines: [
        "BLOCK 24 CITIVIEW ESTATE",
        "WAREWA OGUN STATE",
        "NIGERIA",
      ],
    },
  },
  hours: {
    weekday: "Mon–Fri: 9AM–6PM EST",
    saturday: "Sat: 10AM–4PM EST",
  },
  shippingRegions: ["UK", "USA", "Canada", "Nigeria"],
  website: "https://4marketdays.com",
} as const;

// export const canadaAddressLine = BUSINESS.addresses.canada.lines.join(", ");
export const nigeriaAddressLine = BUSINESS.addresses.nigeria.lines.join(", ");
