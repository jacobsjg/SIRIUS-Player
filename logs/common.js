/* Common JavaScript functions for sirius.com */
/* **********************************
 * Opens the Media Player window 
 * DEPRECATED:  Use launchPlayer()
 * **********************************/
function openMediaPlayer(winName, genre, channel, source, target) {

	var sourceString = "";
	
	//setup source if exists
	if(source != null && source.length >  0) {
		sourceString = "source=" + source;	
	}
	
	var domain = "http://www.sirius.com";
	
	//setup url
	var url = domain + "/sirius/servlet/MediaPlayer?activity=expand&streamNumber=" + channel + "&" + sourceString;
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=575,width=650,screenX=10,screenY=10,left=10,top=10";
	
	//determine target media player page if requested - default is selection screen
	if(target == "register") {
		url = domain + "/sirius/servlet/MediaPlayerRegistration?" + sourceString;
	} else if(target == "guestlogin") {
		url = domain + "/sirius/servlet/MediaPlayer?activity=selectLoginType&type=guest&" + sourceString;
	} else if(target == "sublogin") {
		url = domain + "/sirius/servlet/MediaPlayer?activity=selectLoginType&type=subscriber&" + sourceString;
	}

	var newWin = window.open(url, "FullMediaPlayer", features);
	return;
}

/* **********************************
 * Opens the Media Player Registration window 
 * **********************************/
function launchRegistration(source)
{
	var domain = "http://www.sirius.com"; 
	
	var url = domain + "/sirius/servlet/MediaPlayerRegistration";
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=575,width=650,screenX=10,screenY=10,left=10,top=10";
	var newWin = window.open(url, "FullMediaPlayer", features);

	return;
}

/* **********************************
 * Opens the Media Player window 
 * **********************************/
function launchPlayer(genreKey, channelKey, source, target) {
	
	//setup source if exists
	/*alert("genreKey:"+genreKey);
		alert("channelKey:"+channelKey);
			alert("source:"+source);
				alert("target:"+target);*/
	var sourceString = "";
	if(source != null && source.length >  0) {
		sourceString = "source=" + source;	
	}
	
	var domain = "http://www.sirius.com"; 
	
	var url = domain + "/sirius/servlet/MediaPlayer?stream=" + channelKey + "&" + sourceString;
	
	if(target == "register") {
		url = domain + "/sirius/servlet/MediaPlayerRegistration?" + sourceString;
	} else if(target == "guestlogin") {
		url = domain + "/sirius/servlet/MediaPlayer?activity=selectLoginType&type=guest&" + sourceString;
	} else if(target == "sublogin") {
		url = domain + "/sirius/servlet/MediaPlayer?activity=selectLoginType&type=subscriber&" + sourceString;
	}
	
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=575,width=650,screenX=10,screenY=10,left=10,top=10";
	var newWin = window.open(url, "FullMediaPlayer", features);

	return;
}

/* *********************************************** 
 *Opens the Email Update window with the input form 
 * ***********************************************/
function openEmailSignup(target) {
	var win = window.open(target, 
												"email_updates", 
												"menubar=no,locationbar=no,status=no,resizable=yes,height=200,width=400");
	return;
}

/** ***********************************************************
 * Pops open a new window for email to a friend.
 * This method adds the additional decrypt flag to indicate whether or not the
 * URL for the email is encrypted or not.
 *
 * decrypt = true for encryption/decryption
 * ************************************************************/
function popEmailWindow(szTitle,szURL,szPageName, decrypt) {
	var nWidth = 552;
	var nHeight = 400;
		
	var szFeatures = "menubar=no,resizable=no,scrollbars=no,toolbar=no,height="+nHeight+",width="+nWidth;
	var szBaseURL = "/servlet/ContentServer?pagename=Sirius/CachedPage&c=Article&cid=1026142020450";
	var szWinURL = szBaseURL + "&p1=" + escape(szTitle) + "&p2=" + escape(szURL) + "&p3=" + escape(szPageName) + "&decrypt=" + decrypt;
	wEmailWin = window.open(szWinURL,"EmailWin",szFeatures);
	wEmailWin.focus();
	
	return;
		
}

/* ******************************************************
 * Opens a new window for the Single Stream Media Player 
 * ******************************************************/
function openSingleStreamPlayer(stream) {

	var width = 552;
	var height = 350;

	var url = "/servlet/SingleMediaPlayer?stream=" + escape(stream);
	var windowName = "SIRIUS_Single_Stream_Player";
	var features="menubar=no,locationbar=no,status=no,resizable=no,height=" + height + ",width=" + width;
	var newWin = window.open(url,windowName,features);
	return;
}

/* *********************************************************
 * View BackStageAsset window 
 * *********************************************************/
function viewBackstageAsset(assetId) {

	var url = "/servlet/ContentServer?pagename=Sirius/Page&c=BackStageAsset&cid=" + assetId;
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=200,width=315";
	var newWin = window.open(url,"BackStageAsset",features);

	return;
}

/* *********************************************************
 * View Slideshow window 
 * *********************************************************/
function viewSlideShow(collectionId) {

	var url = "/servlet/ContentServer?pagename=Sirius/Page&c=Collection&cid=" + collectionId;
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=390,width=390";
	var newWin = window.open(url,"Collection",features);

	return;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//	setCookie() - Create a cookie with the specified name and value.
//  Args:
//      sName                       - name of the cookie
//      sValue                      - value of the cookie
//      sDomain[OPTIONAL]           - Setting the domain of the cookie allows pages on a domain made up
//                                      of more than one server to share cookie information
//      sPath[OPTIONAL]             - Setting a path for the cookie allows the current document to share cookie
//                                      information with other pages within the same domain
//      sExpires[OPTIONAL]          - Setting no expiration date on a cookie causes it to expire when
//                                      the browser closes. If you set an expiration date in the future, the cookie
//                                      is saved across browser sessions. If you set an expiration date in the past,
//                                      the cookie is deleted. Use GMT format to specify the date.
////////////////////////////////////////////////////////////////////////////////////////////////////////
function setCookie(sName, sValue, sDomain, sPath, sExpires) {
	if(sName) {
		var sCookie = sName + "=";
		if(sValue)
			sCookie += escape(sValue);
		if(sPath)
		   sCookie += "; path=" + sPath;
		if(sDomain)
			sCookie += "; domain=" + sDomain;
		if(sExpires)
			sCookie += "; expires=" + sExpires;
		document.cookie = sCookie;
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
//	getCookie() - Retrieve the value of the cookie with the specified name.
//  Args:
//  sName                       - name of the cookie
////////////////////////////////////////////////////////////////////////////////////////////////////////
function getCookie(cookieName) {
	var cookieArray = document.cookie.split("; ");
	for(k in cookieArray)
	{
		var cookie = cookieArray[k].split("=");
		if (cookieName == cookie[0])
			return unescape(cookie[1]);
	}
	return null;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
//	deleteCookie() - Deletes the cookie with the specified name.
//  Args:
//  sName                       - name of the cookie
////////////////////////////////////////////////////////////////////////////////////////////////////////
function deleteCookie(cookieName, path, domain)
{
	setCookie(cookieName, null, domain, path, "Thu, 01-Jan-70 00:00:01 GMT")
}

/** *************************************************
 * Appends the users source (from SIRIUS_CAMPAIGN cookie) to the input URL
 * **************************************************/
function getSourceUrl(instring) {
	var campaign_code = getCookie("SIRIUS_CAMPAIGN");	
	if (campaign_code != null) {
		if (instring.indexOf("?") == -1)
			instring += "?source=" + campaign_code;
		else
			instring += "&source=" + campaign_code;
	}
	return instring;
}

/** *************************************************
 * Appends the users sid (from SIRIUS_VISITOR_ID cookie) to the input URL
 * **************************************************/
function getSIDUrl(instring) {
	var sidVal = getCookie("SIRIUS_VISITOR_ID");	
	if (sidVal != null) {
		if (instring.indexOf("?") == -1)
			instring += "?sid=" + sidVal;
		else
			instring += "&sid=" + sidVal;
	}
	return instring;
}

/** *************************************************
 * Appends the users source and sid 
 * (from SIRIUS_CAMPAIGN and SIRIUS_VISITOR_ID cookie) to the input URL
 * **************************************************/
function getSourceAndSIDUrl(instring) {
	var campaign_code = getCookie("SIRIUS_CAMPAIGN");	
	if (campaign_code != null) {
		if (instring.indexOf("?") == -1)
			instring += "?source=" + campaign_code;
		else
			instring += "&source=" + campaign_code;
	}
	var sidVal = getCookie("SIRIUS_VISITOR_ID");	
	if (sidVal != null) {
		if (instring.indexOf("?") == -1)
			instring += "?sid=" + sidVal;
		else
			instring += "&sid=" + sidVal;
	}
	return instring;
}

/** ***********************************************************
 * opens the SIRIUS Direct site and passes in the users source code if present
 * ************************************************************/
function siriusDirect() {
	var url = getSourceUrl("http://shop.sirius.com/pl/legacyRedir.plx");
	window.location = url;
}

/** **********************************************
 * Pre-load images for rollover effects
 * ***********************************************/
function preload(name,dir) {
	eval(
		name + "_on = new Image();" + 
		name + "_on.src = \"" + dir + name + "_on.gif\";" + 
		name + "_off = new Image();" + 
		name + "_off.src = \"" + dir + name + "_off.gif\";"
	);
}

/** **************************************************
 * load a new image
 * ***************************************************/
function loadImage(name, img) {
	if (document.images) {
		document.images[name].src = img.src;
	}
}

/*****************************************************
 * this function is used by Google search page top nav
*****************************************************/
function changeImageGoogle(name,img) {
	if (document.images) {			
		document[name].src = img;			
	}
}

/* ****************************************************
 * Opens new window 
 * ****************************************************/
function pop(url,name,h,w,s,t,m,r){
	var wWin = null;
	if(uBN=="MSIE" && uOS=="Macintosh"){r = "no"};
	if(document.location.href.substring(0,5) == "https"){
		name="https";
	}
	if(aol){
		wWin = window.open(url,name,"height="+h+",width="+w+"scrollbars="+s+",toolbar="+t+",menubar="+m+",locationbar=no");

		//wWin.resizeTo(w,h);

		wWin.focus();
	} else {
		x=(screen.availWidth-w);
		y=(screen.availHeight-h);
		if (name.document) {
			name.document.location.href=url;
		} else {
			wWin=window.open(url,name,"height="+h+",width="+w+",scrollbars="+s+",toolbar="+t+",menubar="+m+",resizable="+r+",status=yes,location=no,screenX="+x/2+",screenY="+y/2+",left="+x/2+",top="+y/2);
			//wWin.resizeTo(w,h);
			wWin.focus();
		}
	}
}

/** ***************************************************
 * Returns the value of the input query string parameter
 * ****************************************************/
function getParaValue(paraName) {
	var searchString = location.search;
	
	if (searchString == null)
		return null;
		
	var fields = searchString.substring(1).split("&");
	for (var i = 0; i < fields.length; i++) {
		tmp = fields[i].split("=");
		if (tmp[0] == "source") {
			if (typeof(tmp[1]) == "undefined")
				return null;
			var sourceVal = unescape(tmp[1]);
			var validChars = "abcdefghijklmnopqrstuvwxyz0123456789";
			var letter = sourceVal.charAt(0).toLowerCase();
			if (validChars.indexOf(letter) == -1)
				return null;
			else
				return sourceVal;
		}		
	}
	return null;
}

/* ***********************************************************
 * Set cookie for SIRIUS_CAMPAIGN, if source is found on query string
 * This script runs every time this file is loaded
 * ***********************************************************/
var expires = new Date();
expires.setTime(expires.getTime() + (30*24*60*60*1000));
var campaignCookie = getParaValue("source");

if (campaignCookie) {
	setCookie("SIRIUS_CAMPAIGN", campaignCookie, null, "/", expires.toGMTString());
}

// Clear Field
function clearField(fldObj) {
	fldObj.value = "";
}
  
// Diplay Default
function populateField(fldObj,val) {
	if (fldObj.value == "") {
		fldObj.value = val;
	}
}
/** ***********************************************************
 * Talk To Us PopUp Window 
 *
 * Parameter - Channel Id
 * ************************************************************/
function popTalkToUsWindow(channelId) {
	var nWidth = 550;
	var nHeight = 374;
		
	var szFeatures = "menubar=no,resizable=no,scrollbars=no,toolbar=no,height="+nHeight+",width="+nWidth;
	var szBaseURL = "/servlet/ContentServer?pagename=Sirius/Channel/TalkToUs&cid="+channelId;
	wTalkToUsWin = window.open(szBaseURL,"TalkToUs",szFeatures);
	wTalkToUsWin.focus();
	
	return;
		
}
/** ***********************************************************
 * Request A Song PopUp Window 
 *
 * Parameter - Channel Id
 * ************************************************************/
function popRequestASongWindow(channelId) {
	var nWidth = 550;
	var nHeight = 374;
		
	var szFeatures = "menubar=no,resizable=no,scrollbars=no,toolbar=no,height="+nHeight+",width="+nWidth;
	var szBaseURL = "/servlet/ContentServer?pagename=Sirius/Channel/RequestASong&cid="+channelId;
	wRequestASongWin = window.open(szBaseURL,"RequestASong",szFeatures);
	wRequestASongWin.focus();
	
	return;	
}

/** **************************************************************
 * Open a basic new window.  Used for opening new windows from flash movies
 *
 *****************************************************************/
function openWindow(url) {
	var newWin = window.open(url,"");
	newWin.focus();
}

/** ****************************************************************
 * processes a link tracking call from flash movies
 *
 *******************************************************************/
function trackLinkWithAccount(linkName,accountCode) {
	//alert(linkName);
	if(linkName != null && linkName.length > 0) {
		//_uacct = "UA-69195-12";
		//urchinTracker(linkName);
                
                var linkTracker = _gat._getTracker(accountCode);
                linkTracker._initData();
                linkTracker._trackPageview(linkName);
	}
	return;
}

/* **********************************
 * Opens the Radio Guide window 
 * **********************************/
function launchRadioGuide() {
	
	var url = "/servlet/ContentServer?pagename=Sirius/Common/RadioGuide";
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=515,width=795,screenX=10,screenY=10,left=10,top=10";
	var newWin = window.open(url, "RadioGuide", features);

	return;
}

/* **********************************
 * Opens the Flash Demo window 
 * **********************************/
function launchDemo() {
	
	var url = "/servlet/ContentServer?pagename=Sirius/Common/Demo";
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=275,width=605,screenX=10,screenY=10,left=10,top=10";
	var newWin = window.open(url, "SiriusFlashDemo", features);

	return;
}

/** ***********************************************************
 * opens the Music Mayhem site and passes in the users source code if present
 * ************************************************************/
function musicMayhem() {
	var url = getSourceUrl("http://mayhem.sirius.com/index.html");
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=600,width=800,screenX=10,screenY=10,left=10,top=10";
	var newWin = window.open(url, "MusicMayhem", features);
	return;
}

/** ***********************************************************
 * opens the Get Sirius page in the parent window - used for the DEMO pup-up : Organic's solution
 * ************************************************************/
function getSirius(){
    window.opener.location.href = '/getsirius';
    window.close();
}

/* **********************************
 * Launch the Flash Video Player 
 * **********************************/
function launchVideoPlayer(pageName, flashMovie) {
	
	var url = "/common/flash/video_player.jsp?pageName=" + escape(pageName) + "&flashMovie=" + escape(flashMovie);
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=260,width=320,screenX=10,screenY=10,left=10,top=10";
	var newWin = window.open(url, "SiriusVideoPlayer", features);

	return;
}



function googleSearch(searchString)
{
	if(searchString == null || searchString == "undefined")
			searchString = "";

	document.searchFrm.q.value = searchString;
    document.searchFrm.submit();
}

function openTVad() {
    var tvad;
    var xMax = 0;
    var yMax = 0;
    if (document.all) {
        xMax = screen.width;
        yMax = screen.height;
    } else {
        xMax = window.outerWidth;
        yMax = window.outerHeight;
    }
    var xOffset = (xMax - 684) / 2, yOffset = (yMax - 500) / 2;
    var url = '/tvad2/tvad2.htm';
    var name = 'tvadwindow';
    tvad = window.open(url, name,
            'left=' + xOffset + ',top=' + xOffset + ',width=684,height=500,toolbar=0,resizable=0,directories=0,status=0,menubar=0,scrollbars=0');
    if (window.focus) {
        tvad.focus()
    }

}

function openHPTVad() {
    var tvad;
    var xMax = 0;
    var yMax = 0;
    if (document.all) {
        xMax = screen.width;
        yMax = screen.height;
    } else {
        xMax = window.outerWidth;
        yMax = window.outerHeight;
    }
    var xOffset = (xMax - 684) / 2, yOffset = (yMax - 500) / 2;
    var url = '/tvad3/tvad3.htm';
    var name = 'hptvadwindow';
    tvad = window.open(url, name,
            'left=' + xOffset + ',top=' + xOffset + ',width=684,height=500,toolbar=0,resizable=0,directories=0,status=0,menubar=0,scrollbars=0');
    if (window.focus) {
        tvad.focus()
    }

}

function onTVadPopup() {
    var tvad;
    var xMax = 0;
    var yMax = 0;
    trackLink('ontv_spot1_flash_open_popup');
    if (document.all) {
        xMax = screen.width;
        yMax = screen.height;
    } else {
        xMax = window.outerWidth;
        yMax = window.outerHeight;
    }
    var xOffset = (xMax - 684) / 2, yOffset = (yMax - 500) / 2;
    var url = '/tvad2/tvad2.htm';
    var name = 'tvadwindow';
    tvad = window.open(url, name,
            'left=' + xOffset + ',top=' + xOffset + ',width=684,height=500,toolbar=0,resizable=0,directories=0,status=0,menubar=0,scrollbars=0');
    if (window.focus) {
        tvad.focus()
    }

}

function callGoogleAnalytics(analyticsAccount1,analyticsAccount2){
    var firstTracker = _gat._getTracker(analyticsAccount1);
    firstTracker._initData();
    firstTracker._trackPageview();
    
    var secondTracker = _gat._getTracker(analyticsAccount2);
    secondTracker._initData();
    secondTracker._trackPageview();
}
/* *********************************************************
 * open Video Player
 * *********************************************************/
function openSingleVideoPlayer(assetId) {
        var baseURL = window.location.href;
        var basepgname = '';

        var servlet_parts = baseURL.split("/servlet");
        if (servlet_parts.length > 1 && servlet_parts[0].length >= 1 && servlet_parts[1].length >= 1){
            basepgname = '';
        } else {
            var slash_parts = baseURL.split("/");
            if (slash_parts.length > 1){
                basepgname = slash_parts[slash_parts.length-1];
            }
        }
        
	var url = "/servlet/ContentServer?pagename=Sirius/BackStageAsset/VideoPlayer&cid=" + assetId+'&basepgname='+basepgname;
	var features = "location=no,menubar=no,locationbar=no,status=no,resizable=no,height=488,width=355";
	var newWin = window.open(url,"videoplayer",features);
	newWin.focus();

	return;
}
/* *********************************************************
 * This function returns User's Browser Name
 * *********************************************************/
function userBrowserName() {
    var agt=navigator.userAgent.toLowerCase();
    if (agt.indexOf("opera") != -1) return 'Opera';
    if (agt.indexOf("staroffice") != -1) return 'Star Office';
    if (agt.indexOf("webtv") != -1) return 'WebTV';
    if (agt.indexOf("beonex") != -1) return 'Beonex';
    if (agt.indexOf("chimera") != -1) return 'Chimera';
    if (agt.indexOf("netpositive") != -1) return 'NetPositive';
    if (agt.indexOf("phoenix") != -1) return 'Phoenix';
    if (agt.indexOf("firefox") != -1) return 'Firefox';
    if (agt.indexOf("safari") != -1) return 'Safari';
    if (agt.indexOf("skipstone") != -1) return 'SkipStone';
    if (agt.indexOf("msie") != -1) return 'Internet Explorer';
    if (agt.indexOf("netscape") != -1) return 'Netscape';
    if (agt.indexOf("mozilla/5.0") != -1) return 'Mozilla';
    if (agt.indexOf('\/') != -1) {
        if (agt.substr(0,agt.indexOf('\/')) != 'mozilla') {
            return navigator.userAgent.substr(0,agt.indexOf('\/'));
        }
        else 
            return 'Netscape';
    } else if (agt.indexOf(' ') != -1)
        return navigator.userAgent.substr(0,agt.indexOf(' '));
    else 
        return navigator.userAgent;
}

function submitMPForm(promo)
{	
	//alert("Inside submitMPForm");
	var submitForm = getNewSubmitForm("mpguest","POST");
	//alert("Inside submitMPForm:After creating a new form");
	createNewFormElement(submitForm, "source", promo); 
	submitForm.action= "/freetrial/register";
	submitForm.submit();
}

//helper function to create the form
function getNewSubmitForm(formName,method){
 var submitForm = document.createElement("FORM");
 document.body.appendChild(submitForm);
 submitForm.name=formName;
 submitForm.method = method;
 return submitForm;
}

//helper function to add elements to the form
function createNewFormElement(inputForm, elementName, elementValue){
	
 var el = document.createElement("input");
 el.type = "hidden";
 el.name = elementName;
 el.value = elementValue;
 inputForm.appendChild(el);

 return el;
}
