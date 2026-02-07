export default function JsonLdSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: "Corion Gutachter",
    alternateName: "Corion Kfz-Sachverständigenbüro & Lackdoktor",
    description:
      "Corion Gutachter bietet schnelle und professionelle Kfz-Schadengutachten und Fahrzeugbewertungen in Frankfurt, Hofheim, Wiesbaden und Mainz.",
    url: "https://www.corion-gutachter.de/",
    telephone: "+4917683458274",
    email: "info@corion-gutachter.de",
    priceRange: "€€",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    address: [
      { "@type": "PostalAddress", addressLocality: "Frankfurt am Main", addressRegion: "HE", addressCountry: "DE" },
      { "@type": "PostalAddress", addressLocality: "Hofheim am Taunus", addressRegion: "HE", addressCountry: "DE" },
      { "@type": "PostalAddress", addressLocality: "Wiesbaden", addressRegion: "HE", addressCountry: "DE" },
      { "@type": "PostalAddress", addressLocality: "Mainz", addressRegion: "RP", addressCountry: "DE" },
    ],
    areaServed: [
      { "@type": "City", name: "Frankfurt am Main" },
      { "@type": "City", name: "Hofheim am Taunus" },
      { "@type": "City", name: "Wiesbaden" },
      { "@type": "City", name: "Mainz" },
      { "@type": "AdministrativeArea", name: "Rhein-Main-Gebiet" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
