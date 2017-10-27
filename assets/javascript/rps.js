// Get reference to the Firebase realtime database service
var database = firebase.database();
var joining = false;

loadCurrentGameState();

// initialize page, allow a user to "join" one of two available spots, and include a chat window at the bottom of the page
function loadCurrentGameState() {
	database.ref('curr').on("value", function(currentData) {
		for(var player in currentData.val()) {
			updatePlayer(player, currentData.val()[player]);
		}
	});
}

function updatePlayer(pNum, pObj) {
	if(pObj.state === "none") {
		addJoinBtn( $(`#${pNum}`) );
	}else if (pObj.state === "joining") {
		addJoiningAlert( $(`#${pNum}`) );
	}else if (pObj.state === "active"){
		addPlayerData( $(`#${pNum}`), pObj)
	}
}

function addJoinBtn(el) {
	if(!joining) {
		var joinBtn = $(`<p class='join-btn' data-player="${$(el).attr("id")}">`);
		$(joinBtn).text("Click to join");
		$(el).empty();
		$(el).append(joinBtn);
	}
}

function addJoiningAlert(el) {
	if(!joining){
		var joinAlert = $("<p class='join-alert'>").text("Player joining...");
		$(el).empty();
		$(el).append(joinAlert);
	}
}

function addPlayerData(el, pObj) {
	console.log(pObj);
	console.log(pObj.user);
	database.ref(`users/${pObj.user}`).once("value").then( function(user) {
		console.log(user);
		console.log(user.val());
		var header = $("<h2 class='player-head'>").text(user.val().username);
		var score = $("<p class='score'>")
		var wins = $("<span class='wins'>").text(`Wins: ${user.val().wins}`);
		var losses = $("<span class='losses'>").text(`Losses: ${user.val().losses}`);

		$(score).append(wins, losses);

		$(el).empty();
		$(el).append(header, score);
	});

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

	joining = true;
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

function checkIfNewPlayer(name, player) {
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

			addPlayerToGame(currentData.val(), player);
		}
	);
}

function addPlayerToGame(userObj, player) {
	console.log(userObj); // {losses: 0, username: "Test", wins: 10}
	console.log(player); // player1

	database.ref(`curr/${player}/user`).set(userObj.username);

	updateState(player, "active");
}

function updateState(player, newState) {
	database.ref(`curr/${player}/state`).transaction(
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