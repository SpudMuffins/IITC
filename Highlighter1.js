// ==UserScript==
// @id             highlight-mods
// @name           Highlight: Multi-hack / Heat Sink Mods
// @category       Highlighter
// @version        0.1
// @description    Highlights portals with Multi-hack or Heat Sink mods
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function setup() {
  window.addPortalHighlighter('Multi-hack or Heat Sink Mods', function (data) {
    var mods = data.portal.options.data.mods;
    if (!mods) return;

    var found = mods.some(mod => mod && (mod.name === 'Multi-hack' || mod.name === 'Heat Sink'));

    if (found) {
      // Yellow fill with 70% opacity
      data.portal.setStyle({ fillColor: 'yellow', fillOpacity: 0.7 });
    }
  });
}

window.plugin.highlightMods = {
  setup: setup
};

if (!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);

if (window.iitcLoaded) setup();
