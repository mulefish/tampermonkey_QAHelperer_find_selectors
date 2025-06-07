// ==UserScript==
// @name         Populate Telos 1
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Populate signup or location based on URL suffix, with clickByText restored
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    const path = window.location.pathname;
    const isLocation = path.endsWith("/location");
    // signup on "/signup" or root "/"
    const isSignup  = path.endsWith("/signup") || path === "/";

    function populateLocation(logArea) {
      // TODO: implement location‐specific filling
      logArea.value += `populateLocation() called, but not yet implemented\n`;
      logArea.scrollTop = logArea.scrollHeight;
        // schedule Sign Up click after a short pause
        setTimeout(() => {
            clickByText(logArea, "span.block", "Next");
            logArea.scrollTop = logArea.scrollHeight;
          }, 100);

    }

    function populateSignup(logArea) {
      try {
        // mobile phone
        const mobile = document.querySelector('input[data-test-id="mobile-phone-input"]');
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

        // contact preference
        const group = document.querySelector('div[data-test-id="contact-preference"]');
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

        // helper to select a QSelect option
        function selectOption(value, opts) {
          let input;
          if (opts.label) input = document.querySelector(`input[aria-label="${opts.label}"]`);
          else if (opts.selector) input = document.querySelector(opts.selector);
          if (!input) {
            logArea.value += `✗ Combobox not found for ${opts.label||opts.selector}\n`;
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
              logArea.value += `✗ ${opts.label||opts.selector} panel/options missing\n`;
              return;
            }
            // find & click target or fallback
            const match = Array.from(items).find(item =>
              item.querySelector(".q-item__label span")?.textContent.trim() === String(value)
            );
            (match || items[0]).click();
            logArea.value += `✓ ${opts.label||opts.selector}: "${match?value:"<first>"}"\n`;
          })();
        }

        // checkbox click helper
        const cb = document.querySelector("div.q-checkbox__bg.absolute");
        if (cb) {
          cb.click();
          logArea.value += `Checkbox clicked\n`;
        } else {
          logArea.value += `Checkbox not found\n`;
        }

        // QSelects
        selectOption("10", { label: "Month" });
        selectOption("10", { label: "Day"   });
        selectOption("2010", { label: "Year"  });
        selectOption("United States of America", {
          selector:
            'div[data-testid="countries-dropdown-select"] input[role="combobox"]'
        });
        selectOption("Jr", {
          selector: '#name-entry-suffix-q-select input[role="combobox"]'
        });

      } catch (err) {
        logArea.value += `Error: ${err.message}\n`;
      }

      // clickByText helper (restored)
      function clickByText(logArea, selector, text) {
        const el = Array.from(document.querySelectorAll(selector))
          .find(el => el.textContent.trim() === text);
        if (el) {
          el.click();
          logArea.value += `✓ Clicked "${text}"\n`;
        } else {
          logArea.value += `✗ "${text}" not found for selector "${selector}"\n`;
        }
      }

      // schedule Sign Up click after a short pause
      setTimeout(() => {
        clickByText(logArea, "span.block", "Sign Up");
        logArea.scrollTop = logArea.scrollHeight;
      }, 100);

      logArea.scrollTop = logArea.scrollHeight;
    }

    function createUI() {
      if (document.getElementById("tm-multi-input-logger")) return;

      const handler = isLocation ? populateLocation : populateSignup;
      const btnText = isLocation ? "Populate Location" : "Populate Signup";

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
      btn.textContent = btnText;
      Object.assign(btn.style, {
        padding: "4px 8px",
        fontSize: "12px",
        cursor: "pointer",
      });
      btn.addEventListener("click", () => handler(logArea));

      container.append(logArea, btn);
      document.body.appendChild(container);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createUI);
    } else {
      createUI();
    }

  })();
