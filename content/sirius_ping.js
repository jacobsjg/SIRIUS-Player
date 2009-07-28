var siriusping = {

	pollInterval: 60000, // replaced by authorization service on demand

  url: function()
  {
    var urls = new Object();
    urls['US'] = 'http://www.sirius.com/sirius/authorization';
    urls['CA'] = 'http://mp.siriuscanada.ca/sirius-ca/authorization';
    return urls[siriusplayer.country()];
  },

	requestPoll: function()
	{
		if (siriusplayer.authok && siriusplayer.wantlogin)
		{
			var auth = siriusplayer.getAuthInfo();
			siriusping.user = auth.username;
			siriusping.reqXML = "data=<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
			siriusping.reqXML = siriusping.reqXML + "<!-- ver 1.2 -->";
			siriusping.reqXML = siriusping.reqXML + "<authorization validation=\"username\"";
			siriusping.reqXML = siriusping.reqXML + " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"authorization_request.xsd\">";
			siriusping.reqXML = siriusping.reqXML + "<login>" + siriusping.user + "</login>";
			siriusping.reqXML = siriusping.reqXML + "</authorization>";
			siriusping.req = new XMLHttpRequest();
			siriusping.req.open("POST", siriusping.url(), true);
			siriusping.req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			siriusping.req.onreadystatechange = siriusping.receivePoll;
			siriusping.req.send(siriusping.reqXML);
		}
		else siriusping.pollInterval = 60000; // reset to default if not connected
		setTimeout(siriusping.requestPoll, siriusping.pollInterval);
	},

	receivePoll: function()
	{
		if (siriusping.req.readyState == 4)
		{
			if (siriusping.req.status == 200)
			{
				siriusping.xmlDoc = document.implementation.createDocument("", "", null);
				var oParser = new DOMParser();
				siriusping.xmlDoc = oParser.parseFromString(siriusping.req.responseText, "text/xml");
				siriusping.processPoll();
			}
		}
	},

	processPoll: function()
	{
		var messageObj = siriusping.xmlDoc.getElementsByTagName("authorization")[0];
		if (messageObj == null) return;
		var timeStampNode = messageObj.getElementsByTagName("timestamp")[0];
		var pollIntNode = messageObj.getElementsByTagName("pollinginterval")[0];
		if (timeStampNode.childNodes.length == 0 || pollIntNode.childNodes.length == 0) return;
		var timeStamp = timeStampNode.childNodes[0].nodeValue;
		siriusping.pollInterval = pollIntNode.childNodes[0].nodeValue * 1000;
		var loginTimeStamp = siriusping.getCookie("sirius_user_logintimestamp");
		if (loginTimeStamp == null || loginTimeStamp.length < 5) return;
		if(loginTimeStamp < timeStamp) siriusping.stopStreaming();
	},

	getCookie: function(name)
	{
		var dc = siriusping.req.getRequestHeader("Cookie");
		var prefix = name + "=";
		var begin = dc.indexOf("; " + prefix);
		if (begin == -1)
		{
			begin = dc.indexOf(prefix);
			if (begin != 0) return null;
		}
		else begin += 2;
		var end = document.cookie.indexOf(";", begin);
		if (end == -1) end = dc.length;
		return unescape(dc.substring(begin + prefix.length, end));
	},

	stopStreaming: function()
	{
		siriusplayer.alert.show("Disconnect requested by SIRIUS.  Activity timeout or other error.", null);
		siriusplayer.logout();
	},

};

siriusping.requestPoll();
