// ==UserScript==
// @id             hs-mh-highlight@spudmuffins
// @name           Highlight: Heat Sink / Multi Hack with Rarity
// @category       Highlighter
// @version        1.2.0
// @namespace      https://github.com/SpudMuffins/IITC
// @description    Dropdown highlight: Color-coded by mod rarity. Hides portals without Heat Sink or Multi Hack mods. Pattern for both present.
// @include        https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};

  window.plugin.modsHighlight = {};

  window.plugin.modsHighlight.RARITY_COLOR = {
    'COMMON': '#cccccc',
    'RARE': '#ff69b4',      // hot pink
    'VERY_RARE': '#800080'  // purple
  };

  window.plugin.modsHighlight.portalHighlight = function (data) {
    const portal = data.portal;
    const details = portal.options.data;
    if (!details || !Array.isArray(details.mods)) return;

    let hasHeat = null;
    let hasMulti = null;

    for (const mod of details.mods) {
      if (!mod) continue;
      const name = mod.name?.toLowerCase();
      const rarity = mod.rarity || 'COMMON';
      if (!name) continue;
      if (name.includes('heat')) hasHeat = window.plugin.modsHighlight.RARITY_COLOR[rarity] || '#cccccc';
      if (name.includes('multi')) hasMulti = window.plugin.modsHighlight.RARITY_COLOR[rarity] || '#cccccc';
    }

    if (hasHeat && hasMulti) {
      const path = portal._path;
      const patternId = 'modsHighlightPattern';
      const defs = document.getElementById('plugin-modsHighlight-defs') || window.plugin.modsHighlight.createPatternDef();
      path.setStyle({ fill: `url(#${patternId})`, opacity: 1 });
    } else if (hasHeat) {
      portal.setStyle({ fillColor: hasHeat, fillOpacity: 1, opacity: 1 });
    } else if (hasMulti) {
      portal.setStyle({ fillColor: hasMulti, fillOpacity: 1, opacity: 1 });
    } else {
      portal.setStyle({ fillOpacity: 0, opacity: 0 });
    }
  };

  window.plugin.modsHighlight.createPatternDef = function () {
    const svgRoot = document.querySelector('svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.setAttribute('id', 'plugin-modsHighlight-defs');
    defs.innerHTML = `
      <pattern id="modsHighlightPattern" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" style="stroke:#c71585; stroke-width:2" />
      </pattern>`;
    svgRoot.insertBefore(defs, svgRoot.firstChild);
    return defs;
  };

  const setup = function () {
    window.addPortalHighlighter('Mods: Heat Sink / Multi Hack (with Rarity)', window.plugin.modsHighlight.portalHighlight);
    window.plugin.modsHighlight.createPatternDef();
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({"buildName":"modsHighlight","pluginId":"hs-mh-highlight@spudmuffins","dateTime":"2025-05-31"});'));
document.body.appendChild(script);
