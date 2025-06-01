// ==UserScript==
// @id             highlight-mod-rings@spudmuffins
// @name           Highlight Mods: Heat Sink / Multi Hack Rings
// @category       Layer
// @version        1.0.0
// @description    Shows two rings around portals to indicate presence/rarity of Heat Sink and Multi Hack mods. Gray if absent. Optional swap for ring order.
// @namespace      https://github.com/SpudMuffins/IITC
// @include        https://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = () => {};
  window.plugin.modRings = {};

  // Color by rarity
  const COLORS = {
    COMMON: '#32CD32',      // Lime Green
    RARE: '#800080',        // Purple
    VERY_RARE: '#FF69B4',   // Hot Pink
    NONE: '#cccccc'         // Light Gray
  };

  const MOD_NAMES = {
    HEAT: ['heat sink', 'heatsink'],
    MULTI: ['multi-hack', 'multihack']
  };

  const RARITY_MAP = {
    'common': COLORS.COMMON,
    'rare': COLORS.RARE,
    'very rare': COLORS.VERY_RARE
  };

  let swapRings = false; // Toggle: false = Multi (inner), Heat (outer)

  // Create circle layers
  window.plugin.modRings.portalHighlight = function (data) {
    const portal = data.portal;
    const details = portal.options.data;
    if (!details || !Array.isArray(details.mods)) return;

    let bestMulti = null;
    let bestHeat = null;

    for (const mod of details.mods) {
      if (!mod || !mod.name || !mod.rarity) continue;
      const name = mod.name.toLowerCase();
      const rarity = mod.rarity.toLowerCase();

      if (MOD_NAMES.MULTI.some(str => name.includes(str))) {
        if (!bestMulti || rarityPriority(rarity) > rarityPriority(bestMulti)) bestMulti = rarity;
      }

      if (MOD_NAMES.HEAT.some(str => name.includes(str))) {
        if (!bestHeat || rarityPriority(rarity) > rarityPriority(bestHeat)) bestHeat = rarity;
      }
    }

    const colorMulti = bestMulti ? RARITY_MAP[bestMulti] : COLORS.NONE;
    const colorHeat = bestHeat ? RARITY_MAP[bestHeat] : COLORS.NONE;

    const latlng = portal.getLatLng();
    const innerColor = swapRings ? colorHeat : colorMulti;
    const outerColor = swapRings ? colorMulti : colorHeat;

    // Draw rings — remove old if exists
    if (portal._modRings) {
      portal._modRings.forEach(r => window.map.removeLayer(r));
    }

    const ring1 = L.circle(latlng, { radius: 18, color: innerColor, fill: false, weight: 3 });
    const ring2 = L.circle(latlng, { radius: 26, color: outerColor, fill: false, weight: 3 });

    portal._modRings = [ring1, ring2];
    ring1.addTo(window.map);
    ring2.addTo(window.map);
  };

  function rarityPriority(rarity) {
    if (rarity === 'very rare') return 3;
    if (rarity === 'rare') return 2;
    if (rarity === 'common') return 1;
    return 0;
  }

  function clearModRings() {
    for (const portal of Object.values(window.portals)) {
      if (portal._modRings) {
        portal._modRings.forEach(r => window.map.removeLayer(r));
        delete portal._modRings;
      }
    }
  }

  function setup() {
    window.addPortalHighlighter('Mod Rings: Heat/Multi', window.plugin.modRings.portalHighlight);

    // Add toggle to swap ring order
    const toolbox = document.getElementById('toolbox');
    if (toolbox) {
      const label = document.createElement('label');
      label.style.marginLeft = '8px';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '4px';
      checkbox.addEventListener('change', () => {
        swapRings = checkbox.checked;
        window.resetHighlightedPortals();
      });
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode('Swap Ring Layers'));
      toolbox.appendChild(label);
    }
  }

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({ "pluginId": "highlight-mod-rings", "buildName": "modRings", "dateTimeVersion": "2025-05-31" });'));
(document.body || document.head || document.documentElement).appendChild(script);
