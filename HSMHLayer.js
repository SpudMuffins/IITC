// ==UserScript==
// @id             mods-layer@yourname
// @name           Map Layer: Highlight Heat Sink or Multi Hack Portals
// @category       Layer
// @version        0.3.0
// @namespace      https://github.com/yourname/iitc-plugins
// @description    Toggleable map layer showing only portals with Heat Sink (pink), Multi Hack (purple), or both (textured).
// @include        https://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};

  window.plugin.modsLayer = function () {};

  const COLOR_HEAT = 'deeppink';
  const COLOR_MULTI = 'purple';

  let layerGroup = null;

  function createPatternDef() {
    const svgRoot = document.querySelector('svg');
    if (!svgRoot || document.getElementById('plugin-modsLayer-defs')) return;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.setAttribute('id', 'plugin-modsLayer-defs');
    defs.innerHTML = `
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" style="stroke: #c71585; stroke-width: 2" />
      </pattern>`;
    svgRoot.insertBefore(defs, svgRoot.firstChild);
  }

  function addModLayer() {
    if (layerGroup) return;

    layerGroup = new L.LayerGroup();
    window.addLayerGroup('Mods: Heat/Multi-Hack', layerGroup, true);
    createPatternDef();
  }

  function updateModLayer() {
    if (!window.map || !layerGroup) return;

    layerGroup.clearLayers();

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

      if (!hasHeat && !hasMulti) continue;

      const latlng = portal.getLatLng();
      const opts = {
        radius: 8,
        weight: 1,
        fillOpacity: 1,
        opacity: 1,
        color: '#000'
      };

      if (hasHeat && hasMulti) {
        opts.fillColor = 'url(#diagonalHatch)'; // Textured, won't work directly with Leaflet
        opts.fillOpacity = 0.6;
        opts.opacity = 0.6;
      } else if (hasHeat) {
        opts.fillColor = COLOR_HEAT;
      } else if (hasMulti) {
        opts.fillColor = COLOR_MULTI;
      }

      const marker = L.circleMarker(latlng, opts);
      marker.bindPopup(portal.getPopup().getContent());
      layerGroup.addLayer(marker);
    }
  }

  function hookPortalUpdates() {
    const origUpdatePortal = window.renderPortalDetails;
    window.renderPortalDetails = function (data) {
      setTimeout(updateModLayer, 500);
      if (origUpdatePortal) origUpdatePortal.apply(this, arguments);
    };
  }

  const setup = function () {
    addModLayer();
    updateModLayer();
    hookPortalUpdates();
    window.map.on('layeradd', updateModLayer);
    window.map.on('layerremove', updateModLayer);
    window.map.on('zoomend moveend', updateModLayer);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded && typeof setup === 'function') setup();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')({"buildName":"modsLayer","dateTime":"2025-05-31","pluginId":"mods-layer@yourname"});'));
document.body.appendChild(script);
