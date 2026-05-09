/**
 * Bortone Antincendio - JS sito principale.
 * Gestisce: menu mobile, form contatti, popup area clienti, preventivo, tab prodotti, legenda.
 * Tutti i moduli sono "self-guarding": escono in modo sicuro se gli elementi non esistono nella pagina corrente.
 */
(function () {
  "use strict";

  // ──────────────────────────────────────────────────────────
  // Utility
  // ──────────────────────────────────────────────────────────
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  /**
   * Invia un form via fetch (Formspree) gestendo honeypot, stati e fallback.
   * @param {Object} cfg
   * @param {HTMLFormElement} cfg.form
   * @param {HTMLElement} cfg.statusEl
   * @param {HTMLButtonElement} [cfg.submitBtn]
   * @param {string} [cfg.successMsg]
   * @param {Function} [cfg.preValidate]  Ritorna stringa errore o null.
   * @param {Function} [cfg.onSuccess]    Callback dopo successo.
   * @param {string}   [cfg.statusBaseClass]  Classe base sullo statusEl.
   */
  function attachFormspreeSubmit(cfg) {
    var form = cfg.form;
    var statusEl = cfg.statusEl;
    var submitBtn = cfg.submitBtn || null;
    var successMsg = cfg.successMsg || "Grazie! La tua richiesta è stata inviata.";
    var baseCls = cfg.statusBaseClass || "";

    function setStatus(text, kind) {
      if (!statusEl) return;
      statusEl.textContent = text;
      if (baseCls) {
        statusEl.className = baseCls + (kind ? " " + kind : "");
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        setStatus("Invio non riuscito. Riprova o scrivici via email.", "error");
        return;
      }

      if (typeof cfg.preValidate === "function") {
        var err = cfg.preValidate(form);
        if (err) { setStatus(err, "error"); return; }
      }

      if (!window.fetch || !window.FormData) {
        setStatus("Browser non supportato. Contattaci via email o telefono.", "error");
        return;
      }

      setStatus("Invio in corso...", "");
      if (submitBtn) submitBtn.disabled = true;

      var fd = new FormData(form);
      fd.delete("website");

      fetch(form.action, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            setStatus(successMsg, "success");
            form.reset();
            if (typeof cfg.onSuccess === "function") cfg.onSuccess();
            return;
          }
          return res.json().then(function (data) {
            setStatus((data && data.error) || "Invio non riuscito. Riprova o scrivici via email.", "error");
          }).catch(function () {
            setStatus("Invio non riuscito. Riprova o scrivici via email.", "error");
          });
        })
        .catch(function () {
          setStatus("Errore di connessione. Riprova tra poco.", "error");
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  // ──────────────────────────────────────────────────────────
  // Menu mobile
  // ──────────────────────────────────────────────────────────
  function initMobileMenu() {
    var navToggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!navToggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
    function toggleMenu() {
      var isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    navToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) closeMenu();
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  // ──────────────────────────────────────────────────────────
  // Form contatti
  // ──────────────────────────────────────────────────────────
  function initContactForm() {
    var form = $("#contact-form");
    var statusEl = $("#form-status");
    if (!form || !statusEl) return;

    attachFormspreeSubmit({
      form: form,
      statusEl: statusEl,
      submitBtn: $("#contact-submit"),
      successMsg: "Grazie! La tua richiesta è stata inviata.",
      statusBaseClass: "form-hint"
    });
  }

  // ──────────────────────────────────────────────────────────
  // Popup Area Clienti
  // ──────────────────────────────────────────────────────────
  function initAccessPopup() {
    var openBtn = $("#open-access-popup");
    var overlay = $("#access-popup-overlay");
    if (!openBtn || !overlay) return;

    var closeBtn = $("#close-access-popup");
    var popupForm = $("#access-popup-form");
    var popupStatus = $("#access-popup-status");
    var popupSubmitBtn = $("#access-popup-submit-btn");
    var nomeInput = $("#access-popup-nome");
    var menuItems = $$(".access-popup-menu-item", overlay);
    var modalEl = $(".access-popup-modal", overlay);

    function getFocusables() {
      if (!modalEl) return [];
      var sel = "button:not([disabled]), [href], input:not([disabled]), select, textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
      return $$(sel, modalEl);
    }

    function openPopup() {
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      requestAnimationFrame(function () {
        overlay.classList.add("active");
        if (closeBtn) closeBtn.focus();
      });
      document.body.style.overflow = "hidden";
      menuItems.forEach(function (i, idx) {
        i.classList.toggle("active", idx === 0);
        i.setAttribute("aria-selected", idx === 0 ? "true" : "false");
      });
      if (nomeInput) nomeInput.placeholder = "Nome azienda / Nome e cognome";
    }

    function closePopup() {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      if (openBtn) openBtn.focus();
      setTimeout(function () {
        overlay.hidden = true;
        document.body.style.overflow = "";
      }, 180);
    }

    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openPopup();
    });
    if (closeBtn) closeBtn.addEventListener("click", closePopup);

    menuItems.forEach(function (item) {
      item.addEventListener("click", function () {
        menuItems.forEach(function (i) {
          i.classList.remove("active");
          i.setAttribute("aria-selected", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");
        var t = this.getAttribute("data-type");
        if (nomeInput) nomeInput.placeholder = t === "admin" ? "Nome e cognome" : "Nome azienda / Nome e cognome";
      });
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closePopup();
    });

    document.addEventListener("keydown", function (e) {
      if (overlay.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
        return;
      }
      if (e.key !== "Tab") return;
      var focusables = getFocusables();
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else if (document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    if (popupForm && popupStatus) {
      attachFormspreeSubmit({
        form: popupForm,
        statusEl: popupStatus,
        submitBtn: popupSubmitBtn,
        successMsg: "Grazie! La tua richiesta è stata inviata.",
        statusBaseClass: "form-hint"
      });
    }
  }

  // ──────────────────────────────────────────────────────────
  // Preventivo Calculator
  // ──────────────────────────────────────────────────────────
  function initPreventivo() {
    var prevForm = $("#preventivo-form");
    if (!prevForm) return;

    var PREZZO = { polvere: 75, co2: 100, schiuma: 125, controllo: 25, kit_registro: 70, registro: 30, gancio: 15, piedistallo: 50 };
    var SCONTO = 0.10;
    var IVA = 0.22;

    var risultato = $("#preventivo-risultato");
    var vociEl = $("#prev-voci");
    var statusEl = $("#preventivo-status");
    var submitBtn = $("#preventivo-submit");

    function formatEur(n) {
      return "€" + n.toFixed(2).replace(".", ",");
    }
    function intVal(id) {
      var el = document.getElementById(id);
      if (!el) return 0;
      var v = parseInt(el.value, 10);
      return isNaN(v) || v < 0 ? 0 : v;
    }
    function setText(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    function calcolaPreventivo(changedId) {
      var mq = intVal("prev-mq");
      var quadri = intVal("prev-quadri");
      var cucine = intVal("prev-cucine");
      var tipoEl = $("#prev-tipo");
      var tipoSel = tipoEl ? tipoEl.value : "";

      if (mq <= 0) {
        if (risultato) risultato.hidden = true;
        return null;
      }

      var nPolvere = Math.max(1, Math.ceil(mq / 90));
      var nCo2 = quadri;
      var nSchiuma = cucine;
      var nTotEstintori = nPolvere + nCo2 + nSchiuma;
      var isCondominio = tipoSel === "condominio";

      var voci = [];
      voci.push({ nome: "Estintore a Polvere", desc: "Copertura generale (" + mq + " m²)", qty: nPolvere, prezzo: PREZZO.polvere });
      if (nCo2 > 0) voci.push({ nome: "Estintore CO2", desc: "Protezione quadri elettrici", qty: nCo2, prezzo: PREZZO.co2 });
      if (nSchiuma > 0) voci.push({ nome: "Estintore a Schiuma 6L", desc: "Protezione cucine", qty: nSchiuma, prezzo: PREZZO.schiuma });

      var ganciInput = $("#pv-q1");
      var piedistalliInput = $("#pv-q2");
      var nGanci = intVal("pv-q1");
      var nPiedistalli = intVal("pv-q2");

      if (nGanci > nTotEstintori) nGanci = nTotEstintori;
      if (nPiedistalli > nTotEstintori) nPiedistalli = nTotEstintori;
      if (nGanci + nPiedistalli > nTotEstintori) {
        if (changedId === "pv-q2") nPiedistalli = Math.max(0, nTotEstintori - nGanci);
        else nGanci = Math.max(0, nTotEstintori - nPiedistalli);
      }
      if (ganciInput) { ganciInput.max = String(nTotEstintori); ganciInput.value = String(nGanci); }
      if (piedistalliInput) { piedistalliInput.max = String(nTotEstintori); piedistalliInput.value = String(nPiedistalli); }

      if (nGanci > 0) voci.push({ nome: "Gancio + Cartello", desc: "Supporto a parete", qty: nGanci, prezzo: PREZZO.gancio });
      if (nPiedistalli > 0) voci.push({ nome: "Piedistallo", desc: "Supporto a terra", qty: nPiedistalli, prezzo: PREZZO.piedistallo });

      if (isCondominio) {
        voci.push({ nome: "Kit Registro Antincendio", desc: "Obbligatorio per condomini", qty: 1, prezzo: PREZZO.kit_registro });
      } else {
        voci.push({ nome: "Registro Antincendio", desc: "Documentazione obbligatoria", qty: 1, prezzo: PREZZO.registro });
      }

      var html = "";
      var subtotale = 0;
      for (var i = 0; i < voci.length; i++) {
        var v = voci[i];
        var lineTotal = v.qty * v.prezzo;
        subtotale += lineTotal;
        html += '<div class="preventivo-voce">';
        html += '<div class="preventivo-voce-info"><strong>' + v.nome + (v.qty > 1 ? ' ×' + v.qty : '') + '</strong>';
        html += '<span>' + v.desc + (v.qty > 1 ? ' — ' + formatEur(v.prezzo) + ' cad.' : '') + '</span></div>';
        html += '<span class="preventivo-voce-prezzo">' + formatEur(lineTotal) + '</span>';
        html += '</div>';
      }
      html += '<div class="preventivo-voce preventivo-voce-info-only">';
      html += '<div class="preventivo-voce-info"><strong>Primo controllo periodico incluso</strong><span></span>';
      html += '</div></div>';
      if (vociEl) vociEl.innerHTML = html;

      var sconto = subtotale * SCONTO;
      var imponibileScontato = subtotale - sconto;
      var iva = imponibileScontato * IVA;
      var totale = imponibileScontato + iva;
      var totaleSenzaPromo = subtotale * (1 + IVA);

      setText("prev-subtotale", formatEur(subtotale));
      setText("prev-sconto", "−" + formatEur(sconto));
      setText("prev-imponibile-scontato", formatEur(imponibileScontato));
      setText("prev-iva", formatEur(iva));
      setText("prev-totale-ivato", formatEur(totaleSenzaPromo));
      setText("prev-totale", formatEur(totale));

      if (risultato) risultato.hidden = false;
      var countText = $("#supporti-count-text");
      if (countText) countText.textContent = "Nel tuo preventivo sono previsti " + nTotEstintori + " estintori.";

      return {
        voci: voci, subtotale: subtotale, sconto: sconto,
        imponibileScontato: imponibileScontato, iva: iva,
        totaleSenzaPromo: totaleSenzaPromo, totale: totale,
        nPolvere: nPolvere, nCo2: nCo2, nSchiuma: nSchiuma, nTotEstintori: nTotEstintori,
        isCondominio: isCondominio
      };
    }

    ["prev-mq", "prev-quadri", "prev-cucine", "prev-tipo", "pv-q1", "pv-q2"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () { calcolaPreventivo(id); });
      el.addEventListener("change", function () { calcolaPreventivo(id); });
    });

    function buildDettagli(c, fields) {
      var d = "===== RICHIESTA PREVENTIVO =====\n\n";
      d += "Cliente: " + fields.nome + "\n";
      d += "Email: " + fields.email + "\n";
      d += "Telefono: " + (fields.telefono || "Non indicato") + "\n";
      d += "Azienda: " + (fields.azienda || "Non indicata") + "\n\n";
      d += "----- LOCALE -----\n";
      d += "Tipo: " + fields.tipoLocale + "\n";
      d += "Superficie: " + fields.mq + " m²\n";
      d += "Quadri elettrici: " + intVal("prev-quadri") + "\n";
      d += "Cucine: " + intVal("prev-cucine") + "\n\n";
      d += "----- VOCI PREVENTIVO -----\n";
      for (var i = 0; i < c.voci.length; i++) {
        var v = c.voci[i];
        d += "- " + v.nome + " x" + v.qty + " (" + formatEur(v.prezzo) + " cad.) = " + formatEur(v.qty * v.prezzo) + "\n";
      }
      d += "Primo controllo periodico: INCLUSO (" + c.nTotEstintori + " estintori)\n\n";
      d += "----- TOTALI -----\n";
      d += "Imponibile: " + formatEur(c.subtotale) + "\n";
      d += "Sconto Promo New Entry (-10%): -" + formatEur(c.sconto) + "\n";
      d += "Imponibile scontato: " + formatEur(c.imponibileScontato) + "\n";
      d += "IVA (22%): " + formatEur(c.iva) + "\n";
      d += "Totale senza promo: " + formatEur(c.totaleSenzaPromo) + "\n";
      d += "TOTALE FINALE: " + formatEur(c.totale) + "\n\n";
      d += "Nota: Revisione dopo 5 anni (CO2/Polvere) o 4 anni (Schiuma). Zona servita: Roma e dintorni.";
      return d;
    }

    attachFormspreeSubmit({
      form: prevForm,
      statusEl: statusEl,
      submitBtn: submitBtn,
      statusBaseClass: "preventivo-status",
      successMsg: "Richiesta inviata! Ti ricontatteremo via email a breve.",
      preValidate: function (f) {
        var fields = {
          nome: (f.querySelector('[name="nome"]') || {}).value,
          email: (f.querySelector('[name="email"]') || {}).value,
          telefono: (f.querySelector('[name="telefono"]') || {}).value,
          azienda: (f.querySelector('[name="azienda"]') || {}).value,
          tipoLocale: (f.querySelector('[name="tipo_locale"]') || {}).value,
          mq: (f.querySelector('[name="metratura"]') || {}).value
        };
        Object.keys(fields).forEach(function (k) {
          if (typeof fields[k] === "string") fields[k] = fields[k].trim();
        });

        if (!fields.nome || !fields.email) return "Compila nome e email.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return "Inserisci un indirizzo email valido.";
        if (!fields.tipoLocale || !fields.mq || parseInt(fields.mq, 10) <= 0) return "Inserisci tipo di locale e metratura.";

        var c = calcolaPreventivo();
        if (!c) return "Inserisci la metratura per generare il preventivo.";

        var hidden = $("#prev-dettagli-hidden");
        if (hidden) hidden.value = buildDettagli(c, fields);
        return null;
      },
      onSuccess: function () {
        if (risultato) risultato.hidden = true;
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // Tab prodotti
  // ──────────────────────────────────────────────────────────
  function initProdottiTabs() {
    var tabs = $$(".prodotti-tab");
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var categoria = this.getAttribute("data-categoria");
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");
        $$(".categoria-prodotti").forEach(function (cat) {
          cat.hidden = cat.id !== "categoria-" + categoria;
        });
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // Toggle legenda "Tipi di incendio"
  // ──────────────────────────────────────────────────────────
  function initLegendToggle() {
    $$(".legend-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var collapsed = btn.classList.toggle("collapsed");
        var bodyId = btn.getAttribute("aria-controls");
        var body = bodyId ? document.getElementById(bodyId) : btn.nextElementSibling;
        if (body) body.classList.toggle("collapsed", collapsed);
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // Bootstrap
  // ──────────────────────────────────────────────────────────
  ready(function () {
    initMobileMenu();
    initContactForm();
    initAccessPopup();
    initPreventivo();
    initProdottiTabs();
    initLegendToggle();
  });
})();
