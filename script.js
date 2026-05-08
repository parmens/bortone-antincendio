(function() {
  function setupMenu() {
    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!navToggle || !nav) {
      setTimeout(setupMenu, 100);
      return;
    }
    function closeMenu() {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    }
    navToggle.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    };
    document.addEventListener("click", function(e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeMenu();
      }
    });
    nav.querySelectorAll("a").forEach(function(a) {
      a.onclick = function() { closeMenu(); };
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMenu);
  } else {
    setupMenu();
  }

  var contactForm = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var submitBtn = document.getElementById("contact-submit");

  if (contactForm && formStatus) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    var honeypot = contactForm.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      formStatus.textContent = "Invio non riuscito. Riprova o scrivici via email.";
      return;
    }
    formStatus.textContent = "Invio in corso...";
    if (submitBtn) submitBtn.disabled = true;

    if (!window.fetch || !window.FormData) {
      formStatus.textContent = "Browser non supportato. Contattaci via email o telefono.";
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    var fd = new FormData(contactForm);
    fd.delete("website");
    fetch(contactForm.action, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" }
    })
      .then(function(res) {
        return res.json().then(function(data) {
          if (res.ok) {
            formStatus.textContent = "Grazie! La tua richiesta è stata inviata.";
            contactForm.reset();
          } else {
            formStatus.textContent = data.error || "Invio non riuscito. Riprova o scrivici via email.";
          }
        }).catch(function() {
          if (res.ok) {
            formStatus.textContent = "Grazie! La tua richiesta è stata inviata.";
            contactForm.reset();
          } else {
            formStatus.textContent = "Invio non riuscito. Riprova o scrivici via email.";
          }
        });
      })
      .catch(function() {
        formStatus.textContent = "Errore di connessione. Riprova tra poco.";
      })
      .finally(function() {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
  }

  // Popup Area Clienti (solo se presenti gli elementi)
  var openBtn = document.getElementById("open-access-popup");
  var overlay = document.getElementById("access-popup-overlay");
  if (openBtn && overlay) {
    var closeBtn = document.getElementById("close-access-popup");
    var popupForm = document.getElementById("access-popup-form");
    var popupStatus = document.getElementById("access-popup-status");
    var popupSubmitBtn = document.getElementById("access-popup-submit-btn");
    var nomeInput = document.getElementById("access-popup-nome");
    var menuItems = overlay.querySelectorAll(".access-popup-menu-item");
    var modalEl = overlay.querySelector(".access-popup-modal");

    function getFocusables() {
      if (!modalEl) return [];
      var sel = "button:not([disabled]), [href], input:not([disabled]), select, textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
      return [].slice.call(modalEl.querySelectorAll(sel));
    }
    function openPopup() {
      overlay.style.display = "flex";
      overlay.setAttribute("aria-hidden", "false");
      setTimeout(function() {
        overlay.classList.add("active");
        if (closeBtn) closeBtn.focus();
      }, 10);
      document.body.style.overflow = "hidden";
      if (menuItems.length) {
        menuItems.forEach(function(i) { i.classList.remove("active"); });
        menuItems[0].classList.add("active");
      }
      if (nomeInput) nomeInput.placeholder = "Nome azienda / Nome e cognome";
    }
    function closePopup() {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      if (openBtn) openBtn.focus();
      setTimeout(function() {
        overlay.style.display = "none";
        document.body.style.overflow = "";
      }, 180);
    }

    openBtn.addEventListener("click", function(e) {
      e.preventDefault();
      openPopup();
    });
    if (closeBtn) closeBtn.addEventListener("click", closePopup);
    menuItems.forEach(function(item) {
      item.addEventListener("click", function() {
        menuItems.forEach(function(i) { i.classList.remove("active"); });
        this.classList.add("active");
        var t = this.getAttribute("data-type");
        if (nomeInput) nomeInput.placeholder = t === "admin" ? "Nome e cognome" : "Nome azienda / Nome e cognome";
      });
    });
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) closePopup();
    });
    document.addEventListener("keydown", function(e) {
      if (overlay.style.display !== "flex") return;
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        closePopup();
        return;
      }
      if (e.key !== "Tab") return;
      var focusables = getFocusables();
      if (focusables.length === 0) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    if (popupForm && popupStatus) {
      popupForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var honeypot = popupForm.querySelector("input[name=\"website\"]");
        if (honeypot && honeypot.value) {
          popupStatus.textContent = "Invio non riuscito. Riprova o scrivici via email.";
          return;
        }
        popupStatus.textContent = "Invio in corso...";
        if (popupSubmitBtn) popupSubmitBtn.disabled = true;
        if (!window.fetch || !window.FormData) {
          popupStatus.textContent = "Browser non supportato. Contattaci via email o telefono.";
          if (popupSubmitBtn) popupSubmitBtn.disabled = false;
          return;
        }
        var fd = new FormData(popupForm);
        fd.delete("website");
        fetch(popupForm.action, { method: "POST", body: fd, headers: { Accept: "application/json" } })
          .then(function(res) {
            return res.json().then(function(data) {
              if (res.ok) {
                popupStatus.textContent = "Grazie! La tua richiesta è stata inviata.";
                popupForm.reset();
              } else {
                popupStatus.textContent = data.error || "Invio non riuscito. Riprova o scrivici via email.";
              }
            }).catch(function() {
              if (res.ok) {
                popupStatus.textContent = "Grazie! La tua richiesta è stata inviata.";
                popupForm.reset();
              } else {
                popupStatus.textContent = "Invio non riuscito. Riprova o scrivici via email.";
              }
            });
          })
          .catch(function() {
            popupStatus.textContent = "Errore di connessione. Riprova tra poco.";
          })
          .finally(function() {
            if (popupSubmitBtn) popupSubmitBtn.disabled = false;
          });
      });
    }
  }

  // ── Preventivo Calculator ──
  var prevForm = document.getElementById("preventivo-form");
  if (prevForm) {
    var PREZZO = { polvere: 75, co2: 100, schiuma: 125, controllo: 25, kit_registro: 70, registro: 30, gancio: 15, piedistallo: 50 };
    var SCONTO = 0.10;

    function formatEur(n) {
      return "€" + n.toFixed(2).replace(".", ",");
    }
    function intVal(id) {
      var v = parseInt(document.getElementById(id).value, 10);
      return isNaN(v) || v < 0 ? 0 : v;
    }

    function calcolaPreventivo(changedId) {
      var mq = intVal("prev-mq");
      var quadri = intVal("prev-quadri");
      var cucine = intVal("prev-cucine");
      var tipoSel = document.getElementById("prev-tipo").value;
      var risultato = document.getElementById("preventivo-risultato");
      var vociEl = document.getElementById("prev-voci");

      if (mq <= 0) {
        risultato.style.display = "none";
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

      var ganciInput = document.getElementById("pv-q1");
      var piedistalliInput = document.getElementById("pv-q2");
      var nGanci = intVal("pv-q1");
      var nPiedistalli = intVal("pv-q2");

      if (nGanci > nTotEstintori) nGanci = nTotEstintori;
      if (nPiedistalli > nTotEstintori) nPiedistalli = nTotEstintori;

      if (nGanci + nPiedistalli > nTotEstintori) {
        if (changedId === "pv-q2") {
          nPiedistalli = Math.max(0, nTotEstintori - nGanci);
        } else {
          nGanci = Math.max(0, nTotEstintori - nPiedistalli);
        }
      }

      if (ganciInput) {
        ganciInput.max = String(nTotEstintori);
        ganciInput.value = String(nGanci);
      }
      if (piedistalliInput) {
        piedistalliInput.max = String(nTotEstintori);
        piedistalliInput.value = String(nPiedistalli);
      }

      if (nGanci > 0) voci.push({ nome: "Gancio + Cartello", desc: "Supporto a parete", qty: nGanci, prezzo: PREZZO.gancio });
      if (nPiedistalli > 0) voci.push({ nome: "Piedistallo", desc: "Supporto a terra", qty: nPiedistalli, prezzo: PREZZO.piedistallo });

      if (isCondominio) {
        voci.push({ nome: "Kit Registro Antincendio", desc: "Obbligatorio per condomini", qty: 1, prezzo: PREZZO.kit_registro });
      } else {
        voci.push({ nome: "Registro Antincendio", desc: "Documentazione obbligatoria", qty: 1, prezzo: PREZZO.registro });
      }

      var html = "";
      var subtotale = 0;
      var subtotaleEstintori = 0;
      for (var i = 0; i < voci.length; i++) {
        var v = voci[i];
        var lineTotal = v.qty * v.prezzo;
        subtotale += lineTotal;
        subtotaleEstintori += lineTotal;
        html += '<div class="preventivo-voce">';
        html += '<div class="preventivo-voce-info"><strong>' + v.nome + (v.qty > 1 ? ' ×' + v.qty : '') + '</strong><span>' + v.desc + (v.qty > 1 ? ' — ' + formatEur(v.prezzo) + ' cad.' : '') + '</span></div>';
        html += '<span class="preventivo-voce-prezzo">' + formatEur(lineTotal) + '</span>';
        html += '</div>';
      }
      html += '<div class="preventivo-voce preventivo-voce-info-only">';
      html += '<div class="preventivo-voce-info"><strong>Primo controllo periodico incluso</strong><span>';
      html += '</div>';
      vociEl.innerHTML = html;

      var iva = subtotale * 0.22;
      var totaleIvato = subtotale + iva;
      var sconto = totaleIvato * SCONTO;
      var totale = totaleIvato - sconto;

      document.getElementById("prev-subtotale").textContent = formatEur(subtotale);
      document.getElementById("prev-iva").textContent = formatEur(iva);
      document.getElementById("prev-totale-ivato").textContent = formatEur(totaleIvato);
      document.getElementById("prev-sconto").textContent = "−" + formatEur(sconto);
      document.getElementById("prev-totale").textContent = formatEur(totale);

      risultato.style.display = "block";
      var countText = document.getElementById("supporti-count-text");
      if (countText) countText.textContent = "Nel tuo preventivo sono previsti " + nTotEstintori + " estintori.";

      return {
        voci: voci, subtotale: subtotale, sconto: sconto,
        iva: iva, totaleIvato: totaleIvato, totale: totale,
        nPolvere: nPolvere, nCo2: nCo2, nSchiuma: nSchiuma, nTotEstintori: nTotEstintori,
        isCondominio: isCondominio
      };
    }

    ["prev-mq", "prev-quadri", "prev-cucine", "prev-tipo", "pv-q1", "pv-q2"].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", function() { calcolaPreventivo(id); });
        el.addEventListener("change", function() { calcolaPreventivo(id); });
      }
    });

    // EmailJS config
    var EMAILJS_PUBLIC_KEY = "IL_TUO_PUBLIC_KEY";
    var EMAILJS_SERVICE_ID = "IL_TUO_SERVICE_ID";
    var EMAILJS_TEMPLATE_ID = "IL_TUO_TEMPLATE_ID";

    if (window.emailjs && EMAILJS_PUBLIC_KEY !== "IL_TUO_PUBLIC_KEY") {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    prevForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var status = document.getElementById("preventivo-status");
      var submitBtn = document.getElementById("preventivo-submit");

      var nome = prevForm.querySelector('[name="nome"]').value.trim();
      var email = prevForm.querySelector('[name="email"]').value.trim();
      var telefono = prevForm.querySelector('[name="telefono"]').value.trim();
      var azienda = prevForm.querySelector('[name="azienda"]').value.trim();
      var tipoLocale = prevForm.querySelector('[name="tipo_locale"]').value;
      var mq = prevForm.querySelector('[name="metratura"]').value;

      if (!nome || !email) {
        status.textContent = "Compila nome e email.";
        status.className = "preventivo-status error";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "Inserisci un indirizzo email valido.";
        status.className = "preventivo-status error";
        return;
      }
      if (!tipoLocale || !mq || parseInt(mq, 10) <= 0) {
        status.textContent = "Inserisci tipo di locale e metratura.";
        status.className = "preventivo-status error";
        return;
      }

      var c = calcolaPreventivo();
      if (!c) {
        status.textContent = "Inserisci la metratura per generare il preventivo.";
        status.className = "preventivo-status error";
        return;
      }

      if (EMAILJS_PUBLIC_KEY === "IL_TUO_PUBLIC_KEY") {
        status.textContent = "Sistema email non ancora configurato. Contattaci direttamente.";
        status.className = "preventivo-status error";
        return;
      }

      status.textContent = "Invio in corso...";
      status.className = "preventivo-status";
      submitBtn.disabled = true;

      var dettagli = "Locale: " + tipoLocale + " — " + mq + " m²\n";
      dettagli += "Quadri elettrici: " + intVal("prev-quadri") + " | Cucine: " + intVal("prev-cucine") + "\n\n";
      for (var i = 0; i < c.voci.length; i++) {
        var v = c.voci[i];
        dettagli += v.nome + " x" + v.qty + " (" + formatEur(v.prezzo) + " cad.) = " + formatEur(v.qty * v.prezzo) + "\n";
      }
      dettagli += "\nPrimo controllo periodico: INCLUSO (" + c.nTotEstintori + " estintori)";
      dettagli += "\n\nSubtotale: " + formatEur(c.subtotale);
      dettagli += "\nIVA (22%): " + formatEur(c.iva);
      dettagli += "\nSconto Promo New Entry (-10%): -" + formatEur(c.sconto);
      dettagli += "\nTOTALE: " + formatEur(c.totale);
      dettagli += "\n\nNota: Revisione dopo 5 anni (CO2/Polvere) o 4 anni (Schiuma).";

      var params = {
        to_email: email,
        nome: nome,
        email: email,
        telefono: telefono || "Non indicato",
        azienda: azienda || "Non indicata",
        tipo_locale: tipoLocale,
        metratura: mq,
        dettagli: dettagli,
        totale: formatEur(c.totale)
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, Object.assign({}, params, { to_email: "info@bortoneantincendio.it" }))
        .then(function() {
          return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        })
        .then(function() {
          status.textContent = "Preventivo inviato! Controlla la tua casella email.";
          status.className = "preventivo-status success";
          prevForm.reset();
          document.getElementById("preventivo-risultato").style.display = "none";
        })
        .catch(function() {
          status.textContent = "Errore nell'invio. Riprova o contattaci direttamente.";
          status.className = "preventivo-status error";
        })
        .finally(function() {
          submitBtn.disabled = false;
        });
    });
  }

  // Tab prodotti
  var prodottiTabs = document.querySelectorAll(".prodotti-tab");
  if (prodottiTabs.length > 0) {
    prodottiTabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        var categoria = this.getAttribute("data-categoria");
        prodottiTabs.forEach(function(t) { t.classList.remove("active"); });
        this.classList.add("active");
        document.querySelectorAll(".categoria-prodotti").forEach(function(cat) {
          cat.style.display = "none";
        });
        var targetCat = document.getElementById("categoria-" + categoria);
        if (targetCat) targetCat.style.display = "block";
      });
    });
  }
})();
