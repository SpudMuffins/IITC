// ==UserScript==
// @id             iitc-plugin-overlay-mods-installed
// @name           IITC plugin: Overlay - Portals with Mods
// @category       Layer
// @version        0.1.0
// @description    [overlay v0.1.0] Adds a visual overlay to highlight portals with one or more mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'object') window.plugin = {};
  window.plugin.modsOverlay = function () {};

  const self = window.plugin.modsOverlay;

  self.layerGroup = null;

  self.setup = function () {
    self.layerGroup = new L.LayerGroup();
    window.addLayerGroup('Portals with Mods', self.layerGroup, true);

    // Hook for when new portal detail is loaded
    window.addHook('portalDetailLoaded', self.onPortalDetailLoaded);

    // Hook for map movement (pan/zoom)
    window.map.on('moveend', self.checkVisiblePortals);

    // Initial scan
    self.checkVisiblePortals();
  };

  self.onPortalDetailLoaded = function (data) {
    const portal = window.portals[data.guid];
    const mods = data.details.mods;

    if (portal && mods && mods.some(m => m)) {
      const latlng = portal.getLatLng();

      const circle = L.circleMarker(latlng, {
        radius: 18,
        color: '#ff00ff',
        weight: 3,
        opacity: 0.7,
        fillOpacity: 0,
        interactive: false
      });

      self.layerGroup.addLayer(circle);
    }
  };

  self.checkVisiblePortals = function () {
    const bounds = window.map.getBounds();

    // Clear existing markers
    self.layerGroup.clearLayers();

    for (const guid in window.portals) {
      const portal = window.portals[guid];
      if (!portal) continue;

      const latlng = portal.getLatLng();
      if (bounds.contains(latlng)) {
        window.portalDetail.request(guid); // Triggers `portalDetailLoaded` later
      }
    }
  };

  const setup = self.setup;
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
