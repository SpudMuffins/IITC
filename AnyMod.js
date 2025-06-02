// ==UserScript==
// @id             iitc-plugin-highlight-portals-with-mods
// @name           IITC plugin: Highlight Portals with Mods
// @category       Highlighter
// @version        0.4.1
// @description    [highlighter v0.4.1] Highlights portals that have one or more mods installed.
// @include        https://intel.ingress.com/intel*
// @match          https://intel.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'object') window.plugin = {};
  window.plugin.highlightModsInstalled = function () {};

  const self = window.plugin.highlightModsInstalled;

  self.highlight = function (data) {
    const d = data.portal.options.data;
    const style = {};

    if (d.mods && d.mods.some(mod => mod !== null)) {
      style.fillColor = window.COLOR_MOD;
      style.fillOpacity = 0.6;
    }

    data.portal.setStyle(style);
  };

  self.requestVisiblePortalDetails = function () {
    const bounds = window.map.getBounds();
    for (const guid in window.portals) {
      const portal = window.portals[guid];
      if (!portal) continue;
      const latlng = portal.getLatLng();
      if (bounds.contains(latlng)) {
        window.portalDetail.request(guid);
      }
    }
  };

  self.setup = function () {
    window.addPortalHighlighter('Mods Installed', self.highlight);

    window.addHook('portalDetailLoaded', function (data) {
      const portal = window.portals[data.guid];
      if (portal && window._currentHighlighter === 'Mods Installed') {
        self.highlight({ portal });
      }
    });

    window.addHook('highlighterChanged', function (name) {
      if (name === 'Mods Installed') {
        self.requestVisiblePortalDetails();

        setTimeout(() => {
          for (const guid in window.portals) {
            const portal = window.portals[guid];
            if (portal) {
              self.highlight({ portal });
            }
          }
        }, 1000);
      }
    });
  };

  const setup = self.setup;
  setup.info = plugin_info;
  if (window.iitcLoaded) {
    setup();
  } else {
    window.bootPlugins = window.bootPlugins || [];
    window.bootPlugins.push(setup);
  }
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify({
  buildName: 'highlight-portals-with-mods',
  dateTimeVersion: '2025-06-01',
  pluginId: 'highlight-portals-with-mods'
}) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
