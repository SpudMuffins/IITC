// ==UserScript==
// @id             mod-finder-layer@spudmuffins
// @name           Modded Portals Layer
// @category       Layer
// @version        1.0.0
// @namespace      https://github.com/SpudMuffins/IITC
// @description    Highlights portals that have any mod installed
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};

  window.plugin.moddedPortals = {
    layerGroup: null,

    setup: function () {
      this.layerGroup = new L.LayerGroup();
      window.addLayerGroup('Modded Portals', this.layerGroup, true);

      // Hook into portalAdded
      window.addHook('portalAdded', function (obj) {
        const data = obj.portal.options.data;
        if (!data || !Array.isArray(data.mods)) return;

        const hasMod = data.mods.some(mod => mod !== null);
        if (hasMod) {
          const circle = L.circle(obj.portal.getLatLng(), {
            radius: 20,
            color: 'orange',
            fillColor: 'orange',
            fillOpacity: 0.5,
            weight: 2,
            interactive: false,
          });
          circle.addTo(window.plugin.moddedPortals.layerGroup);
        }
      });

      // Recheck all portals when toggled
      window.addHook('mapDataRefreshEnd', this.refreshAll);
    },

    refreshAll: function () {
      const layer = window.plugin.moddedPortals.layerGroup;
      if (!layer) return;

      layer.clearLayers();

      for (const guid in window.portals) {
        const portal = window.portals[guid];
        const data = portal.options.data;
        if (!data || !Array.isArray(data.mods)) continue;

        const hasMod = data.mods.some(mod => mod !== null);
        if (hasMod) {
          const circle = L.circle(portal.getLatLng(), {
            radius: 20,
            color: 'orange',
            fillColor: 'orange',
            fillOpacity: 0.5,
            weight: 2,
            interactive: false,
          });
          circle.addTo(layer);
        }
      }
    }
  };

  const setup = window.plugin.moddedPortals.setup.bind(window.plugin.moddedPortals);
  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify({
  buildName: 'moddedPortals',
  pluginId: 'mod-finder-layer@spudmuffins',
  dateTimeVersion: '2025-05-31'
}) + ');'));
document.body.appendChild(script);
