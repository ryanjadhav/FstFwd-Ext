(function(){
	var bgPage = chrome.extension.getBackgroundPage();

	//private artist and song.
	var artist, song;
	
	//private function to create a standard query
	var createQuery = function(artist, song){	
		artist = artist.replace(/\s/g, '+');
		song = song.replace(/\s/g, '+');
		
		//middle concatinator
		var middle_concat = '+';
		
		if(song == ''){
			middle_concat = '';
		}
		
		return artist + middle_concat + song;
	};
	
	//parse user urls
	var parseUrl = function(url, callback){
		url = url.replace('http://', '');
		var splitUrl = url.split('/');
		
		if(splitUrl[0] == 'open.spotify.com'){
			spotifyLookup(splitUrl[2], function(data){
				callback.call(this, data);
			});
		} else if(splitUrl[0] == 'last.fm' || 'www.last.fm'){
			callback.call(this, lastfmLookup(splitUrl[2], splitUrl[4]));
		} else {
			console.log('Not a Recognized URL.');
		}
	};
	
	//look up spotify data with user uri, return track info for queries
	var spotifyLookup = function(uri, callback){
		console.log('performing a spotify lookup');
	  var trackInfo;
	  $.ajax({
			url: 'http://ws.spotify.com/lookup/1/.json?uri=spotify:track:' + uri,
			success: function(data){
				if(!data || !data.track){
					console.log('Error with Spotify URL');
				} else {
					//return data for queries
					trackInfo = { 
						'artist': data.track.artists[0].name,
						'track': data.track.name
					};
					
					callback.call(this, trackInfo);
				}
			},
			error: function(){
			  console.log("Error with Spotify lookup.")
			}	
		});	
	};

	//private function for ajax request to spotify
	var spotifyFetch = function(trackInfo){
		var query = createQuery(trackInfo.artist, trackInfo.track);
		
		console.log(query);

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
				console.log("There was an error with Spotify.");
			}
		});	
	};
	
	//TODO
	var grooveSharkLookup = function(uri){
		//Waiting on grooveshark api.
	}
	
	//This api needs to call the real grooveshark api.
	var groovesharkFetch = function(trackInfo){
		var query = createQuery(trackInfo.artist, trackInfo.track);
	
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
				console.log("There was an error with Grooveshark.");
			}
		});
	};
	
	var lastfmLookup = function(artist, track){
	  return {
	  	'artist': artist,
	  	'track': track
	  };
	};
	
	var lastfmFetch = function(artist, song){
	  artist = artist.replace(' ', '+');
		song = song.replace(' ', '+');
		
	  $.ajax({
	    url: 'http://ws.audioscrobbler.com/2.0/?method=track.getinfo&format=json&api_key=0cc6c91b6bf535eddc5fd9526eec1bb6&artist=' + artist + '&track=' + song,
	    success: function(data){
	      console.log("Object from LastFm: ");
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
	
	var stringify = function(parameters) {
	  var params = [];
	  for(var p in parameters) {
	    params.push(p + '=' + parameters[p]);
	  }
	  return params.join('&');
	};
	
	var handleRdioSuccess = function(resp, xhr) {
		var data = JSON.parse(resp);	
		console.log(data);
		console.log(xhr);
		
		var rdio_url = data.result.results[0].shortUrl;
				
		$('.rdio_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + rdio_url +"\", \"selected\":true});window.close();'>"+ rdio_url +"</a>");
	};
	
	//TODO
	var rdioOnAuthorizedLookup = function(){
	
	};
	
	var rdioOnAuthorizedFetch = function(){
		var artist = $('#artist_input').val();
		var song = $('#song_input').val();
		
		var query = createQuery(artist, song);
	
	  var params2 = {
	  	'method' : 'search',
			'query' : query,
			'types' : 'Track',
			'count' : '1'
	  };
	    
	  var params = {	
	    'method': 'POST',
	    'body': stringify(params2)
	  };
	 		 	
	  bgPage.oauth.sendSignedRequest(bgPage.DOCLIST_FEED, handleRdioSuccess, params);
	};
	
	var rdioLookup = function(){
		bgPage.oauth.authorize(rdioOnAuthorizedLookup);
	}

	var rdioFetch = function(){
		bgPage.oauth.authorize(rdioOnAuthorizedFetch);
	};
	
	$(document).ready(function(){
		$('.track_link_container').delegate('.service_data', 'click', function(){
			var selectedService = $(this).attr('service');
			var userUrl = $('#track_input').val();
			
			parseUrl(userUrl, function(data){
				console.log(data);
				if(selectedService == 'spotify'){
					spotifyFetch(data);
				}	else if(selectedService == 'lastfm'){
					lastfmFetch(data.artist, data.track);
				}			
			});			
		});
	});	
})();