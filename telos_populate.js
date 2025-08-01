// ==UserScript==
// @name         Populate Telos v2
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Populate various forms based on URL, with SPA support and dynamic button
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  // ——— Core populate functions ———
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function populateDefault(logArea) {
    logArea.value += `No specialized populate function for this page.\n`;
  }

  function populateSignup(logArea) {
    try {
      // mobile phone
      const mobile = document.querySelector(
        'input[data-test-id="mobile-phone-input"]'
      );
      if (mobile) {
        mobile.value = "111-222-3333";
        mobile.dispatchEvent(new Event("input", { bubbles: true }));
        logArea.value += `Mobile Phone: set to "111-222-3333"\n`;
      } else {
        logArea.value += `Mobile phone input not found\n`;
      }

      // email
      const email = document.querySelector('input[data-test-id="email-input"]');
      if (email) {
        email.value = "abc@abc.com";
        email.dispatchEvent(new Event("input", { bubbles: true }));
        logArea.value += `Email: set to "abc@abc.com"\n`;
      } else {
        logArea.value += `Email input not found\n`;
      }

      // name mapping
      const allInputs = document.querySelectorAll("input");
      if (!allInputs.length) throw new Error("No <input> elements found");
      const names = { 0: "John", 1: "Q", 2: "Public" };
      allInputs.forEach((el, i) => {
        if (names[i] != null) {
          el.value = names[i];
          el.dispatchEvent(new Event("input", { bubbles: true }));
          logArea.value += `Index ${i}: set to "${names[i]}"\n`;
        }
      });

      // contact preference radio
      const group = document.querySelector(
        'div[data-test-id="contact-preference"]'
      );
      if (group) {
        const opt = group.querySelector('div[role="radio"]');
        if (opt) {
          opt.click();
          logArea.value += `Contact Preference: set to "Email"\n`;
        } else {
          logArea.value += `Contact radio option not found\n`;
        }
      } else {
        logArea.value += `Contact-preference group not found\n`;
      }

      // helper to select QSelect
      function selectOption(value, opts) {
        let input;
        if (opts.label)
          input = document.querySelector(`input[aria-label="${opts.label}"]`);
        else if (opts.selector) input = document.querySelector(opts.selector);
        if (!input) {
          logArea.value += `Combobox not found for ${
            opts.label || opts.selector
          }\n`;
          return;
        }
        input.click();
        const panelId = input.getAttribute("aria-controls");
        let retries = 10;
        (function attempt() {
          const panel = document.getElementById(panelId);
          const items = panel?.querySelectorAll('[role="option"]') || [];
          if ((!panel || !items.length) && --retries > 0) {
            return setTimeout(attempt, 50);
          }
          if (!panel || !items.length) {
            logArea.value += `${
              opts.label || opts.selector
            } panel/options missing\n`;
            return;
          }
          const match = Array.from(items).find(
            (item) =>
              item.querySelector(".q-item__label span")?.textContent.trim() ===
              String(value)
          );
          (match || items[0]).click();
          logArea.value += `${opts.label || opts.selector}: "${
            match ? value : "<first>"
          }"\n`;
        })();
      }

      // QSelects
      selectOption("10", { label: "Month" });
      selectOption("10", { label: "Day" });
      selectOption("2010", { label: "Year" });
      selectOption("United States of America", {
        selector:
          'div[data-testid="countries-dropdown-select"] input[role="combobox"]',
      });
      selectOption("Jr", {
        selector: '#name-entry-suffix-q-select input[role="combobox"]',
      });

      // checkbox
      const cb = document.querySelector("div.q-checkbox__bg.absolute");
      if (cb) {
        cb.click();
        logArea.value += `Checkbox clicked\n`;
      } else {
        logArea.value += `Checkbox not found\n`;
      }
    } catch (err) {
      logArea.value += `Error: ${err.message}\n`;
    }

    // click SPA button ("Sign Up") after pause
    setTimeout(() => {
      clickByText(logArea, "span.block", "Sign Up");
      logArea.scrollTop = logArea.scrollHeight;
    }, 100);

    logArea.scrollTop = logArea.scrollHeight;
  }
  async function populateLegalname(logArea) {
    try {
      setToggleSwitchByIndex("label.toggle-switch", "yes", 1);
      logArea.value += "1: seting 1st label.toggle-switch to yes\n";

      await sleep(1000);
      setToggleSwitchByIndex("label.toggle-switch", "no", 1);
      logArea.value += "2: seting 1st label.toggle-switch to no\n";
    } catch (boom) {
      logArea.value += boom.message + "\n";
    }
  }
  function populateLocation(logArea) {
    try {
      const container = document.querySelector("div.col.scroll.q-pa-md");
      if (!container) {
        logArea.value += `Locations container not found\n`;
        return;
      }
      const firstCard = container.querySelector("div.location-card");
      if (!firstCard) {
        logArea.value += `No location cards found\n`;
        return;
      }
      firstCard.click();
      logArea.value += `First location card clicked\n`;

      setTimeout(() => {
        clickByText(logArea, "span.block", "Next");
        logArea.scrollTop = logArea.scrollHeight;
      }, 100);
    } catch (err) {
      logArea.value += `Error in populateLocation: ${err.message}\n`;
    }
    logArea.scrollTop = logArea.scrollHeight;
  }

  // clickByText helper
  function clickByText(logArea, selector, text) {
    const el = Array.from(document.querySelectorAll(selector)).find(
      (el) => el.textContent.trim() === text
    );
    if (el) {
      el.click();
      logArea.value += `Clicked "${text}"\n`;
    } else {
      logArea.value += `"${text}" not found for selector "${selector}"\n`;
    }
  }

  // ——— config based on path ———

  function getPopulateConfig(pathname) {
    switch (true) {
      case pathname.endsWith("/location"):
        return { handler: populateLocation, btnText: "Populate Location" };
      case pathname.endsWith("/signup") || pathname === "/":
        return { handler: populateSignup, btnText: "Populate Signup" };
      case pathname.endsWith("/legalName"):
        return { handler: populateLegalname, btnText: "Populate LegalName" };
      default:
        return { handler: populateDefault, btnText: "?" };
    }
  }

  function setToggleSwitchByIndex(selector, state, index) {
    // Toggle switches have no ID so use the INDEX to pick one out
    const wrappers = document.querySelectorAll(selector);
    const wrapper = wrappers[index];
    if (!wrapper) {
      console.warn(`No toggle at index ${index} for "${selector}"`);
      return;
    }
    const checkbox = wrapper.querySelector('input[type="checkbox"]');
    if (!checkbox) {
      console.warn(`No checkbox in wrapper #${index}`);
      return;
    }
    const shouldBeChecked = state.toLowerCase() === "yes";
    if (checkbox.checked !== shouldBeChecked) {
      checkbox.click();
    }
  }

  // ——— UI setup ———

  function createUI() {
    if (document.getElementById("tm-multi-input-logger")) return;

    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      bottom: "10px",
      right: "10px",
      width: "420px",
      background: "white",
      border: "1px solid #ccc",
      padding: "8px",
      zIndex: "2147483647",
      boxShadow: "0 0 8px rgba(0,0,0,0.2)",
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      lineHeight: "1.2",
    });

    const logArea = document.createElement("textarea");
    Object.assign(logArea.style, {
      width: "100%",
      height: "220px",
      resize: "none",
      marginBottom: "8px",
      border: "1px solid #bbb",
      backgroundColor: "#f9f9f9",
      fontSize: "12px",
    });
    logArea.id = "tm-multi-input-logger";

    const btn = document.createElement("button");
    btn.id = "tm-multi-populate-btn";
    Object.assign(btn.style, {
      padding: "4px 8px",
      fontSize: "12px",
      cursor: "pointer",
    });
    // dynamic click listener reads current path
    btn.addEventListener("click", () => {
      const { handler } = getPopulateConfig(window.location.pathname);
      handler(logArea);
    });

    container.append(logArea, btn);
    document.body.appendChild(container);

    const { btnText } = getPopulateConfig(window.location.pathname);
    btn.textContent = btnText;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createUI);
  } else {
    createUI();
  }

  // ——— SPA URL change detection ———

  (function () {
    ["pushState", "replaceState"].forEach((fn) => {
      const orig = history[fn];
      history[fn] = function () {
        const ret = orig.apply(this, arguments);
        window.dispatchEvent(new Event("locationchange"));
        return ret;
      };
    });
    window.addEventListener("popstate", () =>
      window.dispatchEvent(new Event("locationchange"))
    );

    window.addEventListener("locationchange", () => {
      const logArea = document.getElementById("tm-multi-input-logger");
      const btn = document.getElementById("tm-multi-populate-btn");
      if (logArea) {
        logArea.value = window.location.href + "\n";
        logArea.scrollTop = logArea.scrollHeight;
      }
      if (btn) {
        const { btnText } = getPopulateConfig(window.location.pathname);
        btn.textContent = btnText;
      }
    });
  })();
})();
