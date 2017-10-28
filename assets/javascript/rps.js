// Get reference to the Firebase realtime database service
var database = firebase.database();
var joining = false;
var currPlayer = "";
var choiceArr = ["Rock", "Paper", "Scissors"];

loadCurrentGameState();


/* initialize page, allow a user to "join" one of two available spots, 
   and include a chat window at the bottom of the page */
function loadCurrentGameState() {
	database.ref('curr').on("value", function(currentData) {
		for(var player in currentData.val()) {
			updatePlayer(player, currentData.val()[player]);
		}
	});
}

function updatePlayer(player, pObj) {
	if(pObj.state === "none") {
		addJoinBtn( player );
	}else if (pObj.state === "joining") {
		addJoiningAlert( player );
	}else if (pObj.state === "active"){
		addPlayerData( player, pObj);
	}
}

function addJoinBtn(player) {
	if(!joining) {
		var joinBtn = $(`<p class='join-btn' data-player="${player}">`);
		$(joinBtn).text("Click to join");
		$(`#${player}`).empty();
		$(`#${player}`).append(joinBtn);
	}else {
		$(`#${player}`).empty();
	}
}

function addJoiningAlert(player) {
	if(player !== currPlayer) {
		var joinAlert = $("<p class='join-alert'>").text("Player joining...");
		$(`#${player}`).empty();
		$(`#${player}`).append(joinAlert);
	}
}

function addPlayerData(player, pObj) {
	database.ref(`users/${pObj.user}`).once("value").then( function(user) {
		var header = $("<h2 class='player-head'>").text(user.val().username);
		var choices = $("<div class='choices'>");
		var score = $("<p class='score'>");
		var wins = $("<span class='wins'>").text(`Wins: ${user.val().wins}`);
		var losses = $("<span class='losses'>").text(`Losses: ${user.val().losses}`);

		$(score).append(wins, losses);

		$(`#${player}`).empty();
		$(`#${player}`).append(header, choices, score);

		if(player === currPlayer) {
			addChoices(currPlayer);
		}
	});
}

function addChoices(player) {
	database.ref("curr").once("value").then( function(currentData) {
		if(currPlayer === "player1") {
			var meRef = currentData.val().player1;
			var themRef = currentData.val().player2;
		} else {
			var meRef = currentData.val().player2;
			var themRef = currentData.val().player1;
		}


		if(meRef.state === "active" && themRef.state === "active") {
			if(meRef.choice === "") {
				var choices = $("<ul class='choice-list'>");

				choiceArr.forEach( function(choice) {
					var item = $("<li class='choice-item'>").text(choice);
					$(choices).append(item);
				});

				$(`#${currPlayer} > .choices`).empty();
				$(`#${currPlayer} > .choices`).append(choices);

				if(themRef.choice !== "") {
					$("#board").append($("<p>").text("Other player chose"));
				}
			}

		}else {
			var choiceEl = $("<p>").text("Waiting for another player to join");

			$(`#${currPlayer} > .choices`).append(choiceEl);
		}
	});
}

function choiceClicked(el) {
	var choice = $(el).text();

	database.ref(`curr/${currPlayer}/choice`).set(choice);
}


// when user clicks an available spot, promt them for a username
	// after entering a username, add that user to firebase rt db
	// show waiting until another user joins.
function getUsername(el) {
	addUsernameForm(el);

	var playerNum = $(el).attr("data-player");

	joining = true;
	currPlayer = playerNum;

	loadDisconnectMethods();

	updateState(playerNum, "joining");

	$("#username-btn").click(usernameBtnClicked);

	function addUsernameForm(el){
		var label = $("<label id='username-label'>").text("Enter your Username");
		var input = $("<input type='text' id='username-input'>");
		var btn = $("<input type='button' id='username-btn' value='Join'>");

		var parent = $(el).parent();
		$(".join-btn").remove();
		$(parent).append(label, "<br>", input, btn);
	}

	function usernameBtnClicked() {
		var input = $("#username-input").val().trim();

		if(input.length > 0) {
			$(`#player${playerNum} > div`).empty();
			checkIfNewPlayer(input, playerNum);
		}
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
	database.ref(`curr/${player}/user`).set(userObj.username);
	updateState(player, "active");
}

function updateState(player, newState) {
	database.ref(`curr/${player}/state`).transaction(
		function(currentData){
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

function loadDisconnectMethods() {
	database.ref(`curr/${currPlayer}`).onDisconnect().set({
		choice: "",
		state: "none",
		user: ""
	});
}

// when second user joins, prompt both users with a rps choice. 
	// after both users click, determine winner based on choices.
	// increment user's score based on win/loss



$(document).on("click", ".join-btn", function() {
	getUsername(this);
});

$(document).on("click", ".choice-item", function() {
	choiceClicked(this);
});