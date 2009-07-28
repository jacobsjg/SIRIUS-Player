var req;
var reqXML;
var url;
var user;
var timeStamp;
var pollInterval;
var xmlDoc;

function pollMPUser(userName) {
	user = userName;
	reqXML = 		  "data=<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
	reqXML = reqXML + "<!-- ver 1.2 -->";
	reqXML = reqXML + "<authorization validation=\"username\""; 
	reqXML = reqXML + " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"authorization_request.xsd\">";
	reqXML = reqXML + "<login>" + user + "</login>";
	reqXML = reqXML + "</authorization>";
	pollInterval = 60000; //default: to start with
	setTimeout('startMP()', pollInterval);
}

function startMP() {
	init();
	req.onreadystatechange = pollUser;
	req.send(reqXML);
	setTimeout('startMP()', pollInterval);
}

function init() {
	if (window.XMLHttpRequest) {
		req = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		req = new ActiveXObject("Microsoft.XMLHTTP");
	}
	var url = "/sirius/authorization";
	req.open("POST", url, true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
}

function pollUser() {
	if (req.readyState == 4) {
		if (req.status == 200) {
			//Get Authorization Response from AEPA
			if(window.ActiveXObject) { //For IE
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = false;
				xmlDoc.loadXML(req.responseText);
				displayAlert();
			}
			if(document.implementation && document.implementation.createDocument) {//For Mozilla
				xmlDoc = document.implementation.createDocument("","",null);
				var oParser = new DOMParser();
				xmlDoc = oParser.parseFromString(req.responseText , "text/xml");
				displayAlert();
			}
		}
	}
}

function displayAlert() {
	var messageObj = xmlDoc.getElementsByTagName("authorization")[0];
	if(messageObj == null)
		return;
	var timeStampNode = messageObj.getElementsByTagName("timestamp")[0];
	var pollIntNode = messageObj.getElementsByTagName("pollinginterval")[0];
	if(timeStampNode.childNodes.length == 0 || pollIntNode.childNodes.length == 0)
		return;
	var timeStamp = timeStampNode.childNodes[0].nodeValue;
	pollInterval = pollIntNode.childNodes[0].nodeValue * 1000;
	//Get Time stamp from cookie
	var loginTimeStamp = getCookie("sirius_user_logintimestamp");
	//If we dont find the timestamp cookie, then we allow the user
	//to stream
	if(loginTimeStamp == null || loginTimeStamp.length < 5)
		return;
	if(loginTimeStamp < timeStamp) { // Stop streaming
		stopStreaming();
		//display a window saying u r logged off
		/* Commented out by Ritesh. We will now be using a new logout page
		   instead of this pop up window
		logOffWindow = window.open("","LogOff","width=300,height=300");
		var htmlString = "You have logged in a different machine<BR>";
		htmlString = htmlString + "You will be logged off now.<BR>";
		htmlString = htmlString + "Please Click <BR>";
		htmlString = htmlString + "<input type=\"button\" value=\"Ok\" onClick=\"self.close()\">";
		logOffWindow.document.write(htmlString);
		*/
	}
}
/*
	Utility function which returns cookie value when cookie name is provided.
	Returns null if cookie with given name is not found
*/
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
    }
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
        end = dc.length;
    }
    return unescape(dc.substring(begin + prefix.length, end));
}

function stopStreaming() {
	location.href = "/sirius/mediaplayer/error/logout.jsp";
}