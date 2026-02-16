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
})();
