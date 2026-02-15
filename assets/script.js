(function() {
  function setupMenu() {
    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!navToggle || !nav) {
      setTimeout(setupMenu, 100);
      return;
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
    nav.querySelectorAll("a").forEach(function(a) {
      a.onclick = function() {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      };
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMenu);
  } else {
    setupMenu();
  }

  var contactForm = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");

  if (!contactForm || !formStatus) return;

  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    formStatus.textContent = "Invio in corso...";

    if (!window.fetch || !window.FormData) {
      formStatus.textContent = "Browser non supportato. Contattaci via email o telefono.";
      return;
    }

    fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" }
    })
      .then(function(res) {
        if (res.ok) {
          formStatus.textContent = "Grazie! La tua richiesta è stata inviata.";
          contactForm.reset();
        } else {
          formStatus.textContent = "Invio non riuscito. Riprova o scrivici via email.";
        }
      })
      .catch(function() {
        formStatus.textContent = "Errore di connessione. Riprova tra poco.";
      });
  });
})();
