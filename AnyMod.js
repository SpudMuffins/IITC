// ==UserScript==
// @id             highlight-portals-with-mods
// @name           IITC plugin: Highlight Portals with Mods
// @category       Highlighter
// @version        0.3
// @description    Highlight portals that have at least one mod installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function highlightPortalsWithMods(data) {
  const portalData = data.portal.options.data;

  let hasMods = false;
  if (portalData && Array.isArray(portalData.mods)) {
    hasMods = portalData.mods.some(mod => mod !== null);
  }

  const style = {};
  if (hasMods) {
    style.fillColor = window.COLOR_MOD;      // use IITC default mod color
    style.fillOpacity = 0.6;
  }

  data.portal.setStyle(style);
}

function setup() {
  window.addPortalHighlighter('Portals with Mods', highlightPortalsWithMods);
}

setup.info = {
  version: '0.3',
  description: 'Highlight portals that have mods installed',
  category: 'Highlighter',
};

if (window.plugin) {
  setup();
} else {
  window.bootPlugins = window.bootPlugins || [];
  window.bootPlugins.push(setup);
}
