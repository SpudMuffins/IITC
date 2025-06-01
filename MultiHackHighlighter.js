// ==UserScript==
// @id             highlight-multihack@spudmuffins
// @name           Highlight: Multi Hack Mods
// @category       Highlighter
// @version        0.1.2
// @namespace      https://github.com/SpudMuffins/IITC
// @description    Highlights portals with Multi Hack mods: Common (green), Rare (purple), Very Rare (pink). Others are dimmed.
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};
  window.plugin.multiHackHighlighter = {};

  const rarityColors = {
    COMMON: 'limegreen',
    RARE: 'blueviolet',
    VERY_RARE: 'deeppink',
    UNKNOWN: 'gray',
  };

  window.plugin.multiHackHighlighter.highlight = function (data) {
    const portal = data.portal;
    const mods = portal.options.data?.mods || [];

    let foundRarity = null;

    for (const mod of mods) {
      if (!mod || !mod.name?.toLowerCase().includes('multi')) continue;
      foundRarity = mod.rarity?.toUpperCase() || 'UNKNOWN';
      break;
    }

    if (foundRarity) {
      const color = rarityColors[foundRarity] || rarityColors.UNKNOWN;
      portal.setStyle({
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: '#000',
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });
    } else {
      // Dim portal if no Multi Hack present, but keep it visible and clickable
      portal.setStyle({
        fillColor: '#000',
        fillOpacity: 0.1,
        strokeOpacity: 0.1,
      });
    }
  };

  const setup = function () {
    window.addPortalHighlighter('Mods: Multi Hack (by rarity)', window.plugin.multiHackHighlighter.highlight);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({});'));
(document.body || document.head || document.documentElement).appendChild(script);
