/* ═══════════════════════════════════════════════════════════════════════════
   AANGIFTE SCHENKBELASTING 2026 — CONFIGURATIE
   ───────────────────────────────────────────────────────────────────────────
   Dit bestand bevat ALLE vragen, teksten, opties en voorwaarden.
   De engine (engine.js) leest dit bestand en bouwt daar het formulier van.

   Wil je iets aanpassen? Dan hoef je alleen hier te zijn:
     • tekst wijzigen       → pas de string aan
     • vraag toevoegen      → voeg een object toe aan `velden`
     • vraag verbergen/tonen→ pas `toon` aan (functie die true/false geeft)
     • dropdown-optie       → pas `opties` aan
     • verplicht of niet    → `verplicht: false`

   Veldtypen: alinea, lijst, kop, info, keuze, janee, tekst, bedrag, datum,
              checkbox, checkboxgroep, postcode_plaats, weergave, herhaal

   Voorwaarde-functies krijgen twee argumenten:
     a    = alle antwoorden buiten herhaalblokken (a.instelling, a.situatie …)
     item = het huidige herhaalblok (bijv. één schenking), anders null

   Labels mogen een string zijn óf een object { zelf: "…", kind: "…" } —
   dan kiest de engine de tekst die past bij de gekozen situatie.

   Velden met `reconstructie: true` zijn NIET letterlijk in het echte
   formulier waargenomen, maar gereconstrueerd op basis van de wet en de
   structuur van het formulier. Open de site met ?dev=1 om ze te markeren.
   ═══════════════════════════════════════════════════════════════════════ */

window.AANGIFTE_CONFIG = {

  jaar: 2026,
  sessiecode: "SUC 071E - 1Z41OLAV",

  vrijstelling: { ouder: 6908, overig: 2769 },

  // Ingelogde (fictieve) gebruiker — wordt "via DigiD" vooringevuld
  gebruiker: {
    naam: "PIETJE PUK",
    voorletters: "P",
    achternaam: "Puk",
    bsn: "111222333",
    geboortedatum: "01-07-1980"
  },

  // Vaste keuzelijsten (op meerdere plekken gebruikt)
  lijsten: {
    soortSchenking: [
      { w: "geld",             l: "Geld" },
      { w: "woning",           l: "Woning of een andere onroerende zaak" },
      { w: "effecten",         l: "Aandelen en andere effecten" },
      { w: "onderneming",      l: "Ondernemingsvermogen" },
      { w: "periodiek",        l: "Periodieke uitkering" },
      { w: "roerend",          l: "Roerende zaken" },
      { w: "schuldigerkenning",l: "Schuldigerkenning uit vrijgevigheid (schenking op papier)" },
      { w: "kwijtschelding",   l: "Kwijtschelding van een schuld" },
      { w: "vruchtgebruik",    l: "Vruchtgebruik" },
      { w: "verzekering",      l: "Verzekering" },
      { w: "andere",           l: "Andere schenking" }
    ],
    // "De schenker is" (situatie: ik krijg een schenking)
    relatieZelf: [
      { w: "ouder",      l: "uw ouder of schoonouder" },
      { w: "grootouder", l: "uw grootouder" },
      { w: "kind",       l: "uw kind" },
      { w: "kleinkind",  l: "uw kleinkind" },
      { w: "partner",    l: "uw echtgenoot, geregistreerde partner of samenwonende partner" },
      { w: "overig",     l: "iemand anders" }
    ],
    // "Relatie tussen deze schenker en uw kind" (situatie: minderjarig kind)
    relatieKind: [
      { w: "ouder",      l: "Ouder" },
      { w: "grootouder", l: "Grootouder" },
      { w: "overig",     l: "Iemand anders" }
    ],
    betaler: [
      { w: "ontvanger", l: "Ontvanger" },
      { w: "schenker",  l: "Schenker" }
    ],
    bijzondereVrijstelling: [
      { w: "moreel",   l: "Morele verplichtingen" },
      { w: "schulden", l: "Betalen van dringende schulden" },
      { w: "anbi",     l: "Schenking door een ANBI in het algemeen belang" },
      { w: "sbbi",     l: "Schenking door een SBBI" }
    ],
    landen: [
      "Nederland","Albanië","België","Bulgarije","Canada","Cyprus","Denemarken","Duitsland",
      "Estland","Finland","Frankrijk","Griekenland","Hongarije","Ierland","IJsland","Italië",
      "Kroatië","Letland","Liechtenstein","Litouwen","Luxemburg","Malta","Marokko","Noorwegen",
      "Oostenrijk","Polen","Portugal","Roemenië","Slovenië","Slowakije","Spanje","Suriname",
      "Tsjechië","Turkije","Verenigd Koninkrijk","Verenigde Staten","Zweden","Zwitserland","Ander land"
    ]
  },

  /* ─────────────────────────────────────────────────────────────────────
     WIZARD-PAGINA'S  (linker navigatie in deze volgorde)
     ───────────────────────────────────────────────────────────────────── */
  paginas: [

    /* ══════════════ 1. INTRODUCTIE ══════════════ */
    {
      id: "introductie",
      nav: "Introductie",
      titel: "Introductie",
      knopVolgende: "Volgende",
      knopVorige: null,
      velden: [
        { type: "alinea", html: "U moet aangifte schenkbelasting doen als:" },
        { type: "lijst", items: [
          "u 1 of meer schenkingen krijgt van uw ouder(s) en de totale waarde in 2026 hoger is dan € 6908",
          "u 1 of meer schenkingen krijgt van iemand anders dan uw ouder(s) en de totale waarde in 2026 hoger is dan € 2769"
        ]},
        { type: "alinea", html: "De bedragen € 6908 en € 2769 zijn de bedragen van de jaarlijkse vrijstelling. Wij kennen de jaarlijkse vrijstelling automatisch toe nadat u aangifte hebt gedaan. U hoeft de algemene jaarlijkse vrijstelling dus niet zelf af te trekken van de schenkingen die u opgeeft." },
        { type: "kop", tekst: "Hulp nodig?", help: "Bij veel vragen staat een vraagteken. Klik daarop voor een korte toelichting." },
        { type: "lijst", items: [
          "Klik op het vraagteken voor een korte toelichting bij de vraag.",
          "Klik op 'Help' in het menu voor meer informatie over dit formulier.",
          "Kijk op <a href=\"https://www.belastingdienst.nl/schenken\" target=\"_blank\" rel=\"noopener\">belastingdienst.nl/schenken (opent nieuw venster)</a> voor meer informatie over schenkbelasting."
        ]},
        { type: "keuze", id: "situatie", label: "Uw situatie",
          help: "Kies 'Mijn minderjarige kind krijgt een schenking' als u als ouder of voogd aangifte doet voor een kind jonger dan 18 jaar.",
          opties: [
            { w: "zelf", l: "Ik krijg een schenking" },
            { w: "kind", l: "Mijn minderjarige kind krijgt een schenking" }
          ]
        },
        { type: "info", html: "In dit formulier ziet u geen berekening. U krijgt na uw aangifte bericht van ons over uw schenkbelasting.<br><br>Wilt u controleren hoeveel schenkbelasting u moet betalen? Gebruik dan het <a href=\"https://www.belastingdienst.nl/wps/wcm/connect/nl/schenken/content/hulpmiddel-schenkbelasting-berekenen\" target=\"_blank\" rel=\"noopener\">hulpmiddel schenkbelasting berekenen (opent nieuw venster)</a>." }
      ]
    },

    /* ══════════════ 2. ALGEMENE GEGEVENS ══════════════ */
    {
      id: "algemeen",
      nav: "Algemene gegevens",
      titel: "Algemene gegevens",
      velden: [

        /* — Variant: ik krijg een schenking (gegevens via DigiD) — */
        { type: "kop", tekst: "Uw gegevens", toon: a => a.situatie === "zelf" },
        { type: "weergave", label: "Naam",                     waarde: (a, i, cfg) => cfg.gebruiker.naam,          toon: a => a.situatie === "zelf" },
        { type: "weergave", label: "Burgerservicenummer (bsn)",waarde: (a, i, cfg) => cfg.gebruiker.bsn,           toon: a => a.situatie === "zelf" },
        { type: "weergave", label: "Geboortedatum",            waarde: (a, i, cfg) => cfg.gebruiker.geboortedatum, toon: a => a.situatie === "zelf" },
        { type: "info", toon: a => a.situatie === "zelf",
          html: "Wij sturen alle correspondentie over deze aangifte naar uw adres. Wilt u liever dat we de aanslag naar een ander adres sturen? Dan kunt u een ander adres invullen. Dit adres gebruiken wij dan ook als we vragen hebben over de aangifte." },

        /* — Variant: mijn minderjarige kind — */
        { type: "kop", tekst: "Gegevens van uw minderjarige kind", toon: a => a.situatie === "kind" },
        { type: "tekst", id: "kind_voorletters", label: "Voorletter(s)", toon: a => a.situatie === "kind" },
        { type: "tekst", id: "kind_tussenvoegsel", label: "Tussenvoegsel", verplicht: false, toon: a => a.situatie === "kind" },
        { type: "tekst", id: "kind_achternaam", label: "Achternaam", toon: a => a.situatie === "kind" },
        { type: "tekst", id: "kind_bsn", label: "Burgerservicenummer (bsn)", valideer: "bsn", uniekBsn: true, breedte: "vol",
          help: "Het burgerservicenummer staat op het paspoort, de identiteitskaart of het rijbewijs van uw kind.",
          toon: a => a.situatie === "kind" },
        { type: "datum", id: "kind_geboortedatum", label: "Geboortedatum", minDatum: "01-01-2008",
          foutMin: "Vul een datum in die op of na 01-01-2008 ligt.",
          toon: a => a.situatie === "kind" },
        { type: "info", toon: a => a.situatie === "kind",
          html: "Wij sturen alle correspondentie over deze aangifte naar het adres van uw minderjarige kind. Wilt u liever dat we de aanslag naar een ander adres sturen? Dan kunt u een ander adres invullen. Dit adres gebruiken wij dan ook als we vragen hebben over de aangifte." },

        /* — Ander adres (beide varianten) — */
        { type: "janee", id: "ander_adres", label: "Wilt u voor het toesturen van de aanslag een ander adres doorgeven?",
          help: "De aanslag komt altijd op naam van de ontvanger van de schenking. U kunt wel een ander adres opgeven waar wij de post naartoe sturen." },
        { type: "janee", id: "corr_instelling", label: "Wilt u dat wij correspondentie over deze aangifte naar een instelling of bedrijf sturen?",
          toon: a => a.ander_adres === "ja" },

        { type: "kop", tekst: "Contactpersoon", toon: a => a.ander_adres === "ja" && a.corr_instelling === "ja" },
        { type: "info", toon: a => a.ander_adres === "ja" && a.corr_instelling === "ja",
          html: "Vul hieronder de gegevens in van de instelling of het bedrijf waar wij de correspondentie naartoe moeten sturen. Wij sturen dan alle correspondentie over deze aangifte naar dit bedrijf of deze instelling." },
        { type: "tekst", id: "corr_naam_instelling", label: "Naam instelling of bedrijf", toon: a => a.ander_adres === "ja" && a.corr_instelling === "ja" },
        { type: "tekst", id: "corr_rsin", label: "RSIN/fiscaal identificatienummer", help: "Het RSIN vindt u in het Handelsregister van de Kamer van Koophandel.", toon: a => a.ander_adres === "ja" && a.corr_instelling === "ja" },
        { type: "tekst", id: "corr_consulent", label: "Nummer belastingconsulent (niet verplicht)", verplicht: false, help: "Het beconnummer van de belastingconsulent.", toon: a => a.ander_adres === "ja" && a.corr_instelling === "ja" },
        { type: "tekst", id: "corr_notaris", label: "Protocolnummer notaris (niet verplicht)", verplicht: false, breedte: "kort", help: "Het protocolnummer van de notaris die de akte heeft opgemaakt.", toon: a => a.ander_adres === "ja" && a.corr_instelling === "ja" },

        { type: "kop", tekst: "Correspondentieadres", toon: a => a.ander_adres === "ja" },
        { type: "keuze", id: "corr_land", label: "Land", lijst: "landen", standaard: "Nederland", help: "Kies het land van het correspondentieadres.", toon: a => a.ander_adres === "ja" },
        { type: "tekst", id: "corr_straat", label: "Straat", toon: a => a.ander_adres === "ja" },
        { type: "tekst", id: "corr_huisnummer", label: "Huisnummer", toon: a => a.ander_adres === "ja" },
        { type: "tekst", id: "corr_toevoeging", label: "Toevoeging", verplicht: false, toon: a => a.ander_adres === "ja" },
        { type: "postcode_plaats", id: "corr_postcode", id2: "corr_plaats", label: "Postcode en woonplaats", toon: a => a.ander_adres === "ja" },

        /* — Contactgegevens (beide varianten) — */
        { type: "kop", tekst: "Contactgegevens voor vragen over deze aangifte" },
        { type: "info", html: "Om u goed te kunnen helpen, kan het zijn dat we nog vragen hebben over deze aangifte. We nemen dan graag contact met u op." },
        { type: "alinea", html: "Contactvoorkeur (Bellen doen we alleen op werkdagen tussen 8.00 en 17.00 uur. E-mailen is sneller.):" },
        { type: "checkboxgroep", id: "contact", verplicht: false, opties: [
          { w: "email",    l: "E-mail" },
          { w: "telefoon", l: "Telefoon" }
        ]},
        { type: "tekst", id: "contact_email", label: "E-mailadres", toon: a => (a.contact || []).includes("email"), reconstructie: true },
        { type: "tekst", id: "contact_telefoon", label: "Telefoonnummer", breedte: "kort", toon: a => (a.contact || []).includes("telefoon"), reconstructie: true }
      ]
    },

    /* ══════════════ 3. SCHENKINGEN ══════════════ */
    {
      id: "schenkingen",
      nav: "Schenkingen",
      titel: "Schenkingen",
      velden: [
        { type: "kop", tekst: "Gegevens schenker" },
        { type: "janee", id: "instelling", label: "Is de schenker een instelling of bedrijf?",
          help: "Kies 'Ja' als u de schenking hebt gekregen van bijvoorbeeld een stichting, vereniging, bv of nv." },

        /* — schenker = persoon — */
        { type: "info", toon: a => a.instelling === "nee",
          html: { zelf: "Vul hieronder de gegevens in van de persoon van wie u de schenking hebt gekregen.",
                  kind: "Vul hieronder de gegevens in van de persoon van wie uw kind de schenking heeft gekregen." } },
        { type: "tekst", id: "s_voorletters", label: "Voorletter(s)", toon: a => a.instelling === "nee" },
        { type: "tekst", id: "s_tussenvoegsel", label: "Tussenvoegsel", verplicht: false, toon: a => a.instelling === "nee" },
        { type: "tekst", id: "s_achternaam", label: "Achternaam", toon: a => a.instelling === "nee" },
        { type: "keuze", id: "relatie", label: "De schenker is", lijst: "relatieZelf",
          help: "Onder 'ouder' verstaan wij ook een stiefouder, pleegouder of schoonouder. De relatie bepaalt welke vrijstelling en welk tarief gelden.",
          toon: a => a.instelling === "nee" && a.situatie === "zelf" },
        { type: "keuze", id: "relatie", label: "Relatie tussen deze schenker en uw kind", lijst: "relatieKind",
          help: "De relatie tussen de schenker en uw kind bepaalt welke vrijstelling en welk tarief gelden.",
          toon: a => a.instelling === "nee" && a.situatie === "kind" },
        { type: "tekst", id: "s_bsn", label: "Burgerservicenummer (bsn)", valideer: "bsn", uniekBsn: true, breedte: "vol",
          help: "Het burgerservicenummer van de schenker. Weet u dit niet? Vraag het aan de schenker.",
          toon: a => a.instelling === "nee" },
        { type: "datum", id: "s_geboortedatum", label: "Geboortedatum", toon: a => a.instelling === "nee" },

        /* — schenker = instelling/bedrijf (gereconstrueerd) — */
        { type: "info", toon: a => a.instelling === "ja", reconstructie: true,
          html: "Vul hieronder de gegevens in van de instelling of het bedrijf van wie u de schenking hebt gekregen." },
        { type: "tekst", id: "s_naam_instelling", label: "Naam instelling of bedrijf", toon: a => a.instelling === "ja", reconstructie: true },
        { type: "tekst", id: "s_rsin", label: "RSIN/fiscaal identificatienummer", help: "Het RSIN vindt u in het Handelsregister van de Kamer van Koophandel.", toon: a => a.instelling === "ja", reconstructie: true },
        { type: "keuze", id: "s_land", label: "Land van vestiging", lijst: "landen", standaard: "Nederland", toon: a => a.instelling === "ja", reconstructie: true },

        { type: "janee", id: "eerder",
          label: { zelf: "Hebt u al eerder in 2026 een schenking ontvangen van deze schenker?",
                   kind: "Heeft uw kind al eerder in 2026 een schenking ontvangen van deze schenker?" },
          toon: a => a.instelling !== undefined && a.instelling !== null },
        { type: "janee", id: "eerder_aangifte", label: "Hebt u van die eerdere schenking(en) al aangifte gedaan?",
          toon: a => a.eerder === "ja", reconstructie: true },

        /* — Herhaalbaar blok: schenkingen — */
        { type: "kop", tekst: "Schenkingen", toon: a => a.eerder !== undefined && a.eerder !== null },
        { type: "herhaal", id: "schenkingen", toon: a => a.eerder !== undefined && a.eerder !== null,
          bloktitel: (item, cfg) => "Schenking: " + (cfg.label("soortSchenking", item.soort) || ""),
          vraagMeer: { zelf: "Hebt u in 2026 nog een schenking ontvangen van deze schenker?",
                       kind: "Heeft uw kind in 2026 nog een schenking ontvangen van deze schenker?" },
          velden: [
            { type: "keuze", id: "soort", label: "Soort schenking", lijst: "soortSchenking",
              help: "Kies wat het beste past bij wat u hebt gekregen. Kreeg u meerdere soorten? Dan geeft u elke soort apart op." },

            /* velden per soort */
            { type: "datum", id: "datum", label: "Datum van de schenking", inJaar: 2026, toon: (a, s) => !!s.soort },
            { type: "bedrag", id: "bedrag", label: "Bedrag van de schenking", toon: (a, s) => s.soort === "geld" },

            { type: "tekst",  id: "adres", label: "Adres van de onroerende zaak", toon: (a, s) => s.soort === "woning", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "WOZ-waarde van de onroerende zaak", help: "Gebruik de WOZ-waarde die geldt in het jaar van de schenking.", toon: (a, s) => s.soort === "woning", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Waarde van de aandelen of effecten", toon: (a, s) => s.soort === "effecten", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Waarde van het ondernemingsvermogen", toon: (a, s) => s.soort === "onderneming", reconstructie: true },
            { type: "janee",  id: "bor", label: "Wilt u gebruikmaken van de bedrijfsopvolgingsregeling?", help: "De bedrijfsopvolgingsregeling (BOR) geeft een voorwaardelijke vrijstelling voor ondernemingsvermogen.", toon: (a, s) => s.soort === "onderneming", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Bedrag van de uitkering per jaar", toon: (a, s) => s.soort === "periodiek", reconstructie: true },
            { type: "tekst",  id: "looptijd", label: "Looptijd in jaren", breedte: "kort", toon: (a, s) => s.soort === "periodiek", reconstructie: true },
            { type: "tekst",  id: "omschrijving", label: "Omschrijving van de roerende zaak", toon: (a, s) => s.soort === "roerend", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Waarde van de roerende zaak", toon: (a, s) => s.soort === "roerend", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Bedrag van de schuldigerkenning", toon: (a, s) => s.soort === "schuldigerkenning", reconstructie: true },
            { type: "janee",  id: "notarieel", label: "Is de schuldigerkenning vastgelegd in een notariële akte?", toon: (a, s) => s.soort === "schuldigerkenning", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Bedrag van de kwijtgescholden schuld", toon: (a, s) => s.soort === "kwijtschelding", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Waarde van het vruchtgebruik", toon: (a, s) => s.soort === "vruchtgebruik", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Waarde van de verzekering", toon: (a, s) => s.soort === "verzekering", reconstructie: true },
            { type: "tekst",  id: "omschrijving", label: "Omschrijving van de schenking", toon: (a, s) => s.soort === "andere", reconstructie: true },
            { type: "bedrag", id: "bedrag", label: "Waarde van de schenking", toon: (a, s) => s.soort === "andere", reconstructie: true },

            /* gemeenschappelijke vragen */
            { type: "janee", id: "apv",
              label: { zelf: "Kreeg u de schenking uit een afgezonderd particulier vermogen (APV)?",
                       kind: "Kreeg uw kind de schenking uit een afgezonderd particulier vermogen (APV)?" },
              help: "Een afgezonderd particulier vermogen is bijvoorbeeld een trust of een buitenlandse stichting waarin vermogen is ondergebracht.",
              toon: (a, s) => !!s.soort },
            { type: "janee", id: "herroepbaar", label: "Is in een overeenkomst vastgelegd dat de schenking herroepbaar is?",
              help: "Een herroepbare schenking kan de schenker later weer ongedaan maken. Dit moet in de overeenkomst staan.",
              toon: (a, s) => !!s.soort },
            { type: "janee", id: "buitenland", label: "Betaalde u over deze schenking(en) buiten Nederland ook belasting?",
              help: "Betaalde u in een ander land al schenkbelasting over deze schenking? Dan kunt u die belasting mogelijk verrekenen.",
              toon: (a, s) => !!s.soort },
            { type: "bedrag", id: "buitenland_bedrag", label: "Betaalde belasting buiten Nederland", toon: (a, s) => s.buitenland === "ja" },
            { type: "keuze",  id: "buitenland_land", label: "Land waar deze belasting is betaald", lijst: "landen", zonderNederland: true, toon: (a, s) => s.buitenland === "ja" },
            { type: "keuze", id: "betaler", label: "Als er schenkbelasting betaald moet worden, dan betaalt de", lijst: "betaler", standaard: "ontvanger",
              help: "Normaal betaalt de ontvanger de schenkbelasting. De schenker kan de belasting ook voor zijn rekening nemen; dan is dat een extra schenking.",
              toon: (a, s) => !!s.soort },
            { type: "info", toon: (a, s) => s.betaler === "schenker",
              html: "De aanslag schenkbelasting sturen wij naar uw adres.<br><br>Wilt u dit niet? Vul dan een ander adres in op het scherm 'Algemene gegevens'.<br><br>Let op!<br>De aanslag komt altijd op uw naam te staan. Ook als de schenker de aanslag betaalt of als u het adres aanpast." },

            /* vrijstellingen */
            { type: "kop", tekst: "Vrijstellingen", toon: (a, s) => !!s.soort },
            { type: "info", toon: (a, s) => !!s.soort,
              html: (a, s, cfg) => "De jaarlijkse vrijstelling is € " + (a.relatie === "ouder" ? cfg.vrijstelling.ouder : cfg.vrijstelling.overig) + ". Wij passen de jaarlijkse vrijstelling automatisch toe nadat u aangifte hebt gedaan. Trek de vrijstelling dus niet zelf af van de schenking." },
            { type: "janee", id: "vrij_gebruik", label: "Wilt u voor dit kalenderjaar een eenmalig verhoogde vrijstelling of een bijzondere vrijstelling gebruiken?",
              help: "Naast de jaarlijkse vrijstelling bestaan er een eenmalig verhoogde vrijstelling (voor kinderen van 18 tot en met 39 jaar) en enkele bijzondere vrijstellingen.",
              toon: (a, s) => !!s.soort },
            { type: "janee", id: "vrij_studie", label: "Is in een notariële akte vastgelegd dat u deze schenking gebruikt voor een dure studie?",
              help: "Voor een dure studie of opleiding geldt een extra verhoogde vrijstelling als dit in een notariële akte is vastgelegd.",
              toon: (a, s) => s.vrij_gebruik === "ja" && a.relatie === "ouder" },
            { type: "janee", id: "vrij_verhoogd", label: "Wilt u voor deze schenking gebruikmaken van de eenmalig verhoogde vrijstelling?",
              help: "De eenmalig verhoogde vrijstelling kunt u maar één keer in uw leven gebruiken voor een schenking van uw ouders.",
              toon: (a, s) => s.vrij_gebruik === "ja" && a.relatie === "ouder" },
            { type: "janee", id: "vrij_bijzonder", label: "Wilt u gebruikmaken van een bijzondere vrijstelling?",
              help: "Bijvoorbeeld een schenking om dringende schulden te betalen of een schenking uit een morele verplichting.",
              toon: (a, s) => s.vrij_gebruik === "ja" },
            { type: "keuze", id: "vrij_bijzonder_soort", label: "Bijzondere vrijstelling", lijst: "bijzondereVrijstelling",
              help: "Kies de bijzondere vrijstelling die op uw situatie van toepassing is.",
              toon: (a, s) => s.vrij_gebruik === "ja" && s.vrij_bijzonder === "ja" }
          ]
        }
      ]
    },

    /* ══════════════ 4. BIJZONDERE SITUATIES ══════════════ */
    {
      id: "bijzonder",
      nav: "Bijzondere situaties",
      titel: "Bijzondere situaties",
      velden: [
        { type: "info", html: "Is er sprake van een bijzondere situatie die u niet in de aangifte kwijt kunt? Dan kunt u dat hieronder aangeven. Wij kunnen dan contact met u opnemen als wij de aangifte in behandeling nemen." },
        { type: "alinea", html: "Ik wil een toelichting geven over:" },
        { type: "checkboxgroep", id: "bijzonder", verplicht: false, opties: [
          { w: "erfrente",     l: "Een bovenmatige erfrechtelijke rente, bij leven uitbetaald" },
          { w: "verblijving",  l: "Een verblijvingsbeding in een maatschapscontract" },
          { w: "vruchtgebruik",l: "Vruchtgebruik van een renteloze lening aan een natuurlijk persoon" }
        ]}
      ]
    },

    /* ══════════════ 5. OVERZICHT ══════════════ */
    {
      id: "overzicht",
      nav: "Overzicht",
      titel: "Overzicht",
      knopVolgende: "Opslaan en naar verzenden",
      overzicht: true,
      velden: [
        { type: "info", html: "Controleer de ingevulde gegevens.<br><br>Als alle gegevens kloppen, klikt u op 'Opslaan en naar verzenden' om de aangifte te verzenden.<br>Wilt u nog gegevens aanpassen? Klik dan op 'Vorige' om terug te gaan naar het vorige scherm." },

        { type: "kop", tekst: { zelf: "Uw gegevens", kind: "Gegevens van uw minderjarige kind" } },
        { type: "weergave", label: "Naam", cursief: true, waarde: (a, i, cfg) => a.situatie === "kind" ? [a.kind_voorletters, a.kind_tussenvoegsel, a.kind_achternaam].filter(Boolean).join(" ") : cfg.gebruiker.naam },
        { type: "weergave", label: "Burgerservicenummer (bsn)", cursief: true, waarde: (a, i, cfg) => a.situatie === "kind" ? a.kind_bsn : cfg.gebruiker.bsn },
        { type: "weergave", label: "Geboortedatum", cursief: true, waarde: (a, i, cfg) => a.situatie === "kind" ? a.kind_geboortedatum : cfg.gebruiker.geboortedatum },
        { type: "weergave", label: "Wilt u voor het toesturen van de aanslag een ander adres doorgeven?", cursief: true, waarde: (a, i, cfg) => cfg.janee(a.ander_adres) },

        { type: "kop", tekst: "Gegevens schenker" },
        { type: "weergave", label: "Naam van de schenker", cursief: true, waarde: a => a.instelling === "ja" ? a.s_naam_instelling : [a.s_voorletters, a.s_tussenvoegsel, a.s_achternaam].filter(Boolean).join(" ") },
        { type: "weergave", label: { zelf: "De schenker is", kind: "Relatie tussen deze schenker en uw kind" }, cursief: true, toon: a => a.instelling === "nee",
          waarde: (a, i, cfg) => cfg.label(a.situatie === "kind" ? "relatieKind" : "relatieZelf", a.relatie) },
        { type: "weergave", label: "Bsn", cursief: true, toon: a => a.instelling === "nee", waarde: a => a.s_bsn },
        { type: "weergave", label: "RSIN/fiscaal identificatienummer", cursief: true, toon: a => a.instelling === "ja", waarde: a => a.s_rsin },
        { type: "weergave", label: "Geboortedatum", cursief: true, toon: a => a.instelling === "nee", waarde: a => a.s_geboortedatum },
        { type: "weergave", label: { zelf: "Hebt u al eerder in 2026 een schenking ontvangen van deze schenker?", kind: "Heeft uw kind al eerder in 2026 een schenking ontvangen van deze schenker?" }, cursief: true, waarde: (a, i, cfg) => cfg.janee(a.eerder) },

        { type: "kop", tekst: "Schenkingen" },
        { type: "tabel", bron: "schenkingen", kolommen: [
          { kop: "Soort schenking", waarde: (s, cfg) => cfg.label("soortSchenking", s.soort) },
          { kop: "Datum", waarde: s => s.datum || "" }
        ]},

        { type: "info", html: "Wij leggen de aanslag schenkbelasting op na afloop van het jaar waarin de schenking is gedaan. Dus voor een schenking in 2026, leggen wij de definitieve aanslag op vanaf 2027. U krijgt de aanslag altijd binnen 3 jaar na het doen van aangifte." },
        { type: "kop", tekst: "Al uw ingevulde gegevens op een rij" },
        { type: "alinea", html: "We hebben al uw ingevulde gegevens voor u op een rij gezet in een pdf. Zo kunt u ze gemakkelijk controleren en opslaan of afdrukken." },
        { type: "knop", label: "Bekijk uw ingevulde gegevens", actie: "toonPdf" }
      ]
    },

    /* ══════════════ 6 & 7: aparte lay-out, zie engine ══════════════ */
    { id: "verzenden",   nav: "Ondertekenen en verzenden", verzendlayout: true },
    { id: "bevestiging", nav: "Ontvangstbevestiging",      verzendlayout: true }
  ],

  /* ─────────────────────────────────────────────────────────────────────
     VERZENDPAGINA & BEVESTIGING
     ───────────────────────────────────────────────────────────────────── */
  verzenden: {
    kop: "Schenkbelasting 2026",
    stappen: ["Invullen aangifte", "Verzenden aangifte", "Ontvangstbevestiging"],
    titel: "Verzenden aangifte",
    verklaring: (naam) => naam + " verklaart dat de aangifte schenkbelasting 2026 volledig en naar waarheid is ingevuld.",
    knop: "Verzenden aangifte",
    foutVerklaring: "U moet de verklaring aanvinken voordat u de aangifte kunt verzenden."
  },
  bevestiging: {
    titel: "Ontvangstbevestiging",
    html: (kenmerk, datum) =>
      "<p><strong>Wij hebben uw aangifte schenkbelasting 2026 ontvangen.</strong></p>" +
      "<p>Ontvangen op: " + datum + "<br>Kenmerk: " + kenmerk + "</p>" +
      "<p>U krijgt na afloop van het jaar bericht van ons over uw schenkbelasting. Bewaar deze bevestiging goed.</p>",
    reconstructie: true
  },

  /* ─────────────────────────────────────────────────────────────────────
     HELP-VENSTER (menu-knop 'Help')
     ───────────────────────────────────────────────────────────────────── */
  helpTekst:
    "<h3>Over dit formulier</h3>" +
    "<p>Met dit formulier doet u aangifte schenkbelasting over schenkingen die u (of uw minderjarige kind) in 2026 hebt ontvangen.</p>" +
    "<p>Doe voor iedere schenker een aparte aangifte. Kreeg u van dezelfde schenker meerdere schenkingen? Geef die dan allemaal op in één aangifte.</p>" +
    "<p>Bij veel vragen staat een vraagteken. Klik daarop voor een korte toelichting.</p>" +
    "<p>Met 'Opslaan' bewaart u een tussentijdse versie. Met 'Afsluiten' sluit u het formulier; uw gegevens blijven bewaard.</p>",

  /* ─────────────────────────────────────────────────────────────────────
     FOUTMELDINGEN (letterlijke teksten van de Belastingdienst)
     ───────────────────────────────────────────────────────────────────── */
  fouten: {
    verplicht:   (label) => "U hebt '" + label + "' nog niet ingevuld.",
    bsn:         "U hebt een ongeldig 'Burgerservicenummer (bsn)' ingevuld. Controleer het nummer en vul 'Burgerservicenummer (bsn)' opnieuw in.",
    bsnDubbel:   "U hebt dit bsn al opgegeven bij een andere persoon. Controleer de gegevens.",
    datum:       "Vul een geldige datum in (dd-mm-jjjj).",
    inJaar:      (jaar) => "Vul een datum in die in " + jaar + " ligt.",
    bedrag:      "Vul een geldig bedrag in."
  }
};
