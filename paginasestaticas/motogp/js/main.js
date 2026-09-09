/**
 * MotoGP Fan Site — script principal
 * Menú móvil accesible, video "facade", galería con lightbox,
 * validación de formulario, botón "volver arriba" y utilidades varias.
 *
 * Nota de seguridad (SEC-006): el mensaje de éxito del formulario se
 * inserta siempre con `textContent`, nunca con `innerHTML`. No cambiar
 * este patrón sin revisar el impacto en XSS.
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* -----------------------------------------------------------
     Menú de navegación móvil
  ----------------------------------------------------------- */
  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var list = document.getElementById("primary-nav-list");
    if (!toggle || !list) return;

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      list.classList.toggle("is-open", !isOpen);
    });

    // Cierra el menú al activar un enlace (móvil)
    list.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 800) {
          toggle.setAttribute("aria-expanded", "false");
          list.classList.remove("is-open");
        }
      });
    });

    // Cierra el menú con Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        toggle.setAttribute("aria-expanded", "false");
        list.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* -----------------------------------------------------------
     Botón "volver arriba"
  ----------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", function () {
      btn.classList.toggle("is-visible", window.scrollY > 500);
    });

    btn.addEventListener("click", function () {
      // SEC-015: respeta la preferencia de movimiento reducido del usuario
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }

  /* -----------------------------------------------------------
     Video "facade" — carga el iframe de YouTube solo bajo demanda
     (SEC-003): evita permisos y peticiones de terceros sin acción
     explícita del usuario.
  ----------------------------------------------------------- */
  function initVideoFacade() {
    var facade = document.querySelector(".video-facade");
    if (!facade) return;

    var wrapper = facade.closest(".video-wrapper");
    var videoId = facade.getAttribute("data-video-id");
    var videoTitle = facade.getAttribute("data-video-title") || "Video de MotoGP";
    if (!wrapper || !videoId) return;

    facade.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1&rel=0";
      iframe.title = videoTitle;
      // SEC-003: permisos mínimos necesarios (sin acelerómetro, giroscopio
      // ni acceso al portapapeles).
      iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      wrapper.innerHTML = "";
      wrapper.appendChild(iframe);
      iframe.focus();
    });
  }

  /* -----------------------------------------------------------
     Galería con lightbox accesible
  ----------------------------------------------------------- */
  function initGallery() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var lightbox = document.getElementById("lightbox");
    if (!items.length || !lightbox) return;

    var lightboxImg = lightbox.querySelector(".lightbox-image");
    var lightboxCaption = lightbox.querySelector(".lightbox-caption");
    var lightboxPosition = lightbox.querySelector(".lightbox-position");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-prev");
    var nextBtn = lightbox.querySelector(".lightbox-next");
    var currentIndex = 0;
    var lastFocusedElement = null;

    // ACC-001: elementos de fondo que deben ocultarse del árbol de
    // accesibilidad mientras el diálogo modal está abierto.
    var backgroundLandmarks = Array.prototype.slice.call(
      document.querySelectorAll("body > .site-header, body > main, body > .site-footer, body > .back-to-top")
    );

    function setBackgroundInert(isInert) {
      backgroundLandmarks.forEach(function (el) {
        if (isInert) {
          el.setAttribute("aria-hidden", "true");
          el.setAttribute("inert", "");
        } else {
          el.removeAttribute("aria-hidden");
          el.removeAttribute("inert");
        }
      });
    }

    function openLightbox(index) {
      currentIndex = index;
      var item = items[index];
      var img = item.querySelector("img");
      var caption = item.querySelector("figcaption");

      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = caption ? caption.textContent : "";
      if (lightboxPosition) {
        lightboxPosition.textContent = "Imagen " + (index + 1) + " de " + items.length;
      }

      lastFocusedElement = document.activeElement;
      lightbox.hidden = false;
      setBackgroundInert(true);
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      setBackgroundInert(false);
      document.body.style.overflow = "";
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    function showRelative(offset) {
      var newIndex = (currentIndex + offset + items.length) % items.length;
      openLightbox(newIndex);
    }

    items.forEach(function (item, index) {
      // La <figure> agrupa imagen + figcaption; el disparador es el <button>
      // interno (un <button> no puede contener un <figure> — element-permitted-content).
      var trigger = item.querySelector(".gallery-item-trigger");
      if (trigger) {
        trigger.addEventListener("click", function () {
          openLightbox(index);
        });
      }
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () {
      showRelative(-1);
    });
    nextBtn.addEventListener("click", function () {
      showRelative(1);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showRelative(-1);
      } else if (event.key === "ArrowRight") {
        showRelative(1);
      } else if (event.key === "Tab") {
        // Mantiene el foco dentro del diálogo (trampa de foco simple)
        var focusable = lightbox.querySelectorAll("button");
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* -----------------------------------------------------------
     Resalta la próxima carrera en la tabla de calendario
  ----------------------------------------------------------- */

  // SEC-007: solo se acepta el formato ISO estricto AAAA-MM-DD antes de
  // construir un Date con el atributo data-date del HTML.
  var ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  function highlightNextRace() {
    var rows = document.querySelectorAll(".schedule-table tbody tr[data-date]");
    if (!rows.length) return;

    var today = new Date();
    var nextRow = null;

    rows.forEach(function (row) {
      var rawDate = row.getAttribute("data-date");
      if (!ISO_DATE_PATTERN.test(rawDate)) return;

      var rowDate = new Date(rawDate);
      if (isNaN(rowDate.getTime())) return;

      if (rowDate >= today && !nextRow) {
        nextRow = row;
      }
    });

    if (nextRow) {
      nextRow.classList.add("is-next");
      // ACC-006: sin aria-label (un <span> sin rol no admite nombre accesible
      // por ARIA); el texto visible ya identifica el estado sin ambigüedad.
      var statusCell = nextRow.querySelector(".status-pill");
      if (statusCell) {
        statusCell.textContent = "Próxima";
        statusCell.className = "status-pill proximo";
      }
    }
  }

  /* -----------------------------------------------------------
     Validación accesible del formulario de contacto
  ----------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var statusBox = document.getElementById("form-status");
    var errorSummary = document.getElementById("form-error-summary");
    var errorList = document.getElementById("form-error-list");

    function showError(field, message) {
      var errorEl = document.getElementById(field.id + "-error");
      if (errorEl) {
        errorEl.textContent = message;
      }
      field.setAttribute("aria-invalid", message ? "true" : "false");
      field.setAttribute("data-touched", "true");
    }

    function fieldLabelText(field) {
      var label = form.querySelector('label[for="' + field.id + '"]');
      return label ? label.textContent.replace("*", "").trim() : field.name;
    }

    function validateField(field) {
      if (field.validity.valid) {
        showError(field, "");
        return true;
      }
      if (field.validity.valueMissing) {
        showError(field, "Este campo es obligatorio.");
      } else if (field.validity.typeMismatch && field.type === "email") {
        showError(field, "Introduce un correo electrónico válido.");
      } else if (field.validity.tooShort) {
        showError(field, "Escribe al menos " + field.minLength + " caracteres.");
      } else {
        showError(field, "El valor introducido no es válido.");
      }
      return false;
    }

    var fields = form.querySelectorAll("input[required], textarea[required], select[required]");

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("data-touched") === "true") {
          validateField(field);
        }
      });
    });

    // ACC-004: resumen de errores anunciado con role="alert" al enviar
    function renderErrorSummary(invalidFields) {
      if (!errorSummary || !errorList) return;

      if (!invalidFields.length) {
        errorSummary.hidden = true;
        errorList.innerHTML = "";
        return;
      }

      errorList.innerHTML = "";
      invalidFields.forEach(function (field) {
        var li = document.createElement("li");
        var link = document.createElement("a");
        link.href = "#" + field.id;
        link.textContent = fieldLabelText(field);
        link.addEventListener("click", function (event) {
          event.preventDefault();
          field.focus();
        });
        li.appendChild(link);
        errorList.appendChild(li);
      });

      errorSummary.hidden = false;
      errorSummary.focus();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var invalidFields = [];

      fields.forEach(function (field) {
        var valid = validateField(field);
        if (!valid) invalidFields.push(field);
      });

      if (invalidFields.length === 0) {
        renderErrorSummary([]);
        statusBox.hidden = false;
        statusBox.textContent =
          "¡Gracias! Tu mensaje sobre \"" +
          form.querySelector("#subject").value +
          "\" fue registrado correctamente (demo sin envío real).";
        statusBox.focus();
        form.reset();
        fields.forEach(function (field) {
          field.removeAttribute("data-touched");
          field.removeAttribute("aria-invalid");
        });
      } else {
        statusBox.hidden = true;
        renderErrorSummary(invalidFields);
      }
    });
  }

  /* -----------------------------------------------------------
     Año dinámico en el pie de página
  ----------------------------------------------------------- */
  function setCurrentYear() {
    var yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initBackToTop();
    initVideoFacade();
    initGallery();
    highlightNextRace();
    initContactForm();
    setCurrentYear();
  });
})();
