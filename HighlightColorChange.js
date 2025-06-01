// ==UserScript==
// @id             highlight-mods-colored
// @name           Highlight: Multi-hack and Heat Sink Mods (Colored)
// @category       Highlighter
// @version        0.2
// @description    Highlights portals with Multi-hack (blue), Heat Sink (red), or both (purple)
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function setup() {
  window.addPortalHighlighter('Colored Multi-hack / Heat Sink Mods', function (data) {
    var mods = data.portal.options.data.mods;
    if (!mods) return;

    let hasMultiHack = false;
    let hasHeatSink = false;

    for (const mod of mods) {
      if (!mod) continue;
      if (mod.name === 'Multi-hack') hasMultiHack = true;
      if (mod.name === 'Heat Sink') hasHeatSink = true;
    }

    if (hasMultiHack && hasHeatSink) {
      // Purple: both mods present
      data.portal.setStyle({ fillColor: 'purple', fillOpacity: 0.7 });
    } else if (hasMultiHack) {
      // Blue: Multi-hack only
      data.portal.setStyle({ fillColor: 'blue', fillOpacity: 0.7 });
    } else if (hasHeatSink) {
      // Red: Heat Sink only
      data.portal.setStyle({ fillColor: 'red', fillOpacity: 0.7 });
    }
  });
}

window.plugin.highlightModsColored = {
  setup: setup
};

if (!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);

if (window.iitcLoaded) setup();

// Optional: auto-select on load
window._storedHighlight = 'Colored Multi-hack / Heat Sink Mods';
