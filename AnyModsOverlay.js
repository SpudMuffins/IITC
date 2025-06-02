// ==UserScript==
// @id             overlay-mods-installed
// @name           Overlay: Portals with Mods
// @category       Layer
// @version        0.2.1
// @description    [overlay v0.2.1] Highlight portals that have one or more mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

// Define the plugin
window.plugin = window.plugin || {};
window.plugin.modsOverlay = {};

window.plugin.modsOverlay.layer = new L.LayerGroup();
window.plugin.modsOverlay.portalGuidsSeen = new Set();
window.plugin.modsOverlay.MIN_ZOOM = 15;

// Add the layer to IITC
window.addLayerGroup('Portals with Mods', window.plugin.modsOverlay.layer, true);

// Add logic: when a portal detail is loaded
window.addHook('portalDetailLoaded', function (data) {
  const mods = data.details.mods;
  const guid = data.guid;

  if (!mods || !mods.some(mod => mod)) return;
  if (window.plugin.modsOverlay.portalGuidsSeen.has(guid)) return;

  const portal = window.portals[guid];
  if (!portal) return;

  const latlng = portal.getLatLng();
  const circle = L.circleMarker(latlng, {
    radius: 18,
    color: '#ff00ff',
    weight: 3,
    opacity: 0.7,
    fillOpacity: 0,
    interactive: false
  });

  window.plugin.modsOverlay.layer.addLayer(circle);
  window.plugin.modsOverlay.portalGuidsSeen.add(guid);
});

// Add logic: when map finishes loading data
window.addHook('mapDataRefreshEnd', function () {
  const zoom = window.map.getZoom();
  if (zoom < window.plugin.modsOverlay.MIN_ZOOM) {
    console.warn('[Mods Overlay] Too zoomed out to detect mods');
    window.plugin.modsOverlay.layer.clearLayers();
    window.plugin.modsOverlay.portalGuidsSeen.clear();
    return;
  }

  window.plugin.modsOverlay.layer.clearLayers();
  window.plugin.modsOverlay.portalGuidsSeen.clear();

  const bounds = window.map.getBounds();
  for (const guid in window.portals) {
    const portal = window.portals[guid];
    if (!portal) continue;

    const latlng = portal.getLatLng();
    if (bounds.contains(latlng)) {
      window.portalDetail.request(guid);
    }
  }
});
