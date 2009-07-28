var siriusplayer = {

  onLoad: function()
  {
    siriusplayer.hiddenWindow = Components.classes["@mozilla.org/appshell/appShellService;1"].getService(Components.interfaces.nsIAppShellService).hiddenDOMWindow;
    if (!siriusplayer.hiddenWindow.siriusplayer) siriusplayer.hiddenWindow.Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://siriusplayer/content/controller.js");
    siriusplayer.player = siriusplayer.hiddenWindow.siriusplayer;
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    siriusplayer.prefs = prefService.getBranch("extensions.siriusplayer.");
    siriusplayer.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    siriusplayer.prefs.addObserver("", siriusplayer, false);
    siriusplayer.presetsTree = document.getElementById('siriusplayer-sidebar-presets-tree');
    siriusplayer.presetsTree.view = siriusplayer.treeViewPresets;
    siriusplayer.allTree = document.getElementById('siriusplayer-sidebar-all-tree');
    siriusplayer.allTree.view = siriusplayer.treeViewAll;
    siriusplayer.tickInterval = setInterval(siriusplayer.tick, 1000);
    siriusplayer.tick();

    document.getElementById("siriusplayer-sidebar-legalnotagree").hidden = 1;
    document.getElementById("siriusplayer-sidebar-loggedout").hidden = 1;
    document.getElementById("siriusplayer-sidebar-loggingin").hidden = 1;
    document.getElementById("siriusplayer-sidebar-badauth").hidden = 1;
    document.getElementById("siriusplayer-sidebar-area").hidden = 1;
  },

  openTab: function(url)
  {
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                           .getInterface(Components.interfaces.nsIWebNavigation)
                           .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                           .rootTreeItem
                           .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                           .getInterface(Components.interfaces.nsIDOMWindow);
    mainWindow.getBrowser().selectedTab = mainWindow.getBrowser().addTab(url);
  },

  treeViewPresets: {
    get rowCount() {
      return siriusplayer.player.presetsIndex.length;
    },

    getCellText: function(row, column)
    {
      return siriusplayer.player.trackerData[siriusplayer.player.presetsIndex[row]][column.id];
    },

    setTree: function(treebox)
    {
      this.treebox = treebox;
    },

    isContainer: function(row)
    {
      return false;
    },

    isSeparator: function(row)
    {
      return false;
    },

    isSorted: function()
    {
      return false;
    },

    getLevel: function(row)
    {
      return 0;
    },

    getImageSrc: function(row, col)
    {
      return null;
    },

    getRowProperties: function(row, props)
    {
      var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);

      if (siriusplayer.player.channel == siriusplayer.player.trackerData[siriusplayer.player.presetsIndex[row]].channelNumber)
      {
        props.AppendElement(atomService.getAtom('playing'));
      }

      if (siriusplayer.player.trackerData[siriusplayer.player.presetsIndex[row]]['updated'])
      {
        props.AppendElement(atomService.getAtom('updated'));
      }
    },

    getCellProperties: function(row, col, props)
    {
      var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);

      if (siriusplayer.player.channel == siriusplayer.player.trackerData[siriusplayer.player.presetsIndex[row]].channelNumber)
      {
        props.AppendElement(atomService.getAtom('playing'));
      }

      if (siriusplayer.player.trackerData[siriusplayer.player.presetsIndex[row]]['updated'])
      {
        props.AppendElement(atomService.getAtom('updated'));
      }
    },

    getColumnProperties: function(colid, col, props)
    {
    },
  },

  treeViewAll: {
    get rowCount()
    {
      if (!siriusplayer.player.channelIndex || !siriusplayer.player.channelIndex.length)
      {
        window.close();
      }
      var count = siriusplayer.player.channelIndex.length;
      return count;
    },

    getCellText: function(row, column)
    {
      return siriusplayer.player.trackerData[siriusplayer.player.channelIndex[row]][column.id];
    },

    setTree: function(treebox)
    {
      this.treebox = treebox;
    },

    isContainer: function(row)
    {
      return false;
    },

    isSeparator: function(row)
    {
      return false;
    },

    isSorted: function()
    {
      return false;
    },

    getLevel: function(row)
    {
      return 0;
    },

    getImageSrc: function(row, col)
    {
      return null;
    },

    getRowProperties: function(row, props)
    {
      var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);

      if (siriusplayer.player.channel == siriusplayer.player.trackerData[siriusplayer.player.channelIndex[row]].channelNumber)
      {
        props.AppendElement(atomService.getAtom('playing'));
      }

      if (siriusplayer.player.trackerData[siriusplayer.player.channelIndex[row]]['updated'])
      {
        props.AppendElement(atomService.getAtom('updated'));
      }
    },

    getCellProperties: function(row, col, props)
    {
      var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);

      if (siriusplayer.player.channel == siriusplayer.player.trackerData[siriusplayer.player.channelIndex[row]].channelNumber)
      {
        props.AppendElement(atomService.getAtom('playing'));
      }

      if (siriusplayer.player.trackerData[siriusplayer.player.channelIndex[row]]['updated'])
      {
        props.AppendElement(atomService.getAtom('updated'));
      }
    },

    getColumnProperties: function(colid, col, props)
    {
    },
  },

  observe: function(subject, topic, pref)
  {
    if (topic != "nsPref:changed") return;

    switch (pref)
    {
      case "authtrigger":
        document.location.href = document.location.href;
        break;

      case "legalagree":
        document.location.href = document.location.href;
        break;
    }
  },

  tick: function()
  {
    if (siriusplayer.player.legalagree())
    {
      if (siriusplayer.player.authbad)
      {
        document.getElementById("siriusplayer-sidebar-badauth").hidden = 0;
        document.getElementById("siriusplayer-sidebar-badauth-reason").value = siriusplayer.player.authbad;
        return true;
      }
      else if (!siriusplayer.player.wantlogin)
      {
        document.getElementById("siriusplayer-sidebar-loggedout").hidden = 0;
        return true;
      }
      else
      {
        if (siriusplayer.player.authok)
        {
          document.getElementById("siriusplayer-sidebar-area").hidden = 0;
        }
        else
        {
          document.getElementById("siriusplayer-sidebar-loggingin").hidden = 0;
          return true;
        }
      }
    }
    else
    {
      document.getElementById("siriusplayer-sidebar-legalnotagree").hidden = 0;
      return true;
    }

    if (siriusplayer.player.isPlaying)
    {
      document.getElementById("siriusplayer-sidebar-stopbutton").hidden = 0;
      document.getElementById("siriusplayer-sidebar-playbutton").hidden = 1;
    }
    else
    {
      document.getElementById("siriusplayer-sidebar-stopbutton").hidden = 1;
      document.getElementById("siriusplayer-sidebar-playbutton").hidden = 0;
    }

    if (siriusplayer.treeViewPresets && siriusplayer.treeViewPresets.treebox) siriusplayer.treeViewPresets.treebox.invalidate();
    if (siriusplayer.treeViewAll && siriusplayer.treeViewAll.treebox) siriusplayer.treeViewAll.treebox.invalidate();

    if (siriusplayer.player.presetsIndex.length)
    {
      document.getElementById("siriusplayer-sidebar-presets-tree").hidden = 0;
      document.getElementById("siriusplayer-sidebar-treesplitter").hidden = 0;
    }
    else
    {
      document.getElementById("siriusplayer-sidebar-presets-tree").hidden = 1;
      document.getElementById("siriusplayer-sidebar-treesplitter").hidden = 1;
    }

    var channel = siriusplayer.player.trackerData[siriusplayer.player.channel];

    if (channel)
    {
      document.getElementById("siriusplayer-sidebar-channellabel").value = channel.channelName;
      document.getElementById("siriusplayer-sidebar-titlelabel").value = channel.song;
      document.getElementById("siriusplayer-sidebar-artistlabel").value = "by " + channel.artist;
    }

    var amazon = siriusplayer.player.amazonData || new Object;

    if (amazon.asin)
    {
      document.getElementById("siriusplayer-sidebar-image").src = amazon.images.medium;
      document.getElementById("siriusplayer-sidebar-image").href = amazon.url || '';
      document.getElementById("siriusplayer-sidebar-image").hidden = 0;
      document.getElementById("siriusplayer-sidebar-buylink").value = "Buy MP3 " + amazon.type + " for " + amazon.price;
      document.getElementById("siriusplayer-sidebar-buylink").href = amazon.url || '';
      document.getElementById("siriusplayer-sidebar-buylink").hidden = 0;
    }
    else
    {
      document.getElementById("siriusplayer-sidebar-image").src = "";
      document.getElementById("siriusplayer-sidebar-image").hidden = 1;
      document.getElementById("siriusplayer-sidebar-buylink").value = "";
      document.getElementById("siriusplayer-sidebar-buylink").hidden = 1;
    }
  },

  dblclickedpreset: function()
  {
    var row = siriusplayer.player.trackerData[siriusplayer.player.presetsIndex[siriusplayer.presetsTree.currentIndex]];
    siriusplayer.player.play(row.channelNumber);
  },

  dblclickedall: function()
  {
    var row = siriusplayer.player.trackerData[siriusplayer.player.channelIndex[siriusplayer.allTree.currentIndex]];
    siriusplayer.player.play(row.channelNumber);
  },

  selectedpreset: function()
  {
  },

  selectedall: function()
  {
  },

  blurpresets: function()
  {
    siriusplayer.treeViewPresets.treebox.view.selection.clearSelection();
  },

  blurall: function()
  {
    siriusplayer.treeViewAll.treebox.view.selection.clearSelection();
  },

  sortNumOrdA: function(a, b)
  {
    return (a-b);
  },

  presetRemoveRow: function()
  {
    var row = siriusplayer.player.trackerData[siriusplayer.player.presetsIndex[siriusplayer.presetsTree.currentIndex]];
    var presets = siriusplayer.prefs.getCharPref("presets").split(/,/);
    var presetkeep = new Array();
    for (var i=0; i<presets.length; i++)
    {
      var value = presets[i];
      if (value != row.channelNumber) presetkeep.push(value);
    }
    var newpreset = presetkeep.sort(siriusplayer.sortNumOrdA).join(',');
    newpreset = newpreset.replace(/^,/, '');
    siriusplayer.prefs.setCharPref("presets", newpreset);
    siriusplayer.treeViewPresets.treebox.rowCountChanged(0, -presets.length);
    siriusplayer.treeViewPresets.treebox.rowCountChanged(0, presetkeep.length);
  },

  presetAddRow: function()
  {
    var row = siriusplayer.player.trackerData[siriusplayer.player.channelIndex[siriusplayer.allTree.currentIndex]];
    var presets = siriusplayer.prefs.getCharPref("presets").split(/,/);
    var presetkeep = new Array();
    for (var i=0; i<presets.length; i++)
    {
      var value = presets[i];
      if (value != row.channelNumber) presetkeep.push(value);
    }
    presetkeep.push(row.channelNumber);
    var newpreset = presetkeep.sort(siriusplayer.sortNumOrdA).join(',');
    newpreset = newpreset.replace(/^,/, '');
    siriusplayer.prefs.setCharPref("presets", newpreset);
    siriusplayer.treeViewPresets.treebox.rowCountChanged(0, -presets.length);
    siriusplayer.treeViewPresets.treebox.rowCountChanged(0, presetkeep.length);
  },

};
