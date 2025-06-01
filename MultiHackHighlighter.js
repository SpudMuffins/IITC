// ==UserScript==
// @id             highlight-multihack@spudmuffins
// @name           Highlight: Multi Hack Mods (by Rarity)
// @category       Highlighter
// @version        1.0.1
// @description    Highlights portals with Multi Hack mods by rarity
// @namespace      https://github.com/SpudMuffins/IITC
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = () => {};

  window.plugin.multiHackHighlighter = {};

  // Core highlighter function
  window.plugin.multiHackHighlighter.highlight = function (data) {
    const mods = data.portal.options.data.mods;
    if (!mods) return;

    let hasCommon = false;
    let hasRare = false;
    let hasVeryRare = false;

    for (const mod of mods) {
      if (!mod?.name?.toLowerCase().includes('multi')) continue;

      const rarity = (mod.rarity || '').toLowerCase();
      if (rarity === 'common') hasCommon = true;
      else if (rarity === 'rare') hasRare = true;
      else if (rarity === 'very_rare' || rarity === 'very rare') hasVeryRare = true;
    }

    if (hasCommon || hasRare || hasVeryRare) {
      data.portal.setStyle({
        fillColor: hasVeryRare ? 'deeppink' : hasRare ? 'purple' : hasCommon ? 'green' : '#666',
        fillOpacity: 1,
        opacity: 1
      });
    } else {
      data.portal.setStyle({ fillOpacity: 0, opacity: 0 });
    }
  };

  const setup = () => {
    window.addPortalHighlighter('Multi Hack Highlighter', window.plugin.multiHackHighlighter.highlight);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({});'));
(document.body || document.head || document.documentElement).appendChild(script);
