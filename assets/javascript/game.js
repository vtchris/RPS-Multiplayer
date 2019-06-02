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
var arrWeapons = [];
var currentSnapshot = "";
var gameStyle = "";
var intervalTime = (2 * 60 * 1000);
var lastUpdate = "";
var mode = $("#mode input:radio:checked").val();
var opponentImage = "";
var player1 = "";
var player1image = "";
var player1losses = 0;
var player1weapon = "";
var player1wins = 0;
var player2 = "";
var player2image = "";
var player2losses = 0;
var player2weapon = "";
var player2wins = 0;
var playerImage = "";

//jQuery Variables
var $gameBoard = $("#gameBoard_div");
var $gameStyle = $("#game-style-div");
var $nameTxt = $("#name-txt");
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
database.ref().on("value", function (snapshot) {

    //Listen to database ONLY in multiplayer mode
    if (mode === "2") {

        console.log(snapshot.val());
        currentSnapshot = snapshot.val();
        lastUpdate = currentSnapshot.lastUpdate;

        if (Date.now() - lastUpdate > intervalTime) {

            //Reset the game if the interval time has been exceeded since last firebase update
            reset_game();

        } else {

            //Update global variables for firebase changes
            player1 = currentSnapshot.player1;
            player1image = currentSnapshot.player1image;
            player1losses = currentSnapshot.player1losses;
            player1weapon = currentSnapshot.player1weapon;
            player1wins = currentSnapshot.player1wins;
            player2 = currentSnapshot.player2;
            player2image = currentSnapshot.player2image;
            player2losses = currentSnapshot.player2losses;
            player2weapon = currentSnapshot.player2weapon;
            player2wins = currentSnapshot.player2wins;

            //If the gameStyle has been chosen, populate the weapons buttons
            if (gameStyle !== currentSnapshot.gameStyle) {
                gameStyle = currentSnapshot.gameStyle;

                populate_weapons(gameStyle);

            }

            //If Opponents Name = "Awaiting Opponent", check to see if name can be populated
            if ($opponentName.text() === "Awaiting Opponent") {

                if (sessionStorage.getItem("player") === "1" && player2 != "") {
                    $opponentName.text("Opponent: " + player2);
                } else if (sessionStorage.getItem("player") === "2" && player1 != "") {
                    $opponentName.text("Opponent: " + player1);
                } else {
                    $opponentName.text("Awaiting Opponent");
                }
            }

            //If both players have selected a weapon, time to battle!
            if (player1weapon !== "" && player2weapon !== "") {

                battle();

            }
        }
    }
})
//If player 1 selects Rock-Paper-Scissors
$("#rps-btn").on("click", function () {

    $gameStyle.addClass("display_none");

    if (mode === "1") {

        populate_weapons("rps");

    } else if (mode === "2") {

        database.ref().set({
            gameStyle: "rps",
            lastUpdate: firebase.database.ServerValue.TIMESTAMP,
            player1: player1,
            player1image: player1image,
            player1losses: player1losses,
            player1weapon: player1weapon,
            player1wins: player1wins,
            player2: player2,
            player2image: player2image,
            player2losses: player2losses,
            player2weapon: player2weapon,
            player2wins: player2wins
        })
    }
})
//If player 1 selects Rock-Paper-Scissors-Lizard-Spock
$("#rpslv-btn").on("click", function () {

    $gameStyle.addClass("display_none");

    if (mode === "1") {

        populate_weapons("rpslv");

    } else if (mode === "2") {

        database.ref().set({
            gameStyle: "rpslv",
            lastUpdate: firebase.database.ServerValue.TIMESTAMP,
            player1: player1,
            player1image: player1image,
            player1losses: player1losses,
            player1weapon: player1weapon,
            player1wins: player1wins,
            player2: player2,
            player2image: player2image,
            player2losses: player2losses,
            player2weapon: player2weapon,
            player2wins: player2wins
        })
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
        $playerName.text($nameTxt.val().toUpperCase());
        $opponentName.text("DEEP THOUGHT");
        $("#weapons-div").remove();

        //If 2 player, check firebase fields
    } else if (mode === "2") {

        //If lastUpdate is more than 15 minutes ago, or if player1 is not populated, then populate player1
        if ((Date.now() - lastUpdate > intervalTime) || (player1 === "") || !player1) {

            sessionStorage.setItem("player", "1");
            player1 = $nameTxt.val().toUpperCase();

            // Save the new info to  Firebase
            database.ref().set({
                gameStyle: "",
                lastUpdate: firebase.database.ServerValue.TIMESTAMP,
                player1: player1,
                player1image: "",
                player1losses: 0,
                player1weapon: "",
                player1wins: 0,
                player2: "",
                player2image: "",
                player2losses: 0,
                player2weapon: "",
                player2wins: 0
            })

            $gameStyle.removeClass("display_none");
            $opponentName.text("Awaiting Opponent");
            $playerName.text("Player: " + player1);

        } else if (currentSnapshot.player2 === "") {

            sessionStorage.setItem("player", "2");
            player2 = $nameTxt.val().toUpperCase();

            database.ref().set({
                gameStyle: gameStyle,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP,
                player1: player1,
                player1image: player1image,
                player1losses: player1losses,
                player1weapon: player1weapon,
                player1wins: player1wins,
                player2: player2,
                player2image: player2image,
                player2losses: player2losses,
                player2weapon: player2weapon,
                player2wins: player2wins
            })

            $playerName.text("Player: " + player2);
        }
    }
})
//END LISTENERS -- START FUNCTIONS
function battle() {
    
    let winner = "";
    
    if (player1weapon === player2weapon) {
        
        winner="tie";

    } else {

        switch (player1weapon) {
            case "r":
                if (player2weapon === "s" || player2weapon === "l") {
                    
                    winner = "player1";

                } else {
                    
                    winner = "player2";
                }
                break;
            case "p":
                if (player2weapon === "r" || player2weapon === "v") {
                    
                    winner = "player1";
                } else {
                    
                    winner = "player2";
                }
                break;
            case "s":
                if (player2weapon === "p" || player2weapon === "l") {
                    
                    winner = "player1";

                } else {
                    
                    winner = "player2";
                }
                break;
            case "l":
                if (player2weapon === "p" || player2weapon === "v") {
                    
                    winner = "player1";

                } else {
                    
                    winner = "player2";
                }
                break;
            case "v":
                if (player2weapon === "s" || player2weapon === "r") {
                    
                    winner = "player1";

                } else {
                    
                    winner = "player2";

                }
        }
    }

    $("#player-img").attr("src", "/assets/images/" + playerImage);
debugger
    if (mode === "1") {

        $opponentImg.attr("src", "/assets/images/" + player2image);

        if (winner === "player1") {

            $opponentImg.css("opacity", ".1");
            $playerImg.css("opacity", "1");

        } else if (winner === "player2") {

            $opponentImg.css("opacity", "1");
            $playerImg.css("opacity", ".1");

        }

    } else if (mode === "2") {

        if (sessionStorage.getItem("player") === "1") {
           
            $opponentImg.attr("src", "/assets/images/" + player2image);

            if (winner === "player1") {

                $opponentImg.css("opacity", ".1");
                $playerImg.css("opacity", "1");

            } else if (winner === "player2") {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", ".1");
            }else {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", "1");

            }

        } else {

            $("#opponent-img").attr("src", "/assets/images/" + player1image);

            if (winner === "player1") {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", ".1");

            } else if (winner === "player2") {

                $opponentImg.css("opacity", ".1");
                $playerImg.css("opacity", "1");

            }else {

                $opponentImg.css("opacity", "1");
                $playerImg.css("opacity", "1");

            }
        }
    }

    $("#results-modal").modal("show");

    update_score(winner);

    //Only one player needs to update score, so player 1 is selected for this purpose
    if (sessionStorage.getItem("player") === "1") {

        $opponentLosses.text("LOSSES: " + player2losses);
        $opponentWins.text("WINS: " + player2wins);
        $playerLosses.text("LOSSES: " + player1losses);
        $playerWins.text("WINS: " + player1wins);
                      
    } else {
   
        $opponentLosses.text("LOSSES: " + player1losses);
        $opponentWins.text("WINS: " + player1wins);
        $playerLosses.text("LOSSES: " + player2losses);
        $playerWins.text("WINS: " + player2wins);

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

            player1weapon = this.value;

            //Computer makes weapon choice
            let random = Math.floor(Math.random() * arrWeapons.length);
            player2image = arrWeapons[random].image;
            player2weapon = arrWeapons[random].value;            

            //fight, Fight, FIGHT!
            battle();
        }

        //Update Firebase for Multiplayer mode only
        if (mode === "2") {

            switch(sessionStorage.getItem("player")){
                case "1":
                        database.ref().set({
                            gameStyle: gameStyle,
                            lastUpdate: firebase.database.ServerValue.TIMESTAMP,
                            player1: player1,
                            player1image: playerImage,
                            player1losses: player1losses,
                            player1weapon: this.value,
                            player1wins: player1wins,                    
                            player2: player2,
                            player2image: player2image,
                            player2losses: player2losses,
                            player2weapon: player2weapon,
                            player2wins: player2wins
                        })
                        break;
                case "2":
                        database.ref().set({

                            gameStyle: gameStyle,
                            lastUpdate: firebase.database.ServerValue.TIMESTAMP,
                            player1: player1,
                            player1image: player1image,
                            player1losses: player1losses,
                            player1weapon: player1weapon,
                            player1wins: player1wins,                            
                            player2: player2,
                            player2image: playerImage,
                            player2losses: player2losses,
                            player2weapon: this.value,
                            player2wins: player2wins        
                        })

            }
            
            // if (sessionStorage.getItem("player") === "1") {
                
                

            // } else if (sessionStorage.getItem("player") === "2") {
                
            // }

        }
    })
}
//Reset Game
function reset_game() {

    sessionStorage.clear();
    $gameBoard.addClass("display_none");
    $opponentName.text("Awaiting Opponent");    
    $welcomeDiv.removeClass("display_none");
    $("#weapons-div").remove();

    database.ref().set({
        gameStyle: "",
        lastUpdate: firebase.database.ServerValue.TIMESTAMP,
        player1: "",
        player1image: "",
        player1losses: "",
        player1weapon: "",
        player1wins: "",
        player2: "",
        player2image: "",
        player2losses: "",
        player2weapon: "",
        player2wins: ""
    })    
}
function update_score(winner) {

    if (winner === "player1") {
        player1wins++;
        player2losses++;
    } else if (winner === "player2") {
        player1losses++;
        player2wins++;
    }

    if (mode === "2") {
        database.ref().set({

            gameStyle: gameStyle,
            lastUpdate: firebase.database.ServerValue.TIMESTAMP,
            player1: player1,
            player1image: "",
            player1losses: player1losses,
            player1weapon: "",
            player1wins: player1wins,            
            player2: player2,
            player2image: "",
            player2losses: player2losses,
            player2weapon: "",
            player2wins: player2wins
        })
    }
}
//Weapon prototype
function weapon(name, value, faClass, img) {
    this.name = name;
    this.value = value;
    this.faClass = faClass;
    this.image = img;
}