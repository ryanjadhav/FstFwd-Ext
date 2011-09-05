(function(){
	var bgPage = chrome.extension.getBackgroundPage();
	
	/**
	* Utility Functions:
	*/
	//create a standard query
	var createQuery = function(artist, song){	
		var middle_concat;
		if(artist){
			artist = artist.replace(/\s/g, '+');
		} 
		
		if(song){
			song = song.replace(/\s/g, '+');
		}
		
		song ? middle_concat = '+' : middle_contcat = '';
		
		return artist + middle_concat + song;
	};
	
	//create a query for post header parameters	
	var stringify = function(parameters) {
	  var params = [];
	  for(var p in parameters) {
	    params.push(p + '=' + parameters[p]);
	  }
	  
	  return params.join('&');
	};
	
	/**
	* API Functions:
	*/
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
			  console.log("Error with Spotify lookup.");
			  callback.call(this, trackInfo);
			}	
		});	
	};

	//private function for ajax request to spotify
	var spotifyFetch = function(trackInfo){
		console.log('performing a spotify fetch');
		
		if(trackInfo && trackInfo.artist && trackInfo.track){
			var query = createQuery(trackInfo.artist, trackInfo.track);
			console.log('query: ' + query);
	
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
					$('.spinner').hide();
	
				},
				error: function(){
					console.log("There was an error with Spotify.");
					$('.spotify_url').html("No Spotify results found.");
				}
			});	
		} else {			
			console.log("Grooveshark search no song data.");
			$('.spotify_url').html("No Spotify results found.");
		}
	};
	
	var groovesharkLookup = function(artist, track){
		console.log('performing grooveshark lookup');

	  return {
	  	'artist': artist,
	  	'track': track
	  };	
	};
	
	//This api needs to call the real grooveshark api.
	var groovesharkFetch = function(trackInfo){
		console.log('performing a grooveshark fetch');
		
		if(trackInfo && trackInfo.artist && trackInfo.track){
			var query = createQuery(trackInfo.artist, trackInfo.track);
			console.log('query: ' + query);		
		
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
					$('.spinner').hide();
		
				},
				error: function(){
					console.log("There was an error with Grooveshark.");
					$('.grooveshark_url').html('No Grooveshark results found.');							
		
				}
			});
		} else {			
			console.log("Grooveshark search no song data.");
			$('.grooveshark_url').html('No Grooveshark results found.');
		}
	};
	
	var lastfmLookup = function(artist, track){
		console.log('performing last fm lookup');

	  return {
	  	'artist': artist,
	  	'track': track
	  };
	};
	
	var lastfmFetch = function(trackInfo){
		console.log('performing last fm fetch');

		if(trackInfo && trackInfo.artist && trackInfo.track){
			trackInfo.artist = trackInfo.artist.replace(/\s/g, '+');
			trackInfo.track = trackInfo.track.replace(/\s/g, '+');
			console.log('query: ' + trackInfo);		

		  $.ajax({
		    url: 'http://ws.audioscrobbler.com/2.0/?method=track.getinfo&format=json&api_key=0cc6c91b6bf535eddc5fd9526eec1bb6&artist=' + trackInfo.artist + '&track=' + trackInfo.track,
		    success: function(data){
		      console.log("Object from LastFm: ");
					console.log(data);
		      if(!data || !data.track || data.message == "Track not found"){
						$('.last_fm_url').html("No Last.FM results found.");
					} else {					
						var last_fm_url = data.track.url;
					
						$('.last_fm_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + last_fm_url +"\", \"selected\":true});window.close();'>"+ last_fm_url +"</a>");
					}   
					$('.spinner').hide();
		    },
		    error: function(){
		      console.log("there was an error with last.fm.");
		      $('.last_fm_url').html("No Last.FM results found.");
		    }
		      
		  });
	  } else {
			console.log("Last.FM search no song data.");
	  	$('.last_fm_url').html("No Last.FM results found.");
	  }
	};
	
	var rdioLookup = function(userUrl, callback){
		bgPage.oauth.authorize(function(trackInfo){
			console.log('performing a rdio lookup');			
			var params2 = {
		  	'method' : 'getObjectFromShortCode',
				'short_code' : userUrl
		  };
		    
		  var params = {	
		    'method': 'POST',
		    'body': stringify(params2)
		  };
		  		 		 	
		 	bgPage.oauth.sendSignedRequest(bgPage.DOCLIST_FEED, function(resp, xhr){
		  	var data = JSON.parse(resp);	
				console.log('Rdio Lookup:')
				console.log(data);
				
				if(!data  || !data.result.artist || !data.result.name){
					console.log('RdioLookup: trackInfo is undefined');
					callback.call(this, trackInfo);
				} else{
					var trackInfo = {
						'artist': data.result.artist,
						'track': data.result.name 
					};
					callback.call(this, trackInfo);
				}
			}, params);
		});	
	};
	

	var rdioFetch = function(trackInfo){
		if(trackInfo && trackInfo.artist !== undefined && trackInfo.track !== undefined){	
			bgPage.oauth.authorize(function(){			
				var query = createQuery(trackInfo.artist, trackInfo.track);
				
				console.log(trackInfo.artist);
			
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
			 		 	
			  bgPage.oauth.sendSignedRequest(bgPage.DOCLIST_FEED, function(resp, xhr){
			  	var data = JSON.parse(resp);	
			  	
			  	console.log('Rdio Fetch:')
					console.log(data);
	
			  	if(!data || data.result.results.length == 0){
			  		$('.rdio_url').html("No Rdio results found.");	
			  	} else{
						var rdio_url = data.result.results[0].shortUrl;					
						$('.rdio_url').html("<a href='javascript:chrome.tabs.create({\"url\":\"" + rdio_url +"\", \"selected\":true});window.close();'>"+ rdio_url +"</a>");	
			 		} 
			  }, params);
			  
			});
		} else {
			$('.rdio_url').html("No Rdio results found.");
		}
	};
	
	/**
	*	DOM functions:
	*/
	//parse user entered urls
	var parseUrl = function(url, callback){
		url = url.replace('http://', '');
		var splitUrl = url.split('/');
		
		console.log('split url:' + splitUrl[0]);
		
		$('#track_input').removeClass('input_error');

		
		if(splitUrl[0] == 'open.spotify.com'){
			spotifyLookup(splitUrl[2], function(data){
				callback.call(this, data);
			});
		} else if(splitUrl[0] == 'last.fm' || splitUrl[0] == 'www.last.fm'){
			callback.call(this, lastfmLookup(splitUrl[2], splitUrl[4]));
		} else if(splitUrl[0] == 'rd.io') {
			rdioLookup(splitUrl[2], function(data){
				callback.call(this, data);
			});
		} else if(splitUrl[0] =='grooveshark.com' || splitUrl[0] == 'www.grooveshark.com'){
			callback.call(this, groovesharkLookup('', splitUrl[3]));
		} else {
			$('#track_input').addClass('input_error');
			console.log('Not a Recognized URL.');
		}
	};
	
	var callAll = function(){
		var userUrl = $('#track_input').val();
		var rdioChecked = $('#rdio_check').is(':checked');

		parseUrl(userUrl, function(data){
			$('.spinner').show();
			
			console.log('trackInfo: ');
			console.log(data);
			
			if(!data || data === undefined || data.artist === undefined || data.track === undefined){
				console.log("trackInfo is undefined");
			}
			
			spotifyFetch(data);
			lastfmFetch(data);
			groovesharkFetch(data);	
			
			if(rdioChecked){
				rdioFetch(data);
			} else {
				$('.rdio_url').html("Rdio disabled.");	
			}
			
			$('.spinner').hide();
		});	
	};
	
	$(document).ready(function(){
		$('.spinner').hide();
	
		$('.track_link_container').delegate('.service_button', 'click', function(){
			var selectedService = $(this).attr('service');
			var userUrl = $('#track_input').val();

			
			parseUrl(userUrl, function(data){
				$('.spinner').show();

				console.log('trackInfo: ');
				console.log(data);
				
				if(!data || data === undefined || data.artist === undefined || data.track === undefined){
					console.log("trackInfo is undefined");
				}
				
				if(selectedService == 'spotify'){
					spotifyFetch(data);
				}	else if(selectedService == 'lastfm'){
					lastfmFetch(data);
				}	else if(selectedService == 'rdio'){
					rdioFetch(data);
				} else if (selectedService == 'grooveshark'){
					groovesharkFetch(data);
				}	else {
					console.log('Error unspecifed service.');
				}
			
				$('.spinner').hide();
			});			
		});
		
		$('.all_header').bind('click', callAll);
	
		$(document).bind('keypress', function(e){
			if(e.keyCode == 13){
				callAll();
			}
		});
	});	
})();