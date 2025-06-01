// ==UserScript==
// @id             hs-mh-layer@spudmuffins
// @name           Mods Layer: Heat Sink / Multi Hack
// @category       Layer
// @version        1.0.0
// @namespace      https://github.com/SpudMuffins/IITC
// @description    Toggleable map layer showing only portals with Heat Sink or Multi Hack. Color-coded, with pattern if both mods present.
// @include        https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};

  window.plugin.modsLayer = {
    layerGroup: null,
    enabled: false,

    COLOR_HEAT: 'deeppink',
    COLOR_MULTI: 'purple',

    onPortalData: function (portal) {
      if (!window.plugin.modsLayer.enabled) return;

      const data = portal.options.data;
      if (!data || !Array.isArray(data.mods)) return;

      let hasHeat = false;
      let hasMulti = false;

      for (const mod of data.mods) {
        if (!mod) continue;
        const name = mod.name?.toLowerCase();
        if (!name) continue;
        if (name.includes('heat')) hasHeat = true;
        if (name.includes('multi')) hasMulti = true;
      }

      if (hasHeat || hasMulti) {
        const color = hasHeat && hasMulti ? 'url(#modsLayerPattern)' : hasHeat ? window.plugin.modsLayer.COLOR_HEAT : window.plugin.modsLayer.COLOR_MULTI;

        const circle = L.circle(portal.getLatLng(), {
          radius: 20,
          color: hasHeat && hasMulti ? '#c71585' : color,
          fillColor: hasHeat && hasMulti ? '#c71585' : color,
          fillOpacity: 0.8,
          weight: 2
        });
        circle.addTo(window.plugin.modsLayer.layerGroup);
      }
    },

    update: function () {
      window.plugin.modsLayer.layerGroup.clearLayers();

      if (!window.plugin.modsLayer.enabled) return;

      for (const guid in window.portals) {
        const portal = window.portals[guid];
        const data = portal.options.data;
        if (!data || !Array.isArray(data.mods)) continue;

        let hasHeat = false;
        let hasMulti = false;
        for (const mod of data.mods) {
          if (!mod) continue;
          const name = mod.name?.toLowerCase();
          if (!name) continue;
          if (name.includes('heat')) hasHeat = true;
          if (name.includes('multi')) hasMulti = true;
        }

        if (hasHeat || hasMulti) {
          window.plugin.modsLayer.onPortalData(portal);
          portal.setStyle({ opacity: 1, fillOpacity: 1 });
        } else {
          portal.setStyle({ opacity: 0, fillOpacity: 0 });
        }
      }
    },

    addPattern: function () {
      const svgRoot = document.querySelector('svg');
      if (!svgRoot || document.getElementById('modsLayerPattern')) return;

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <pattern id="modsLayerPattern" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" style="stroke:#c71585; stroke-width:2" />
        </pattern>`;

      defs.setAttribute('id', 'modsLayerPatternDefs');
      svgRoot.insertBefore(defs, svgRoot.firstChild);
    },

    toggle: function (enabled) {
      window.plugin.modsLayer.enabled = enabled;
      window.plugin.modsLayer.update();
    },

    setup: function () {
      window.plugin.modsLayer.layerGroup = new L.LayerGroup();
      window.addLayerGroup('Mods: Heat/Multi-Hack', window.plugin.modsLayer.layerGroup, true);

      map.on('layeradd layerremove', function (e) {
        if (e.layer === window.plugin.modsLayer.layerGroup) {
          window.plugin.modsLayer.toggle(map.hasLayer(window.plugin.modsLayer.layerGroup));
        }
      });

      window.addHook('portalAdded', ({ portal }) => {
        if (window.plugin.modsLayer.enabled) window.plugin.modsLayer.onPortalData(portal);
      });

      window.plugin.modsLayer.addPattern();
    }
  };

  const setup = window.plugin.modsLayer.setup;
  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({"buildName":"modsLayer","pluginId":"hs-mh-layer@spudmuffins","dateTime":"2025-05-31"});'));
document.body.appendChild(script);
