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

    refreshAll: functi
