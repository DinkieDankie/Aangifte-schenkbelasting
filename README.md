# Aangifte Schenkbelasting 2026 — werkende kopie + mock-ups

Een zelfstandig draaiende kopie van het formulier *Aangifte schenkbelasting 2026*
uit Mijn Belastingdienst, plus twee eerdere concept-mock-ups met verbetervoorstellen.

🌐 **Live:** [https://aangifte-schenkbelasting.vercel.app](https://aangifte-schenkbelasting.vercel.app)

---

## Inhoud

```
Aangifte-schenkbelasting/
│
├── index.html            ← de kopie van het BD-formulier (Vercel root)
├── css/stijl.css
├── js/vragen.js          ← ★ alle vragen, teksten en voorwaarden (hier aanpassen)
├── js/engine.js
├── KOPIE.md              ← handleiding voor het aanpassen van de kopie
│
└── mockups/
    ├── v1-conditionele-logica/aangifte-schenkbelasting-2026.html
    └── v2-scenario-kiezer/aangifte-schenkbelasting-2026-v2.html
```

## Versies

| Versie | Beschrijving | Link |
|--------|-------------|------|
| **Kopie** | 1-op-1 nabouw van het echte formulier, configuratie-gestuurd | [https://aangifte-schenkbelasting.vercel.app](https://aangifte-schenkbelasting.vercel.app) |
| **v1** | Wizard met skip-teller — toont hoeveel velden worden overgeslagen | [v1](https://aangifte-schenkbelasting.vercel.app/mockups/v1-conditionele-logica/aangifte-schenkbelasting-2026.html) |
| **v2** | Scenario-kiezer, BD-opmaak, live belastingberekening | [v2](https://aangifte-schenkbelasting.vercel.app/mockups/v2-scenario-kiezer/aangifte-schenkbelasting-2026-v2.html) |

Open `index.html?dev=1` om gereconstrueerde (niet letterlijk waargenomen) velden te markeren.

---
*Demonstratieomgeving — er wordt niets naar de Belastingdienst verstuurd.*
