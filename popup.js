/*
Rdio:
API Key: c6rv7hex6jacaeujwhyesd3k
Shared Secret: KKDtQNQKBE

Last.fm:
API Key: 0cc6c91b6bf535eddc5fd9526eec1bb6
Secret: 8a1487b224d940518bcc9f17aae1d5b5
*/
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
				$('.spotify_url').html("No Spotify Results found.");
			} else {					
				var trackCode = data.tracks[0].href.split(':');
				var spotify_url = 'http://open.spotify.com/track/' + trackCode[2];
			
				$('.spotify_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + spotify_url +"\", \"selected\":true});window.close();'>Spotify</a>");
				
			}
		},
		error: function(){
			console.log("there was an error with spotify.");
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
			
				$('.grooveshark_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + grooveshark_url +"\", \"selected\":true});window.close();'>Grooveshark</a>");
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
      if(!data || data.track.length == 0){
				$('.spotify_url').html("No Last.FM Results found.");
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

$(document).ready(function(){
	$('#submit').click(submitHandler);
});