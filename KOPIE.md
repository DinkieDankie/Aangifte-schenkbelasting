# Aangifte schenkbelasting 2026 — werkende kopie

Een zelfstandig draaiende kopie van het formulier *Aangifte schenkbelasting 2026* uit Mijn Belastingdienst, nagebouwd op basis van schermafbeeldingen van het echte formulier. Geen server nodig: open `index.html` in een browser.

## Bestanden

```
bd-kopie/
├── index.html        ← open dit bestand (of zet de map online)
├── css/stijl.css     ← opmaak (kleuren, lettertype, knoppen)
├── js/vragen.js      ← ★ ALLE vragen, teksten, opties en voorwaarden
└── js/engine.js      ← de motor die vragen.js omzet in een formulier
```

## Zelf aanpassen: alleen `js/vragen.js`

Elke pagina is een object met een lijst `velden`. Een veld ziet er zo uit:

```js
{ type: "janee", id: "herroepbaar",
  label: "Is in een overeenkomst vastgelegd dat de schenking herroepbaar is?",
  help: "Korte toelichting achter het vraagteken.",
  toon: (a, s) => !!s.soort }        // alleen tonen als soort schenking is gekozen
```

| Wil je…                      | Doe dan…                                                        |
|------------------------------|-----------------------------------------------------------------|
| een tekst wijzigen           | pas de string aan (`label`, `html`, `tekst`)                    |
| een vraag toevoegen          | voeg een object toe aan `velden` op de juiste plek              |
| een vraag verbergen/tonen    | pas `toon` aan; `a` = alle antwoorden, `s` = huidige schenking  |
| een keuzelijst wijzigen      | pas `opties` of de lijst in `lijsten` aan                       |
| iets niet verplicht maken    | `verplicht: false`                                              |
| een vraag per variant anders | `label: { zelf: "Hebt u…", kind: "Heeft uw kind…" }`            |
| vrijstellingsbedragen        | `vrijstelling: { ouder: 6908, overig: 2769 }`                   |

Veldtypen: `alinea`, `lijst`, `kop`, `info`, `keuze`, `janee`, `tekst`, `bedrag`, `datum`, `checkboxgroep`, `postcode_plaats`, `weergave`, `tabel`, `knop`, `herhaal`.

## Ontwikkelmodus

Open `index.html?dev=1`. Velden met `reconstructie: true` — niet letterlijk in het echte formulier waargenomen maar afgeleid — krijgen dan een oranje stippellijn. Dit zijn de plekken waar een schermafbeelding van het echte formulier de kopie nog exacter kan maken:

- schenker is een **instelling of bedrijf** (Ja-route)
- "al eerder een schenking ontvangen" → **Ja**-route
- soorten schenking **anders dan Geld** (woning, aandelen, onderneming, …)
- de volledige lijsten achter "De schenker is" en "Bijzondere vrijstelling"
- e-mail/telefoonvelden bij contactvoorkeur
- de **ontvangstbevestiging** (na daadwerkelijk verzenden)

## Gegevens hergebruiken (JSON → GSP)

Er zijn geen vooringevulde gegevens; alles wordt in het formulier ingevuld. Op de pagina *Overzicht* en op de *Ontvangstbevestiging* staat de knop **Download gegevens (JSON)**. Die levert één gestructureerd bestand (`aangifte-schenkbelasting-2026.json`) met alle antwoorden in schone vorm: datums als `jjjj-mm-dd`, bedragen als getallen, ja/nee als `true`/`false`, één object per schenking. Dit is de basis voor een latere vertaling naar het GSP-/XBRL-formaat van de Belastingdienst. In de browserconsole geeft `AANGIFTE_EXPORT()` hetzelfde object.

## Wat de kopie wél en niet doet

Wél: alle zeven stappen, beide situaties (zelf / minderjarig kind), conditionele vragen, meerdere schenkingen, foutmeldingen met de letterlijke BD-teksten, BSN-controle (11-proef en dubbel gebruik), leeftijdscontrole kind, PDF-overzicht, verzendpagina met voortgangsbalk, verwijderbevestiging, tussentijds opslaan (in de browser).

Niet: echte DigiD (de login accepteert alles), verzending naar de Belastingdienst, belastingberekening (die toont het echte formulier ook niet).

## Online zetten

De map kan als geheel op Vercel, Netlify of GitHub Pages; er is niets te bouwen. Zie `../github_upload.py`.
