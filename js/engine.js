/* ═══════════════════════════════════════════════════════════════════════════
   AANGIFTE SCHENKBELASTING 2026 — ENGINE
   ───────────────────────────────────────────────────────────────────────────
   Leest js/vragen.js en bouwt daar het complete formulier van.
   Normaal gesproken hoef je dit bestand NIET aan te passen.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const C = window.AANGIFTE_CONFIG;
  const OPSLAG = 'aangifte_schenkbelasting_' + C.jaar;
  const DEV = /[?&]dev=1/.test(location.search);
  const app = document.getElementById('app');

  /* ── helpers die ook aan de configuratie worden doorgegeven ─────────── */
  const cfg = Object.assign({}, C, {
    label(lijst, w) {
      const l = C.lijsten[lijst];
      if (!l) return w || '';
      const o = l.find(o => (typeof o === 'string' ? o : o.w) === w);
      return o ? (typeof o === 'string' ? o : o.l) : (w || '');
    },
    janee(v) { return v === 'ja' ? 'Ja' : v === 'nee' ? 'Nee' : ''; },
    naam(prefix) { const a = S.antwoorden; return [a[prefix + 'voorletters'], a[prefix + 'tussenvoegsel'], a[prefix + 'achternaam']].filter(Boolean).join(' '); }
  });

  /* de ingelogde persoon = wat in het blok "Uw gegevens" is ingevuld */
  function gebruiker() {
    const a = S.antwoorden;
    return { naam: (cfg.naam('u_') || 'Ingelogd').toUpperCase(), bsn: a.u_bsn || '', geboortedatum: a.u_geboortedatum || '' };
  }

  /* ── state ──────────────────────────────────────────────────────────── */
  function leeg() {
    return { ingelogd: false, pagina: 'login', antwoorden: {}, schenkingen: [{}],
             voltooid: {}, fouten: {}, bereikt: 0, verklaring: false,
             verzonden: null, kenmerk: null, popover: null, modal: null, menu: false, toast: null };
  }
  let S = leeg();
  try {
    const opgeslagen = JSON.parse(localStorage.getItem(OPSLAG));
    if (opgeslagen && opgeslagen.antwoorden) S = Object.assign(leeg(), opgeslagen, { popover: null, modal: null, menu: false, toast: null, fouten: {} });
  } catch (e) { /* geen opslag beschikbaar */ }

  function bewaar() {
    try { localStorage.setItem(OPSLAG, JSON.stringify(S)); } catch (e) { /* negeren */ }
  }

  const A = () => S.antwoorden;
  const variant = () => A().situatie || 'zelf';

  /* ── tekst-helpers ──────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function T(x, item) {
    if (x == null) return '';
    if (typeof x === 'function') return x(A(), item || {}, cfg);
    if (typeof x === 'object') return x[variant()] != null ? x[variant()] : (x.zelf || '');
    return x;
  }
  function zicht(v, item) { return !v.toon || !!v.toon(A(), item || {}, cfg); }
  function key(id, i) { return i == null ? id : 'schenkingen.' + i + '.' + id; }
  function lees(k) {
    const p = k.split('.');
    if (p[0] === 'schenkingen') return (S.schenkingen[+p[1]] || {})[p[2]];
    return S.antwoorden[k];
  }
  function schrijf(k, val) {
    const p = k.split('.');
    if (p[0] === 'schenkingen') { S.schenkingen[+p[1]] = S.schenkingen[+p[1]] || {}; S.schenkingen[+p[1]][p[2]] = val; }
    else S.antwoorden[k] = val;
    bewaar();
  }

  const WIZARD = C.paginas.filter(p => !p.verzendlayout);
  const paginaIdx = id => WIZARD.findIndex(p => p.id === id);
  const paginaDef = id => C.paginas.find(p => p.id === id);

  /* ── datum / bedrag / bsn ───────────────────────────────────────────── */
  function parseDatum(s) {
    const m = /^\s*(\d{1,2})-(\d{1,2})-(\d{4})\s*$/.exec(s || '');
    if (!m) return null;
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    return (d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1]) ? d : null;
  }
  const pad = n => (n < 10 ? '0' : '') + n;
  function fmtDatum(d) { return pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear(); }
  function datumLang(s) {
    const d = parseDatum(s); if (!d) return s || '';
    const M = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    return d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  }
  function parseBedrag(s) {
    if (s == null || s === '') return NaN;
    const t = String(s).replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
    return /^\d+(\.\d{1,2})?$/.test(t) ? parseFloat(t) : NaN;
  }
  function fmtBedrag(n) {
    if (isNaN(n)) return '';
    return n.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function bsnOk(s) {
    const d = String(s || '').replace(/\s/g, '');
    if (!/^\d{8,9}$/.test(d)) return false;
    const n = d.padStart(9, '0');
    let som = 0;
    for (let i = 0; i < 8; i++) som += (+n[i]) * (9 - i);
    som -= +n[8];
    return som % 11 === 0;
  }
  function dubbelBsn(k, val) {
    const v = String(val || '').replace(/\s/g, '');
    const andere = [];
    if (k !== 'u_bsn') andere.push(A().u_bsn);
    if (k !== 'kind_bsn' && A().situatie === 'kind') andere.push(A().kind_bsn);
    if (k !== 's_bsn') andere.push(A().s_bsn);
    return andere.some(x => x && String(x).replace(/\s/g, '') === v);
  }

  /* ── validatie ──────────────────────────────────────────────────────── */
  const INVOER = ['keuze', 'janee', 'tekst', 'bedrag', 'datum', 'postcode_plaats', 'checkboxgroep'];
  function valideerVeld(v, k, item) {
    const val = lees(k);
    const isLeeg = val == null || val === '' || (Array.isArray(val) && !val.length);
    const verplicht = v.verplicht !== false && v.type !== 'checkboxgroep';
    if (v.type === 'postcode_plaats') {
      const pl = lees(key(v.id2, item ? item.__i : null));
      if (verplicht && (isLeeg || !pl)) return C.fouten.verplicht(T(v.label, item));
      return null;
    }
    if (isLeeg) return verplicht ? C.fouten.verplicht(T(v.label, item)) : null;
    if (v.valideer === 'bsn' && !bsnOk(val)) return C.fouten.bsn;
    if (v.uniekBsn && dubbelBsn(k, val)) return C.fouten.bsnDubbel;
    if (v.type === 'datum') {
      const d = parseDatum(val);
      if (!d) return C.fouten.datum;
      if (v.minDatum && d < parseDatum(v.minDatum)) return v.foutMin || ('Vul een datum in die op of na ' + v.minDatum + ' ligt.');
      if (v.maxDatum && d > parseDatum(v.maxDatum)) return v.foutMax || ('Vul een datum in die op of voor ' + v.maxDatum + ' ligt.');
      if (v.inJaar && d.getFullYear() !== v.inJaar) return C.fouten.inJaar(v.inJaar);
    }
    if (v.type === 'bedrag' && isNaN(parseBedrag(val))) return C.fouten.bedrag;
    if (typeof v.valideer === 'function') return v.valideer(val, A(), item, cfg) || null;
    return null;
  }

  /* loopt alle zichtbare invoervelden van een pagina langs */
  function zichtbareVelden(p, fn) {
    p.velden.forEach(v => {
      if (!zicht(v)) return;
      if (v.type === 'herhaal') {
        S.schenkingen.forEach((item, i) => {
          item.__i = i;
          v.velden.forEach(sv => { if (zicht(sv, item) && INVOER.includes(sv.type)) fn(sv, key(sv.id, i), item, i); });
        });
        const laatste = S.schenkingen.length - 1;
        fn({ type: 'janee', id: 'nog_een', label: T(v.vraagMeer) }, key('nog_een', laatste), S.schenkingen[laatste], laatste);
      } else if (INVOER.includes(v.type)) fn(v, key(v.id), null, null);
    });
  }
  function valideerPagina(p) {
    const fouten = {};
    zichtbareVelden(p, (v, k, item) => { const f = valideerVeld(v, k, item); if (f) fouten[k] = f; });
    return fouten;
  }

  /* ── VELD-RENDERING ─────────────────────────────────────────────────── */
  let helpTeller = 0;
  function helpIcoon(v) {
    if (!v.help) return '';
    const id = 'h' + (helpTeller++);
    const open = S.popover === id;
    return '<span class="help-wrap"><button type="button" class="help-icoon" data-actie="help" data-id="' + id + '" aria-label="Toelichting">?</button>' +
      (open ? '<span class="popover">' + esc(v.help) + '</span>' : '') + '</span>';
  }
  function devTag(v) { return DEV && v.reconstructie ? ' dev-recon' : ''; }

  function rij(v, k, invoer, item, extraKlas) {
    const fout = S.fouten[k];
    return '<div class="rij' + (fout ? ' heeft-fout' : '') + (extraKlas || '') + devTag(v) + '">' +
      '<div class="rij-label"><label for="f_' + esc(k) + '">' + esc(T(v.label, item)) + '</label>' + helpIcoon(v) + '</div>' +
      '<div class="rij-invoer">' + invoer + '</div></div>' +
      (fout ? '<div class="melding fout"><span class="fout-icoon"></span><div>' + esc(fout) + '</div></div>' : '');
  }

  function opties(v) {
    let l = v.opties || C.lijsten[v.lijst] || [];
    l = l.map(o => typeof o === 'string' ? { w: o, l: o } : o);
    if (v.zonderNederland) l = l.filter(o => o.w !== 'Nederland');
    return l;
  }

  function renderVeld(v, item, i) {
    if (!zicht(v, item)) return '';
    const k = v.id ? key(v.id, i) : null;
    const fout = k ? S.fouten[k] : null;
    switch (v.type) {

      case 'alinea': return '<p class="alinea' + devTag(v) + '">' + T(v.html, item) + '</p>';
      case 'lijst':  return '<ul class="lijst">' + v.items.map(x => '<li>' + T(x, item) + '</li>').join('') + '</ul>';
      case 'kop':    return '<h3 class="kop' + devTag(v) + '">' + esc(T(v.tekst, item)) + helpIcoon(v) + '</h3>';
      case 'info':   return '<div class="melding info' + devTag(v) + '"><span class="info-icoon">i</span><div>' + T(v.html, item) + '</div></div>';
      case 'knop':   return '<div class="knop-rij"><button type="button" class="knop knop-secundair" data-actie="' + esc(v.actie) + '">' + esc(T(v.label)) + '</button></div>';

      case 'weergave':
        return '<div class="rij weergave"><div class="rij-label' + (v.cursief ? ' cursief' : '') + '">' + esc(T(v.label, item)) + '</div>' +
               '<div class="rij-waarde">' + esc(v.waarde(A(), item || {}, cfg) || '') + '</div></div>';

      case 'keuze': {
        let val = lees(k);
        if ((val == null || val === '') && v.standaard) { val = v.standaard; schrijf(k, val); }
        const os = opties(v);
        const html = '<div class="select-wrap"><select id="f_' + esc(k) + '" data-key="' + esc(k) + '" class="' + (fout ? 'fout' : '') + '">' +
          (val ? '' : '<option value="">Maak een keuze</option>') +
          os.map(o => '<option value="' + esc(o.w) + '"' + (o.w === val ? ' selected' : '') + '>' + esc(o.l) + '</option>').join('') +
          '</select></div>';
        return rij(v, k, html, item);
      }

      case 'janee': {
        const val = lees(k);
        const knop = (w, l) => '<button type="button" class="jn' + (val === w ? ' gekozen' : '') + '" data-jn="' + w + '" data-key="' + esc(k) + '"><span class="radio"></span>' + l + '</button>';
        return rij(v, k, '<div class="janee">' + knop('ja', 'Ja') + knop('nee', 'Nee') + '</div>', item, ' rij-janee');
      }

      case 'tekst': {
        const val = lees(k) || '';
        const html = '<input type="text" id="f_' + esc(k) + '" data-key="' + esc(k) + '" value="' + esc(val) + '" class="' + (fout ? 'fout ' : '') + (v.breedte === 'kort' ? 'kort' : '') + '" autocomplete="off">';
        return rij(v, k, html, item);
      }

      case 'bedrag': {
        const val = lees(k) || '';
        const html = '<div class="bedrag' + (fout ? ' fout' : '') + '"><span>€</span><input type="text" inputmode="decimal" id="f_' + esc(k) + '" data-key="' + esc(k) + '" data-bedrag="1" value="' + esc(val) + '" autocomplete="off"></div>';
        return rij(v, k, html, item);
      }

      case 'datum': {
        const val = lees(k) || '';
        const d = parseDatum(val);
        const iso = d ? d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) : '';
        const html = '<div class="datum' + (fout ? ' fout' : '') + '"><input type="text" id="f_' + esc(k) + '" data-key="' + esc(k) + '" data-datum="1" value="' + esc(val) + '" placeholder="dd-mm-jjjj" autocomplete="off">' +
          '<button type="button" class="kalender" data-actie="kalender" data-key="' + esc(k) + '" aria-label="Kies datum"></button>' +
          '<input type="date" class="datum-native" data-native="' + esc(k) + '" value="' + iso + '" tabindex="-1"></div>';
        return rij(v, k, html, item);
      }

      case 'checkboxgroep': {
        const val = lees(k) || [];
        return '<div class="checkgroep' + devTag(v) + '">' + opties(v).map(o =>
          '<label class="check"><input type="checkbox" data-key="' + esc(k) + '" data-w="' + esc(o.w) + '"' + (val.includes(o.w) ? ' checked' : '') + '><span class="box"></span>' + esc(o.l) + '</label>').join('') + '</div>';
      }

      case 'postcode_plaats': {
        const k2 = key(v.id2, i);
        const html = '<div class="postcode-plaats"><input type="text" id="f_' + esc(k) + '" data-key="' + esc(k) + '" value="' + esc(lees(k) || '') + '" class="' + (fout ? 'fout' : '') + '" autocomplete="off">' +
          '<input type="text" data-key="' + esc(k2) + '" value="' + esc(lees(k2) || '') + '" class="' + (fout ? 'fout' : '') + '" autocomplete="off"></div>';
        return rij(v, k, html, item);
      }

      case 'tabel': {
        const rijen = S.schenkingen;
        return '<table class="tabel"><thead><tr>' + v.kolommen.map(c => '<th>' + esc(c.kop) + '</th>').join('') + '</tr></thead><tbody>' +
          rijen.map(r => '<tr>' + v.kolommen.map(c => '<td>' + esc(c.waarde(r, cfg) || '') + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
      }

      case 'herhaal': {
        let html = '';
        S.schenkingen.forEach((item, idx) => {
          item.__i = idx;
          html += '<div class="blok"><div class="blok-kop"><span class="blok-titel"><span class="chevron"></span>' + esc(v.bloktitel(item, cfg)) + '</span>' +
            '<button type="button" class="link-knop" data-actie="verwijderItem" data-i="' + idx + '"><span class="prullenbak"></span>Verwijderen</button></div>' +
            v.velden.map(sv => renderVeld(sv, item, idx)).join('') + '</div>';
        });
        const laatste = S.schenkingen.length - 1;
        html += renderVeld({ type: 'janee', id: 'nog_een', label: T(v.vraagMeer) }, S.schenkingen[laatste], laatste);
        return html;
      }
    }
    return '';
  }

  /* ── LAY-OUT: header ────────────────────────────────────────────────── */
  const LOGO = '<div class="rijkslogo"><svg viewBox="0 0 50 100" width="50" height="100" aria-hidden="true">' +
    '<rect width="50" height="100" fill="#154273"/><path d="M18 0 H32 V22 H18 Z" fill="#fff"/><path d="M14 20 C11 26 11 34 14 40 L18 46 H32 L36 40 C39 34 39 26 36 20 Z" fill="#fff"/><ellipse cx="25" cy="62" rx="18" ry="13.5" fill="#F7D117"/><ellipse cx="6" cy="62" rx="2.6" ry="2" fill="#F7D117"/><ellipse cx="44" cy="62" rx="2.6" ry="2" fill="#F7D117"/><path d="M14 69.5 C19 73.5 31 73.5 36 69.5" stroke="#E5B800" stroke-width="1.4" fill="none" stroke-linecap="round"/><g fill="#fff" stroke="#154273" stroke-width="1.3" stroke-linejoin="round"><path d="M12 40 C10 44 10 51 12.5 56 A3.2 3.2 0 0 0 18.5 56 C19.5 51 19 44 17.5 40 Z"/><path d="M19.5 42 C18.5 47 19 54 20.5 59 A3.2 3.2 0 0 0 26.5 59 C27.5 54 27.5 47 26 42 Z"/><path d="M27.5 42 C26.5 47 27 54 28.5 59 A3.2 3.2 0 0 0 34.5 59 C35.5 54 35 47 33.5 42 Z"/><path d="M34.5 40 C33 44 33.5 51 35.5 56 A3.2 3.2 0 0 0 41.5 56 C43 51 42.5 44 40.5 40 Z"/></g><path d="M13 36 C5 40 3 50 9 56 A3.5 3.5 0 0 0 14 52 C11 48 12 43 16 40 Z" fill="#fff" stroke="#154273" stroke-width="1.3" stroke-linejoin="round"/><path d="M25 79 C29.5 85 29.5 89.5 25 91.5 C20.5 89.5 20.5 85 25 79 Z" fill="#F7D117"/><path d="M16 85 C19 89 19 92 16 93.5 C13 92 13 89 16 85 Z" fill="#F7D117"/><path d="M34 87 C37 91 37 94 34 95.5 C31 94 31 91 34 87 Z" fill="#F7D117"/>' +
    '</svg><span class="rijkslogo-naam">Demo</span></div>';

  function gebruikerMenu(icoon) {
    return '<div class="gebruiker"><button type="button" class="gebruiker-knop" data-actie="menu"><span class="' + icoon + '"></span>' + esc(gebruiker().naam) + '<span class="chevron-omlaag"></span></button>' +
      (S.menu ? '<div class="gebruiker-menu"><button type="button" data-actie="uitloggen">Uitloggen</button><button type="button" data-actie="herstel">Demo opnieuw beginnen (alles wissen)</button></div>' : '') + '</div>';
  }
  function headerWizard() {
    return '<header class="kop-wit">' + LOGO + '</header>' +
      '<div class="balk-blauw"><div class="balk-inner"><span class="balk-titel">Mijn Belastingdienst</span>' + gebruikerMenu('slot') + '</div></div>';
  }
  function headerVerzend(titel) {
    return '<header class="kop-wit">' + LOGO + '</header>' +
      '<div class="balk-wit"><div class="balk-inner"><span class="balk-titel-blauw">' + esc(titel) + '</span>' + gebruikerMenu('persoon') + '</div></div>';
  }

  /* ── LAY-OUT: wizard ────────────────────────────────────────────────── */
  function zijbalk(huidig) {
    const hIdx = paginaIdx(huidig);
    const items = C.paginas.map((p, i) => {
      const wIdx = paginaIdx(p.id);
      const voltooid = !!S.voltooid[p.id];
      const actief = p.id === huidig;
      const bereikbaar = wIdx >= 0 ? wIdx <= S.bereikt : false;
      const klas = 'nav-item' + (actief ? ' actief' : '') + (!bereikbaar && !actief ? ' toekomst' : '');
      const inner = esc(p.nav) + (voltooid && !actief ? '<span class="vink"></span>' : '');
      return bereikbaar && !actief && wIdx >= 0
        ? '<button type="button" class="' + klas + '" data-actie="nav" data-pagina="' + p.id + '">' + inner + '</button>'
        : '<div class="' + klas + '">' + inner + '</div>';
    }).join('');
    return '<aside class="zijbalk"><div class="kaart"><div class="zijbalk-titel">Aangifte schenkbelasting ' + C.jaar + '</div><nav class="nav">' + items + '</nav></div>' +
      '<div class="kaart zijbalk-menu">' +
      '<button type="button" class="link-knop" data-actie="helpVenster"><span class="ico-help"></span>Help</button>' +
      '<button type="button" class="link-knop" data-actie="afdrukken"><span class="ico-print"></span>Afdrukken</button>' +
      '<button type="button" class="link-knop" data-actie="opslaan"><span class="ico-opslaan"></span>Opslaan</button>' +
      '<button type="button" class="link-knop" data-actie="afsluiten"><span class="ico-sluiten"></span>Afsluiten</button>' +
      '<div class="sessie">' + esc(C.sessiecode) + '</div></div></aside>';
  }

  function wizardPagina(p) {
    helpTeller = 0;
    const idx = paginaIdx(p.id);
    const volgende = p.knopVolgende || 'Akkoord';
    const toonVorige = p.knopVorige !== null && idx > 0;
    const inhoud = p.velden.map(v => renderVeld(v, null, null)).join('');
    return headerWizard() + '<div class="pagina">' + zijbalk(p.id) +
      '<main class="inhoud"><div class="kaart"><h1>' + esc(T(p.titel)) + '</h1>' + inhoud +
      '<div class="knoppen">' + (toonVorige ? '<button type="button" class="knop knop-secundair" data-actie="vorige"><span class="pijl-links"></span>Vorige</button>' : '') +
      '<button type="button" class="knop knop-primair" data-actie="akkoord"><span class="vinkje"></span>' + esc(volgende) + '</button></div>' +
      '</div></main></div>';
  }

  /* ── LAY-OUT: verzenden / bevestiging ───────────────────────────────── */
  function voortgang(stap) {
    return '<div class="voortgang">' + C.verzenden.stappen.map((s, i) => {
      const st = i < stap ? 'klaar' : i === stap ? 'huidig' : 'later';
      return (i ? '<div class="vg-lijn ' + (i <= stap ? 'klaar' : '') + '"></div>' : '') +
        '<div class="vg-stap ' + st + '"><div class="vg-bol">' + (st === 'huidig' ? '<span class="pijl-rechts"></span>' : '<span class="vinkje"></span>') + '</div><div class="vg-tekst">' + esc(s) + '</div></div>';
    }).join('') + '</div>';
  }
  function verzendPagina() {
    const g = gebruiker();
    return headerVerzend(C.verzenden.kop) + '<div class="verzend-pagina">' + voortgang(1) +
      '<h1 class="verzend-titel">' + esc(C.verzenden.titel) + '</h1>' +
      '<div class="verzend-grid"><div class="kaart verzend-links">' +
      '<button type="button" class="link-knop" data-actie="wijzigen"><span class="pijl-links"></span>Aangifte wijzigen</button>' +
      '<button type="button" class="link-knop" data-actie="helpVenster"><span class="ico-help"></span>Help</button>' +
      '<button type="button" class="link-knop" data-actie="afsluiten"><span class="ico-sluiten"></span>Afsluiten aangifte</button></div>' +
      '<div class="kaart verzend-rechts"><div class="verzend-persoon"><span class="persoon"></span>' + esc(g.naam) + ', ' + esc(g.geboortedatum) + ', BSN ' + esc(g.bsn) + '</div>' +
      '<label class="check verklaring"><input type="checkbox" data-actie="verklaring"' + (S.verklaring ? ' checked' : '') + '><span class="box"></span>' + esc(C.verzenden.verklaring(g.naam)) + '</label>' +
      (S.fouten.verklaring ? '<div class="melding fout"><span class="fout-icoon"></span><div>' + esc(S.fouten.verklaring) + '</div></div>' : '') +
      '</div></div><div class="knoppen verzend-knoppen"><button type="button" class="knop knop-primair" data-actie="verzenden">' + esc(C.verzenden.knop) + '<span class="pijl-rechts wit"></span></button></div></div>';
  }
  function bevestigingPagina() {
    return headerVerzend(C.verzenden.kop) + '<div class="verzend-pagina">' + voortgang(2) +
      '<h1 class="verzend-titel">' + esc(C.bevestiging.titel) + '</h1>' +
      '<div class="verzend-grid"><div class="kaart verzend-links">' +
      '<button type="button" class="link-knop" data-actie="afdrukken"><span class="ico-print"></span>Afdrukken</button>' +
      '<button type="button" class="link-knop" data-actie="downloadJson"><span class="ico-opslaan"></span>Download gegevens (JSON)</button>' +
      '<button type="button" class="link-knop" data-actie="naarMbd"><span class="ico-sluiten"></span>Afsluiten</button></div>' +
      '<div class="kaart verzend-rechts bevestiging' + (DEV && C.bevestiging.reconstructie ? ' dev-recon' : '') + '">' + C.bevestiging.html(S.kenmerk, S.verzonden) + '</div></div></div>';
  }

  /* ── LAY-OUT: Mijn Belastingdienst / login / verwijderen ────────────── */
  function schenkerNaam() {
    const a = A();
    return a.instelling === 'ja' ? (a.s_naam_instelling || '') : [a.s_voorletters, a.s_tussenvoegsel, a.s_achternaam].filter(Boolean).join(' ');
  }
  function aangifteOmschrijving() {
    const n = schenkerNaam(), d = (S.schenkingen[0] || {}).datum;
    return 'schenking' + (n ? ' van ' + n : '') + (d ? ' op ' + datumLang(d) : '');
  }
  function heeftConcept() { return Object.keys(A()).length > 0; }

  function loginPagina() {
    return '<header class="kop-wit">' + LOGO + '</header><div class="balk-blauw"><div class="balk-inner"><span class="balk-titel">Mijn Belastingdienst</span></div></div>' +
      '<div class="login-pagina"><div class="kaart login-kaart"><h1>Inloggen op Mijn Belastingdienst</h1>' +
      '<p>Log in met DigiD om uw aangifte schenkbelasting ' + C.jaar + ' te doen.</p>' +
      '<div class="digid-blok"><div class="digid-logo">Digi<span>D</span></div>' +
      '<div class="rij"><div class="rij-label"><label for="digid_naam">Gebruikersnaam</label></div><div class="rij-invoer"><input type="text" id="digid_naam" autocomplete="off"></div></div>' +
      '<div class="rij"><div class="rij-label"><label for="digid_ww">Wachtwoord</label></div><div class="rij-invoer"><input type="password" id="digid_ww" autocomplete="off"></div></div>' +
      '<div class="knoppen"><button type="button" class="knop knop-primair" data-actie="login">Inloggen<span class="pijl-rechts wit"></span></button></div></div>' +
      '<p class="klein">Dit is een demonstratieomgeving. Er wordt niets naar de Belastingdienst verstuurd.</p></div></div>';
  }

  function mbdPagina() {
    let inhoud;
    if (S.verzonden) {
      inhoud = '<div class="mbd-rij"><div><strong>Aangifte schenkbelasting ' + C.jaar + '</strong><br><span class="grijs">' + esc(aangifteOmschrijving()) + ' — verzonden op ' + esc(S.verzonden) + '</span></div>' +
        '<div class="mbd-acties"><button type="button" class="link-knop" data-actie="naarBevestiging">Ontvangstbevestiging</button><button type="button" class="link-knop" data-actie="verwijderen"><span class="prullenbak"></span>Verwijderen</button></div></div>';
    } else if (heeftConcept()) {
      inhoud = '<div class="mbd-rij"><div><strong>Aangifte schenkbelasting ' + C.jaar + '</strong><br><span class="grijs">' + esc(aangifteOmschrijving()) + ' — nog niet verzonden</span></div>' +
        '<div class="mbd-acties"><button type="button" class="knop knop-primair" data-actie="verder">Verder met aangifte<span class="pijl-rechts wit"></span></button><button type="button" class="link-knop" data-actie="verwijderen"><span class="prullenbak"></span>Verwijderen</button></div></div>';
    } else {
      inhoud = '<p>U hebt nog geen aangifte schenkbelasting ' + C.jaar + ' klaarstaan.</p><div class="knoppen"><button type="button" class="knop knop-primair" data-actie="starten">Aangifte schenkbelasting ' + C.jaar + ' starten<span class="pijl-rechts wit"></span></button></div>';
    }
    return headerWizard() + '<div class="login-pagina"><div class="kaart login-kaart"><h1>Schenkbelasting</h1>' + inhoud + '</div></div>';
  }

  function verwijderPagina() {
    return headerVerzend('Verwijderen') + '<div class="verzend-pagina"><h1 class="verwijder-titel">Verwijderen aangifte schenkbelasting ' + C.jaar + '<br>' + esc(aangifteOmschrijving()) + '</h1>' +
      '<div class="verwijder-kaart"><div class="kaart">Weet u zeker dat u dit formulier wilt verwijderen?</div>' +
      '<div class="kaart knoppen"><button type="button" class="knop knop-secundair" data-actie="verwijderNee">Nee</button><button type="button" class="knop knop-primair" data-actie="verwijderJa">Ja</button></div></div></div>';
  }

  /* ── PDF-weergave ("Bekijk uw ingevulde gegevens") ──────────────────── */
  function waardeTekst(v, k, item) {
    const val = lees(k);
    switch (v.type) {
      case 'janee': return cfg.janee(val);
      case 'keuze': return opties(v).filter(o => o.w === val).map(o => o.l)[0] || '';
      case 'bedrag': { const n = parseBedrag(val); return isNaN(n) ? '' : '€ ' + fmtBedrag(n); }
      case 'checkboxgroep': return opties(v).filter(o => (val || []).includes(o.w)).map(o => o.l).join(', ');
      case 'postcode_plaats': return [val, lees(key(v.id2, item ? item.__i : null))].filter(Boolean).join(' ');
      case 'weergave': return v.waarde(A(), item || {}, cfg) || '';
      default: return val == null ? '' : String(val);
    }
  }
  function pdfHtml() {
    let h = '';
    const rijHtml = (l, w) => '<div class="pdf-rij"><div>' + esc(l) + '</div><div>' + esc(w) + '</div></div>';
    const sectie = (p, body) => '<section><h1>' + esc(T(p.titel)) + '</h1><h2>' + esc(p.nav) + '</h2>' + body + '</section>';

    WIZARD.filter(p => !p.overzicht).forEach(p => {
      let body = '';
      p.velden.forEach(v => {
        if (!zicht(v)) return;
        if (v.type === 'kop') body += '<h4>' + esc(T(v.tekst)) + '</h4>';
        else if (v.type === 'weergave' || INVOER.includes(v.type)) {
          if (v.type === 'checkboxgroep') opties(v).forEach(o => { body += rijHtml(o.l, (lees(key(v.id)) || []).includes(o.w) ? 'Ja' : 'Nee'); });
          else body += rijHtml(T(v.label), waardeTekst(v, v.id ? key(v.id) : '', null));
        } else if (v.type === 'herhaal') {
          S.schenkingen.forEach((item, i) => {
            item.__i = i;
            body += '<h4>' + esc(v.bloktitel(item, cfg)) + '</h4>';
            v.velden.forEach(sv => {
              if (!zicht(sv, item)) return;
              if (sv.type === 'kop') body += '<h2 class="pdf-sub">' + esc(T(sv.tekst, item)) + '</h2>';
              else if (INVOER.includes(sv.type)) body += rijHtml(T(sv.label, item), waardeTekst(sv, key(sv.id, i), item));
            });
          });
        }
      });
      h += sectie(p, body);
    });
    return h;
  }

  /* ── gestructureerde export (basis voor latere GSP/XBRL-mapping) ──── */
  function isoDatum(s) { const d = parseDatum(s); return d ? d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) : null; }
  function getal(s) { const n = parseBedrag(s); return isNaN(n) ? null : n; }
  function persoon(prefix) {
    const a = A();
    return { voorletters: a[prefix + 'voorletters'] || null, tussenvoegsel: a[prefix + 'tussenvoegsel'] || null, achternaam: a[prefix + 'achternaam'] || null,
             bsn: a[prefix + 'bsn'] || null, geboortedatum: isoDatum(a[prefix + 'geboortedatum']) };
  }
  function exportData() {
    const a = A();
    const jn = v => v === 'ja' ? true : v === 'nee' ? false : null;
    return {
      bericht: { soort: 'AangifteSchenkbelasting', belastingjaar: C.jaar, versie: 1, aangemaakt: new Date().toISOString(),
                 verzonden: S.verzonden || null, kenmerk: S.kenmerk || null },
      situatie: a.situatie || null,
      aangever: persoon('u_'),
      minderjarigKind: a.situatie === 'kind' ? persoon('kind_') : null,
      anderAdres: jn(a.ander_adres),
      correspondentie: a.ander_adres === 'ja' ? {
        naarInstelling: jn(a.corr_instelling),
        instelling: a.corr_instelling === 'ja' ? { naam: a.corr_naam_instelling || null, rsin: a.corr_rsin || null, beconnummer: a.corr_consulent || null, protocolnummerNotaris: a.corr_notaris || null } : null,
        adres: { land: a.corr_land || null, straat: a.corr_straat || null, huisnummer: a.corr_huisnummer || null, toevoeging: a.corr_toevoeging || null, postcode: a.corr_postcode || null, plaats: a.corr_plaats || null }
      } : null,
      contactvoorkeur: { email: (a.contact || []).includes('email') ? (a.contact_email || true) : false, telefoon: (a.contact || []).includes('telefoon') ? (a.contact_telefoon || true) : false },
      schenker: {
        isInstelling: jn(a.instelling),
        persoon: a.instelling === 'nee' ? Object.assign(persoon('s_'), { relatie: a.relatie || null }) : null,
        instelling: a.instelling === 'ja' ? { naam: a.s_naam_instelling || null, rsin: a.s_rsin || null, land: a.s_land || null } : null,
        eerderSchenkingOntvangen: jn(a.eerder),
        eerderAangifteGedaan: a.eerder === 'ja' ? jn(a.eerder_aangifte) : null
      },
      schenkingen: S.schenkingen.map(s => ({
        soort: s.soort || null, datum: isoDatum(s.datum), bedrag: getal(s.bedrag),
        adres: s.adres || null, omschrijving: s.omschrijving || null, looptijdJaren: s.looptijd ? +s.looptijd : null,
        bedrijfsopvolgingsregeling: jn(s.bor), notarieleAkte: jn(s.notarieel),
        uitAPV: jn(s.apv), herroepbaar: jn(s.herroepbaar),
        buitenlandseBelasting: s.buitenland === 'ja' ? { bedrag: getal(s.buitenland_bedrag), land: s.buitenland_land || null } : null,
        betaler: s.betaler || null,
        vrijstellingen: { verhoogdOfBijzonderGewenst: jn(s.vrij_gebruik), dureStudieNotarieel: jn(s.vrij_studie), eenmaligVerhoogd: jn(s.vrij_verhoogd),
                          bijzonder: jn(s.vrij_bijzonder), bijzonderSoort: s.vrij_bijzonder_soort || null }
      })),
      bijzondereSituaties: a.bijzonder || []
    };
  }
  function downloadJson() {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a'); el.href = url; el.download = 'aangifte-schenkbelasting-' + C.jaar + '.json';
    document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  window.AANGIFTE_EXPORT = exportData;

  /* ── modals / toast ─────────────────────────────────────────────────── */
  function modalHtml() {
    if (!S.modal) return '';
    if (S.modal === 'help') return '<div class="modal-achtergrond" data-actie="sluitModal"><div class="modal" role="dialog"><button type="button" class="modal-sluit" data-actie="sluitModal" aria-label="Sluiten">×</button>' + C.helpTekst + '</div></div>';
    if (S.modal === 'pdf') return '<div class="modal-achtergrond" data-actie="sluitModal"><div class="modal pdf" role="dialog"><div class="modal-balk"><span>Uw ingevulde gegevens</span><span><button type="button" class="knop knop-secundair" data-actie="afdrukken">Afdrukken</button> <button type="button" class="knop knop-primair" data-actie="sluitModal">Sluiten</button></span></div><div class="pdf-pagina" id="pdf">' + pdfHtml() + '</div></div></div>';
    return '';
  }
  function toastHtml() { return S.toast ? '<div class="toast">' + esc(S.toast) + '</div>' : ''; }

  /* ── RENDER ─────────────────────────────────────────────────────────── */
  function render() {
    const act = document.activeElement;
    const actKey = act && act.dataset ? act.dataset.key : null;
    const pos = act && typeof act.selectionStart === 'number' ? act.selectionStart : null;

    let html;
    if (!S.ingelogd || S.pagina === 'login') html = loginPagina();
    else if (S.pagina === 'mbd') html = mbdPagina();
    else if (S.pagina === 'verwijderen') html = verwijderPagina();
    else if (S.pagina === 'verzenden') html = verzendPagina();
    else if (S.pagina === 'bevestiging') html = bevestigingPagina();
    else html = wizardPagina(paginaDef(S.pagina) || WIZARD[0]);

    document.body.className = (DEV ? 'dev ' : '') + (S.modal ? 'modal-open ' : '');
    app.innerHTML = html + modalHtml() + toastHtml();

    if (actKey) focusKey(actKey, pos);
  }
  function focusKey(k, pos) {
    const el = app.querySelector('input[data-key="' + CSS.escape(k) + '"], select[data-key="' + CSS.escape(k) + '"], button[data-key="' + CSS.escape(k) + '"]');
    if (!el) return;
    el.focus({ preventScroll: true });
    if (pos != null && typeof el.setSelectionRange === 'function') { try { el.setSelectionRange(pos, pos); } catch (e) { /* type mismatch */ } }
  }
  function naarEersteFout() {
    const el = app.querySelector('.heeft-fout, .melding.fout');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function toon(msg) {
    S.toast = msg; render();
    setTimeout(() => { S.toast = null; render(); }, 2500);
  }

  /* ── NAVIGATIE ──────────────────────────────────────────────────────── */
  function naar(id) {
    S.pagina = id; S.fouten = {}; S.popover = null; S.menu = false;
    const i = paginaIdx(id); if (i > S.bereikt) S.bereikt = i;
    bewaar(); render(); window.scrollTo(0, 0);
  }
  function akkoord() {
    const p = paginaDef(S.pagina);
    const fouten = p.overzicht ? {} : valideerPagina(p);
    if (Object.keys(fouten).length) { S.fouten = fouten; render(); naarEersteFout(); return; }
    S.voltooid[p.id] = true;
    const i = paginaIdx(p.id);
    if (i + 1 < WIZARD.length) naar(WIZARD[i + 1].id); else naar('verzenden');
  }
  function vorige() {
    const i = paginaIdx(S.pagina);
    if (i > 0) naar(WIZARD[i - 1].id);
  }
  function laatsteBereikt() { return WIZARD[Math.min(S.bereikt, WIZARD.length - 1)].id; }

  /* ── EVENTS ─────────────────────────────────────────────────────────── */
  app.addEventListener('click', e => {
    const t = e.target.closest('[data-actie], [data-jn]');
    if (!t) {
      if (S.popover || S.menu) { S.popover = null; S.menu = false; render(); }
      return;
    }
    if (t.dataset.jn) {
      const k = t.dataset.key; schrijf(k, t.dataset.jn); delete S.fouten[k];
      if (/\.nog_een$/.test(k) && t.dataset.jn === 'ja') { S.schenkingen.push({}); bewaar(); }
      render(); return;
    }
    const a = t.dataset.actie;
    switch (a) {
      case 'akkoord':      akkoord(); break;
      case 'vorige':       vorige(); break;
      case 'nav':          naar(t.dataset.pagina); break;
      case 'help':         S.popover = S.popover === t.dataset.id ? null : t.dataset.id; render(); break;
      case 'helpVenster':  S.modal = 'help'; render(); break;
      case 'toonPdf':      S.modal = 'pdf'; render(); break;
      case 'downloadJson': downloadJson(); break;
      case 'sluitModal':   if (e.target === t || t.classList.contains('modal-sluit') || t.tagName === 'BUTTON') { S.modal = null; render(); } break;
      case 'afdrukken':    window.print(); break;
      case 'opslaan':      bewaar(); toon('Uw gegevens zijn opgeslagen.'); break;
      case 'afsluiten':    bewaar(); naar('mbd'); break;
      case 'naarMbd':      naar('mbd'); break;
      case 'menu':         S.menu = !S.menu; render(); break;
      case 'uitloggen':    S.ingelogd = false; S.menu = false; S.pagina = 'login'; bewaar(); render(); break;
      case 'herstel':      S = leeg(); bewaar(); render(); break;
      case 'login':        S.ingelogd = true; naar('mbd'); break;
      case 'starten':      naar(WIZARD[0].id); break;
      case 'verder':       naar(laatsteBereikt()); break;
      case 'verwijderen':  naar('verwijderen'); break;
      case 'verwijderNee': naar('mbd'); break;
      case 'verwijderJa':  { const ingelogd = S.ingelogd; S = leeg(); S.ingelogd = ingelogd; naar('mbd'); break; }
      case 'wijzigen':     naar('overzicht'); break;
      case 'naarBevestiging': naar('bevestiging'); break;
      case 'verzenden':
        if (!S.verklaring) { S.fouten.verklaring = C.verzenden.foutVerklaring; render(); break; }
        S.verzonden = fmtDatum(new Date()) + ' ' + pad(new Date().getHours()) + ':' + pad(new Date().getMinutes());
        S.kenmerk = 'SB' + C.jaar + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        S.voltooid.verzenden = true; naar('bevestiging'); break;
      case 'verwijderItem': {
        const i = +t.dataset.i;
        if (S.schenkingen.length > 1) S.schenkingen.splice(i, 1); else S.schenkingen = [{}];
        S.schenkingen.forEach(s => { delete s.__i; });
        const l = S.schenkingen[S.schenkingen.length - 1]; if (l.nog_een === 'ja') delete l.nog_een;
        S.fouten = {}; bewaar(); render(); break;
      }
      case 'kalender': {
        const n = app.querySelector('input[data-native="' + CSS.escape(t.dataset.key) + '"]');
        if (n) { if (typeof n.showPicker === 'function') { try { n.showPicker(); } catch (err) { n.focus(); } } else n.focus(); }
        break;
      }
    }
  });

  app.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset && el.dataset.key && el.tagName === 'INPUT' && el.type !== 'checkbox') schrijf(el.dataset.key, el.value);
  });

  app.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.actie === 'verklaring') { S.verklaring = el.checked; delete S.fouten.verklaring; bewaar(); render(); return; }
    if (el.dataset.native) {
      const k = el.dataset.native;
      if (el.value) { const [y, m, d] = el.value.split('-'); schrijf(k, d + '-' + m + '-' + y); delete S.fouten[k]; render(); }
      return;
    }
    if (!el.dataset.key) return;
    if (el.tagName === 'SELECT') { schrijf(el.dataset.key, el.value); delete S.fouten[el.dataset.key]; render(); }
    else if (el.type === 'checkbox') {
      const k = el.dataset.key, cur = (lees(k) || []).slice(), w = el.dataset.w;
      const idx = cur.indexOf(w); if (el.checked && idx < 0) cur.push(w); if (!el.checked && idx >= 0) cur.splice(idx, 1);
      schrijf(k, cur); render();
    }
  });

  app.addEventListener('focusout', e => {
    const el = e.target;
    if (!el.dataset || !el.dataset.key || el.tagName !== 'INPUT' || el.type === 'checkbox') return;
    const k = el.dataset.key;
    if (el.dataset.bedrag) { const n = parseBedrag(el.value); if (!isNaN(n)) schrijf(k, fmtBedrag(n)); }
    if (el.dataset.datum) { const d = parseDatum(el.value); if (d) schrijf(k, fmtDatum(d)); }
    /* veld-validatie na verlaten (zoals het echte formulier) */
    const p = paginaDef(S.pagina);
    if (p && p.velden) {
      let gevonden = null;
      zichtbareVelden(p, (v, vk, item) => { if (vk === k) gevonden = { v, item }; });
      if (gevonden) {
        const f = valideerVeld(gevonden.v, k, gevonden.item);
        const leegVeld = !lees(k);
        if (f && !leegVeld) S.fouten[k] = f; else delete S.fouten[k];
      }
    }
    const volgende = e.relatedTarget && e.relatedTarget.dataset ? e.relatedTarget.dataset.key : null;
    render();
    if (volgende) focusKey(volgende, null);
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (S.modal || S.popover || S.menu)) { S.modal = null; S.popover = null; S.menu = false; render(); } });

  /* voorkom dat state-kopie in JSON `__i` meeneemt als functie */
  render();
})();
