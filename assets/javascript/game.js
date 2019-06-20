//TODO
//Animation reveal/fadeout
//"Waiting for" messages
//Validate IE
//Exit to restart

//TODO - DONE
//Convert players to objects to reduce global variables
//1 database update function
//Save matches
//Add Messaging
//Finish Modal Win/Loss
//Timeout page > return to start
//connect to portfolio
//Mobile tests

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
var browserPlayer = 0;
var gameStyle = "";
var intervalId = 0;
var intervalTime = (3 * 60 * 1000);
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
var $resultsHeader = $("#results-h")
var $welcomeDiv = $("#welcome-div");

//sessionStorage.clear();
$opponentName.text("Awaiting Opponent");
$(".js_messages").remove();

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
            if (currentSnapshot.chat) {
                arrMessages = currentSnapshot.chat;
            }

            player1 = currentSnapshot.oPlayer1;
            player2 = currentSnapshot.oPlayer2;

            if (player1.name != "") {
                clearTimeout(intervalId);
                set_timer();
            }

            //If the gameStyle has been chosen, populate the weapons buttons
            if (gameStyle !== currentSnapshot.gameStyle) {
                gameStyle = currentSnapshot.gameStyle;

                populate_weapons(gameStyle);

            }

            //If Opponents Name = "Awaiting Opponent", check to see if name can be populated
            if ($opponentName.text() === "Awaiting Opponent") {

                //if (sessionStorage.getItem("player") === "1" && player2.name != "") {
                if (browserPlayer === 1 && player2.name != "") {
                    $opponentName.text("Opponent: " + player2.name);
                    //} else if (sessionStorage.getItem("player") === "2" && player1.name != "") {
                } else if (browserPlayer === 2 && player1.name != "") {
                    $opponentName.text("Opponent: " + player1.name);
                } else {
                    $opponentName.text("Awaiting Opponent");
                }
            }

            //If both players have selected a weapon, time to battle!
            if (player1.weapon !== "" && player2.weapon !== "") {

                battle();

            }

            if (arrMessagesIdx < arrMessages.length) {
                populate_user_messages();
            }


        }
    }
})
document.addEventListener("keyup", function (event) {

    if (event.keyCode === 13) {
        if ($welcomeDiv.is(":visible")) {
            $("#submit-btn").click();
        } else if ($newMessage.is(":visible")) {
            $("#message-btn").click();
        }
    }

})
$("#message-btn").on("click", function () {

    event.preventDefault();

    if ($newMessage.val() !== "") {
        let browserName = "";
        if (browserPlayer === 1) {
            browserName = player1.name;
        } else {
            browserName = player2.name;
        }
        arrMessages.push(new newText(browserName, $newMessage.val(), browserPlayer));
        update_database();
    }

    $newMessage.val("");
    $newMessage.focus();

})

//If player 1 selects Rock-Paper-Scissors
$("#rps-btn").on("click", function () {

    event.preventDefault();
    $gameStyle.addClass("display_none");
    gameStyle = "rps"
    populate_weapons(gameStyle);

    if (mode === "2") {

        update_database();

    }
})
//If player 1 selects Rock-Paper-Scissors-Lizard-Spock
$("#rpslv-btn").on("click", function () {

    event.preventDefault();
    $gameStyle.addClass("display_none");
    gameStyle = "rpslv"
    populate_weapons(gameStyle);

    if (mode === "2") {

        update_database();

    }
})
//Determine if player 1 or player 2
$("#submit-btn").on("click", function () {

    event.preventDefault();

    if ($nameTxt.val().trim() === "") {
        $nameTxt.focus();
        return;
    }
    
    $playerWins.text("WINS: 0");
    $playerLosses.text("LOSSES: 0");
    $opponentWins.text("WINS: 0");
    $opponentLosses.text("LOSSES: 0");

    //Find desired mode (1 player or 2)
    mode = $("#mode input:radio:checked").val();
    $welcomeDiv.addClass("display_none");
    $gameBoard.removeClass("display_none");

    //If 1 player, set Computer as opponent and setup board
    if (mode === "1") {

        //sessionStorage.setItem("player", "1");
        setup_singlePlayer();

        //If 2 player, check firebase fields
    } else if (mode === "2") {

        //If lastUpdate is more than 15 minutes ago, or if player1 is not populated, then populate player1
        if ((Date.now() - lastUpdate > intervalTime) || (player1.name === "") || !player1) {

            save_match();
            browserPlayer = 1;
            player1.name = $nameTxt.val().toUpperCase();

            // Save the new info to  Firebase
            update_database();

            $gameStyle.removeClass("display_none");
            $opponentName.text("Awaiting Opponent");
            $playerName.text("Player: " + player1.name);

        } else if (currentSnapshot.oPlayer2.name === "") {

            //sessionStorage.setItem("player", "2");
            browserPlayer = 2;
            player2.name = $nameTxt.val().toUpperCase();

            update_database();

            $playerName.text("Player: " + player2.name);
        } else {

            mode = "1";
            setup_singlePlayer();

        }
    }

    if(mode==="1"){
        set_timer();
    }

})
//END LISTENERS -- START FUNCTIONS
function battle() {

    let results = "Battle Results";
    let winner = "";

    if (player1.weapon === player2.weapon) {

        results = "IT'S A DRAW!"
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

    switch (player1.weapon + player2.weapon) {
        case "rp":
        case "pr":
            results = "Paper covers Rock";
            break;
        case "rs":
        case "sr":
            results = "Rock crushes Scissors";
            break;
        case "rl":
        case "lr":
            results = "Rock crushes Lizard";
            break;
        case "rv":
        case "vr":
            results = "Spock vaporizes Rock";
            break;
        case "ps":
        case "sp":
            results = "Scissors cut Paper";
            break;
        case "pl":
        case "lp":
            results = "Lizard eats Paper";
            break;
        case "pv":
        case "vp":
            results = "Paper disproves Spock";
            break;
        case "sl":
        case "ls":
            results = "Scissors decapitates Lizard";
            break;
        case "sv":
        case "vs":
            results = "Spock crushes Scissors";
            break;
        case "lv":
        case "vl":
            results = "Lizard poisons Spock";
            break;
    }

    $("#player-img").attr("src", "assets/images/" + playerImage);
    if (winner === "player1") {
        results = results + ": " + player1.name + " WINS!"
    } else if (winner === "player2") {
        results = results + ": " + player2.name + " WINS!"
    }
    $resultsHeader.text(results);

    if (mode === "1") {

        $opponentImg.attr("src", "assets/images/" + player2.image);

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

        // if (sessionStorage.getItem("player") === "1") {
        if (browserPlayer === 1) {

            $opponentImg.attr("src", "assets/images/" + player2.image);

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

            $("#opponent-img").attr("src", "assets/images/" + player1.image);

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
    $("#weapons-div").removeClass("invisible");

    update_score(winner);

    //Only one player needs to update score, so player 1 is selected for this purpose
    //if (sessionStorage.getItem("player") === "1") {
    if (browserPlayer === 1) {

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
function populate_user_messages() {


    while (arrMessagesIdx < arrMessages.length) {

        let newRow = $("<tr>");
        let newDateTD = $("<td>");
        let newUserTD = $("<td>");
        let newMessageTD = $("<td>");
        newDateTD.text(arrMessages[arrMessagesIdx].dateStamp);
        newMessageTD.text(arrMessages[arrMessagesIdx].message);
        if (browserPlayer !== arrMessages[arrMessagesIdx].player) {
            newRow.addClass("text-info");
        }
        newRow.addClass("js_messages");
        newUserTD.text(arrMessages[arrMessagesIdx].name);
        newDateTD.appendTo(newRow);
        newMessageTD.appendTo(newRow);
        newUserTD.appendTo(newRow);

        newRow.prependTo($("#messages-table"))

        arrMessagesIdx++
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

        event.preventDefault();
        console.log(this.value);

        $("#weapons-div").addClass("invisible");

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

            //switch (sessionStorage.getItem("player")) {
            switch (browserPlayer) {
                case 1:
                    player1.weapon = this.value;
                    player1.image = playerImage;
                    update_database();

                    break;
                case 2:

                    player2.weapon = this.value;
                    player2.image = playerImage;
                    update_database();

            }
        }
    })
}
//Reset Game
function reset_game(currentSnapshot) {

    clearTimeout(intervalId);
    save_match();

    $("#results-modal").modal("hide");

    // database.ref().child("currentMatch").on("value", function (snapshot) {
    //     currentSnapshot = snapshot.val();
    // })

    $nameTxt.val("");


    //sessionStorage.clear();
    $gameBoard.addClass("display_none");
    $opponentName.text("Awaiting Opponent");
    $welcomeDiv.removeClass("display_none");
    $("#weapons-div").remove();
    $(".js_messages").remove();

    // if (currentSnapshot.oPlayer1.name !== "" && currentSnapshot.oPlayer2.name !== "" ) {

    //     if (currentSnapshot.chat) {
    //         array = currentSnapshot.chat;
    //     }

    //     database.ref().child("matches").push({
    //         datePlayed: moment(currentSnapshot.lastUpdate).format("MM-DD-YYYY HH:mm:ss"),
    //         gameStyle: currentSnapshot.gameStyle,
    //         chat: array,
    //         player1: currentSnapshot.oPlayer1.name,
    //         player1losses: currentSnapshot.oPlayer1.losses,
    //         player1wins: currentSnapshot.oPlayer1.wins,
    //         player2: currentSnapshot.oPlayer2.name,
    //         player2losses: currentSnapshot.oPlayer2.losses,
    //         player2wins: currentSnapshot.oPlayer2.wins
    //     })
    // }

}
function save_match() {

    let array = [];

    database.ref().child("currentMatch").on("value", function (snapshot) {
        currentSnapshot = snapshot.val();
    })

    if (currentSnapshot.oPlayer1.name !== "" && currentSnapshot.oPlayer2.name !== "") {

        if (currentSnapshot.chat) {
            array = currentSnapshot.chat;
        }

        database.ref().child("matches").push({
            datePlayed: moment(currentSnapshot.lastUpdate).format("MM-DD-YYYY HH:mm:ss"),
            gameStyle: currentSnapshot.gameStyle,
            chat: array,
            player1: currentSnapshot.oPlayer1.name,
            player1losses: currentSnapshot.oPlayer1.losses,
            player1wins: currentSnapshot.oPlayer1.wins,
            player2: currentSnapshot.oPlayer2.name,
            player2losses: currentSnapshot.oPlayer2.losses,
            player2wins: currentSnapshot.oPlayer2.wins
        })
    }

    gameStyle = "";
    arrMessages = [];
    player1 = new player;
    player2 = new player;
    update_database();
}
function set_timer() {
    intervalId = setTimeout(reset_game, intervalTime)
}
function setup_singlePlayer() {

    browserPlayer = 1;
    gameStyle = "";
    $gameStyle.removeClass("display_none");
    player1.name = $nameTxt.val().toUpperCase();
    $playerName.text("Player: " + player1.name);
    player2.name = "DEEP THOUGHT"
    $opponentName.text(player2.name);
    $("#weapons-div").remove();
    $(".js_chat").addClass("display_none");
    $(".js_messages").remove();

}
function update_database() {

    database.ref().child("currentMatch").set({
        gameStyle: gameStyle,
        lastUpdate: firebase.database.ServerValue.TIMESTAMP,
        chat: arrMessages,
        oPlayer1: player1,
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