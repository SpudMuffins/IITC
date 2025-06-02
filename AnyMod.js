// ==UserScript==
// @id             iitc-plugin-highlight-portals-with-mods
// @name           Highlight Portals with Mods
// @category       Highlighter
// @version        0.2.0
// @description    Highlights portals with one or more mods installed.
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
  // Register the highlighter
  window.addPortalHighlighter('Mods Installed', highlightWithMods);

  // Listen for full portal detail load and re-highlight the updated portal
  window.addHook('portalDetailsUpdated', function (e) {
    const portal = window.portals[e.guid];
    if (portal && window._currentHighlighter === 'Mods Installed') {
      highlightWithMods({ portal });
    }
  });
}

if (window.iitcLoaded) {
  setup();
} else {
  window.bootPlugins = window.bootPlugins || [];
  window.bootPlugins.push(setup);
}
