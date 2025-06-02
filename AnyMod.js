// ==UserScript==
// @id             iitc-plugin-highlight-portals-with-mods
// @name           Highlight Portals with Mods
// @category       Highlighter
// @version        0.3.0
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

function requestDetailsForVisiblePortals() {
  const bounds = window.map.getBounds();
  const zoom = window.map.getZoom();

  for (const guid in window.portals) {
    const portal = window.portals[guid];
    if (!portal) continue;

    const latlng = portal.getLatLng();
    if (bounds.contains(latlng)) {
      window.portalDetail.request(guid);
    }
  }
}

function setup() {
  // Register highlighter
  window.addPortalHighlighter('Mods Installed', highlightWithMods);

  // Highlight portals as full details are loaded
  window.addHook('portalDetailLoaded', function (data) {
    const portal = window.portals[data.guid];
    if (portal && window._currentHighlighter === 'Mods Installed') {
      highlightWithMods({ portal });
    }
  });

  // When highlighter is selected, load portal details
  const oldSetHighlighter = window.setActiveHighlighter;

  window.setActiveHighlighter = function (name) {
    oldSetHighlighter(name);
    if (name === 'Mods Installed') {
      // Trigger full data load + rehighlight
      requestDetailsForVisiblePortals();

      // Give time for detail requests to return, then re-highlight
      setTimeout(() => {
        for (const guid in window.portals) {
          const portal = window.portals[guid];
          if (portal) {
            highlightWithMods({ portal });
          }
        }
      }, 1000); // Delay to allow detail loads
    }
  };
}

if (window.iitcLoaded) {
  setup();
} else {
  window.bootPlugins = window.bootPlugins || [];
  window.bootPlugins.push(setup);
}
