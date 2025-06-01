// ==UserScript==
// @id             highlight-any-mod@spudmuffins
// @name           Highlight: Any Mods Present
// @category       Highlighter
// @version        0.1.0
// @namespace      https://github.com/SpudMuffins/IITC
// @description    Highlights portals that have any mod installed.
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = () => {};
  window.plugin.anyModHighlighter = {};

  window.plugin.anyModHighlighter.highlight = function (data) {
    const mods = data.portal.options.data?.mods;
    if (mods && mods.some(m => m)) {
      data.portal.setStyle({
        fillColor: '#00ffff',
        fillOpacity: 0.7,
        strokeColor: '#000',
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });
    } else {
      data.portal.setStyle({
        fillOpacity: 0.1,
        strokeOpacity: 0.1,
      });
    }
  };

  const setup = function () {
    window.addPortalHighlighter('Mods: Any Present', window.plugin.anyModHighlighter.highlight);
  };

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded) setup();
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')({});'));
(document.body || document.head || document.documentElement).appendChild(script);
