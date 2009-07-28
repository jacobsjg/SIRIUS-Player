const prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefBranch);

var hiddenWindow = Components.classes["@mozilla.org/appshell/appShellService;1"]
                   .getService(Components.interfaces.nsIAppShellService)
                   .hiddenDOMWindow;

var player = hiddenWindow.siriusPlayer;



function siriusplayer_init()
{
  siriusplayer_loadPresets();
}



function siriusplayer_loadPresets()
{
  try {
    var presets = prefManager.getChildList("extensions.siriusplayer.preset", {});
    for (n in presets.sort())
    {
      try
      {
        var preset = presets[n];
        var data = prefManager.getCharPref(preset);
        var label = data || "< empty >";

        var field = Math.floor(n) + 1;
        document.getElementById("SiriusPlayer-EditPreset-Preset" + field).setAttribute("label", label);
        document.getElementById("SiriusPlayer-EditPreset-Preset" + field).setAttribute("data", data);
      }
      catch(e)
      {
        //alert(e);
      }
    }
  }
  catch(e)
  {
    //alert(e);
  }
}



function siriusplayer_populateChannelBox(field)
{
  try
  {
    var popup = field.firstChild;
  
    while (popup.childNodes[0])
    {
      popup.removeChild(popup.childNodes[0]);
    }

    var newChannel = document.createElement("menuitem");
    newChannel.setAttribute("label", "< empty >");
    newChannel.setAttribute("data", "");
    popup.appendChild(newChannel);

    var channels = player.getChannels().channels;

    for (i in channels)
    {
      var channel = channels[i];
      var newChannel = document.createElement("menuitem");
      newChannel.setAttribute("label", channel);
      newChannel.setAttribute("data", channel);
      popup.appendChild(newChannel);
    }

    return true;
  }
  catch(e)
  {
    alert(e);
  }
}



function siriusplayer_cancel()
{
  window.close();
}



function siriusplayer_save()
{
  try
  {
    for (var i=1; i<10; i++)
    {
      var field = document.getElementById("SiriusPlayer-EditPreset-Preset" + i);
      var value = field.getAttribute("data");

      try
      {
        value = field.selectedItem.getAttribute("data");
      }
      catch(e)
      {
        //alert(e);
      }
      
      prefManager.setCharPref("extensions.siriusplayer.preset" + i, value);

    }
  }
  catch(e)
  {
    alert(e);
  }

  window.close();
}
