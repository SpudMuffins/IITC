// ==UserScript==
// @id             highlight-mods@yourname
// @name           Highlight Portals: Heat Sink / Multi Hack
// @category       Highlighter
// @version        0.1.0
// @description    Highlights portals with Heat Sink (pink), Multi Hack (purple), or both (hatched). Hides others.
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  // Ensure plugin namespace exists
  if (typeof window.plugin !== 'function') window.plugin = function () {};
  window.plugin.highlightMods = {};

  // Color settings
  const COLOR_HEAT = 'deeppink';
  const COLOR_MULTI = 'purple';

  // Create pattern for dual-mod
  function createPattern() {
    const svg = document.querySelector('svg');
    if (!svg || document.getElementById('highlightMods-pattern')) return;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.setAttribute('id', 'highlightMods-pattern');
    defs.innerHTML = `
      <pattern id="modHatch" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4"
              style="stroke:${COLOR_MULTI}; stroke-width:2" />
      </pattern>`;
    svg.insertBefore(defs, svg.firstChild);
  }

  // Highlighter function
  function highlightPortal(data) {
    const portal = data.portal;
    const mods = portal.options?.data?.mods;

    if (!mods || mods.length === 0) {
      portal.setStyle({ fillOpacity: 0, opacity: 0 });
      return;
    }

    let hasHeat = false;
    let hasMulti = false;

    for (const mod of mods) {
      if (!mod || !mod.name) continue;
      const name = mod.name.toLowerCase();
      if (name.includes('heat')) hasHeat = true;
      if (name.includes('multi')) hasMulti = true;
    }

    if (hasHeat && hasMulti) {
      createPattern();
      const path = portal._path;
      if (path) path.setStyle({ fill: 'url(#modHatch)', opacity: 1 });
    } else if (hasHeat) {
      portal.setStyle({ fillColor: COLOR_HEAT, fillOpacity: 1, opacity: 1 });
    } else if (hasMulti) {
      portal.setStyle({ fillColor: COLOR_MULTI, fillOpacity: 1, opacity: 1 });
    } else {
      portal.setStyle({ fillOpacity: 0, opacity: 0 });
    }
  }

  // Plugin setup
  const setup = function () {
    window.addPortalHighlighter('Mods: Heat/Multi-Hack', highlightPortal);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

// Inject wrapper into page
const script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')({ "buildName": "highlight-mods", "pluginId": "highlight-mods@yourname", "dateTimeVersion": "2025-05-31" });'));
document.body.appendChild(script);
