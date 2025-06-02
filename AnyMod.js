// ==UserScript==
// @id             highlight-portals-with-mods
// @name           IITC plugin: Highlight Portals with Mods
// @category       Highlighter
// @version        0.2
// @description    Highlight portals that have at least one mod installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function setup() {
  window.addPortalHighlighter('Portals with Mods', function(data) {
    const portalData = data.portal.options.data;

    if (!portalData || !Array.isArray(portalData.mods)) return;

    const hasMods = portalData.mods.some(mod => mod !== null);
    console.log('Highlighting portal:', data.portal.options.guid, 'Has mods?', hasMods);

    if (hasMods) {
      data.portal.setStyle({
        fillColor: 'yellow',
        fillOpacity: 0.6,
        color: '#FFFF00'
      });
    }
  });
}

setup.info = {
  version: '0.2',
  description: 'Highlight portals that have mods installed',
  category: 'Highlighter',
};

if (window.plugin) {
  setup();
} else {
  window.bootPlugins = window.bootPlugins || [];
  window.bootPlugins.push(setup);
}
