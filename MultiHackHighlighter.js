// ==UserScript==
// @id             highlight-multihack@spudmuffins
// @name           Highlight: Multi Hack Mods
// @category       Highlighter
// @version        0.1.1
// @namespace      https://github.com/SpudMuffins/IITC
// @description    Highlights portals with Multi Hack mods: Common (green), Rare (purple), Very Rare (pink). Others are dimmed.
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = () => {};
  window.plugin.multiHackHighlighter = {};

  // Colors by rarity
  const rarityColors = {
    COMMON: 'limegreen',
    RARE: 'blueviolet',
    VERY_RARE: 'deeppink',
    UNKNOWN: 'gray',
  };

  window.plugin.multiHackHighlighter.highlight = function (data) {
    const portal = data.portal;
    const mods = portal.options.data?.mods;

    if (!mods || !mods.length) {
      // Dim portals with no mods but still keep them clickable
      portal.setStyle({ fillOpacity: 0.1, strokeOpacity: 0.1 });
      return;
    }

    let foundRarity = null;

    for (const mod of mods) {
      if (!mod || !mod.name?.toLowerCase().includes('multi')) continue;
      foundRarity = mod.rarity?.toUpperCase() || 'UNKNOWN';
      break;
    }

    if (foundRarity) {
      const color = rarityColors[foundRarity] || rarityColors.UNKNOWN;
      portal.setStyle({ fillColor: color, fillOpacity: 0.7, stroke: true });
    } else {
      // If no Multi Hack, dim the portal
      portal.setStyle({ fillOpacity: 0.1, strokeOpacity: 0.1 });
    }
  };

  function setup() {
    window.addPortalHighlighter('Mods: Multi Hack (by rarity)', window.plugin.multiHackHighlighter.highlight);
  }

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({});'));
(document.body || document.head || document.documentElement).appendChild(script);
