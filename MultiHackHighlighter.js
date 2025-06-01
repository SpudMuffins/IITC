// ==UserScript==
// @id             highlight-multihacks@spudmuffins
// @name           Highlight: Multi Hack Mods (by Rarity)
// @category       Highlighter
// @version        1.0.0
// @description    Highlights portals with Multi Hack mods. Common = green, Rare = purple, Very Rare = pink. Gray ring if none.
// @namespace      https://github.com/SpudMuffins/IITC
// @match          https://intel.ingress.com/*
// @include        https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};
  window.plugin.multiHackHighlighter = {};

  // Define color scheme by rarity
  const COLORS = {
    COMMON: 'limegreen',
    RARE: 'blueviolet',
    VERY_RARE: 'deeppink',
    NONE: 'gray',
  };

  function getRarityColor(rarity) {
    if (!rarity) return COLORS.NONE;
    switch (rarity.toLowerCase()) {
      case 'common': return COLORS.COMMON;
      case 'rare': return COLORS.RARE;
      case 'very rare': return COLORS.VERY_RARE;
      default: return COLORS.NONE;
    }
  }

  window.plugin.multiHackHighlighter.highlight = function (data) {
    const portal = data.portal;
    const details = portal.options.data;
    if (!details || !details.mods || !Array.isArray(details.mods)) return;

    const multiHackMods = details.mods.filter(mod => mod && mod.name?.toLowerCase().includes('multi'));

    if (multiHackMods.length === 0) {
      portal.setStyle({ color: COLORS.NONE, opacity: 0.2 });
    } else {
      // Pick highest rarity to show
      const rarityOrder = ['common', 'rare', 'very rare'];
      const rarities = multiHackMods.map(mod => mod.rarity?.toLowerCase()).filter(Boolean);
      const selectedRarity = rarities.sort((a, b) => rarityOrder.indexOf(b) - rarityOrder.indexOf(a))[0] || 'common';
      const ringColor = getRarityColor(selectedRarity);
      portal.setStyle({ color: ringColor, fillOpacity: 0.7, opacity: 1 });
    }
  };

  const setup = function () {
    window.addPortalHighlighter('Multi Hack Mods (Rarity)', window.plugin.multiHackHighlighter.highlight);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({});'));
(document.body || document.head || document.documentElement).appendChild(script);
