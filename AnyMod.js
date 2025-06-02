// ==UserScript==
// @id             iitc-plugin-highlight-portals-with-mods
// @name           Highlight Portals with Mods
// @category       Highlighter
// @version        0.1.1
// @description    Highlights portals that have one or more mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function highlightWithMods(data) {
  const d = data.portal.options.data;
  const style = {};

  if (d.mods && d.mods.some(mod => mod !== null)) {
    style.fillColor = window.COLOR_MOD;
    style.fillOpacity = 0.6;
  }

  data.portal.setStyle(style);
}

function setup() {
  window.addPortalHighlighter('Mods Installed', highlightWithMods);
}

if (window.iitcLoaded) {
  setup();
} else {
  if (typeof window.bootPlugins !== 'object') window.bootPlugins = [];
  window.bootPlugins.push(setup);
}
