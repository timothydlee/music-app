$(document).ready(function(){
	var player;
	var hold = [];
	var holdShortenedName = [];
	var similarArtistArray = [];


	var config = {
		apiKey: "AIzaSyAfp1Bs3v2vGmBFzFurtDXduezcb8_ifWs",
		authDomain: "music-app-14ddc.firebaseapp.com",
		databaseURL: "https://music-app-14ddc.firebaseio.com",
		storageBucket: "music-app-14ddc.appspot.com",
		messagingSenderId: "95008115181"
	};
	firebase.initializeApp(config); // intializing firebase for our user data 
	var database = firebase.database(); // database variable 

	$("#find-artistevents").on('click', function() {
		$(".searched-artist").empty();
		$(".similar-artist").empty();
		$("#playerDiv").empty();
		var userLocation = $("#location-input").val().trim(); // Variable for the searched location 
		var userArtist = $("#artist-input").val().trim(); // Variable for the searchedArtist
		//Last FM query URL for getting searched artist info
		var infoQueryURL = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + userArtist + "&api_key=1472636e9d44c81a12cdfb216ce752ac&format=json";
		//Last FM query URL for getting similar artists 
		var similarQueryURL = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + userArtist + "&api_key=1472636e9d44c81a12cdfb216ce752ac&format=json&limit=3";
		//Spotify query URL for getting artist IDs
		var spotifyQueryURL = "https://api.spotify.com/v1/search?q=" + userArtist + "&type=artist";

		//Searched Artist search
		$.get(infoQueryURL, function(response){
			var artistName = response.artist.name;
			var artistNameShortened = artistName.replace(/\s/g, '').toLowerCase();
			//show in artist div searched for artist info from lastfm
			$(".searched-artist").append("<h1>" + artistName);
			$(".searched-artist").append("<input type='checkbox' data-name='" + artistNameShortened + "' </input>").attr("id", artistNameShortened); //Talk to design team about what needs to happen with "selected" artists
			$(".searched-artist").append("<img src='" + response.artist.image[3]["#text"] + "''>");
			$.get(spotifyQueryURL, function(spotifyResponse){
				// Prints the Artist ID from the Spotify Object to console.
				var artistID = spotifyResponse.artists.items[0].id;
				// Then we build a SECOND URL to query another Spotify endpoint (this one for the tracks)
				var queryURLTracks = "https://api.spotify.com/v1/artists/" + artistID +"/top-tracks?country=US";
				// We then run a second AJAX call to get the tracks associated with that Spotify ID
				$.get(queryURLTracks, function(trackResponse){
					// Builds a Spotify player playing the top song associated with the artist. (NOTE YOU NEED TO BE LOGGED INTO SPOTIFY)
					player = '<iframe src="https://embed.spotify.com/?uri=spotify:track:'+trackResponse.tracks[0].id+'" frameborder="0" allowtransparency="true"></iframe>';
					$("#playerDiv").append(player);
				});
			});
		});

		//Similar Artist Query
		$.get(similarQueryURL, function(response){
			for (var i=0; i<3; i++){
				var newDiv = $("<div>");
				var similarArtistName = response.similarartists.artist[i].name
				var similarArtistNameShortened = similarArtistName.replace(/\s/g, '').toLowerCase();
				var similarArtistImg = response.similarartists.artist[i].image[3]["#text"];
				var spotifyQueryURL = "https://api.spotify.com/v1/search?q=" + similarArtistName + "&type=artist";
				holdShortenedName.push(similarArtistNameShortened);
				similarArtistArray.push(similarArtistName);

				newDiv.append("<input type='checkbox' data-name='" + similarArtistNameShortened + "'</input>").attr("id", similarArtistNameShortened); 
				newDiv.append("<img src=" + similarArtistImg + ">");
				newDiv.append("<h2>" + similarArtistName);
				newDiv.append("<a href='" + response.similarartists.artist[i].url+ "' target='_'>" + similarArtistName + "</a>");
				//Generating Spotify Player for first track of the similar artist
				$.get(spotifyQueryURL, function(response){
					// Prints the Artist ID from the Spotify Object to console.
					var artistID = response.artists.items[0].id;
					// Then we build a SECOND URL to query another Spotify endpoint (this one for the tracks)
					var queryURLTracks = "https://api.spotify.com/v1/artists/" + artistID +"/top-tracks?country=US";
					$.get(queryURLTracks, function(trackResponse){
						// Builds a Spotify player playing the top song associated with the artist. (NOTE YOU NEED TO BE LOGGED INTO SPOTIFY)
						player = '<iframe src="https://embed.spotify.com/?uri=spotify:track:'+ trackResponse.tracks[0].id +'" frameborder="0" allowtransparency="true"></iframe>';
						// Appends the new player into the HTML
						// hold.push(player); //Doesn't work for same reason as appending to newDiv asynchronously - rest of the page renders too quickly.
						newDiv.append(player);
					}); // End second Spotify AJAX call to get tracks
				}); //End first Spotify AJAX call
				$(".similar-artist").append(newDiv);
			}; //End for loop
		}); //End similar artist AJAX call
		return false;
	});//end of #find-artistevents click handler
}); //end of document ready