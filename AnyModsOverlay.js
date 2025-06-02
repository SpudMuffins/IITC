// ==UserScript==
// @id             iitc-plugin-overlay-mods-installed
// @name           IITC plugin: Overlay - Portals with Mods
// @category       Layer
// @version        0.2.0
// @description    [overlay v0.2.0] Adds an overlay that marks portals with one or more mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'object') window.plugin = {};
  if (!window.plugin.modsOverlay) window.plugin.modsOverlay = {};

  const plugin = window.plugin.modsOverlay;

  plugin.MOD_LAYER_NAME = 'Portals with Mods';
  plugin.MIN_ZOOM = 15;

  plugin.layer = new L.LayerGroup();
  plugin.portalGuidsSeen = new Set();

  plugin.setup = function () {
    console.log('[Mods Overlay] setup()');

    window.addLayerGroup(plugin.MOD_LAYER_NAME, plugin.layer, true);

    window.addHook('portalDetailLoaded', plugin.portalDetailLoaded);
    window.addHook('mapDataRefreshEnd', plugin.updateLayer);
    plugin.updateLayer();
  };

  plugin.portalDetailLoaded = function (data) {
    const mods = data.details.mods;
    const guid = data.guid;

    if (!mods || !mods.some(mod => mod)) return;
    if (plugin.portalGuidsSeen.has(guid)) return;

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

    plugin.layer.addLayer(circle);
    plugin.portalGuidsSeen.add(guid);
    console.log(`[Mods Overlay] Added for portal: ${guid}`);
  };

  plugin.updateLayer = function () {
    const zoom = window.map.getZoom();
    if (zoom < plugin.MIN_ZOOM) {
      console.log('[Mods Overlay] Too zoomed out');
      plugin.layer.clearLayers();
      plugin.portalGuidsSeen.clear();
      return;
    }

    plugin.layer.clearLayers();
    plugin.portalGuidsSeen.clear();

    const bounds = window.map.getBounds();
    for (const guid in window.portals) {
      const portal = window.portals[guid];
      if (!portal) continue;
      const latlng = portal.getLatLng();
      if (bounds.contains(latlng)) {
        window.portalDetail.request(guid);
      }
    }

    console.log('[Mods Overlay] Requested visible portal details');
  };

  const setup = plugin.setup;
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
  buildName: 'overlay-mods-installed',
  dateTimeVersion: '2025-06-01',
  pluginId: 'overlay-mods-installed'
}) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
