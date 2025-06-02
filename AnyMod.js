// ==UserScript==
// @id             highlight-portals-with-mods
// @name           IITC plugin: Highlight Portals with Mods
// @category       Highlighter
// @version        0.1
// @description    Highlight portals that have at least one mod installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function setup() {
  window.addPortalHighlighter('Portals with Mods', function(data) {
    const mods = data.portal.options.data.mods;
    if (mods && mods.some(mod => mod !== null)) {
      // Set fillColor to yellow for visibility
      data.portal.setStyle({ fillColor: 'yellow', fillOpacity: 0.6 });
    }
  });
}

setup.info = {
  version: '0.1',
  description: 'Highlight portals that have mods installed',
  category: 'Highlighter',
};

if (window.plugin) {
  setup();
} else {
  window.bootPlugins = window.bootPlugins || [];
  window.bootPlugins.push(setup);
}
