preload("icn_entertainment", "http://cdn.sirius.com/mp/i/icn/");
preload("icn_star", "http://cdn.sirius.com/mp/i/icn/");
preload("icn_news", "http://cdn.sirius.com/mp/i/icn/");
preload("icn_sports", "http://cdn.sirius.com/mp/i/icn/");
preload("icn_music", "http://cdn.sirius.com/mp/i/icn/");
preload("icn_specials", "http://cdn.sirius.com/mp/i/icn/");

function Player(type) {

    this._cat = false;
    this._genre = false;
    this._channel = false;
    this._pane = '';
    this._focus = '';

    this.Category = function(category, page)
	{
	  if(category != null && category.length > 0) {
	    //turns off highlight
	    if (this._cat) {
	        top.frames['category'].document.getElementById(this._cat).className = 'hover-cat';
		    //SIR MP - 09/15/2006
	        //this.IconSwap(this._cat,'icn_'+this._cat+'_off');
	    }

	    parent.frames['category'].document.getElementById(category).className = 'hover-cat hover-cat-over';
	    //SIR MP - 09/15/2006
	    //this.IconSwap(category,'icn_'+category+'_on');
	    if (page) {
	    	top.frames['genre'].location = (page + "?category=" + category);
	    	top.frames['channel'].location = '/sirius/mediaplayer/player/common/lineup/channel.jsp';
	    }

	    this._cat = category;
	    this._focus = this._cat;
	  }
	}

	this.Genre = function(category, genre, page)
	{
	  if(genre != null && genre.length > 0) {
	    //turns off highlight
	    if (this._genre) {
	        top.frames['genre'].document.getElementById(this._genre).className = 'hover-ge';
	    }

	    top.frames['genre'].document.getElementById(genre).className = 'hover-ge hover-ge-over';
	    if (page) {
	    	top.frames['channel'].location = (page + "?category=" + category + "&genre=" + genre);
	    }

	    this._genre = genre;
	    this._focus = this._genre;
	  }
	}

	this.Channel = function(category, genre, channel, page, token)
	{
	  if(channel != null && channel.length > 0) {
		//turns off highlight
	    if (this._channel) {
	        top.frames['channel'].document.getElementById(this._channel).className = 'hover-ch';
	    }

	    top.frames['channel'].document.getElementById(channel).className = 'hover-ch hover-ch-clicked';
	    //refresh page
	    if (page) {
	        top.location = 
						"/sirius/servlet/MediaPlayer?activity=selectStream&stream=" + 
						channel + "&genre=" + genre + "&category=" + category + "&token=" + token;
	    }
        
	    this._channel = channel;
	    this._focus = this._channel;
	  }
	}

	this.IconSwap = function(cat,img)
	{
	    //SIR MP - 09/15/2006	
	    //parent.frames['category'].document.images['icn_'+cat].src = eval(img).src;
	}

	this.MouseOver = function(cat)
	{
		if (this._focus == cat) {
	    	return;
	    }
	    
	    var obj = parent.frames[this._pane].document.getElementById(cat);
	    var objClassName = obj.className;   
	    obj.className = objClassName+' '+objClassName+'-over';
	    //SIR MP - 09/15/2006		
	    //if (this._pane==top.frames['category'].name) {
	    //    this.IconSwap(cat,'icn_'+cat+'_on');
	    //}
	}
	
	this.MouseOut = function(cat)
	{
	    if (this._focus == cat) {
	    	return;
	    }	
	    
	    var obj = parent.frames[this._pane].document.getElementById(cat);
	    var objClassName = obj.className;
	    var temp = objClassName.split(' ');
	    obj.className = temp[0];
	    //SIR MP - 09/15/2006		
	    //if (this._pane==top.frames['category'].name) {
	    //    this.IconSwap(cat,'icn_'+cat+'_off');
	    //}
	}
	
}


//array to hold last5songs played objects
var last5Songs = parseLast5SongsCookie();

/** Song object for storing last 5 songs data **/
function Song() {

}

/** Loads the activeX script observer for Netscape browsers **/
function loader(){
	if ( navigator.appName == "Netscape" ) {
    document.appObs.setByProxyDSScriptCommandObserver(document.SIRIUSPlayer,true);	  
  }
}

/** Script command event handler for Netscape **/
function OnDSScriptCommandEvt (command, param) {
	processCaptionChange(param);
}

/** Processes a caption change event in the MediaPlayer plugin **/
function processCaptionChange(param) {
	var timerId = setTimeout("writeTitleAndArtist(" + param + ")",0);
}

/** clears the title and artist information **/
function clearTitleAndArtist() {
	if(!document.all && document.getElementById) {
		document.getElementById("artist").innerHTML = "";
		document.getElementById("title").innerHTML = "";
	}
	else if(document.all) {
		document.all.artist.innerHTML = "";
		document.all.title.innerHTML = "";
	}
	
	return;
}

/** Writes the Title And Artist caption information to the screen **/
function writeTitleAndArtist(type, param) {
	//get start index of title and artist in caption param
	var titleIndex = param.indexOf("TITLE");
	var artistIndex = param.indexOf("ARTIST");
	
	//parse caption param to extract title and artist info
	if (titleIndex != -1) {
		var titleAdvance = 6;
		var artistAdvance = 7;
		var end = param.length;
		var titleStart = titleIndex + titleAdvance;
		var artistStart = artistIndex + artistAdvance;
		var title = param.slice(titleStart, (artistIndex - 1));
		var artist = param.slice(artistStart, end);	
		
		//write title and artist to div	
		if(!document.all && document.getElementById) {
			document.getElementById("artist").innerHTML = artist;
			document.getElementById("title").innerHTML = title;
		}	
		else if(document.all) {
			document.all.artist.innerHTML = artist;
			document.all.title.innerHTML = title;
		}

		if(type == "NEWFLG")
			updateLast5Songs(artist , title);

		//write last 5 songs if in full player mode
		if(playerType == "full")
			displayLast5Songs();
	}
	return;
}

/** Updates the last 5 songs list with the new song **/
function updateLast5Songs(artist, title) {

	var newSong = new Song();
	newSong.artist = artist;
	newSong.title = title;
	newSong.genre = currentGenre; //from genre var in top_level page
	newSong.stream = currentStream; //from stream var in top_level page
	newSong.streamNumber = currentStreamNumber; //from streamNumber var in top_level page
	newSong.streamKey = currentStreamKey; //from currentStreamKey var in top_level page
	newSong.genreKey = currentGenreKey; //from currentGenreKey var in top_level page
	newSong.categoryKey = currentCategoryKey; //from currentCategoryKey var in top_level page
	
	
	//if its not a music channel, nothing and return
	if(newSong.categoryKey.indexOf("music") == -1)
		return;

	//reorder array and add this item as last element
	var tempArray = new Array();
	tempArray[tempArray.length] = newSong;

	for(i=0; i < last5Songs.length; i++) {
		if(i < 4) {
			tempSong = last5Songs[i];
			tempArray[tempArray.length] = tempSong;
		}
	}
	
	last5Songs = tempArray;
	
	//write new session cookie for last 5 songs data
	writeLast5SongsCookie(last5Songs);
}

/** displays the last5songs info on the screen **/
function displayLast5Songs() {

	//write dhtml last 5 songs using last5songs array as input data
	var html = "";
	if(last5Songs.length > 0)
		html = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">";
	
	for(i=0; i < last5Songs.length; i++) {
		var nextSong = last5Songs[i];
    html += "<tr>";
		html += "<td>";
    html += "<span class=\"t5nb\">" + nextSong.artist + "</span><br />";
    html += nextSong.title + "<br />";
		html += "<a href=\"/sirius/servlet/MediaPlayer?activity=selectStream&stream=" + nextSong.streamKey + "&genre=" + nextSong.genreKey + 
						"&category=" + nextSong.categoryKey + "&token=" + token  + "\">";
    html += "<span class=\"t5bb\">" + nextSong.streamNumber + "</span>";
		html += " | <span class=\"t5bb\">" + nextSong.stream + "</span></a><br />";
    html += "</td>";
    html += "</tr>";
    html += "<tr>";
    html += "<td><img src=\"/s.gif\" width=\"10\" height=\"8\"/></td>";
    html += "</tr>"
	}
	
	if(last5Songs.length > 0)
		html += "</table>";
	
	if(!document.all && document.getElementById) {
		document.getElementById("last5Songs").innerHTML = html;
	}
	else if(document.all) {
		document.all.last5Songs.innerHTML = html;
	}
}

/** writes the last5songs cookie to the session 
 * All values are escaped before being written to the cookie
 * Cookie Delimiters:
 * :: between song attribute and value
 * $$ between song attributes
 * #### between songs
 **/
function writeLast5SongsCookie(songs) {
	
	var value = "";
	
	//loop through songs array building string and adding it to cookie value
	for(i=0; i < songs.length; i++) {
		var song = songs[i];
		
		value += "artist::" + escape(song.artist) + "$$";
		value += "title::" + escape(song.title) + "$$";
		value += "genre::" + escape(song.genre) + "$$";
		value += "stream::" + escape(song.stream) + "$$";
		value += "streamKey::" + escape(song.streamKey) + "$$";
		value += "genreKey::" + escape(song.genreKey) + "$$";
		value += "categoryKey::" + escape(song.categoryKey) + "$$";
		value += "streamNumber::" + escape(song.streamNumber) + "####";
	}
	
	writeCookie("last5songs", value);
}

/** parses the last5songs cookie value into Song array **/
function parseLast5SongsCookie(input) {
	var cookieValue = readCookie("last5songs");
	var songs = new Array();
	
	if(cookieValue != null || cookieValue.length != 0) {
		//split cookie into individual Songs by #### delimiter
		var entries = new Array();
		entries = cookieValue.split("####");
		
		//for each song, split into components
		for(i=0; i < entries.length; i++) {
			var nextEntry = entries[i];
			
			//split songText on $$ to get individual attributes
			var attributes = new Array();
			attributes = nextEntry.split("$$");
			
			//for each attribute, split into name/value pair
			if(attributes.length == 8) {
				var song = new Song();
				for(x=0; x < attributes.length; x++) {
					var nextAttribute = attributes[x];
					
					//split attribute into name and value
					var nameValuePair = new Array();
					nameValuePair = nextAttribute.split("::");
					
					//add attribute to Song
					if(nameValuePair.length == 2) {
						var name = nameValuePair[0];
						var value = nameValuePair[1];
						
						switch(name) {
							case "artist":
								song.artist = unescape(value);
								break;
							case "title":
								song.title = unescape(value);
								break;
							case "genre":
								song.genre = unescape(value);
								break;
							case "stream":
								song.stream = unescape(value);
								break;
							case "streamNumber":
								song.streamNumber = unescape(value);
								break;
							case "streamKey":
								song.streamKey = unescape(value);
								break;
							case "genreKey":
								song.genreKey = unescape(value);
								break;
							case "categoryKey":
								song.categoryKey = unescape(value);
								break;
						}
					}
				}
			
				//add song to array
				songs[songs.length] = song;
			}
		}
	}
	
	return songs;
}

/** writes a transient cookie to the browser **/
function writeCookie(name, value) {
	//setup date to live for 30 days
	var newDate = new Date();
	newDate.setDate(newDate.getDate() + 30);
	
	document.cookie = name + "=" + escape(value) + "; path=/; expires=" + newDate.toGMTString();
}

/*
 * Sets the cookie with the expiration date. if 'expiredate' is not
 * provided, then cookie automatically becomes 'session cookie'.
 * i.e. the cookie will expire when the user shuts down their browser.
 */
function setCookie(c_name,value,expiredate) {
	document.cookie = c_name + "=" + escape(value) + "; path=/" + ((expiredate == null) ? "" : "; expires=" + expiredate);
}

/** read a cookie **/
function readCookie(name) {
	//get all cookies
	var allCookies = document.cookie;
	
	//find position index of named cookie
	var pos = allCookies.indexOf(name);
	
	if(pos != -1) {
		var start = pos + name.length + 1;
		var end = allCookies.indexOf(";", start);
		if(end == -1) end = allCookies.length;
		
		var value = allCookies.substring(start, end);
		value = unescape(value);
		
		return value;
	}
	else {
		return "";
	}
}

/* opens new window for buy now link */
function openBuyNow(url) {
	var newWin = window.open(url,"","");
	return;
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