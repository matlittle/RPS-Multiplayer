// Get reference to the Firebase realtime database service
var database = firebase.database();

loadCurrentGameState();

// initialize page, allow a user to "join" one of two available spots, and include a chat window at the bottom of the page
function loadCurrentGameState() {
	database.ref('curr').on("value", function(currentData) {
		console.log(currentData.val());
		for(var player in currentData.val()) {
			updatePlayer(player, currentData.val()[player]);
		}
	});
}

function updatePlayer(pNum, pObj) {
	console.log(pNum);
	console.log(pObj);


	if(pObj.state === "none") {
		addJoinBtn($(`#${pNum}`));
	}else if (pObj.state === "joining") {
		addJoiningAlert($(`#${pNum}`));
	}else {
		addPlayerData($(`#${pNum}`), pObj)
	}
}

function addJoinBtn(el) {
	console.log($(el));
	var joinBtn = $("<p class='join-btn'>").text("Click to join");
	$(joinBtn).attr("data-player", $(el).attr("id"));

	$(el).append(joinBtn);
}

function addJoiningAlert(el) {

}

function addPlayerData(el) {
	/*var header = $("<h2 class='player-head'>").text(userObj.username);
	var score = $("<p class='score'>")
	var wins = $("<span class='wins'>").text(`Wins: ${userObj.wins}`);
	var losses = $("<span class='losses'>").text(`Losses: ${userObj.losses}`);

	$(score).append(wins, losses);

	$(`#player${num}`).append(header, score);*/
}


// when user clicks an available spot, promt them for a username
	// after entering a username, add that user to firebase rt db
	// show waiting until another user joins.
function getUsername(el) {
	usernamePrompt(el);

	var playerNum = $(el).attr("data-player");

	updateState(playerNum, "joining");

	$("#username-btn").click(function() {
		var input = $("#username-input").val().trim();

		if(input.length > 0) {
			$(`#player${playerNum} > div`).empty();
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
	database.ref(`users/${name}`).transaction(
		function(currentData) {
			if(currentData === null) {
				return {
					username: name,
					wins: 0,
					losses: 0
				};
			}else {
				return;
			}
		}, function(error, committed, currentData) {
			if(error) {
				console.log("Error: ", error);
			}else if(!committed) {
				console.log("Transaction aborted, user exists");
			}else if(commited) {
				console.log("Transaction complete, user created");
			}

			addPlayerToGame(currentData.val(), num);
		}
	);
}

function addPlayerToGame(userObj, num) {
	var header = $("<h2 class='player-head'>").text(userObj.username);
	var score = $("<p class='score'>")
	var wins = $("<span class='wins'>").text(`Wins: ${userObj.wins}`);
	var losses = $("<span class='losses'>").text(`Losses: ${userObj.losses}`);

	$(score).append(wins, losses);

	$(`#player${num}`).append(header, score);

	updateState(num, "active");
}

function updateState(playerNum, newState) {
	database.ref(`curr/player${playerNum}/state`).transaction(
		function(currentData){
			console.log(currentData);
			if(currentData === "none" || currentData === null) {
				return newState;
			}else if(currentData === "joining" && newState === "active") {
				return newState;
			}else {
				return;
			}
		}, function(error, committed, currentData) {
			if(error) {
				console.log("Error: ", error);
			}else if(!committed) {
				console.log("Transaction aborted. Another player already joining or active.");
			}
		}
	);
}

// when second user joins, prompt both users with a rps choice. 
	// after both users click, determine winner based on choices.
	// increment user's score based on win/loss



$(document).on("click", ".join-btn", function() {
	getUsername(this);
});