// controllers/legalController.js
// Returnerar HTML från kod, men nu utan hårdkodad svart text.
// Vi använder dina variabler: --text-main (vit i dark theme) och --accent-hover.

const htmlShell = (title, body) => `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    /* Använd sajtens färgvariabler med fallback för säkerhet */
    :root { --legal-text: var(--text-main, #fff); --legal-link: var(--accent-hover, #8aa9ff); }
    .legal-wrapper { max-width: 860px; margin: 2rem auto; padding: 0 1rem; }
    .legal * { color: inherit; }
    .legal { color: var(--legal-text); line-height: 1.7; }
    .legal h1 { font-size: 1.75rem; margin: 0 0 1rem 0; }
    .legal h2 { font-size: 1.25rem; margin: 1.25rem 0 .5rem 0; }
    .legal p { margin: 0 0 1rem 0; }
    .legal ul { padding-left: 1.25rem; margin: 0 0 1rem 0; }
    .legal a { color: var(--legal-link); text-decoration: underline; }
  </style>
</head>
<body>
  <section class="legal-wrapper">
    <article class="legal">
      ${body}
    </article>
  </section>
</body>
</html>`;

export function getTerms(req, res) {
  const body = `
    <h1>Allmänna villkor</h1>
    <p><strong>Gäller från:</strong> 4 november 2025 · <strong>Version:</strong> 1.0</p>
    <p>Välkommen till GameMarket (”Tjänsten”). Dessa allmänna villkor (”Villkoren”) reglerar din användning av
    vår marknadsplats för köp, försäljning och uthyrning av spel och relaterade produkter. Genom att skapa konto
    eller använda Tjänsten accepterar du Villkoren.</p>

    <h2>1. Parter och kontakt</h2>
    <p>Tjänsten tillhandahålls av <em>GameMarket, org.nr 000000-0000</em> (”vi”, ”oss”). Kontakt:
    <em>privacy@gamemarket.local</em>.</p>

    <h2>2. Ålder och konto</h2>
    <ul>
      <li>Du måste vara minst 18 år eller ha målsmans samtycke.</li>
      <li>Du ansvarar för att uppgifter är korrekta och att skydda dina inloggningsuppgifter.</li>
      <li>Vi kan stänga av konton vid överträdelser eller misstanke om bedrägeri.</li>
    </ul>

    <h2>3. Tjänstens natur</h2>
    <p>GameMarket är en plattform. Om inte annat anges agerar vi förmedlare mellan köpare och säljare/uthyrare.
    Parterna i själva transaktionen är köpare och säljare/uthyrare.</p>

    <h2>4. Annonsering och förbjudna varor</h2>
    <ul>
      <li>Endast lagliga, originalprodukter får listas. Piratkopior eller kringgående av kopieringsskydd är förbjudet.</li>
      <li>Respektera åldersmärkning (t.ex. PEGI) och lokala regler.</li>
      <li>Annonser får inte innehålla kränkande, olagligt eller vilseledande innehåll.</li>
    </ul>

    <h2>5. Priser, avgifter och betalning</h2>
    <ul>
      <li>Priser visas i SEK och kan inkludera moms där så är tillämpligt.</li>
      <li>Eventuella plattformsavgifter och fraktkostnader redovisas innan köp.</li>
      <li>Betalning hanteras via extern betalningsleverantör. Tillämpliga villkor därifrån gäller.</li>
    </ul>

    <h2>6. Beställning, leverans och risk</h2>
    <ul>
      <li>Beställning är bindande när orderbekräftelse skickats.</li>
      <li>Leverans- och upphämtningssätt framgår i kassan. Risken övergår vid leverans enligt gällande rätt.</li>
    </ul>

    <h2>7. Uthyrning</h2>
    <ul>
      <li>Hyrestagaren ansvarar för produkten under hyresperioden och ska återlämna i motsvarande skick.</li>
      <li>Deposition och avgifter kan tillkomma. Försenad återlämning kan medföra extra kostnader.</li>
      <li>Skador eller borttappad produkt kan debiteras enligt avtalade villkor.</li>
    </ul>

    <h2>8. Ångerrätt och reklamation</h2>
    <ul>
      <li>14 dagars ångerrätt enligt distansavtalslagen (undantag bl.a. bruten försegling och aktiverat digitalt innehåll).</li>
      <li>Reklamation enligt Konsumentköplagen. Säljaren ansvarar för fel på varan.</li>
    </ul>

    <h2>9. Omdömen och innehåll</h2>
    <p>Du ansvarar för innehåll du publicerar. Vi kan ta bort innehåll som bryter mot Villkoren.</p>

    <h2>10. Ansvar och ansvarsbegränsning</h2>
    <p>Ingen garanti för oavbruten drift. Ansvar begränsas till direkta skador och inte högre än avgifter
    du betalat till oss de senaste 12 månaderna i den mån lagen tillåter.</p>

    <h2>11. Immateriella rättigheter</h2>
    <p>Material i Tjänsten tillhör oss eller licensgivare.</p>

    <h2>12. Personuppgifter och cookies</h2>
    <p>Se vår <a href="/privacy">Integritetspolicy</a>. Vi använder cookies enligt cookiepolicy.</p>

    <h2>13. Ändringar</h2>
    <p>Vi kan uppdatera Villkoren. Fortsatt användning innebär accept.</p>

    <h2>14. Lagval och tvist</h2>
    <p>Svensk rätt. Tvist i allmän domstol. Konsument kan vända sig till ARN eller EU:s ODR-plattform.</p>

    <p><em>Denna text är en mall och ersätter inte juridisk rådgivning.</em></p>
  `;
  res.type("html").send(htmlShell("Allmänna villkor – GameMarket", body));
}

export function getPrivacy(req, res) {
  const body = `
    <h1>Integritetspolicy (GDPR)</h1>
    <p>Vi behöver spara och behandla personuppgifter om dig, så som namn, e-postadress och information du lämnar
    när du använder GameMarket. Syftet är att kunna hantera ditt konto, dina annonser, köp och uthyrningar.</p>

    <p>Vi har fått dina uppgifter direkt från dig i samband med registrering. Den rättsliga grunden är samtycke.
    Dina uppgifter sparas så länge du har ett konto och raderas vid avslut eller på begäran.</p>

    <p>Uppgifter delas endast med personuppgiftsbiträden vi använder för att driva tjänsten (t.ex. drift/databas inom EU/EES).
    Vi överför inte uppgifter utanför EU/EES.</p>

    <p>Personuppgiftsansvarig är GameMarket-gruppen (kursprojekt). Begär utdrag/rättelse/radering/dataportabilitet via
    <strong>privacy@gamemarket.local</strong>. Dataskyddsombud nås via samma adress.</p>

    <p>Har du klagomål kan du kontakta Integritetsskyddsmyndigheten (IMY).</p>
  `;
  res.type("html").send(htmlShell("Integritetspolicy – GameMarket", body));
}
