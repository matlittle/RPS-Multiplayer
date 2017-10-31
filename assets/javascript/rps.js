// Initialize Firebase 
var config = {
	apiKey: "AIzaSyDwNTnUpn-XTpt5vzq5prFY0sPYKZHtmSk",
	authDomain: "rps-project-65d20.firebaseapp.com",
	databaseURL: "https://rps-project-65d20.firebaseio.com",
	projectId: "rps-project-65d20",
	storageBucket: "",
	messagingSenderId: "1010689628405"
};
firebase.initializeApp(config);


// Get reference to the Firebase realtime database service
var database = firebase.database();
var joining = false;
var currPlayer = "";
var currUsername = "";
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

	database.ref('chat').on("child_added", function(data) {
		appendChatLine(data.val());
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
		$(joinBtn).text("Click to Join");
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
		$(`#${player}`).append(header, score, choices);

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

			}else if(themRef.choice === "") {
				$("#board").append($("<p>").text("Waiting on other player"));
			}else {
				determineWinner(meRef.choice, themRef.choice);
			}	

		}else {
			var choiceEl = $("<p>").text("Waiting for another player to join");

			$(`#${currPlayer} > .choices`).append(choiceEl);
			$("#board").empty();
		}
	});
}

function choiceClicked(el) {
	var choice = $(el).text();

	database.ref(`curr/${currPlayer}/choice`).set(choice);
}

function determineWinner(mine, theirs) {
	if(mine === theirs) {
		tieGame();
	}else if(mine === "Rock") {
		if(theirs === "Paper") {
			lostGame();
		}else if(theirs === "Scissors") {
			wonGame();
		}
	} else if(mine === "Paper") {
		if(theirs === "Rock") {
			wonGame();
		}else if(theirs === "Scissors") {
			lostGame();
		}
	}else if(mine === "Scissors"){
		if(theirs === "Rock") {
			lostGame();
		}else if(theirs === "Paper") {
			wonGame();
		}
	}
}

function tieGame() {
	$("#board").empty();
	$("#board").append($("<p>").text("Tie Game!"));

	setTimeout(resetGame, 5 * 1000);
}

function wonGame() {
	$("#board").empty();
	$("#board").append($("<p>").text("You Won!"));

	database.ref(`users/${currUsername}/wins`).once("value").then(function(data) {
		var newCount = data.val() + 1;
		database.ref(`users/${currUsername}/wins`).set(newCount);
	});

	setTimeout(resetGame, 5 * 1000);
}

function lostGame() {
	$("#board").empty();
	$("#board").append($("<p>").text("You Lost!"));

	database.ref(`users/${currUsername}/losses`).once("value").then(function(data) {
		var newCount = data.val() + 1;
		database.ref(`users/${currUsername}/losses`).set(newCount);
	});

	setTimeout(resetGame, 5 * 1000);
}

function resetGame() {
	database.ref(`curr/player1/choice`).set("");
	database.ref(`curr/player2/choice`).set("");
	$("#board").empty();
}

function getUsername(el) {
	addUsernameForm(el);

	var playerNum = $(el).attr("data-player");

	joining = true;
	currPlayer = playerNum;

	loadDisconnectMethods();

	updateState(playerNum, "joining");

	$("#username-btn").click(usernameBtnClicked);

	$("#username-input").keypress(function(e){
		if(e.keyCode==13){ 
			$("#username-btn").click();
		}
	});

	function addUsernameForm(el){
		var label = $("<label id='username-label'>").text("Enter your Username");
		var input = $("<input type='text' id='username-input' autofocus>");
		var btn = $("<input type='button' id='username-btn' value='Join'>");

		var parent = $(el).parent();
		$(".join-btn").remove();
		$(parent).append(label, "<br>", input, "<br>", btn);
	}

	function usernameBtnClicked() {
		var input = $("#username-input").val().trim();

		if(input.length > 0) {
			$(`#player${playerNum} > div`).empty();
			currUsername = input;
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
				console.log("Transaction stopped, user exists");
			}else if(committed) {
				console.log("Transaction complete, user created");
			}

			addPlayerToGame(currentData.val(), player);
		}
	);
}

function addPlayerToGame(userObj, player) {
	database.ref(`curr/${player}/user`).set(userObj.username);
	updateState(player, "active");
	activateChat();
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
				console.log("Transaction stopped. Another player already joining or active.");
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

	database.ref(`curr/player1/choice`).set("");
	database.ref(`curr/player2/choice`).set("");

	$("#board").empty();
}

function chatBtnClicked(event) {
	event.preventDefault();
	var message = $("#chat-input").val().trim();

	if(message === "") return;

	$("#chat-input").val("");

	database.ref("/chat/").push({
		user: currUsername,
		message: message
	});
}

function activateChat() {
	$("#chat-input").removeAttr("disabled");
	$("#chat-btn").removeAttr("disabled");
}

function appendChatLine(line) {
	var newLine = $("<p class='chat-line'>");
	var text = $("<span class='chat-msg'>").text(line.message);
	var user = $("<span class='chat-user'>").text(line.user);

	$(newLine).append(user, ": ", text);
	$("#chat-area").append(newLine);

	scrollChat();
}

function scrollChat() {
	var chatDiv = document.getElementById("chat-area");
	$("#chat-area").scrollTop(chatDiv.scrollHeight);
}

function chatResizing() {
	var resizing = setInterval(scrollChat, 1);

	$(document).mouseup(function() {
		clearInterval(resizing);
		$(document).mouseup(function() {});
	})
}


// CLICK LISTENERS

$(document).on("click", ".join-btn", function() {
	getUsername(this);
});

$(document).on("click", ".choice-item", function() {
	choiceClicked(this);
});

$("#chat-btn").click( function(event) {
	chatBtnClicked(event);
});

$("#chat-input").keypress(function(event){
	if(event.keyCode==13){ 
		chatBtnClicked(event);
	}
});

$("#chat-area").mousedown(chatResizing);