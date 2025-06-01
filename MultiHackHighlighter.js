// ==UserScript==
// @id             highlight-multihack@spudmuffins
// @name           Highlight: Multi Hack Rarity
// @category       Layer
// @version        1.0.0
// @description    Highlights portals with Multi Hack mods. Color by rarity. Gray if absent.
// @namespace      https://github.com/SpudMuffins/IITC
// @include        https://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = () => {};
  window.plugin.highlightMultiHack = {};

  const COLORS = {
    COMMON: '#32CD32',
    RARE: '#800080',
    VERY_RARE: '#FF69B4',
    NONE: '#cccccc'
  };

  const RARITY_MAP = {
    'common': COLORS.COMMON,
    'rare': COLORS.RARE,
    'very rare': COLORS.VERY_RARE
  };

  window.plugin.highlightMultiHack.portalHighlight = function (data) {
    const portal = data.portal;
    const details = portal.options.data;
    if (!details || !Array.isArray(details.mods)) return;

    let best = null;
    for (const mod of details.mods) {
      if (!mod || !mod.name || !mod.rarity) continue;
      const name = mod.name.toLowerCase();
      const rarity = mod.rarity.toLowerCase();
      if (name.includes('multi')) {
        if (!best || rarityPriority(rarity) > rarityPriority(best)) best = rarity;
      }
    }

    const color = best ? RARITY_MAP[best] : COLORS.NONE;
    data.portal.setStyle({ fillColor: color, fillOpacity: 1, opacity: 1 });
  };

  function rarityPriority(rarity) {
    return rarity === 'very rare' ? 3 : rarity === 'rare' ? 2 : rarity === 'common' ? 1 : 0;
  }

  function setup() {
    window.addPortalHighlighter('Mods: Multi Hack (Rarity)', window.plugin.highlightMultiHack.portalHighlight);
  }

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')({ "pluginId": "highlight-multihack" });'));
(document.body || document.head || document.documentElement).appendChild(script);
