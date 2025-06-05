// ==UserScript==
// @name         Toggle Highlight Elements data-test-id
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Toggle highlighting of elements with data-test-id or data-testid via a floating button
// @author       Paul Montgomery
// @match        *://*/*
// @grant        none
// ==/UserScript==

// PUT THIS INTO 'tamper monkey' in your browser
// https://www.tampermonkey.net/


(function () {
    'use strict';

    // Arrays to keep track of what was added so that they can be deleted when needed
    let highlightedElements = [];
    let labelNodes = [];
    let isActive = false;

    
    function createFloatingToggleButton() {
        const btn = document.createElement('button');
        btn.innerText = 'Toggle Highlights';
        btn.id = 'tm-highlight-toggle';
        Object.assign(btn.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: '99999',
            padding: '8px 12px',
            backgroundColor: '#f00',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            opacity: '0.7',
        });
        btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
        btn.addEventListener('mouseleave', () => btn.style.opacity = '0.7');
        btn.addEventListener('click', toggleHighlights);
        document.body.appendChild(btn);
    }

    function highlightElements() {
        const attributesToCheck = ['data-test-id', 'data-testid'];  // YOU could change to look for 'aria-label' or whatever
        const elements = document.querySelectorAll('*');

        elements.forEach(element => {
            for (const attr of attributesToCheck) {
                if (element.hasAttribute(attr)) {
                    const attrValue = element.getAttribute(attr);
                    if (!attrValue) continue;

                    // Apply red outline and create and position the label
                    element.style.outline = '2px solid red';
                    element.style.outlineOffset = '2px';
                    highlightedElements.push(element);

                    const rect = element.getBoundingClientRect();
                    const label = document.createElement('div');
                    label.innerText = `${attr}: ${attrValue}`;
                    Object.assign(label.style, {
                        position: 'absolute',
                        left: `${window.scrollX + rect.left}px`,
                        top: `${window.scrollY + rect.top - 20}px`,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid red',
                        color: 'black',
                        fontSize: '12px',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        zIndex: '99998',
                    });
                    document.body.appendChild(label);
                    labelNodes.push(label);

                    break; // 
                }
            }
        });
    }

    function clearHighlights() {
        // ZAP!
        highlightedElements.forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
        });
        labelNodes.forEach(label => label.remove());

        highlightedElements = [];
        labelNodes = [];
    }

    function toggleHighlights() {
        if (!isActive) {
            highlightElements();
            isActive = true;
            document.getElementById('tm-highlight-toggle').innerText = 'Clear Highlights';
        } else {
            clearHighlights();
            isActive = false;
            document.getElementById('tm-highlight-toggle').innerText = 'Toggle Highlights';
        }
    }

    function init() {
        createFloatingToggleButton();
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
