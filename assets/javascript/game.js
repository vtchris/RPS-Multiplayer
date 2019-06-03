//TODO
//Add Messaging
//Finish Modal Win/Loss
//Animation reveal/fadeout
//"Waiting for" messages
//Mobile tests
//connect to portfolio
//Timeout page > return to start
//Exit to restart

//TODO - DONE
//Validate IE - apparently sessionStorage can only be used on ie with https.
//Convert players to objects to reduce global variables
//1 database update function
//Save matches

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDTO0P1aPPDHfqK0Eu5swF7z2NlrfUfcXw",
    authDomain: "rock-paper-scissors-84082.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-84082.firebaseio.com",
    projectId: "rock-paper-scissors-84082",
    storageBucket: "rock-paper-scissors-84082.appspot.com",
    messagingSenderId: "1065443187886",
    appId: "1:1065443187886:web:7f8f7027d9384295"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

//Set Global Variables
var arrMessages = [];
var arrMessagesIdx = 0;
var arrWeapons = [];
var gameStyle = "";
var intervalTime = (2 * 60 * 1000);
var lastUpdate = "";
var mode = $("#mode input:radio:checked").val();
var opponentImage = "";
var player1 = new player;
var player2 = new player;
var playerImage = "";

//jQuery Variables
var $gameBoard = $("#gameBoard_div");
var $gameStyle = $("#game-style-div");
var $nameTxt = $("#name-txt");
var $newMessage = $("#new-message-txt")
var $opponentImg = $("#opponent-img");
var $opponentLosses = $("#opponent-losses-label");
var $opponentName = $("#opponentName");
var $opponentWins = $("#opponent-wins-label");
var $playerImg = $("#player-img");
var $playerLosses = $("#player-losses-label");
var $playerName = $("#playerName");
var $playerWins = $("#player-wins-label");
var $welcomeDiv = $("#welcome-div");

sessionStorage.clear();
$opponentName.text("Awaiting Opponent");

//Attach Listeners
database.ref().child("currentMatch").on("value", function (snapshot) {

    //Listen to database ONLY in multiplayer mode
    if (mode === "2") {

        console.log(snapshot.val());
        currentSnapshot = snapshot.val();
        lastUpdate = currentSnapshot.lastUpdate;

        if (Date.now() - lastUpdate > intervalTime) {

            //Reset the game if the interval time has been exceeded since last firebase update
            reset_game(currentSnapshot);

        } else {

            //Update global variables for firebase changes
            player1 = currentSnapshot.oPlayer1;
            player2 = currentSnapshot.oPlayer2;
            
            //If the gameStyle has been chosen, populate the weapons buttons
            if (gameStyle !== currentSnapshot.gameStyle) {
                gameStyle = currentSnapshot.gameStyle;

                populate_weapons(gameStyle);

            }

            //If Opponents Name = "Awaiting Opponent", check to see if name can be populated
            if ($opponentName.text() === "Awaiting Opponent") {

                if (sessionStorage.getItem("player") === "1" && player2.name != "") {
                    $opponentName.text("Opponent: " + player2.name);
                } else if (sessionStorage.getItem("player") === "2" && player1.name != "") {
                    $opponentName.text("Opponent: " + player1.name);
                } else {
                    $opponentName.text("Awaiting Opponent");
                }
            }

            //If both players have selected a weapon, time to battle!
            if (player1.weapon !== "" && player2.weapon !== "") {

                battle();

            }
        }
    }
})
$("#message-btn").on("click", function () {
    if ($newMessage.value !== "") {
        arrMessages.push(new newText(player1.name, $newMessage.val(), "1"))
    }

    $newMessage.val("");
    update_database();
    display_messages();
})

function display_messages() {


    while (arrMessagesIdx < arrMessages.length) {
        // let newP = $("<p>")
        // newP.text(arrMessages[arrMessagesIdx].message)
        // newP.appendTo($("#chat-div"))
        let newRow = $("<tr>");
        let newDateTD = $("<td>");
        let newUserTD = $("<td>");
        let newMessageTD = $("<td>");
        newDateTD.text(arrMessages[arrMessagesIdx].dateStamp);
        newMessageTD.text(arrMessages[arrMessagesIdx].message);
        newUserTD.text(arrMessages[arrMessagesIdx].name);

        newDateTD.appendTo(newRow);
        newMessageTD.appendTo(newRow);
        newUserTD.appendTo(newRow);

        newRow.appendTo($("#messages-table"))

        arrMessagesIdx++
    }

    //arrMessagesIdx = (arrMessages.length - 1)
}
//If player 1 selects Rock-Paper-Scissors
$("#rps-btn").on("click", function () {

    $gameStyle.addClass("display_none");

    if (mode === "1") {

        populate_weapons("rps");

    } else if (mode === "2") {

        gameStyle = "rps"
        update_database();
        populate_weapons(gameStyle);

    }
})
//If player 1 selects Rock-Paper-Scissors-Lizard-Spock
$("#rpslv-btn").on("click", function () {

    $gameStyle.addClass("display_none");

    if (mode === "1") {

        populate_weapons("rpslv");

    } else if (mode === "2") {

        gameStyle = "rpslv"
        update_database();
        populate_weapons(gameStyle);

    }
})
//Determine if player 1 or player 2
$("#submit-btn").on("click", function () {

    //Find desired mode (1 player or 2)
    mode = $("#mode input:radio:checked").val();
    $welcomeDiv.addClass("display_none");
    $gameBoard.removeClass("display_none");

    //If 1 player, set Computer as opponent and setup board
    if (mode === "1") {

        sessionStorage.setItem("player", "1");
        gameStyle = "";
        $gameStyle.removeClass("display_none");
        player1.name = $nameTxt.val().toUpperCase();
        $playerName.text("Player: " + player1.name);
        $opponentName.text("DEEP THOUGHT");
        $("#weapons-div").remove();
        $(".js_chat").addClass("display_none");

        //If 2 player, check firebase fields
    } else if (mode === "2") {

        //If lastUpdate is more than 15 minutes ago, or if player1 is not populated, then populate player1
        if ((Date.now() - lastUpdate > intervalTime) || (player1.name === "") || !player1) {

            sessionStorage.setItem("player", "1");
            player1.name = $nameTxt.val().toUpperCase();

            // Save the new info to  Firebase
            update_database();

            $gameStyle.removeClass("display_none");
            $opponentName.text("Awaiting Opponent");
            $playerName.text("Player: " + player1.name);

        } else if (currentSnapshot.player2 === "") {

            sessionStorage.setItem("player", "2");
            player2.name = $nameTxt.val().toUpperCase();

            update_database();

            $playerName.text("Player: " + player2.name);
        }
    }
})
//END LISTENERS -- START FUNCTIONS
function battle() {

    let winner = "";

    if (player1.weapon === player2.weapon) {

        winner = "tie";

    } else {

        switch (player1.weapon) {
            case "r":
                if (player2.weapon === "s" || player2.weapon === "l") {

                    winner = "player1";

                } else {

                    winner = "player2";
                }
                break;
            case "p":
                if (player2.weapon === "r" || player2.weapon === "v") {

                    winner = "player1";
                } else {

                    winner = "player2";
                }
                break;
            case "s":
                if (player2.weapon === "p" || player2.weapon === "l") {

                    winner = "player1";

                } else {

                    winner = "player2";
                }
                break;
            case "l":
                if (player2.weapon === "p" || player2.weapon === "v") {

                    winner = "player1";

                } else {

                    winner = "player2";
                }
                break;
            case "v":
                if (player2.weapon === "s" || player2.weapon === "r") {

                    winner = "player1";

                } else {

                    winner = "player2";

                }
        }
    }

    $("#player-img").attr("src", "/assets/images/" + playerImage);

    if (mode === "1") {

        $opponentImg.attr("src", "/assets/images/" + player2.image);

        if (winner === "player1") {

            $opponentImg.css("opacity", ".1");
            $playerImg.css("opacity", "1");

        } else if (winner === "player2") {

            $opponentImg.css("opacity", "1");
            $playerImg.css("opacity", ".1");

        } else {

            $opponentImg.css("opacity", "1");
            $playerImg.css("opacity", "1");

        }

    } else if (mode === "2") {

        if (sessionStorage.getItem("player") === "1") {

            $opponentImg.attr("src", "/assets/images/" + player2.image);

            if (winner === "player1") {

                $opponentImg.css("opacity", ".1");
                $playerImg.css("opacity", "1");

            } else if (winner === "player2") {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", ".1");

            } else {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", "1");

            }

        } else {

            $("#opponent-img").attr("src", "/assets/images/" + player1.image);

            if (winner === "player1") {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", ".1");

            } else if (winner === "player2") {

                $opponentImg.css("opacity", ".1");
                $playerImg.css("opacity", "1");

            } else {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", "1");

            }
        }
    }

    $("#results-modal").modal("show");

    update_score(winner);

    //Only one player needs to update score, so player 1 is selected for this purpose
    if (sessionStorage.getItem("player") === "1") {

        $opponentLosses.text("LOSSES: " + player2.losses);
        $opponentWins.text("WINS: " + player2.wins);
        $playerLosses.text("LOSSES: " + player1.losses);
        $playerWins.text("WINS: " + player1.wins);

    } else {

        $opponentLosses.text("LOSSES: " + player1.losses);
        $opponentWins.text("WINS: " + player1.wins);
        $playerLosses.text("LOSSES: " + player2.losses);
        $playerWins.text("WINS: " + player2.wins);

    }
}
function populate_weapons(gameStyle) {

    $("#weapons-div").remove();
    arrWeapons = [];

    switch (gameStyle) {
        case "rpslv":
            arrWeapons.push(new weapon("lizard", "l", "fa-hand-lizard", "geico.jpg"));
            arrWeapons.push(new weapon("spock", "v", "fa-hand-spock", "spock.jfif"));
        case "rps":
            arrWeapons.push(new weapon("rock", "r", "fa-hand-rock", "rock.jfif"));
            arrWeapons.push(new weapon("paper", "p", "fa-hand-paper", "paper.jpg"));
            arrWeapons.push(new weapon("scissors", "s", "fa-hand-scissors", "scissors.jpg"));
    }


    let array = arrWeapons.slice(0);

    newDiv = $("<div>");
    newDiv.attr("id", "weapons-div");

    while (array.length > 0) {

        //Place weapons in random order
        let random = Math.floor(Math.random() * array.length);

        newButton = $("<button>");
        newButton.addClass("btn btn-secondary m-1 js_weapon");
        newButton.val(array[random].value);
        newButton.attr("data-image", array[random].image);
        newButton.html("<span class='fa " + array[random].faClass + "'></span> " + array[random].name.toUpperCase());
        newButton.appendTo(newDiv);

        //Remove from array
        array.splice(random, 1);
    }
    //newDiv.appendTo(newDiv);
    newDiv.appendTo($("#player-body-div"));

    $(".js_weapon").on("click", function () {

        console.log(this.value);

        playerImage = $(this).attr("data-image");

        if (mode === "1") {

            player1.weapon = this.value;

            //Computer makes weapon choice
            let random = Math.floor(Math.random() * arrWeapons.length);
            player2.image = arrWeapons[random].image;
            player2.weapon = arrWeapons[random].value;

            //fight, Fight, FIGHT!
            battle();
        }

        //Update Firebase for Multiplayer mode only
        if (mode === "2") {

            switch (sessionStorage.getItem("player")) {
                case "1":
                    player1.weapon = this.value;
                    player1.image = playerImage;
                    update_database();

                    break;
                case "2":

                    player2.weapon = this.value;
                    player2.image = playerImage;
                    update_database();

            }
        }
    })
}
//Reset Game
function reset_game(currentSnapshot) {

    let array = []

    sessionStorage.clear();
    $gameBoard.addClass("display_none");
    $opponentName.text("Awaiting Opponent");
    $welcomeDiv.removeClass("display_none");
    $("#weapons-div").remove();
   
    if (currentSnapshot.oPlayer1.name !== ""){

        if (currentSnapshot.chat){
            array = currentSnapshot.chat;        
        }

        database.ref().child("matches").push({
            datePlayed:moment(currentSnapshot.lastUpdate).format("MM-DD-YYYY HH:mm:ss"),
            gameStyle:currentSnapshot.gameStyle,
            chat:array,
            player1:currentSnapshot.oPlayer1.name,
            player1losses: currentSnapshot.oPlayer1.losses,
            player1wins:currentSnapshot.oPlayer1.wins,
            player2:currentSnapshot.oPlayer2.name,
            player2losses: currentSnapshot.oPlayer2.losses,
            player2wins:currentSnapshot.oPlayer2.wins
        })
    }
    
    gameStyle = "";
    arrMessages = [];
    player1 = new player;
    player2 = new player;
    update_database();

}
function update_database() {
    
    database.ref().child("currentMatch").set({
        gameStyle: gameStyle,
        lastUpdate: firebase.database.ServerValue.TIMESTAMP,
        chat: arrMessages,
        player1: player1.name,
        player1image: player1.image,
        player1losses: player1.losses,
        player1weapon: player1.weapon,
        player1wins: player1.wins,
        player2: player2.name,
        player2image: player2.image,
        player2losses: player2.losses,
        player2weapon: player2.weapon,
        player2wins: player2.wins,
        oPlayer1:player1,
        oPlayer2: player2
    })

}
function update_score(winner) {

    if (winner === "player1") {
        player1.wins++;
        player2.losses++;
    } else if (winner === "player2") {
        player1.losses++;
        player2.wins++;
    }

    player1.image = "";
    player1.weapon = "";
    player2.image = "";
    player2.weapon = "";

    if (mode === "2") {

        update_database();
    }
}
//PROTOTYPES
//Message prototype
function newText(name, newMessage, player) {
    this.name = name;
    this.message = newMessage;
    this.player = player;
    this.dateStamp = moment().format("MM-DD-YYYY HH:mm:ss")
}
//Player prototype
function player() {
    this.image = "";
    this.losses = 0;
    this.name = "";
    this.weapon = ""
    this.wins = 0;
}
//Weapon prototype
function weapon(name, value, faClass, img) {
    this.name = name;
    this.value = value;
    this.faClass = faClass;
    this.image = img;
}