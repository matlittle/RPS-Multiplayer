// Get reference to the Firebase realtime database service
var database = firebase.database();

var curr = {};

// initialize page, allow a user to "join" one of two available spots, and include a chat window at the bottom of the page


// when user clicks an available spot, promt them for a username
	// after entering a username, add that user to firebase rt db
	// show waiting until another user joins.



function usernamePrompt(el){
	var label = $("<label id='username-label'>").text("Enter your Username");
	var input = $("<input type='text' id='username-input'>");
	var btn = $("<input type='button' id='username-btn' value='Join'>");

	var parent = $(el).parent();
	$(".join-btn").remove();
	$(parent).append(label, "<br>", input, btn);
}

function playerJoining(el) {
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
}

function checkIfNewPlayer(name, num) {
	database.ref(`/users/${name}`).once("value").then(function(data) {
		if(data.val()){
			addPlayerToGame(data.val(), num);
		}else {
			writePlayerData(name, num);
		}
	});
}

function writePlayerData(user, num) {
	var playerData = {
		username: user,
		wins: 0,
		losses: 0
	}

	database.ref(`/users/${user}`).set(playerData);

	addPlayerToGame(playerData, num);
}

function addPlayerToGame(userObj, num) {
	var header = $("<h2 class='player-head'>").text(userObj.username);
	var score = $("<p class='score'>")
	var wins = $("<span class='wins'>").text(`Wins: ${userObj.wins}`);
	var losses = $("<span class='losses'>").text(`Losses: ${userObj.losses}`);

	$(score).append(wins, losses);

	$(`#player-${num} > div`).append(header, score);
}

// when second user joins, prompt both users with a rps choice. 
	// after both users click, determine winner based on choices.
	// increment user's score based on win/loss



$(document).on("click", ".join-btn", function() {
	playerJoining(this);
});