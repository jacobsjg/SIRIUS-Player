var siriusPlayer;

try
{
  siriusPlayer = {
    
    unknownDocumentTimeout: 2500,
    unknownPageMax: 3,
    unknownPageIterator: 0,
    
    prefManager: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
    
    systemUrl: {
      US: "http://www.sirius.com/sirius/servlet/MediaPlayer?activity=minimize",
      CA: "http://mp.siriuscanada.ca/sirius/ca/servlet/MediaPlayer?activity=minimize",
    },
    
    country: {
      US: "United States",
      CA: "Canada",
    },
    
    createNewFrame: function()
    {
      var myFrame = document.createElement('IFRAME');
      myFrame.setAttribute('id', 'siriusPlayerFrame');
      document.body.appendChild(myFrame);
      myFrame.setAttribute('src', 'about:blank');
      return myFrame;
    },
    
    getFrameHandle: function()
    {
      var myFrame = document.getElementById('siriusPlayerFrame');
      if (!myFrame)
      {
        myFrame = siriusPlayer.createNewFrame();
      }
      return myFrame;
    },
    
    getWindowHandle: function()
    {
      return siriusPlayer.getFrameHandle().contentWindow;
    },

    resetPageIterator: function()
    {
      siriusPlayer.unknownPageIterator = 0;
    },

    shouldUnknownPageRetry: function()
    {
      siriusPlayer.unknownPageIterator ++;
      return (siriusPlayer.unknownPageIterator < siriusPlayer.unknownPageMax);
    },

    getSystemUrl: function()
    {
      return siriusPlayer.systemUrl[siriusPlayer.prefManager.getCharPref("extensions.siriusplayer.country")];
    },
    
    isPlayerLoaded: function()
    {
      return (siriusPlayer.getWindowHandle().streamSelection ? 1 : 0);
    },

    isLoginWindow: function()
    {
      return (siriusPlayer.getWindowHandle().document.documentElement.innerHTML.indexOf('captcha') >= 0);
    },
    
    openLoginWindow: function()
    {
      var height = 590;
      var width = 650;
      var top = (screen.height - height) / 2;
      var left = (screen.width - width) / 2;
      var loginWindow = window.openDialog(siriusPlayer.getSystemUrl(), 'popupSiriusPlayerLogin', 'height='+height+', width='+width+', top='+top+', left='+left+', menubar=no, location=no, toolbar=no, status=no, dependent=yes');
      setTimeout(siriusPlayer.watchLoginWindow, 1000, loginWindow); // start watching the login window after a small delay
    },

    watchLoginWindow: function(loginWindow)
    {
      try
      {
        if (loginWindow.document) // is the window still open?
        {
          if (loginWindow.processClick || // ??
              loginWindow.streamSelection || // "minimize" view after successful login
              loginWindow.document.getElementById("cat")) // "normal" view after successful login
          {
            loginWindow.close();
            siriusPlayer.useBlankFrame();
            siriusPlayer.setChannel(siriusPlayer.prefManager.getCharPref("extensions.siriusplayer.channel"));
          }
          else
          {
            setTimeout(siriusPlayer.watchLoginWindow, 100, loginWindow); // okay, keep watching

            var titleNode = loginWindow.document.getElementsByTagName("title");
            if (titleNode && titleNode.item(0))
            {
              titleNode.item(0).text = "Login - SIRIUS " + siriusPlayer.country[siriusPlayer.prefManager.getCharPref("extensions.siriusplayer.country")] + " - " + siriusPlayer.getSystemUrl();
            }
          }
        }
      }
      catch(e)
      {
        alert(e);
      }
    },

    useBlankFrame: function()
    {
      //siriusPlayer.getFrameHandle().setAttribute('src', 'about:blank'); // wipe out the player frame content, it will stop the player and any timers created by SIRIUS
      siriusPlayer.getFrameHandle().setAttribute('src', siriusPlayer.getSystemUrl());
    },

    getChannels: function()
    {
      try
      {
        if (siriusPlayer.isPlayerLoaded())
        {
          var channelSelector = siriusPlayer.getWindowHandle().document.streamSelectForm.selectedStream;

          var channels = [];
          var channelTree = [];
          channelTree["categories"] = [];
          var category = "Uncategorized"; // in case something isn't in a category, somehow?

          for (i in channelSelector.options)
          {
            var channelName = channelSelector.options[i].text;
            if (channelName)
            {
              if (channelName && channelName.indexOf('==') >= 0) // category
              {
                var re = /^\s*==\s+(.*)\s+==\s*$/;
                var matches = re.exec(channelName);
                channelName = matches[1];
                category = channelName;
              }
              else // channel
              {
                var re = /^\s*(.*?)\s*$/;
                var matches = re.exec(channelName);
                channelName = matches[1];
                re = /&nbsp;/gi;
                channelName = channelName.replace(re);
                channels[channelName] = channelName;
                if (!channelTree[category])
                {
                  channelTree["categories"].push(category);
                  channelTree[category] = [];
                  channelTree[category]["channels"] = [];
                }
                channelTree[category]["channels"].push(channelName);
                channelTree[category][channelName] = channelName;
              }
            }
          }

          return {
            channels: channels,
            channelTree: channelTree
          };
        }
        return false;
      }
      catch(e)
      {
        alert("SiriusPlayer GetChannel Error:\n\n" + e);
      }
    },
    
    setChannel: function(channel)
    {
      try
      {
        if (!channel)
        {
          siriusPlayer.useBlankFrame();
        }

        if (siriusPlayer.isLoginWindow())
        {
          siriusPlayer.resetPageIterator();
          siriusPlayer.openLoginWindow();
          return false;
        }

        if (siriusPlayer.isPlayerLoaded())
        {
          siriusPlayer.resetPageIterator();
          
          var channelSelector = siriusPlayer.getWindowHandle().document.streamSelectForm.selectedStream;
          var selectionMatched = 0;
          
          for (i in channelSelector.options)
          {
            var channelName = channelSelector.options[i].text;
            if (channelName)
            {
              var re = /^\s*(.*?)\s*$/;
              var matches = re.exec(channelName);
              channelName = matches[1];
              re = /&nbsp;/gi;
              channelName = channelName.replace(re);

              if (channelName == channel)
              {
                channelSelector.selectedIndex = i;
                selectionMatched = 1;
              }
            }
          }
          
          if (selectionMatched) // requested channel is a valid channel
          {
            siriusPlayer.getWindowHandle().streamSelection(); // tell SIRIUS to play the newly selected channel
          }
          else
          {
            if (channel && channel != "STOPPED")
            {
              alert("Selected channel is unknown or unavailable.\n\nChannel: " + channel);
            }
          }
          
          return true;
        }
        
        if (siriusPlayer.shouldUnknownPageRetry())
        {
          siriusPlayer.getFrameHandle().setAttribute('src', siriusPlayer.getSystemUrl()); // load the SIRIUS system in the player frame content
          setTimeout(siriusPlayer.setChannel, siriusPlayer.unknownDocumentTimeout, channel);
          return;
        }
        else
        {
          siriusPlayer.resetPageIterator();
          alert("SIRIUS Player Error:\n\nUnable to access SIRIUS Internet Radio.\n\nMake sure you are connected to the Internet and try again.");
          return false;
        }
      }
      catch(e)
      {
        alert("SiriusPlayer SetChannel Error:\n\n" + e);
      }
    },
    
    getChannelLogo: function()
    {
      try
      {
        var imgs = siriusPlayer.getWindowHandle().document.getElementsByTagName("img");
        for (var i=0; i<imgs.length; i++)
        {
          var src = imgs.item(i).getAttribute("src");
          if (src.indexOf("http") >= 0)
          {
            return src;
          }
        }
        return false;
      }
      catch(e)
      {
        alert(e);
      }
    },
    
    setQuality: function(quality)
    {
      if (!siriusPlayer.canUseHighQuality()) // can't use high quality
      {
        alert("** Account Restriction **\n\nIt appears that your account is not permitted to use High Quality audio.\n\nThe High Quality audio stream option typically requires an upgraded Internet Streaming account.  To upgrade to High Quality audio stream support, login to your account at the official SIRIUS website and purchase the upgraded account.\n\nIf you are using a trial account, you are not permitted to use High Quality audio.");
      }

      if (quality != siriusPlayer.getQuality()) // change in quality was requested
      {
        var anchors = siriusPlayer.getWindowHandle().document.getElementsByTagName("a");
        for (var i=0; i<anchors.length; i++)
        {
          var href = anchors.item(i).getAttribute("href");
          if (href.indexOf("selectBitrate") >= 0)
          {
            if (href.indexOf("/") == 0) // starts with slash
            {
              var re = /^(https?:\/\/.*?)\//;
              var matches = re.exec(siriusPlayer.getWindowHandle().document.location.href);
              var baseHref = matches[1];
              href = baseHref + href;
            }
            siriusPlayer.getWindowHandle().document.location.href = href; // click the link that changes bitrate
          }
        }
      }

      return siriusPlayer.getQuality();
    },

    getQuality: function()
    {
      try
      {
        var imgs = siriusPlayer.getWindowHandle().document.getElementsByTagName("img");
        for (var i=0; i<imgs.length; i++)
        {
          var src = imgs.item(i).getAttribute("src");
          if (src.indexOf("low-pressed") >= 0)
          {
            return "Normal";
          }
          if (src.indexOf("hi-pressed") >= 0)
          {
            return "High";
          }
        }
        return "Normal"; // assume normal if we can't figure it out
      }
      catch(e)
      {
        alert(e);
      }
    },
    
    canUseHighQuality: function()
    {
      try
      {
        var imgs = siriusPlayer.getWindowHandle().document.getElementsByTagName("img");
        for (var i=0; i<imgs.length; i++)
        {
          var src = imgs.item(i).getAttribute("src");
          if (src.indexOf("hi-reg") >= 0) // available but not in use (is this true?  does it really mean it's available?)
          {
            return true;
          }
          if (src.indexOf("hi-pressed") >= 0) // available and in use
          {
            return true;
          }
        }
        return false;
      }
      catch(e)
      {
        alert(e);
      }
    }
    
  };
  
  siriusPlayer.getFrameHandle(); // to initialize the frame if necessary
}
catch(e)
{
  alert("SiriusPlayer Internal Error:\n\n" + e);
}
