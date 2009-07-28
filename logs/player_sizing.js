
/**
 * Minimizes the Media Player.
 */
function minimize(category, genre, stream, token) {
	var url = "/sirius/servlet/MediaPlayer?activity=minimize&category=" + category + "&genre=" + genre + "&stream=" + stream + "&token=" + token;
	var features="menubar=no,locationbar=no,status=no,resizable=yes,height=310,width=370,screenX=-10,screenY=-10,left=10,top=10";
	var newWin = window.open(url, "SmallMediaPlayer", features);

	//close existing window
	window.close();
}

/**
 * Expands the Media Player to full size.
 */
function expand(category, genre, stream, token) {
	var url = "/sirius/servlet/MediaPlayer?activity=expand&category=" + category + "&genre=" + genre + "&stream=" + stream + "&token=" + token;
	var features = "menubar=no,locationbar=no,status=no,resizable=yes,height=575,width=650,screenX=10,screenY=10,left=10,top=10";
	var newWin = window.open(url, "FullMediaPlayer", features);

	//close existing window
	window.close();
}