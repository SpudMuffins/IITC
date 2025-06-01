// ==UserScript==
// @id             highlight-mods@yourname
// @name           Highlight Portals: Heat Sink / Multi Hack + Rarity
// @category       Highlighter
// @version        0.2.0
// @description    Highlights portals with Heat Sink (pink), Multi Hack (purple), both (hatched). Hides others. Shows mod rarity in tooltip.
// @namespace      https://github.com/yourname/iitc-plugins
// @downloadURL    https://yourname.github.io/iitc-plugins/highlight-mods.user.js
// @updateURL      https://yourname.github.io/iitc-plugins/highlight-mods.user.js
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function () {};
  window.plugin.highlightMods = {};

  const COLOR_HEAT = 'deeppink';
  const COLOR_MULTI = 'purple';

  function createPattern() {
    const svg = document.querySelector('svg');
    if (!svg || document.getElementById('highlightMods-pattern')) return;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.setAttribute('id', 'highlightMods-pattern');
    defs.innerHTML = `
      <pattern id="modHatch" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4"
              style="stroke:${COLOR_MULTI}; stroke-width:2" />
      </pattern>`;
    svg.insertBefore(defs, svg.firstChild);
  }

  function highlightPortal(data) {
    const portal = data.portal;
    const mods = portal.options?.data?.mods;

    if (!mods || mods.length === 0) {
      portal.setStyle({ fillOpacity: 0, opacity: 0 });
      return;
    }

    let hasHeat = false;
    let hasMulti = false;
    const raritySummary = [];

    for (const mod of mods) {
      if (!mod || !mod.name) continue;
      const name = mod.name.toLowerCase();
      const rarity = mod.rarity?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN';

      if (name.includes('heat')) {
        hasHeat = true;
        raritySummary.push(`Heat Sink (${rarity})`);
      }
      if (name.includes('multi')) {
        hasMulti = true;
        raritySummary.push(`Multi Hack (${rarity})`);
      }
    }

    if (hasHeat && hasMulti) {
      createPattern();
      const path = portal._path;
      if (path) path.setStyle({ fill: 'url(#modHatch)', opacity: 1 });
    } else if (hasHeat) {
      portal.setStyle({ fillColor: COLOR_HEAT, fillOpacity: 1, opacity: 1 });
    } else if (hasMulti) {
      portal.setStyle({ fillColor: COLOR_MULTI, fillOpacity: 1, opacity: 1 });
    } else {
      portal.setStyle({ fillOpacity: 0, opacity: 0 });
      return;
    }

    // Append rarity to the tooltip
    if (raritySummary.length > 0) {
      const desc = raritySummary.join(', ');
      if (portal.options.data) {
        portal.options.data._modSummary = desc;
      }
    }
  }

  function setup() {
    window.addPortalHighlighter('Mods: Heat/Multi-Hack + Rarity', highlightPortal);

    // Hook into portal details to show rarity summary
    const origFunc = window.renderPortalDetails;
    window.renderPortalDetails = function (guid) {
      origFunc(guid);
      const portal = window.portals[guid];
      const modSummary = portal?.options?.data?._modSummary;
      if (modSummary) {
        const infoBox = document.getElementById('portaldetails');
        if (infoBox) {
          const summaryNode = document.createElement('div');
          summaryNode.style.marginTop = '4px';
          summaryNode.style.color = '#999';
          summaryNode.textContent = 'Mods: ' + modSummary;
          infoBox.appendChild(summaryNode);
        }
      }
    };
  }

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')({ "buildName": "highlight-mods", "pluginId": "highlight-mods@yourname", "dateTimeVersion": "2025-05-31" });'));
document.body.appendChild(script);
