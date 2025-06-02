// ==UserScript==
// @id             overlay-mods-installed
// @name           Overlay: Portals with Mods
// @category       Layer
// @version        0.4.0
// @description    [overlay v0.4.0] Highlight portals that have mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// @license        MIT
// @downloadURL    https://raw.githubusercontent.com/SpudMuffins/IITC/main/plugins/overlay-mods-installed.user.js
// @updateURL      https://raw.githubusercontent.com/SpudMuffins/IITC/main/plugins/overlay-mods-installed.user.js
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'object') window.plugin = {};
  window.plugin.modsOverlay = {};

  window.plugin.modsOverlay.layerGroup = new L.LayerGroup();
  window.addLayerGroup('Portals with Mods', window.plugin.modsOverlay.layerGroup, true);

  window.plugin.modsOverlay.updateOverlay = function() {
    const zoom = window.map.getZoom();
    if (zoom < 15) {
      window.plugin.modsOverlay.layerGroup.clearLayers();
      return;
    }

    window.plugin.modsOverlay.layerGroup.clearLayers();
    const bounds = window.map.getBounds();

    Object.values(window.portals).forEach(portal => {
      if (bounds.contains(portal.getLatLng())) {
        window.portalDetail.request(portal.options.guid);
      }
    });
  };

  window.plugin.modsOverlay.portalDetailLoaded = function(data) {
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

  const setup = function() {
    window.addHook('mapDataRefreshEnd', window.plugin.modsOverlay.updateOverlay);
    window.addHook('portalDetailLoaded', window.plugin.modsOverlay.portalDetailLoaded);
    window.plugin.modsOverlay.updateOverlay();
  };

  setup.info = plugin_info;

  if (window.iitcLoaded) {
    setup();
  } else {
    window.bootPlugins = window.bootPlugins || [];
    window.bootPlugins.push(setup);
  }
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify({
  pluginId: 'overlay-mods-installed',
  dateTimeVersion: '2025-06-01'
}) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
