/* ==========================================================================
   site.js - menu, estado do cabecalho, revelacoes ao rolar, copiar chave Pix

   Nenhum listener de scroll. O estado do cabecalho e as revelacoes usam
   IntersectionObserver, que o navegador agenda fora do caminho crítico da
   rolagem. Tudo degrada para conteudo estatico sem JavaScript.
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------- menu mobile */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav-principal");

  if (toggle && nav) {
    var label = toggle.querySelector(".nav-toggle-label");

    var setMenu = function (open) {
      nav.setAttribute("data-collapsed", open ? "false" : "true");
      /* a troca do icone hamburger/X e feita pelo CSS a partir deste atributo */
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Fechar o menu" : "Abrir o menu";
    };

    setMenu(false);

    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    /* fecha ao escolher um destino ou ao apertar Esc */
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a") && window.innerWidth <= 860) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    /* o menu aberto no mobile nao deve continuar aberto ao voltar ao desktop */
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ------------------------------------------- estado do cabecalho ao rolar */

  var header = document.querySelector(".site-header");
  var sentinel = document.getElementById("topo-sentinela");

  if (header && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        /* a sentinela fica no topo da pagina: quando ela sai da tela, a
           pagina rolou e o cabecalho ganha fundo */
        header.classList.toggle("is-stuck", !entries[0].isIntersecting);
      },
      { rootMargin: "0px" }
    ).observe(sentinel);
  }

  /* ------------------------------------------------- revelacoes ao rolar */

  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealables.forEach(function (el, index) {
      /* escalonamento dentro de cada grupo, para o olho ler em sequencia */
      var group = el.closest("[data-reveal-group]");
      var position = group ? Array.prototype.indexOf.call(group.children, el) : index;
      el.style.setProperty("--reveal-delay", Math.min(position, 6) * 70 + "ms");
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------- copiar chave Pix */

  var copyTargets = document.querySelectorAll("[data-copy]");

  if (copyTargets.length) {
    var toast;
    var toastText;
    var toastTimer;

    var showToast = function (message) {
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "copy-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.innerHTML =
          '<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor">' +
          '<path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>' +
          "</svg><span></span>";
        toastText = toast.querySelector("span");
        document.body.appendChild(toast);
      }

      toastText.textContent = message;
      /* o reflow garante a transicao quando o aviso e reexibido em seguida */
      void toast.offsetWidth;
      toast.setAttribute("data-visible", "true");

      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.removeAttribute("data-visible");
      }, 2600);
    };

    var legacyCopy = function (value) {
      var field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
      document.body.appendChild(field);
      field.select();

      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {
        ok = false;
      }

      document.body.removeChild(field);
      return ok;
    };

    copyTargets.forEach(function (target) {
      target.addEventListener("click", function () {
        var value = target.getAttribute("data-copy");

        var done = function (ok) {
          showToast(
            ok
              ? "Chave Pix copiada para a área de transferência"
              : "Não foi possível copiar. Selecione a chave e copie manualmente."
          );
        };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value).then(
            function () {
              done(true);
            },
            function () {
              done(legacyCopy(value));
            }
          );
        } else {
          /* file:// e http nao expoem a area de transferencia moderna */
          done(legacyCopy(value));
        }
      });
    });
  }
})();
