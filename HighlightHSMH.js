// ==UserScript==
// @id             highlight-hsmh@custom
// @name           Highlight: Heat Sink / Multi Hack Mods
// @category       Highlighter
// @version        1.0.0
// @description    Highlights portals with Heat Sink or Multi Hack mods. Hides all others. Heat Sink = pink, Multi Hack = purple, both = diagonal hatch.
// @match          https://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  // Plugin namespace
  window.plugin = window.plugin || {};
  window.plugin.highlightHSMH = {};

  const COLORS = {
    heat: 'deeppink',
    multi: 'purple'
  };

  const RARITY_MAP = {
    common: '',
    rare: '',
    very_rare: ''
  };

  function createHatchPattern() {
    const svgRoot = document.querySelector('svg');
    if (!svgRoot) return;

    if (!document.getElementById('plugin-highlightHSMH-defs')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.setAttribute('id', 'plugin-highlightHSMH-defs');
      defs.innerHTML = `
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" 
                style="stroke: #c71585; stroke-width: 2" />
        </pattern>
      `;
      svgRoot.insertBefore(defs, svgRoot.firstChild);
    }
  }

  window.plugin.highlightHSMH.portalHighlight = function (data) {
    const portalData = data.portal.options.data;
    if (!portalData || !Array.isArray(portalData.mods)) return;

    let hasHeat = false;
    let hasMulti = false;

    for (const mod of portalData.mods) {
      if (!mod || !mod.name) continue;
      const name = mod.name.toLowerCase();
      const rarity = mod.rarity?.toLowerCase() || 'unknown';

      if (name.includes('heat')) hasHeat = true;
      if (name.includes('multi')) hasMulti = true;
    }

    if (hasHeat && hasMulti) {
      createHatchPattern();
      data.portal._path.setStyle({
        fill: 'url(#diagonalHatch)',
        fillOpacity: 1,
        opacity: 1
      });
    } else if (hasHeat) {
      data.portal.setStyle({
        fillColor: COLORS.heat,
        fillOpacity: 1,
        opacity: 1
      });
    } else if (hasMulti) {
      data.portal.setStyle({
        fillColor: COLORS.multi,
        fillOpacity: 1,
        opacity: 1
      });
    } else {
      data.portal.setStyle({ fillOpacity: 0, opacity: 0 });
    }
  };

  const setup = () => {
    window.addPortalHighlighter('Mods: Heat/Multi-Hack', window.plugin.highlightHSMH.portalHighlight);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

// Inject the script into the page
const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({});'));
(document.body || document.head || document.documentElement).appendChild(script);
