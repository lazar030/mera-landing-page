import type { LandingCopy } from '../interface'

/** Serbian (Latin script) landing copy. */
export const sr: LandingCopy = {
  meta: {
    lang: 'sr',
    locale: 'sr-RS',
    title: 'Mera — od mere do ponude',
    description:
      'Softver za radionice nameštaja po meri: tačan kroj, kalkulacija materijala i okova i PDF predračun za nekoliko minuta.',
  },
  nav: { how: 'Kako radi', features: 'Mogućnosti', pricing: 'Cene', login: 'Prijava', cta: 'Probaj besplatno' },
  hero: {
    eyebrow: 'Softver za radionice nameštaja po meri',
    headline: 'Od mere do ponude, bez Excela.',
    lead: 'Mera pretvara dimenzije prostora u tačan kroj, kalkulaciju materijala i okova i predračun spreman za kupca — za nekoliko minuta, ne za nekoliko dana.',
    primaryCta: 'Probaj besplatno 7 dana',
    secondaryCta: 'Pogledaj kako radi',
    note: 'Bez kartice. Otkažite bilo kad.',
  },
  demo: {
    project: 'Projekat · Kuhinja Petrović',
    sliderLabel: 'Širina zida',
    hint: 'Pomerite klizač — elementi se uklapaju do milimetra.',
    exact: 'Elementi: {count} · tačno',
    remainder: 'Ostatak {mm} mm',
    customLegend: 'element po meri popunjava ostatak',
    boards: 'Ploče · iverica 18 mm',
    edge: 'Kant traka',
    hardware: 'Okovi',
    labour: 'Rad',
    total: 'Ukupno',
    currency: 'RSD',
    units: { mm: 'mm', m2: 'm²', m: 'm', pcs: 'kom' },
  },
  problem: {
    title: 'Ponuda telefonom. Kroj na papiru. Cena iz glave.',
    body: 'Svaka greška u meri košta jednu ploču. Svaka spora ponuda košta jedan posao. Mera spaja meru, kalkulaciju i ponudu na jedno mesto — sa vašim materijalima i vašim cenama.',
  },
  how: {
    eyebrow: 'Kako radi',
    title: 'Tri koraka od mere do potpisane ponude.',
    steps: [
      { title: 'Unesite meru', body: 'Zid od 3925 mm je 3925 mm. Mera popunjava prostor do milimetra — bez rupa i bez elemenata koji ne mogu da se naprave.' },
      { title: 'Mera računa', body: 'Za svaki element: ploče u m², kant traka u metrima, okovi po komadu i rad. Lista za kroj je spremna odmah.' },
      { title: 'Pošaljite ponudu', body: 'Predračun sa vašim logom i stavkama za transport i montažu, kao PDF. Cena se zaključava u trenutku slanja.' },
    ],
  },
  features: {
    eyebrow: 'Mogućnosti',
    title: 'Cela radionica, digitalizovana.',
    items: [
      { title: 'Projekti i rokovi', body: 'Tabla Na čekanju · U izradi · Završeno, lista i vremenska linija. Svaki posao sa ukupnom cenom i rokom.' },
      { title: 'Kroj i kalkulacija', body: 'Elementi, fioke i pojedinačne ploče. Svaki deo sa dimenzijama, smerom godova i kantovanim ivicama.' },
      { title: 'Materijali i ostaci', body: 'Ploče po m², trake i radne ploče po metru, okovi po komadu. Ostatke vodite kao zalihu.' },
      { title: 'Konfiguracije materijala', body: 'Sačuvajte kombinaciju korpusa, fronta i leđa jednom — popunite ceo element jednim klikom.' },
      { title: '2D i 3D pregled', body: 'Kotirani crtež i 3D model iz iste konfiguracije. Kupac vidi tačno ono što ćete napraviti.' },
      { title: 'Ponude u PDF-u', body: 'Predračun sa podacima kupca, avansom i uslovima plaćanja. Izdata ponuda se ne menja kad promenite cene.' },
    ],
    upcoming: {
      badge: 'USKORO',
      body: 'Skica ili fotografija → elementi. Nacrtajte na papiru ili opišite rečima, Mera predlaže elemente koje zatim doterujete.',
    },
  },
  promise: {
    title: 'Ono što se konfiguriše, radionica može da napravi.',
    facts: [
      { title: '1 mm', body: 'Sve mere su celi milimetri. Bez zaokruživanja, bez centimetara.' },
      { title: '0 rupa', body: 'Elementi popunjavaju prostor tačno, uz poštovanje vaših pravila za širine i visine.' },
      { title: '„Na upit“', body: 'Gde cena nije poznata, Mera to kaže. Nikada ne izmišlja broj.' },
    ],
  },
  pricing: {
    eyebrow: 'Cene',
    title: 'Jedan plan. Sve uključeno.',
    lead: 'Prvih 7 dana besplatno. Neograničeni projekti, kroj, kalkulacija i PDF ponude.',
    choose: 'Izaberi',
    plans: [
      { name: 'Nedeljno', price: '15 €', period: '/ nedelja', body: 'Za probu na pravom poslu. Otkažite bilo kad.', featured: false },
      { name: 'Mesečno', price: '50 €', period: '/ mesec', body: 'Za radionice koje rade više poslova mesečno.', featured: false },
      { name: 'Godišnje', price: '360 €', period: '/ godina', body: 'Najbolja vrednost — 30 € mesečno.', badge: '2 MESECA GRATIS', featured: true },
    ],
  },
  faq: {
    title: 'Česta pitanja',
    items: [
      { title: 'Da li moram da menjam način rada?', body: 'Ne. Unosite iste materijale i cene koje već koristite. Mera samo radi računicu koju sada radite ručno.' },
      { title: 'Koje materijale mogu da unesem?', body: 'Ploče po m², kant trake i radne ploče po metru, okove po komadu i ostatke ploča.' },
      { title: 'U kojoj valuti su ponude?', body: 'Podrazumevano u dinarima. Valutu menjate u podešavanjima.' },
      { title: 'Gde se čuvaju moji podaci?', body: 'Na serverima u Evropskoj uniji (Frankfurt). Svaka radionica vidi samo svoje podatke.' },
    ],
  },
  finalCta: { title: 'Sledeću ponudu napravite u Meri.', body: '7 dana besplatno, bez kartice.', cta: 'Napravi nalog' },
  footer: {
    tagline: 'nameštaj po meri, tačno.',
    links: [
      { label: 'Prijava', href: '#' },
      { label: 'Kontakt', href: '#' },
      { label: 'Uslovi korišćenja', href: '#' },
      { label: 'Privatnost', href: '#' },
    ],
    copyright: '© 2026 Mera',
  },
}
