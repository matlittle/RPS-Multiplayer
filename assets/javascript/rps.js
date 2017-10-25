// Get reference to the Firebase realtime database service
var database = firebase.database();
console.log(database);

// initialize page, allow a user to "join" one of two available spots, and include a chat window at the bottom of the page


// when user clicks an available spot, promt them for a username
	// after entering a username, add that user to firebase rt db
	// show waiting until another user joins.

function playerJoining(el) {
	//var player = $(el).attr("id");

	usernamePrompt(el);

	$("#username-btn").click(function() {
		addPlayer($("#username-input").val().trim())
	});
}

function usernamePrompt(el){
	var label = $("<label id='username-label'>").text("Enter a Username");
	var input = $("<input type='text' id='username-input'>");
	var btn = $("<input type='button' id='username-btn' value='Join'>");

	var parent = $(el).parent();
	$(".join-btn").remove();
	$(parent).append(label, "<br>", input, btn);
}

function addPlayer(name) {

	database.ref(`/users/${name}`).once("value").then(function(data) {
		if(data.val()){
			loadPlayerData(data.val())
		}else {
			writePlayerData(name);
		}
	});
	
}

function writePlayerData(user) {
	database.ref(`/users/${user}`).set({
		username: user,
		wins: 0,
		losses: 0
	});
}

function loadPlayerData(user) {
	console.log(user);
}

// when second user joins, prompt both users with a rps choice. 
	// after both users click, determine winner based on choices.
	// increment user's score based on win/loss



$(document).on("click", ".join-btn", function() {
	playerJoining(this);
});