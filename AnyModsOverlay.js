// ==UserScript==
// @id             iitc-plugin-overlay-mods-installed
// @name           IITC plugin: Overlay - Portals with Mods
// @category       Layer
// @version        0.1.2
// @description    [overlay v0.1.2] Adds a visual overlay to highlight portals with one or more mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'object') window.plugin = {};
  window.plugin.modsOverlay = function () {};

  const self = window.plugin.modsOverlay;

  self.layerGroup = null;
  self.layerName = 'Portals with Mods';

  self.setup = function () {
    console.log('[Mods Overlay] Setup started');

    self.layerGroup = new L.LayerGroup();

    // Wait until layerChooser is available before adding overlay
    const waitForLayerChooser = () => {
      if (window.layerChooser && typeof window.layerChooser.addOverlay === 'function') {
        console.log('[Mods Overlay] Registering overlay with layerChooser');
        window.map.addLayer(self.layerGroup); // Required for visibility toggle
        window.layerChooser.addOverlay(self.layerGroup, self.layerName);
      } else {
        console.warn('[Mods Overlay] layerChooser not ready yet. Retrying...');
        setTimeout(waitForLayerChooser, 500);
      }
    };

    waitForLayerChooser();

    // Hook into portal detail loading
    window.addHook('portalDetailLoaded', self.onPortalDetailLoaded);

    // Recheck on map movement
    window.map.on('moveend', self.checkVisiblePortals);

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

      console.log(`[Mods Overlay] Added mod highlight for portal: ${data.guid}`);
    }
  };

  self.checkVisiblePortals = function () {
    const zoom = window.map.getZoom();
    if (zoom < 15) {
      console.warn('[Mods Overlay] Zoom in (15+) to detect modded portals');
      return;
    }

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

    console.log('[Mods Overlay] Checked visible portals for mods');
  };

  // IITC plugin init hook
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
