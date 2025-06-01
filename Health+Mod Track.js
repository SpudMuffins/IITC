// ==UserScript==
// @id             iitc-plugin-onscreen-mod-highlight
// @name           IITC Plugin: Onscreen Portal Details + Mod Highlight
// @category       Info
// @version        1.0.0
// @namespace      https://github.com/yourusername
// @updateURL      https://your-update-url-if-any
// @downloadURL    https://your-download-url-if-any
// @description    Show portal details onscreen and highlight portals based on installed mod types with fixed colors.
// @match          https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

(function() {
  'use strict';

  // Wait for IITC to be ready
  function setup() {
    if (!window.plugin) window.plugin = {};

    // Create plugin namespace
    window.plugin.onscreenModHighlight = {};

    const plugin = window.plugin.onscreenModHighlight;

    // Map mod types to colors (fixed)
    plugin.modColors = {
      'SHIELD': '#1E90FF',      // DodgerBlue
      'LINK_AMPLIFIER': '#32CD32', // LimeGreen
      'FORCE_AMP': '#800080',   // Purple
      'HEATSINK': '#FF8C00',    // DarkOrange
      'MULTIHACK': '#FFD700'    // Gold
    };

    // Priority of mods to pick color when multiple are present
    plugin.modPriority = ['SHIELD', 'LINK_AMPLIFIER', 'FORCE_AMP', 'HEATSINK', 'MULTIHACK'];

    // Create the onscreen portal details container
    plugin.createDetailsDiv = function() {
      if (plugin.detailsDiv) return;

      plugin.detailsDiv = document.createElement('div');
      plugin.detailsDiv.id = 'plugin-onscreen-mod-highlight-details';
      plugin.detailsDiv.style.position = 'fixed';
      plugin.detailsDiv.style.bottom = '10px';
      plugin.detailsDiv.style.left = '10px';
      plugin.detailsDiv.style.maxWidth = '300px';
      plugin.detailsDiv.style.padding = '6px 10px';
      plugin.detailsDiv.style.background = 'rgba(0,0,0,0.8)';
      plugin.detailsDiv.style.color = 'white';
      plugin.detailsDiv.style.fontSize = '12px';
      plugin.detailsDiv.style.fontFamily = 'Arial, sans-serif';
      plugin.detailsDiv.style.zIndex = 9999;
      plugin.detailsDiv.style.pointerEvents = 'none';
      plugin.detailsDiv.style.borderRadius = '5px';

      document.body.appendChild(plugin.detailsDiv);
    };

    // Function to get a short mod name
    plugin.getModShortName = function(modName) {
      switch(modName) {
        case 'Shield': return 'SH';
        case 'Link Amp': return 'LA';
        case 'Force Amp': return 'FA';
        case 'Heat Sink': return 'HS';
        case 'Multi-hack': return 'MH';
        default: return modName.substring(0,2).toUpperCase();
      }
    };

    // Function to update onscreen details
    plugin.updateDetails = function(data) {
      if (!plugin.detailsDiv) plugin.createDetailsDiv();

      if (!data || !data.portalDetails) {
        plugin.detailsDiv.innerHTML = '<i>No portal selected</i>';
        return;
      }

      const pd = data.portalDetails;
      const mods = pd.mods || [];
      const resonators = pd.resonators || [];

      let html = '<b>Portal Details</b><br>';

      // Resonators info
      html += 'Resonators:<br>';
      resonators.forEach((res, idx) => {
        if (!res) return;
        const level = res.level || '?';
        const owner = res.owner || 'Unknown';
        html += `L${level} - ${owner}<br>`;
      });

      // Mods info
      html += '<br>Mods:<br>';
      mods.forEach(mod => {
        if (!mod) return;
        const name = mod.displayName || 'Unknown';
        const rarity = mod.rarity || '';
        const shortName = plugin.getModShortName(name);
        html += `${shortName} (${rarity})<br>`;
      });

      plugin.detailsDiv.innerHTML = html;
    };

    // Helper: determine portal highlight color by mods
    plugin.getHighlightColor = function(portal) {
      if (!portal || !portal.options || !portal.options.data || !portal.options.data.portalV2) return null;
      const mods = portal.options.data.portalV2.mods || [];
      if (!mods.length) return null;

      // Collect mod types present (uppercase, no spaces, underscores)
      let modTypes = mods.map(m => {
        if (!m) return null;
        if (m.displayName) {
          switch(m.displayName) {
            case 'Shield': return 'SHIELD';
            case 'Link Amp': return 'LINK_AMPLIFIER';
            case 'Force Amp': return 'FORCE_AMP';
            case 'Heat Sink': return 'HEATSINK';
            case 'Multi-hack': return 'MULTIHACK';
            default: return null;
          }
        }
        return null;
      }).filter(x => x);

      // Pick highest priority mod color present
      for (const modType of plugin.modPriority) {
        if (modTypes.includes(modType)) {
          return plugin.modColors[modType];
        }
      }

      return null;
    };

    // Add a layer to highlight portals by mod type
    plugin.highlightByMods = function() {
      if (plugin.modHighlighter) {
        window.removeLayerGroup(plugin.modHighlighter);
        plugin.modHighlighter = null;
      }

      const group = L.layerGroup();

      window.portalsLayer.eachLayer(portal => {
        const color = plugin.getHighlightColor(portal);
        if (color) {
          // Draw a circle around the portal
          const circle = L.circle(portal.getLatLng(), {
            radius: 25, // radius in meters, adjust if needed
            color: color,
            weight: 3,
            fillColor: color,
            fillOpacity: 0.3,
            interactive: false,
          });
          circle.addTo(group);
        }
      });

      plugin.modHighlighter = group;
      plugin.modHighlighter.addTo(window.map);
    };

    // Update on portal select
    plugin.onPortalDetailsUpdated = function(data) {
      plugin.updateDetails(data);
      plugin.highlightByMods();
    };

    // Register hook to portal detail update event
    window.addHook('portalDetailsUpdated', plugin.onPortalDetailsUpdated);

    // Init details div immediately
    plugin.createDetailsDiv();
  }

  // Wait for IITC to be fully loaded
  function waitForIITC() {
    if(window.map && window.addHook) {
      setup();
    } else {
      setTimeout(waitForIITC, 500);
    }
  }

  waitForIITC();
})();
