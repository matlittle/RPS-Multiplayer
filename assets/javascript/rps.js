// Get reference to the Firebase realtime database service
var database = firebase.database();

var curr = {};

// initialize page, allow a user to "join" one of two available spots, and include a chat window at the bottom of the page


// when user clicks an available spot, promt them for a username
	// after entering a username, add that user to firebase rt db
	// show waiting until another user joins.
	function getUsername(el) {
	//var player = $(el).attr("id");

	usernamePrompt(el);

	var playerNum = $(el).attr("data-player");

	$("#username-btn").click(function() {
		var input = $("#username-input").val().trim();

		if(input.length > 0) {
			$(`#player-${playerNum} > div`).empty();
			checkIfNewPlayer(input, playerNum);
		}
	});


	function usernamePrompt(el){
		var label = $("<label id='username-label'>").text("Enter your Username");
		var input = $("<input type='text' id='username-input'>");
		var btn = $("<input type='button' id='username-btn' value='Join'>");

		var parent = $(el).parent();
		$(".join-btn").remove();
		$(parent).append(label, "<br>", input, btn);
	}
}

function checkIfNewPlayer(name, num) {
	var checkUser = database.ref(`users/${name}`);

	checkUser.transaction( function(currentData) {
		if(currentData === null) {
			console.log("user test");
			return {
				username: name,
				wins: 0,
				losses: 0
			};
		}else {
			console.log("user exists");
			return;
		}
	}, function(error, committed, snapshot) {
		if(error) {
			console.log("Error: ", error);
		}else if(!committed) {
			console.log("transaction aborted");
		}
		console.log("Data: ", snapshot.val());
		addPlayerToGame(snapshot.val(), num);
	});
}

function addPlayerToGame(userObj, num) {
	var header = $("<h2 class='player-head'>").text(userObj.username);
	var score = $("<p class='score'>")
	var wins = $("<span class='wins'>").text(`Wins: ${userObj.wins}`);
	var losses = $("<span class='losses'>").text(`Losses: ${userObj.losses}`);

	$(score).append(wins, losses);

	$(`#player-${num} > div`).append(header, score);

	updateState("players", 1);
}

function updateState(prop, change) {
	if(prop === "players") {
		var playersRef = database.ref("curr/state/players");
		playersRef.transaction(function(currentData) {
			return currentData += 1;
		});
	}else {
		// for data other than num players
		console.log("prop given not players");
	}
}

// when second user joins, prompt both users with a rps choice. 
	// after both users click, determine winner based on choices.
	// increment user's score based on win/loss



	$(document).on("click", ".join-btn", function() {
		getUsername(this);
	});