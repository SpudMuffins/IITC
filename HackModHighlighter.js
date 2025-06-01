// ==UserScript==
// @id             highlight-mods@yourname
// @name           Highlight Portals with Heat Sink or Multi Hack
// @category       Layer
// @version        0.1.0
// @namespace      https://github.com/yourname/iitc-plugins
// @description    Highlights portals with Heat Sink (pink), Multi Hack (purple), or both (textured).
// @include        https://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};

  window.plugin.highlightMods = function () {};

  window.plugin.highlightMods.COLOR_HEAT = 'deeppink';
  window.plugin.highlightMods.COLOR_MULTI = 'purple';

  window.plugin.highlightMods.portalHighlight = function (data) {
    const mods = data.portal.options.data.mods;
    if (!mods) return;

    let hasHeat = false;
    let hasMulti = false;

    for (const mod of mods) {
      if (!mod) continue;
      const name = mod.name?.toLowerCase();
      if (!name) continue;
      if (name.includes('heat sink')) hasHeat = true;
      if (name.includes('multi-hack')) hasMulti = true;
    }

    if (hasHeat && hasMulti) {
      // Both: add striped pattern using SVG
      const path = data.portal._path;
      const patternId = 'diagonalHatch';
      const defs = document.getElementById('plugin-highlightMods-defs') || createPatternDef();
      path.setStyle({ fill: `url(#${patternId})` });
    } else if (hasHeat) {
      data.portal.setStyle({ fillColor: window.plugin.highlightMods.COLOR_HEAT, fillOpacity: 1 });
    } else if (hasMulti) {
      data.portal.setStyle({ fillColor: window.plugin.highlightMods.COLOR_MULTI, fillOpacity: 1 });
    }
  };

  function createPatternDef() {
    const svgRoot = document.querySelector('svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.setAttribute('id', 'plugin-highlightMods-defs');
    defs.innerHTML = `
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M-2,2 l4,-4
                 M0,8 l8,-8
                 M6,10 l4,-4" 
              style="stroke: #c71585; stroke-width: 2" />
      </pattern>`;
    svgRoot.insertBefore(defs, svgRoot.firstChild);
    return defs;
  }

  var setup = function () {
    window.addPortalHighlighter('Mods: Heat/Multi-Hack', window.plugin.highlightMods.portalHighlight);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded && typeof setup === 'function') setup();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')({"buildName":"highlightMods","dateTime":"2025-05-31","pluginId":"highlight-mods@yourname"});'));
document.body.appendChild(script);
