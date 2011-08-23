/*
Rdio:
API Key: c6rv7hex6jacaeujwhyesd3k
Shared Secret: KKDtQNQKBE
*/
var bgPage = chrome.extension.getBackgroundPage();

var submitHandler = function(){
	var artist = $('#artist_input').val();
	var song = $('#song_input').val();
	
	var query = createQuery(artist, song);
	
	console.log("query: " + query);
	
	groovesharkFetch(query);
	spotifyFetch(query);
	lastfmFetch(artist, song);
	
	$('.track_link_container').show();
};

var createQuery = function(artist, song){
	artist = artist.replace(' ', '+');
	song = song.replace(' ', '+');
	
	var middle = '+';
	
	if(song == ''){
		middle = '';
	}
	
	var query = artist + middle + song;
	
	return query;
};

var spotifyFetch = function(query){
	$.ajax({
		url: 'http://ws.spotify.com/search/1/track.json?q=' + query,
		success: function(data){
			console.log("Spotify: ");
			console.log(data);
			if(!data || data.tracks.length == 0){
				$('.spotify_url').html("No Spotify results found.");
			} else {					
				var trackCode = data.tracks[0].href.split(':');
				var spotify_url = 'http://open.spotify.com/track/' + trackCode[2];
			
				$('.spotify_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + spotify_url +"\", \"selected\":true});window.close();'>" + spotify_url + "</a>");
				
			}
		},
		error: function(){
			console.log("there was an error with Spotify.");
		}
	});
};

//TODO: Finish me.
var spotifyLookup = function(uri){
  $.ajax({
		url: 'http://ws.spotify.com/lookup/1/.json?uri=' + uri,
		success: function(data){
		  
		},
		error: function(){
		  console.log("Error with Spotify lookup.")
		}	
	});
		
};

//This api needs to call the real grooveshark api.
var groovesharkFetch = function(query){
	$.ajax({
		url: 'http://tinysong.com/a/'+ query
		+'?format=json&key=b4385955bd9dd410287d0b3c7ffee5c8',
		success: function(data){
			console.log("Grooveshark: ");
			console.log(data);
			if(data.length === 2){
				$('.grooveshark_url').html('No Grooveshark results found.');
			} else {
				data = data.replace(/"/g, '');
				data = data.replace(/\\/g, '');
			
				var grooveshark_url = unescape(data);
			
				$('.grooveshark_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + grooveshark_url +"\", \"selected\":true});window.close();'>" + grooveshark_url + "</a>");
			}
		},
		error: function(){
			console.log("there was an error with grooveshark.");
		}
	});
};

var lastfmFetch = function(artist, song){
  artist = artist.replace(' ', '+');
	song = song.replace(' ', '+');
	
  $.ajax({
    url: 'http://ws.audioscrobbler.com/2.0/?method=track.getinfo&format=json&api_key=0cc6c91b6bf535eddc5fd9526eec1bb6&artist=' + artist + '&track=' + song,
    success: function(data){
      console.log("LastFm: ");
			console.log(data);
      if(!data || !data.track || data.message == "Track not found"){
				$('.last_fm_url').html("No Last.FM results found.");
			} else {					
				var last_fm_url = data.track.url;
			
				$('.last_fm_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + last_fm_url +"\", \"selected\":true});window.close();'>"+ last_fm_url +"</a>");
			}     
    },
    error: function(){
      console.log("there was an error with last.fm.");
    }
      
  });
};

var lastfmLookup = function(url){
  //deconstruct url to get artist and song
  //call other api's.
}

/*
rdiofy.getUserPlaylist = function() {
  var params = {
    'method': 'POST',
    'headers': {},
    'parameters': {
	},
    'body':'&method=getPlaylists' 
  };
	console.log('Fetching user\'s playlist');
 	bgPage.oauth.sendSignedRequest(bgPage.DOCLIST_FEED, rdiofy.userPlaylistCallback, params);
};

bgPage.oauth.authorize(function() {
	if (bgPage._rdioUser ==null) {
		rdiofy.log('No user details cached...fetching', INFO);
		rdiofy.getUserDetail();
	}
});
*/

var stringify = function(parameters) {
  var params = [];
  for(var p in parameters) {
    params.push(p + '=' + parameters[p]);
  }
  return params.join('&');
};

var rdio_authorize = function(){
	bgPage.oauth.authorize(rdioOnAuthorized);
};

var handleSuccess = function(resp, xhr) {
	var data = JSON.parse(resp);	
	console.log(data);
	console.log(xhr);
	
	var rdio_url = data.result.results[0].shortUrl;
	
	$('.rdio_url').html(data.result.results[0].shortUrl);
	
	$('.rdio_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + rdio_url +"\", \"selected\":true});window.close();'>"+ rdio_url +"</a>");
};

var rdioOnAuthorized = function(){

	var artist = $('#artist_input').val();
	var song = $('#song_input').val();
	
	var query = createQuery(artist, song);

  var params2 = {
  	'method' : 'search',
		'query' : query,
		'types' : 'Track',
		'count' : '1'
  };
  
  console.log(stringify(params2));
  
  var params = {	
    'method': 'POST',
    'body': stringify(params2)
  };
  
  bgPage.oauth.sendSignedRequest(bgPage.DOCLIST_FEED, handleSuccess, params);
};

$(document).ready(function(){
	$('#submit').click(submitHandler);
	$('#rdio_auth').click(rdio_authorize);
});