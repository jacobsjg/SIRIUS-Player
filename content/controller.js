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
    dump("SIRIUS Player initializing... ");
    siriusplayer.initialized = true;
    siriusplayer.version = '2.0.4';
    siriusplayer.passwordrealm = 'SIRIUS Player Login';
    siriusplayer.hiddenWindow = Components.classes["@mozilla.org/appshell/appShellService;1"].getService(Components.interfaces.nsIAppShellService).hiddenDOMWindow;
    siriusplayer.hiddenWindow.Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://siriusplayer/content/sirius_ping.js");
    siriusplayer.hiddenWindow.Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://siriusplayer/content/md5.js");
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    siriusplayer.ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    siriusplayer.cookieService = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
    siriusplayer.cookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
    siriusplayer.prefs = prefService.getBranch("extensions.siriusplayer.");
    siriusplayer.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    siriusplayer.prefs.addObserver("", siriusplayer, false);
    siriusplayer.observer = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    siriusplayer.observer.addObserver(siriusplayer.httpRequestObserver, "http-on-modify-request", false);
    siriusplayer.strings = document.getElementById("siriusplayer-strings");
    siriusplayer.alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
    siriusplayer.passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
    siriusplayer.nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo, "init");
    siriusplayer.trackerupdatefreq = siriusplayer.prefs.getIntPref("trackerupdatefreq");
    if (siriusplayer.trackerupdatefreq < 15)
    {
      siriusplayer.trackerupdatefreq = 15;
      siriusplayer.trackerupdatefreq = siriusplayer.prefs.setIntPref("trackerupdatefreq", siriusplayer.trackerupdatefreq);
    }
    siriusplayer.channel = 0;
    siriusplayer.isPlaying = 0;
    siriusplayer.readPresets();
    siriusplayer.trackerData = new Object();
    siriusplayer.authbad = '';
    siriusplayer.authok = 0;
    siriusplayer.wantlogin = 0;
    siriusplayer.token = '';
    siriusplayer.urlUpdate();
    siriusplayer.requestChannels();
    dump("done.\n");
  },

  country: function()
  {
    return siriusplayer.prefs.getCharPref('country');
  },

  url: function()
  {
    var urls = new Object();
    urls['US'] = 'http://www.sirius.com/sirius/servlet/MediaPlayer';
    urls['CA'] = 'http://mp.siriuscanada.ca/sirius/ca/servlet/MediaPlayer';

    return urls[siriusplayer.country()];
  },

  urlLogin: function()
  {
    var urls = new Object();
    urls['US'] = 'http://www.sirius.com/sirius/servlet/MediaPlayerLogin/subscriber';
    urls['CA'] = 'http://mp.siriuscanada.ca/sirius/ca/servlet/MediaPlayerLogin/subscriber';

    return urls[siriusplayer.country()];
  },

  observe: function(subject, topic, pref)
  {
    if (topic != "nsPref:changed") return;

    var prefvalue = '???';
    switch (siriusplayer.prefs.getPrefType(pref))
    {
      case 32:
        prefvalue = siriusplayer.prefs.getCharPref(pref);
        break;

      case 64:
        prefvalue = siriusplayer.prefs.getIntPref(pref);
        break;

      case 128:
        prefvalue = siriusplayer.prefs.getBoolPref(pref);
        break;
    };

    dump("Observed preference change: [" + pref + "] " + prefvalue  + "\n");

    switch (pref)
    {
      case "lowquality":
        //alert("lowquality changed");
        break;

      case "country":
        siriusplayer.wantlogin = 0;
        break;

      case "legalagree":
        siriusplayer.wantlogin = 0;
        break;

      case "presets":
        siriusplayer.readPresets();
        break;

      case "trackerupdatefreq":
        clearTimeout(siriusplayer.trackerTimer);
        siriusplayer.trackerupdatefreq = siriusplayer.prefs.getIntPref("trackerupdatefreq");
        if (siriusplayer.trackerupdatefreq < 15)
        {
          siriusplayer.trackerupdatefreq = 15;
          siriusplayer.trackerupdatefreq = siriusplayer.prefs.setIntPref("trackerupdatefreq", siriusplayer.trackerupdatefreq);
        }
        siriusplayer.trackerTimer = setTimeout(siriusplayer.requestTracker, siriusplayer.trackerupdatefreq * 1000);
        break;

      case "trackerupdateurl":
        clearTimeout(siriusplayer.trackerTimer);
        siriusplayer.trackerupdatefreq = siriusplayer.prefs.getIntPref("trackerupdatefreq");
        siriusplayer.trackerTimer = setTimeout(siriusplayer.requestTracker, siriusplayer.trackerupdatefreq * 1000);
        break;

    }
  },

  setUserAgent: function(http)
  {
    http.setRequestHeader('User-Agent', 'SIRIUSPlayer/' + siriusplayer.version + ' (http://www.siriusplayer.dustywilson.com/?r=ua&v=' + siriusplayer.version + ') ' + window.navigator.userAgent);
  },

  requestTracker: function()
  {
    dump("SIRIUS Player fetching tracker data.\n");
    clearTimeout(siriusplayer.trackerTimer);
    if (siriusplayer.authok && siriusplayer.wantlogin)
    {
      var channelOne = "";
      try
      {
        channelOne = siriusplayer.prefs.getCharPref('channel.1.code');
      } catch(e) {};
      if (!channelOne) siriusplayer.chanMap();

      siriusplayer.tracker = new XMLHttpRequest();
      siriusplayer.tracker.open('GET', siriusplayer.prefs.getCharPref("trackerupdateurl"), true); // is async
      siriusplayer.setUserAgent(siriusplayer.tracker);
      siriusplayer.tracker.onreadystatechange = siriusplayer.receiveTracker;
      siriusplayer.tracker.send(null);
    }
  },

  receiveTracker: function()
  {
    clearTimeout(siriusplayer.trackerTimer);
    if (siriusplayer.tracker.readyState == 4)
    {
      if (siriusplayer.tracker.status == 200)
      {
        siriusplayer.trackerupdatefreq = siriusplayer.prefs.getIntPref("trackerupdatefreq");
        siriusplayer.processTracker();
      }
      else
      {
        dump("Error getting songlist feed from DogstarRadio.\n");
        siriusplayer.trackerupdatefreq = Math.round(siriusplayer.trackerupdatefreq * 1.75);
        siriusplayer.alert.show("Error getting songlist feed from DogstarRadio.  Trying again in " + siriusplayer.trackerupdatefreq + " second" + (siriusplayer.trackerupdatefreq == 1 ? "" : "s") + ".", null);

        for each (var channel in siriusplayer.trackerData)
        {
          channel.updated = 0;
        }
      }

      clearTimeout(siriusplayer.trackerTimer);
      siriusplayer.trackerTimer = setTimeout(siriusplayer.requestTracker, siriusplayer.trackerupdatefreq * 1000);
    }
  },

  processTracker: function()
  {
    dump("SIRIUS Player received tracker data.\n");
    var channels = siriusplayer.tracker.responseText.split('\n---\n');
    if (channels.length < 2) return false; // not the content we expected (error pages, etc)
    var date;
    var channelIndex = new Array();

    for (var i=0; i<channels.length; i++)
    {
      var channelText = channels[i];
      var channelFields = channelText.split('\n') || new Array();
      var data = new Object();

      if (!date) date = channelFields.shift(); // the first line of the response is the date
      data.channelNumber = channelFields[0];
      data.channelSatName = channelFields[1];
      data.channelName = data.channelSatName;
      data.artist = channelFields[2].indexOf('Dogstar') >= 0 ? '' : channelFields[2];
      data.song = channelFields[3].indexOf('Dogstar') >= 0 ? '' : channelFields[3];
      data.playing = 0;
      if (!data.song) data.song = data.artist || data.channelName;
      if (!data.artist) data.artist = data.song;

      data.channelCode = '';
      data.channelComment = '';
      try
      {
        data.channelCode = siriusplayer.prefs.getCharPref('channel.' + Math.floor(data.channelNumber) + '.code');
        data.channelComment = siriusplayer.prefs.getCharPref('channel.' + Math.floor(data.channelNumber) + '.comment');
        if (data.channelComment) data.channelName = data.channelComment;
      } catch(e) {};

      if (data.channelCode)
      {
        channelIndex.push(data.channelNumber);

        if (data.channelNumber == siriusplayer.channel)
        {
          dump("Channel [" + data.channelNumber + "] [" + data.channelName + "] [" + data.artist + "] [" + data.song + "]\n");
          data.playing = 1;
        }

        if (!siriusplayer.trackerData[data.channelNumber] || siriusplayer.trackerData[data.channelNumber].song != data.song)
        {
          if (data.channelNumber == siriusplayer.channel)
          {
            siriusplayer.alert.show('"' + data.song + '" by ' + data.artist + ' is playing on ' + data.channelName + '.', 'play:' + data.channelNumber);
          }
          data.updated = 1;
          siriusplayer.trackerData[data.channelNumber] = data;
        }
        else
        {
          siriusplayer.trackerData[data.channelNumber].updated = 0;
        }
      }
    }

    siriusplayer.trackerRows = channels.length;
    siriusplayer.channelIndex = channelIndex;

    if (siriusplayer.channel && siriusplayer.trackerData[siriusplayer.channel].updated)
    {
      siriusplayer.requestAmazon(siriusplayer.channel);
    }
  },

  getCaptcha: function(img)
  {
    var country = siriusplayer.prefs.getCharPref('country');

	  var codes = new Object();

	  codes['US'] = new Array();
    codes['US'][1] = 'wrQ2';
    codes['US'][2] = 'LtFK';
    codes['US'][3] = '2bxh';
    codes['US'][4] = 'Mf6D';
    codes['US'][5] = 'fEXY';
    codes['US'][6] = 'Wc46';
    codes['US'][7] = 'fYP7';
    codes['US'][8] = 'X6aw';
    codes['US'][9] = 'nQQd';
    codes['US'][10] = 'rt3k';
    codes['US'][11] = 'kQhf';
    codes['US'][12] = 'f2WG';
    codes['US'][13] = 'aTLX';
    codes['US'][14] = 'Qnaf';
    codes['US'][15] = 'cA2T';
    codes['US'][16] = 'cY36';
    codes['US'][17] = 'xddQ';
    codes['US'][18] = 'yaYf';
    codes['US'][19] = '4P67';
    codes['US'][20] = '7ekW';
    codes['US'][21] = 'yZLN';
    codes['US'][22] = 'RhLd';
    codes['US'][23] = '4eAc';
    codes['US'][24] = 'bHKA';
    codes['US'][25] = 't4kw';
    codes['US'][26] = 'AZQE';
    codes['US'][27] = 'RWhN';
    codes['US'][28] = '7rPD';
    codes['US'][29] = 'fYWP';
    codes['US'][30] = '7HCb';
    codes['US'][31] = 'aR3L';
    codes['US'][32] = 'TDkT';
    codes['US'][33] = 'kf4Y';
    codes['US'][34] = 'yfFZ';
    codes['US'][35] = 'eyDh';
    codes['US'][36] = 'yWnK';
    codes['US'][37] = 'NFWm';
    codes['US'][38] = '2n4d';
    codes['US'][39] = '634t';
    codes['US'][40] = 'YnAH';
    codes['US'][41] = 'MHPQ';
    codes['US'][42] = 'N26M';
    codes['US'][43] = 'Ra4C';
    codes['US'][44] = 'dR4e';
    codes['US'][45] = 'P6CZ';
    codes['US'][46] = 'cnaW';
    codes['US'][47] = 'W6wm';
    codes['US'][48] = 'Wm3y';
    codes['US'][49] = 'mrdG';
    codes['US'][50] = '3KhR';
    codes['US'][51] = 'p6fY';
    codes['US'][52] = 'AGeh';
    codes['US'][53] = 'ctDC';
    codes['US'][54] = 'HDZY';
    codes['US'][55] = 'WNKM';
    codes['US'][56] = 'K72H';
    codes['US'][57] = 'k627';
    codes['US'][58] = 'PMW2';
    codes['US'][59] = 'mWew';
    codes['US'][60] = 'y3YA';
    codes['US'][61] = 'r67T';
    codes['US'][62] = 'nDpE';
    codes['US'][63] = 'Q7MQ';
    codes['US'][64] = 'kLW2';
    codes['US'][65] = 'pyDR';
    codes['US'][66] = 'AQkH';
    codes['US'][67] = 'wdfw';
    codes['US'][68] = 'ewQh';
    codes['US'][69] = 'ttEP';
    codes['US'][70] = 'tn6r';
    codes['US'][71] = 'P6yx';
    codes['US'][72] = 'nRKW';
    codes['US'][73] = 'eXEb';
    codes['US'][74] = 'ywNZ';
    codes['US'][75] = 'MHZt';
    codes['US'][76] = 'f7mc';
    codes['US'][77] = 'RyMY';
    codes['US'][78] = 'MTPC';
    codes['US'][79] = 'rc3K';
    codes['US'][80] = 'Xebn';
    codes['US'][81] = 'ffGH';
    codes['US'][82] = '6Y2D';
    codes['US'][83] = 'mbKX';
    codes['US'][84] = '6nCH';
    codes['US'][85] = 'tHyG';
    codes['US'][86] = 'RtAE';
    codes['US'][87] = 'hWe2';
    codes['US'][88] = '3F6D';
    codes['US'][89] = 'dQpC';
    codes['US'][90] = 'HACn';
    codes['US'][91] = 'Ampy';
    codes['US'][92] = 'mLEr';
    codes['US'][93] = 'Mdt2';
    codes['US'][94] = 'QGbL';
    codes['US'][95] = 'PDQp';
    codes['US'][96] = 'EEyc';
    codes['US'][97] = 'MfmL';
    codes['US'][98] = 'PQ3f';
    codes['US'][99] = 'HPPc';
    codes['US'][100] = 'pTXc';

	  codes['CA'] = new Array();
	  codes['CA'][1] = 'vRLCHr';
	  codes['CA'][2] = 'Rk9f3b';
	  codes['CA'][3] = 'tN2R1A';
	  codes['CA'][4] = 'R3iwj5';
	  codes['CA'][5] = 'jBjsVj';
	  codes['CA'][6] = 'v3jvKg';
	  codes['CA'][7] = 'iimNmx';
	  codes['CA'][8] = 'cahMYf';
	  codes['CA'][9] = 'Vw3rxG';
	  codes['CA'][10] = 'R7KPgK';
	  codes['CA'][11] = 'RUyTUS';
	  codes['CA'][12] = 'Cef11w';
	  codes['CA'][13] = 'NAQbyX';
	  codes['CA'][14] = 'q6EYAH';
	  codes['CA'][15] = 'tReWYs';
	  codes['CA'][16] = 'fimQlm';
	  codes['CA'][17] = 'U6qsi6';
	  codes['CA'][18] = 'm5Wkwh';
	  codes['CA'][19] = 'FpVR2T';
	  codes['CA'][20] = 'CuAF1k';
	  codes['CA'][21] = 'sgnUw7';
	  codes['CA'][22] = '4N1RPP';
	  codes['CA'][23] = 'ech2am';
	  codes['CA'][24] = 'CtbsNQ';
	  codes['CA'][25] = 'kXrPES';
	  codes['CA'][26] = '1AgXSR';
	  codes['CA'][27] = '5DHYSR';
	  codes['CA'][28] = 'e3ru7T';
	  codes['CA'][29] = 'c1yjHE';
	  codes['CA'][30] = 'FR1ltI';
	  codes['CA'][31] = 'Xtn36U';
	  codes['CA'][32] = 'DHEWnx';
	  codes['CA'][33] = '8KePqv';
	  codes['CA'][34] = '1TKVVk';
	  codes['CA'][35] = 'BIY138';
	  codes['CA'][36] = 'RA6c83';
	  codes['CA'][37] = 'SaluKT';
	  codes['CA'][38] = 'T89gGV';
	  codes['CA'][39] = 'gUPVqL';
	  codes['CA'][40] = 'J4F3gi';
	  codes['CA'][41] = 'BbQnjy';
	  codes['CA'][42] = 'qLrRgi';
	  codes['CA'][43] = 'c3eSfa';
	  codes['CA'][44] = 'yAhdN5';
	  codes['CA'][45] = '3YW4WC';
	  codes['CA'][46] = 'mPvBah';
	  codes['CA'][47] = 'UZnHN4';
	  codes['CA'][48] = 'x24GCx';
	  codes['CA'][49] = 'GLdYdn';
	  codes['CA'][50] = 'DsUIMk';
	  codes['CA'][51] = '7GCaEc';
	  codes['CA'][52] = '1WXPNr';
	  codes['CA'][53] = 'SRpRsG';
	  codes['CA'][54] = 'vSlae4';
	  codes['CA'][55] = 'r95Vhm';
	  codes['CA'][56] = '1tGuK7';
	  codes['CA'][57] = 'wnZyD4';
	  codes['CA'][58] = 'c8lj6k';
	  codes['CA'][59] = 'sdQ3X4';
	  codes['CA'][60] = '5FNMsi';
	  codes['CA'][61] = 'Up7Rni';
	  codes['CA'][62] = 'csjyJa';
	  codes['CA'][63] = '9Uq5rm';
	  codes['CA'][64] = 'p9kbvj';
	  codes['CA'][65] = 'Cy1iip';
	  codes['CA'][66] = 'mc7y2c';
	  codes['CA'][67] = 'SE3rqi';
	  codes['CA'][68] = 'YmJ3Tv';
	  codes['CA'][69] = 'Qr32YN';
	  codes['CA'][70] = 'l3rcdJ';
	  codes['CA'][71] = 'xn33VA';
	  codes['CA'][72] = 'tjxuf4';
	  codes['CA'][73] = '3hLBuU';
	  codes['CA'][74] = '3fntSq';
	  codes['CA'][75] = 'rMYmpH';
	  codes['CA'][76] = 'yvKfyR';
	  codes['CA'][77] = 'bkxHDW';
	  codes['CA'][78] = 'EtUSs3';
	  codes['CA'][79] = '3gA7wG';
	  codes['CA'][80] = 'Yn3uUL';
	  codes['CA'][81] = 'hCW9Cg';
	  codes['CA'][82] = 'aLI1R7';
	  codes['CA'][83] = 'wmkRRP';
	  codes['CA'][84] = 'Rm3C3i';
	  codes['CA'][85] = 'CgS98N';
	  codes['CA'][86] = 'xaF7cd';
	  codes['CA'][87] = 'ATxch8';
	  codes['CA'][88] = '8I1rDk';
	  codes['CA'][89] = 'C8896y';
	  codes['CA'][90] = 'SiNusq';
	  codes['CA'][91] = 'AQZ3kR';
	  codes['CA'][92] = 'ARFUSP';
	  codes['CA'][93] = 'hDgs72';
	  codes['CA'][94] = 'Lxbg1X';
	  codes['CA'][95] = '4716A3';
	  codes['CA'][96] = 'gCkAqa';
	  codes['CA'][97] = 'wRDWeN';
	  codes['CA'][98] = 'h64fGf';
	  codes['CA'][99] = 'Cr2VPm';
	  codes['CA'][100] = '66SiiF';

    return codes[country][img];
  },

  getAuthInfo: function()
  {
    var auth = new Object();
    var logins = siriusplayer.passwordManager.findLogins({}, 'chrome://siriusplayer', null, siriusplayer.passwordrealm);
    if (logins.length)
    {
      auth.username = logins[0].username;
      auth.password = logins[0].password;
    }

	  return auth;
  },

  setAuthInfo: function(username, password)
  {
    var logins = siriusplayer.passwordManager.findLogins({}, 'chrome://siriusplayer', null, siriusplayer.passwordrealm);
    for (i=0; i<logins.length; i++)
      siriusplayer.passwordManager.removeLogin(logins[i]);

    if (username && password)
      siriusplayer.passwordManager.addLogin(new siriusplayer.nsLoginInfo('chrome://siriusplayer', null, siriusplayer.passwordrealm, username, password, '', ''));
  },

  readPresets: function()
  {
    dump("*** readPresets\n");
    var presetsIndex = new Array();
    var presetPref = siriusplayer.prefs.getCharPref('presets');
    if (presetPref)
    {
      presetsIndex = presetPref.split(',');
    }
    siriusplayer.presetsIndex = presetsIndex;
  },

  writePresets: function(presets)
  {
    siriusplayer.presetsIndex = presets;
    siriusplayer.prefs.setCharPref('presets', siriusplayer.presetsIndex.join(','));
  },

  play: function(channel)
  {
    siriusplayer.isPlaying = 1;
    siriusplayer.channel = channel;
    siriusplayer.alert.show('Tuning to "' + siriusplayer.trackerData[channel].channelName + '".');
    siriusplayer.requestAmazon(channel);
    siriusplayer.getChannel(siriusplayer.trackerData[channel].channelCode);
  },

  stop: function()
  {
    siriusplayer.isPlaying = 0;
    siriusplayer.doStream(null);
  },

  requestAmazon: function(channel)
  {
    siriusplayer.amazonData = new Object();
    var title = siriusplayer.trackerData[channel].song;
    title = title.replace(/\s*[({<].*?$/, "");
    dump("Searching Amazon for: " + title + "\n");
    siriusplayer.amazon = new XMLHttpRequest();
    siriusplayer.amazon.open('GET', 'http://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=170H613B42SP21ATETG2&AssociateTag=siriplr2-20&Operation=ItemSearch&SearchIndex=MP3Downloads&Title=' + escape(title) + '&Version=2009-01-06&ResponseGroup=ItemAttributes,OfferFull,Images', true); // is async
    siriusplayer.setUserAgent(siriusplayer.amazon);
    siriusplayer.amazon.onreadystatechange = siriusplayer.receiveAmazon;
    siriusplayer.amazon.send(null);
  },

  receiveAmazon: function()
  {
    if (siriusplayer.amazon.readyState == 4)
    {
      if (siriusplayer.amazon.status == 200)
      {
        siriusplayer.processAmazon();
      }
      else
      {
        dump("Error getting song data from Amazon.\n");
        siriusplayer.alert.show("Error getting song data from Amazon.", null);
      }
    }
  },

  processAmazon: function()
  {
    dump("SIRIUS Player received Amazon song data.\n");

    var song = siriusplayer.trackerData[siriusplayer.channel];

    var parser = new DOMParser();
    var amazon = parser.parseFromString(siriusplayer.amazon.responseText, "text/xml").firstChild;
    dump(amazon + "\n");

    for each (var item in amazon.getElementsByTagName("Item"))
    {
      if (!item.getElementsByTagName) continue;
      var obj = new Object();
      obj.asin = item.getElementsByTagName("ASIN")[0].firstChild.nodeValue;
      obj.url = item.getElementsByTagName("DetailPageURL")[0].firstChild.nodeValue;
      obj.title = item.getElementsByTagName("ItemAttributes")[0].getElementsByTagName("Title")[0].firstChild.nodeValue;
      obj.artist = item.getElementsByTagName("ItemAttributes")[0].getElementsByTagName("Creator")[0].firstChild.nodeValue;
      obj.producttype = item.getElementsByTagName("ItemAttributes")[0].getElementsByTagName("ProductTypeName")[0].firstChild.nodeValue;
      obj.type = 'unknown';
      if (obj.producttype == 'DOWNLOADABLE_MUSIC_ALBUM') obj.type = 'album';
      if (obj.producttype == 'DOWNLOADABLE_MUSIC_TRACK') obj.type = 'track';
      obj.price = item.getElementsByTagName("OfferSummary")[0].getElementsByTagName("LowestNewPrice")[0].getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
      obj.images = new Object();
      obj.images.large = item.getElementsByTagName("LargeImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
      obj.images.medium = item.getElementsByTagName("MediumImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
      obj.images.small = item.getElementsByTagName("SmallImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
      if (obj.artist.toLowerCase() == song.artist.toLowerCase())
      {
        dump("SONG: " + obj.asin + " = " + obj.type + " = " + obj.price + " = " + obj.title + " by " + obj.artist + "\n");
        siriusplayer.amazonData = obj;
        if (obj.type == 'track')
        {
          break;
        }
      }
      siriusplayer.amazonData = new Object();
    }
  },

  alert: {
    show: function(message, cookie)
    {
      dump("SIRIUS Player [" + cookie + "]: " + message + "\n");
      siriusplayer.alertsService.showAlertNotification("chrome://siriusplayer/skin/noteicon.png", "SIRIUS Player", message, cookie ? true : false, cookie, siriusplayer.alert, "firefoxsiriusplayer");
    },

    observe: function(subject, topic, cookie)
    {
      if (topic != "alertclickcallback") return false;
      dump("ALERT CLICKED: " + topic + " - " + cookie + "\n");

      if (cookie.indexOf('play:') == 0)
      {
        var channel = cookie.replace(/^play:/, '');
        siriusplayer.play(channel);
      }
    },
  },

  legalagree: function()
  {
    return siriusplayer.prefs.getBoolPref('legalagree');
  },

  openPrefs: function()
  {
    openDialog("chrome://browser/content/preferences/preferences.xul", "Preferences", "chrome,menubar,toolbar,resizable", "siriusplayer-preferences");
  },

  login: function()
  {
    if (!siriusplayer.legalagree) return false;
    var country = siriusplayer.prefs.getCharPref('country');
    var auth = siriusplayer.getAuthInfo();
    if (country && auth.username && auth.password)
    {
      siriusplayer.wantlogin = 1;
      siriusplayer.requestChannels();
      siriusplayer.prefs.setCharPref('authtrigger', Math.floor(Math.random() * 10000));
    }
    else
    {
      siriusplayer.authbad = 'Needs login information.';
      siriusplayer.wantlogin = 0;
      siriusplayer.prefs.setCharPref('authtrigger', Math.floor(Math.random() * 10000));
    }
  },

  logout: function()
  {
    siriusplayer.wantlogin = 0;
    siriusplayer.authbad = '';
    siriusplayer.authok = 0;
    clearTimeout(siriusplayer.trackerTimer);
    siriusplayer.stop();
    siriusplayer.killCookieDomain();
    siriusplayer.prefs.setCharPref('authtrigger', Math.floor(Math.random() * 10000));
  },

  killCookieDomain: function()
  {
    var uri = siriusplayer.ioService.newURI('http://www.sirius.com/', null, null);
    var cookie = siriusplayer.cookieService.getCookieString(uri, null);
    if (cookie)
    {
      var cookies = cookie.split(/\s*;\s*/);
      for (var i=0; i<cookies.length; i++)
      {
        var cookieParts = cookies[i].split(/\s*=\s*/);
        var cookieName = cookieParts[0];
        if (cookieName)
        {
          dump("Removing cookie: " + cookieParts[i] + "\n");
          siriusplayer.cookieManager.remove('www.sirius.com', cookieParts[0], '/', false);
          siriusplayer.cookieManager.remove('www.sirius.com', cookieParts[0], '/sirius', false);
        }
      }
    }
  },

  httpRequestObserver:
  {
    observe: function(subject, topic, data)
    {
      if (topic == "http-on-modify-request")
      {
        var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
        if (httpChannel.URI.host.match(/\.sirius\.com/i) || httpChannel.URI.host.match(/\.siriuscanada\.ca/i))
        {
          httpChannel.setRequestHeader("Referer", siriusplayer.url(), false);
        }
      }
    }
  },

  requestChannels: function()
  {
    var url = siriusplayer.url();
    siriusplayer.channels = new Object();
    dump("Fetching SIRIUS Channels...\n");
    siriusplayer.sirius = new XMLHttpRequest();
    siriusplayer.sirius.open('GET', url + "?activity=minimize", true); // is async
    siriusplayer.sirius.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    siriusplayer.sirius.onreadystatechange = siriusplayer.receiveChannels;
    siriusplayer.sirius.send(null);
  },

  receiveChannels: function()
  {
    if (siriusplayer.sirius.readyState == 4)
    {
      if (siriusplayer.sirius.status == 200)
      {
        siriusplayer.processChannels();
      }
      else
      {
        dump("Error getting SIRIUS Channels.\n");
        siriusplayer.alert.show("Error getting SIRIUS Channels.", null);
      }
    }
  },

  processChannels: function()
  {
    dump("SIRIUS Player received SIRIUS Channels.\n");

    dump("RESPONSE HEADERS:\n" + siriusplayer.sirius.getAllResponseHeaders() + "\n");
    dump("RESPONSE COOKIES:\n" + siriusplayer.sirius.getResponseHeader("Set-Cookie") + "\n");

    var page = siriusplayer.sirius.responseText;

    var tokenMatch = page.match(/<input type="hidden" name="token" value="([^"]+)"/i);
    if (tokenMatch && tokenMatch[1])
    {
      siriusplayer.token = tokenMatch[1] || siriusplayer.token;
    }

    dump("token: " + siriusplayer.token + "\n");

    if (page.indexOf('LOGIN FORM BEGIN') >= 0)
    {
      siriusplayer.requestLogin(page);
    }
    else
    {
      siriusplayer.badauth = '';
      siriusplayer.authok = 1;
      siriusplayer.wantlogin = 1;
      siriusplayer.requestTracker();
      // process channels here...
    }
  },

  requestLogin: function(page)
  {
    if (siriusplayer.wantlogin)
    {
      var url = siriusplayer.urlLogin();

      var auth = siriusplayer.getAuthInfo();
      var username = auth.username;
      var password = auth.password;
      var captchaId = page.match(/<input type="hidden" name="captchaID" value="([^"]+)"/i)[1];
      var captchaImg = Math.floor(page.match(/<img src="[^"]+img_(.*?)\.jpg"/i)[1]);
      var captchaValue = siriusplayer.getCaptcha(captchaImg);

      var content = "activity=login&type=subscriber&password=" + escape(hex_md5(password)) + "&loginForm=subscriber&stream=&token=" + escape(siriusplayer.token) + "&playerType=full&username=" + escape(username) + "&captchaID=" + escape(captchaId) + "&captcha_response=" + escape(captchaValue) + "&rememberMe=yes";
      //dump("token: " + siriusplayer.token + " - cId: " + captchaId + " - cImg: " + captchaImg + " - cVal: " + captchaValue + "\n" + content + "\n");

      siriusplayer.channels = new Object();
      dump("Fetching SIRIUS Login...\n");
      siriusplayer.sirius = new XMLHttpRequest();
      siriusplayer.sirius.open('POST', url, true); // is async
      siriusplayer.sirius.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      siriusplayer.sirius.onreadystatechange = siriusplayer.receiveLogin;
      siriusplayer.sirius.send(content);
    }
  },

  receiveLogin: function()
  {
    if (siriusplayer.sirius.readyState == 4)
    {
      if (siriusplayer.sirius.status == 200)
      {
        siriusplayer.processLogin();
      }
      else
      {
        dump("Error getting SIRIUS Login.\n");
        siriusplayer.alert.show("Error getting SIRIUS Login.", null);
        siriusplayer.wantlogin = 0;
        siriusplayer.authok = 0;
        siriusplayer.badauth = 'Unable to get SIRIUS Login.';
      }
    }
  },

  processLogin: function()
  {
    dump("SIRIUS Player received SIRIUS Login.\n");

    //dump("RESPONSE HEADERS:\n" + siriusplayer.sirius.getAllResponseHeaders() + "\n");
    //dump("RESPONSE COOKIES:\n" + siriusplayer.sirius.getResponseHeader("Set-Cookie") + "\n");

    var page = siriusplayer.sirius.responseText;

    var tokenMatch = page.match(/<input type="hidden" name="token" value="([^"]+)"/i);
    if (tokenMatch && tokenMatch[1])
    {
      siriusplayer.token = tokenMatch[1] || siriusplayer.token;
    }

    if (page.indexOf('LOGIN FORM BEGIN') >= 0)
    {
      siriusplayer.alert.show("Login failed.", null);
      siriusplayer.wantlogin = 0;
      siriusplayer.authok = 0;
      siriusplayer.badauth = 'Bad login.';
      //dump(page);
    }
    else
    {
      siriusplayer.alert.show("Login successful.", null);
      siriusplayer.authok = 1;
      siriusplayer.badauth = '';
      siriusplayer.requestChannels();
    }

    siriusplayer.prefs.setCharPref('authtrigger', Math.floor(Math.random() * 10000));
  },

  urlUpdate: function(verbal)
  {
    if (verbal) siriusplayer.alert.show("Fetching SIRIUS Player internal URLs...", null);

    var urlupdate = new XMLHttpRequest();
    urlupdate.open('GET', siriusplayer.prefs.getCharPref('urlupdateurl'), false); // is not async
    siriusplayer.setUserAgent(urlupdate);
    urlupdate.send(null);

    if (urlupdate.status == 200)
    {
      var page = urlupdate.responseText;
      var lines = page.split(/\r?\n/);
      for (var i=0; i<lines.length; i++)
      {
        var line = lines[i];
        var part = line.split(/\s*=\s*/);
        var name = part[0];
        var value = part[1];
        try
        {
          siriusplayer.prefs.setCharPref(name, value);
        }
        catch(e) {};
      }

      if (verbal) siriusplayer.alert.show("Done fetching SIRIUS Player internal URLs.", null);
    }
    else
    {
      if (verbal) siriusplayer.alert.show("Failed fetching SIRIUS Player internal URLs.  If this persists, go to http://www.siriusplayer.dustywilson.com/ for upgrade or failure info.", null);
    }
  },

  chanMap: function(verbal)
  {
    if (verbal) siriusplayer.alert.show("Fetching SIRIUS Player channel map...", null);

    var chanmap = new XMLHttpRequest();
    chanmap.open('GET', siriusplayer.prefs.getCharPref('chanmapurl'), false); // is not async
    siriusplayer.setUserAgent(chanmap);
    chanmap.send(null);

    if (chanmap.status == 200)
    {
      var page = chanmap.responseText;
      var lines = page.split(/\r?\n/);
      for (var i=0; i<lines.length; i++)
      {
        var line = lines[i];
        var linepart = line.split(/\s*#\s*/);
        var comment = linepart[1];
        var part = linepart[0].split(/\s*=\s*/);
        var name = "channel." + part[0];
        var value = part[1];
        try
        {
          siriusplayer.prefs.setCharPref(name + '.code', value);
          siriusplayer.prefs.setCharPref(name + '.comment', comment);
        }
        catch(e) {};
      }

      if (verbal) siriusplayer.alert.show("Done fetching SIRIUS Player channel map.", null);
    }
    else
    {
      if (verbal) siriusplayer.alert.show("Failed fetching SIRIUS Player channel map.  If this persists, try forcing URL update.", null);
    }
  },

  getChannel: function(channelCode)
  {
    var channel = new XMLHttpRequest();
    channel.open('GET', siriusplayer.url() + '?activity=selectStream&stream=' + channelCode + '&token=' + siriusplayer.token, false); // is not async
    channel.send(null);

    if (channel.status == 200)
    {
      var page = channel.responseText;
      page = page.replace(/[\s\r\n]+/g, " ");
      var embed = page.match(/\s<EMBED.*?>/i);
      if (embed[0])
      {
        var src = embed[0].match(/\sSRC="([^"]+)"\s/i);
        var streamurl = src[1];
        siriusplayer.doStream(streamurl);
      }
      else
      {
        dump("No player code match.\n");
      }
    }
  },

  doStream: function(src)
  {
    if (siriusplayer.myEmbed) document.body.removeChild(siriusplayer.myEmbed);
    siriusplayer.myEmbed = null;
    if (src)
    {
      var myEmbed = document.createElement('EMBED');
      myEmbed.setAttribute('type', 'application/x-mplayer2');
      myEmbed.setAttribute('autostart', '1');
      myEmbed.setAttribute('src', src);
      siriusplayer.myEmbed = myEmbed;
      document.body.appendChild(siriusplayer.myEmbed);
    }
  },

};

siriusplayer.onLoad();
