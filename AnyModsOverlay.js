// ==UserScript==
// @id             iitc-plugin-overlay-mods-installed
// @name           IITC plugin: Overlay - Portals with Mods
// @category       Layer
// @version        0.1.1
// @description    [overlay v0.1.1] Adds a visual overlay to highlight portals with one or more mods installed.
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
    console.log('[Mods Overlay] Setup started');

    self.layerGroup = new L.LayerGroup();

    // Try to register with IITC layer chooser
    if (window.layerChooser && typeof window.layerChooser.addOverlay === 'function') {
      console.log('[Mods Overlay] Registering overlay with layerChooser');
      window.map.addLayer(self.layerGroup); // Needed before adding to chooser
      window.layerChooser.addOverlay(self.layerGroup, 'Portals with Mods');
    } else {
      console.warn('[Mods Overlay] Could not register with layerChooser – falling back');
      window.map.addLayer(self.layerGroup);
    }

    // Hook: when portal details load, check for mods
    window.addHook('portalDetailLoaded', self.onPortalDetailLoaded);

    // Hook: when map pans/zooms
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

      console.log(`[Mods Overlay] Modded portal overlay added: ${data.guid}`);
    }
  };

  self.checkVisiblePortals = function () {
    const zoom = window.map.getZoom();
    if (zoom < 15) {
      console.warn('[Mods Overlay] Zoom in to see mod overlays (level 15+ recommended)');
      return;
    }

    console.log('[Mods Overlay] Scanning visible portals...');
    self.layerGroup.clearLayers();

    const bounds = window.map.getBounds();

    for (const guid in window.portals) {
      const portal = window.portals[guid];
      if (!portal) continue;

      const latlng = portal.getLatLng();
      if (bounds.contains(latlng)) {
        window.portalDetail.request(guid);
      }
    }
  };

  const setup = self.setup;
  setup.info = plugin_info;

  // Make sure setup runs
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
