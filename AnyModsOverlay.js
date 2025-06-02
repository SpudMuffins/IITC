// ==UserScript==
// @id             iitc-plugin-overlay-mods-installed
// @name           IITC plugin: Overlay - Portals with Mods
// @category       Layer
// @version        0.1.3
// @description    [overlay v0.1.3] Adds a visual overlay to highlight portals with one or more mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'object') window.plugin = {};
  if (!window.plugin.modsOverlay) window.plugin.modsOverlay = {};

  const plugin = window.plugin.modsOverlay;

  // LayerGroup that will hold our mod markers
  plugin.layerGroup = new L.LayerGroup();

  // Add to IITC's layer control
  window.addLayerGroup('Portals with Mods', plugin.layerGroup, true);

  // Highlight portals with mods when portal details are loaded
  plugin.onPortalDetailLoaded = function (data) {
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

      plugin.layerGroup.addLayer(circle);
      console.log(`[Mods Overlay] Added overlay for portal: ${data.guid}`);
    }
  };

  // Request details for all visible portals
  plugin.checkVisiblePortals = function () {
    const zoom = window.map.getZoom();
    if (zoom < 15) {
      console.warn('[Mods Overlay] Zoom in to see modded portals (L15+)');
      return;
    }

    plugin.layerGroup.clearLayers();

    const bounds = window.map.getBounds();

    for (const guid in window.portals) {
      const portal = window.portals[guid];
      if (!portal) continue;

      const latlng = portal.getLatLng();
      if (bounds.contains(latlng)) {
        window.portalDetail.request(guid);
      }
    }

    console.log('[Mods Overlay] Requested visible portals for mod check');
  };

  // Setup all hooks
  function setup() {
    console.log('[Mods Overlay] Setup running');
    window.addHook('portalDetailLoaded', plugin.onPortalDetailLoaded);
    window.map.on('moveend', plugin.checkVisiblePortals);
    plugin.checkVisiblePortals();
  }

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
