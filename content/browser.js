/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is SIRIUS Player.
 *
 * The Initial Developer of the Original Code is
 * Dusty Wilson.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var siriusplayer = {

  onLoad: function()
  {
    siriusplayer.hiddenWindow = Components.classes["@mozilla.org/appshell/appShellService;1"].getService(Components.interfaces.nsIAppShellService).hiddenDOMWindow;
    if (!siriusplayer.hiddenWindow.siriusplayer) siriusplayer.hiddenWindow.Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://siriusplayer/content/controller.js");
    siriusplayer.player = siriusplayer.hiddenWindow.siriusplayer;
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

  buildMenu: function()
  {
    return true;
  },

};

window.addEventListener("load", function(e) { siriusplayer.onLoad(e); }, false);

// END INIT

/*

function siriusplayer_initPresets()
{
  try
  {
    var presetPrefs = prefManager.getBranch("extensions.siriusplayer.preset");
    var presets = presetPrefs.getChildList("", {});
    for (n in presets)
    {
      try
      {
        var preset = presets[n];
        var value = presetPrefs.getCharPref(preset);
        document.getElementById("SiriusPlayer-Preset-" + preset).setAttribute("label", preset + " - " + value);
        document.getElementById("SiriusPlayer-Preset-" + preset).setAttribute("data", value);
      }
      catch(e)
      {
        //alert(e);
      }
    }
  }
  catch(e)
  {
    alert(e);
  }
}


function siriusplayer_initCountry()
{
  siriusplayer_setCountry();
}

function siriusplayer_setCountry(countryCode)
{
  if (countryCode)
  {
    prefManager.setCharPref("extensions.siriusplayer.country", countryCode);
  }
  else
  {
    countryCode = prefManager.getCharPref("extensions.siriusplayer.country");
  }
  document.getElementById("SiriusPlayer-Country-" + countryCode).setAttribute("checked", true);
  return true;
}



function siriusplayer_initQuality()
{
  siriusplayer_setQuality();
}

function siriusplayer_setQuality(quality)
{
  if (quality)
  {
    quality = player.setQuality(quality);
    prefManager.setCharPref("extensions.siriusplayer.quality", quality);
  }
  else
  {
    quality = prefManager.getCharPref("extensions.siriusplayer.quality");
  }
  document.getElementById("SiriusPlayer-Quality-" + quality).setAttribute("checked", true);
  return true;
}



function siriusplayer_initOptions()
{
  siriusplayer_setShowChannelInMenuLabel();
}

function siriusplayer_setShowChannelInMenuLabel(action)
{
  var bool = prefManager.getBoolPref("extensions.siriusplayer.showChannelInMenuLabel");

  if (action)
  {
    bool = !bool;
    prefManager.setBoolPref("extensions.siriusplayer.showChannelInMenuLabel", bool);
  }
  document.getElementById("SiriusPlayer-ShowChannelInMenuLabel").setAttribute("checked", bool);
  siriusplayer_initChannel();

  return true;
}



function siriusplayer_initChannel()
{
  siriusplayer_setChannel();
}

function siriusplayer_setChannel(channel)
{
  if (channel === 0)
  {
    channel = "STOPPED";
  }

  if (channel)
  {
    prefManager.setCharPref("extensions.siriusplayer.channel", channel);
    if (channel == "STOPPED")
    {
      player.setChannel();
    }
    else
    {
      player.setChannel(channel);
    }
  }
  else
  {
    channel = prefManager.getCharPref("extensions.siriusplayer.channel");
  }

  document.getElementById("SiriusPlayer-Menu-SelectedChannel").setAttribute("label", channel);

  var label = "";
  if (prefManager.getBoolPref("extensions.siriusplayer.showChannelInMenuLabel"))
  {
    label = " - " + channel;
  }

  document.getElementById("SiriusPlayer-Menu-SelectedChannel-Logo").setAttribute("channel", channel);
  document.getElementById("SiriusPlayer-Menu-SelectedChannel").setAttribute("channel", channel);
  document.getElementById("SiriusPlayer-Menu-Stop").setAttribute("channel", channel);

  document.getElementById("menu_SiriusPlayer-Label").setAttribute("label", "SIRIUS" + label);

  document.getElementById("SiriusPlayer-Menu-SelectedChannel-Logo").style.backgroundImage = "url(" + player.getChannelLogo() + ")";

  return channel;
}



function siriusplayer_initChannelList()
{
  try
  {
    var popup = document.getElementById("SiriusPlayer-Menu-Channels-Popup");
    if (!popup.childNodes[1])
    {
      siriusplayer_populateChannels();
    }
  }
  catch(e)
  {
    alert(e);
  }
}

function siriusplayer_populateChannels()
{
  try
  {
    var popup = document.getElementById("SiriusPlayer-Menu-Channels-Popup");
    while (popup.childNodes[0])
    {
      popup.removeChild(popup.childNodes[0]);
    }

    var channelTree = player.getChannels().channelTree;

    if (channelTree)
    {
      for (i in channelTree.categories)
      {
        var category = channelTree.categories[i];
        var newCategory = document.createElement("menu");
        newCategory.setAttribute("label", category);
        var newMenuPopup = document.createElement("menupopup");
        newCategory.appendChild(newMenuPopup);
        for (j in channelTree[category].channels)
        {
          var channel = channelTree[category].channels[j];
          var newChannel = document.createElement("menuitem");
          newChannel.setAttribute("label", channel);
          newChannel.setAttribute("oncommand", "siriusplayer_setChannel(this.getAttribute('label'))");
          newMenuPopup.appendChild(newChannel);
        }
        popup.appendChild(newCategory);
      }
    }
    else
    {
      var login = document.createElement("menuitem");
      login.setAttribute("label", "-- Login --");
      login.setAttribute("oncommand", "siriusplayer_setChannel(0)");
      popup.appendChild(login);
    }
  }
  catch(e)
  {
    alert(e);
  }
}



function siriusplayer_editPresets()
{
  var height = 500;
  var width = 300;
  var top = (screen.height - height) / 2;
  var left = (screen.width - width) / 2;
  window.open("chrome://siriusplayer/content/editpreset.xul", "SiriusPlayer-EditPreset-Window", "top="+top+", left="+left+", height="+height+", width="+width+", modal=yes");
}

*/
