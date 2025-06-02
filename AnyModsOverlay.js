// ==UserScript==
// @id             overlay-mods-installed
// @name           Overlay: Portals with Mods
// @category       Layer
// @version        0.3.0
// @description    [overlay v0.3.0] Clearly highlight portals that have mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

window.plugin.modsOverlay = function () {};
window.plugin.modsOverlay.layerGroup = new L.LayerGroup();
window.addLayerGroup('Portals with Mods', window.plugin.modsOverlay.layerGroup, true);

window.plugin.modsOverlay.MIN_ZOOM = 15;

window.plugin.modsOverlay.updateOverlay = function () {
  const zoom = window.map.getZoom();
  if (zoom < window.plugin.modsOverlay.MIN_ZOOM) {
    window.plugin.modsOverlay.layerGroup.clearLayers();
    return;
  }

  window.plugin.modsOverlay.layerGroup.clearLayers();
  const bounds = window.map.getBounds();

  for (const guid in window.portals) {
    const portal = window.portals[guid];
    if (bounds.contains(portal.getLatLng())) {
      window.portalDetail.request(guid);
    }
  }
};

window.plugin.modsOverlay.onPortalDetailLoaded = function (data) {
  const mods = data.details.mods;
  if (!mods || mods.every(mod => mod === null)) return;

  const portal = window.portals[data.guid];
  if (!portal) return;

  const circle = L.circleMarker(portal.getLatLng(), {
    radius: 18,
    color: '#ff00ff',
    weight: 3,
    opacity: 0.7,
    fillOpacity: 0,
    interactive: false,
  });

  window.plugin.modsOverlay.layerGroup.addLayer(circle);
};

function setup() {
  window.addHook('mapDataRefreshEnd', window.plugin.modsOverlay.updateOverlay);
  window.addHook('portalDetailLoaded', window.plugin.modsOverlay.onPortalDetailLoaded);
  window.plugin.modsOverlay.updateOverlay();
}

setup.info = { pluginId: 'overlay-mods-installed', version: '0.3.0' };

if (window.iitcLoaded) {
  setup();
} else {
  window.bootPlugins = window.bootPlugins || [];
  window.bootPlugins.push(setup);
}
