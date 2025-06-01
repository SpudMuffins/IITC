// ==UserScript==
// @id             iitc-plugin-mod-type-highlighter
// @name           IITC Highlighter: Mod Type Highlighter
// @category       Highlighter
// @version        1.0.0
// @namespace      https://github.com/yourusername/iitc-plugins
// @description    Highlights portals depending on installed mod types (shields, link amps, heat sinks, etc.)
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

(function() {
  'use strict';

  function highlightPortalByMods(data) {
    const portal = data.portal;
    const details = portal.options.data;
    if (!details || !details.portalV2 || !details.portalV2.mods) return;

    const mods = details.portalV2.mods;

    // Map mod types to fixed colors
    const modColors = {
      'SHIELD': '#1E90FF',        // DodgerBlue
      'LINK_AMPLIFIER': '#32CD32',// LimeGreen
      'FORCE_AMP': '#800080',     // Purple
      'HEATSINK': '#FF8C00',      // DarkOrange
      'MULTIHACK': '#FFD700'      // Gold
    };

    // Priority order for mod colors
    const modPriority = ['SHIELD', 'LINK_AMPLIFIER', 'FORCE_AMP', 'HEATSINK', 'MULTIHACK'];

    // Identify what mod types are present
    const presentMods = mods.map(m => {
      if (!m || !m.displayName) return null;
      const name = m.displayName.toUpperCase().replace(/\s+/g, '_');
      if (modColors[name]) return name;
      return null;
    }).filter(Boolean);

    let highlightColor = null;

    // Pick first matching mod type based on priority
    for (const type of modPriority) {
      if (presentMods.includes(type)) {
        highlightColor = modColors[type];
        break;
      }
    }

    if (highlightColor) {
      data.portal.setStyle({
        fillColor: highlightColor,
        fillOpacity: 0.6
      });
    }
  }

  // Register the highlighter
  window.addPortalHighlighter('Mod Type Highlighter', highlightPortalByMods);
})();
