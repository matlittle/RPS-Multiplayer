// Get reference to the Firebase realtime database service
var database = firebase.database();

// initialize page, allow a user to "join" one of two available spots, and include a chat window at the bottom of the page


// when user clicks an available spot, promt them for a username
	// after entering a username, add that user to firebase rt db
	// show waiting until another user joins.

function playerJoining(el) {
	var player = $(el).attr("id");

	var username = usernamePrompt();
}

function usernamePrompt(){
	var modal = $("<div class='modal' id='username-prompt'>");
	var label = $("<label id='username-label'>").text("Enter a Username");
	var input = $("<input type='text' id='username-input'>");
	var btn = $("<input type='button' id='username-btn' value='Join'>");

	$(modal).append(label, input, btn);
	$("#wrapper").append(modal);
}

// when second user joins, prompt both users with a rps choice. 
	// after both users click, determine winner based on choices.
	// increment user's score based on win/loss



$(document).on("click", ".join-btn", playerJoining(this));