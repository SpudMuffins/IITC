// ==UserScript==
// @id             iitc-plugin-highlight-hacksinks-ui
// @name           IITC Highlighter: Heat Sink / Multi-hack + UI
// @category       Highlighter
// @version        1.2.0
// @namespace      https://github.com/yourusername/iitc-plugins
// @description    Highlights portals with Heat Sinks (orange) or Multi-hacks (gold), with onscreen legend only when active.
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

(function() {
  'use strict';

  const HEAT_COLOR = '#FF8C00';   // orange
  const MULTI_COLOR = '#FFD700';  // gold
  const HIGHLIGHTER_NAME = 'Heat Sink / Multi-hack + UI';

  function createLegendBox() {
    let box = document.getElementById('mod-highlight-legend');
    if (!box) {
      box = document.createElement('div');
      box.id = 'mod-highlight-legend';
      box.style.position = 'fixed';
      box.style.bottom = '10px';
      box.style.left = '10px';
      box.style.background = 'rgba(0,0,0,0.8)';
      box.style.color = '#fff';
      box.style.padding = '6px 10px';
      box.style.fontSize = '12px';
      box.style.fontFamily = 'Arial, sans-serif';
      box.style.borderRadius = '5px';
      box.style.zIndex = 9999;
      document.body.appendChild(box);
    }

    box.innerHTML = `
      <b>Mod Highlighter</b><br>
      <span style="color:${HEAT_COLOR}">⬤</span> Heat Sink<br>
      <span style="color:${MULTI_COLOR}">⬤</span> Multi-hack
    `;
    box.style.display = 'block';
  }

  function removeLegendBox() {
    const box = document.getElementById('mod-highlight-legend');
    if (box) {
      box.style.display = 'none';
    }
  }

  function highlightPortal(data) {
    const portal = data.portal;
    const details = portal.options.data;
    if (!details || !details.portalV2 || !details.portalV2.mods) return;

    const mods = details.portalV2.mods;
    if (!mods || mods.length === 0) return;

    let hasHeatSink = false;
    let hasMultiHack = false;

    for (const mod of mods) {
      if (!mod || !mod.displayName) continue;
      const name = mod.displayName.toLowerCase();
      if (name.includes('heat sink')) hasHeatSink = true;
      else if (name.includes('multi-hack')) hasMultiHack = true;
    }

    if (hasHeatSink) {
      portal.setStyle({ fillColor: HEAT_COLOR, fillOpacity: 0.6 });
    } else if (hasMultiHack) {
      portal.setStyle({ fillColor: MULTI_COLOR, fillOpacity: 0.6 });
    }
  }

  function watchHighlighterChanges() {
    const originalSetHighlighter = window.setActiveHighlighter;
    window.setActiveHighlighter = function(name) {
      if (name === HIGHLIGHTER_NAME) {
        createLegendBox();
      } else {
        removeLegendBox();
      }
      return originalSetHighlighter.apply(this, arguments);
    };

    i
