//If 1 player, play against computer
//If 2 player, wait for another person to join
//players choose weapons
//Winner is revealed, scores incremented

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
var mode = $("#mode input:radio:checked").val()

//Set Global Variables
var arrWeapons = [];
var currentSnapshot = "";
var gameStyle = "";
var intervalTime = (2 * 60 * 1000)
var lastUpdate = "";
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
var $gameBoard = $("#gameBoard_div")
var $gameStyle = $("#game-style-div");
var $opponentImg = $("#opponent-img");
var $opponentName = $("#opponentName");
var $playerImg = $("#player-img");
var $playerName = $("#playerName");
var $welcomeDiv = $("#welcome-div");


$opponentName.text("")

//Attach Listeners
database.ref().on("value", function (snapshot) {

    console.log(snapshot.val());
    currentSnapshot = snapshot.val();
    lastUpdate = currentSnapshot.lastUpdate;

    if (Date.now() - lastUpdate > intervalTime) {
        //debugger
        reset_game();
    } else {

        player1 = currentSnapshot.player1;
        player1image = currentSnapshot.player1image;
        player1weapon = currentSnapshot.player1weapon;
        player1wins = currentSnapshot.player1wins;
        player1losses = currentSnapshot.player1losses;
        player2 = currentSnapshot.player2;
        player2image = currentSnapshot.player2image;
        player2weapon = currentSnapshot.player2weapon;
        player2wins = currentSnapshot.player1wins;
        player2losses = currentSnapshot.player1losses;

        if (gameStyle !== currentSnapshot.gameStyle) {
            gameStyle = currentSnapshot.gameStyle;

            arrWeapons = [];

            switch (gameStyle) {
                case "rpslv":
                    arrWeapons.push(new weapon("lizard", "l", "fa-hand-lizard", "geico.jpg"))
                    arrWeapons.push(new weapon("spock", "v", "fa-hand-spock", "spock.jfif"))
                case "rps":
                    arrWeapons.push(new weapon("rock", "r", "fa-hand-rock", "rock.jfif"))
                    arrWeapons.push(new weapon("paper", "p", "fa-hand-paper", "paper.jpg"))
                    arrWeapons.push(new weapon("scissors", "s", "fa-hand-scissors", "scissors.jpg"))
                    break;
            }

            populate_weapons(arrWeapons)

        }

        if ($opponentName.text() === "") {
            if (sessionStorage.getItem("player") === "1" && player2 != "") {
                $opponentName.text("Opponent: " + player2)
            } else if (sessionStorage.getItem("player") === "2" && player1 != "") {
                $opponentName.text("Opponent: " + player1)
            } else {
                $opponentName.text("")
            }
        }


        //If both players have selected a weapon
        if (player1weapon !== "" && player2weapon !== "") {
            let winner = ""
            if (player1.weapon === player2weapon) {
                alert("it's a draw")
            } else {

                switch (player1weapon) {
                    case "r":
                        if (player2weapon === "s" || player2weapon === "l") {
                            //alert("player 1 wins")
                            winner = "player1"

                        } else {
                            alert("player 1 loses")
                            winner = "player2"
                        }
                        break;
                    case "p":
                        if (player2weapon === "r" || player2weapon === "v") {
                            alert("player 1 wins")
                            winner = "player1"
                        } else {
                            alert("player 1 loses")
                            winner = "player2"
                        }
                        break;
                    case "s":
                        if (player2weapon === "p" || player2weapon === "l") {
                            alert("player 1 wins")
                            winner = "player1"
                        } else {
                            alert("player 1 loses")
                            winner = "player2"
                        }
                        break;
                    case "l":
                        if (player2weapon === "p" || player2weapon === "v") {
                            alert("player 1 wins")
                            winner = "player1"
                        } else {
                            alert("player 1 loses")
                            winner = "player2"
                        }
                        break;
                    case "v":
                        if (player2weapon === "s" || player2weapon === "r") {
                            alert("player 1 wins")
                            winner = "player1"
                        } else {
                            alert("player 1 loses")
                            winner = "player2"
                        }

                }

                
            }
            
            $("#player-img").attr("src", "/assets/images/" + playerImage)
           
            if (sessionStorage.getItem("player") === "1") {
               $opponentImg.attr("src", "/assets/images/" + player2image)
                
                if(winner === "player1"){
                    $opponentImg.css("opacity",".1")
                    $playerImg.css("opacity","1")
                }else if (winner === "player2"){
                    $opponentImg.css("opacity","1")
                    $playerImg.css("opacity",".1")
                }

            } else {
                $("#opponent-img").attr("src", "/assets/images/" + player1image)

                if(winner === "player1"){
                    $opponentImg.css("opacity","1")
                    $playerImg.css("opacity",".1")
                }else if (winner === "player2"){
                    $opponentImg.css("opacity",".1")
                    $playerImg.css("opacity","1")
                }

            }


            $("#results-modal").modal("show");

            //Only one player needs to run this code, so player 1 is selected for this purpose
            if (sessionStorage.getItem("player") === "1") {
                update_score(winner);
            }


        }
        //}
    }

})
//If player 1 selects Rock-Paper-Scissors-Lizard-Spock
$("#btnRPSLS").on("click", function () {

    $gameStyle.addClass("display_none")

    database.ref().set({
        player1: player1,
        player1image: player1image,
        player1weapon: player1weapon,
        player1wins: player1wins,
        player1losses: player1losses,
        player2: player2,
        player2image: player2image,
        player2weapon: player2weapon,
        player2wins: player2wins,
        player2losses: player2losses,
        gameStyle: "rpslv",
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
    })

})
//If player 1 selects Rock-Paper-Scissors
$("#btnRPS").on("click", function () {

    $gameStyle.addClass("display_none")

    database.ref().set({
        player1: player1,
        player1image: player1image,
        player1weapon: player1weapon,
        player1wins: player1wins,
        player1losses: player1losses,
        player2: player2,
        player2image: player2image,
        player2weapon: player2weapon,
        player2wins: player2wins,
        player2losses: player2losses,
        gameStyle: "rps",
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
    })

})
//Deterine 1 player or 2 player
$("#submit-btn").on("click", function () {
debugger
    //Find desired mode (1 player or 2)
    mode = $("#mode input:radio:checked").val()
    $welcomeDiv.addClass("display_none")
    $gameBoard.removeClass("display_none")

    //If 2 player, check firebase fields
    if (mode === "2") {

        sessionStorage.clear()

        //If lastUpdate is more than 15 minutes ago, or if player1 is not populated, then populate player1
        if ((Date.now() - lastUpdate > intervalTime) || (player1 === "") || !player1) {
            // Save the new in Firebase
            player1 = $("#name-txt").val().toUpperCase()
            sessionStorage.setItem("player", "1")

            database.ref().set({
                gameStyle: "",
                player1: player1,
                player1image: "",
                player1losses: 0,
                player1weapon: "",
                player1wins: 0,
                player2: "",
                player2image: "",
                player2losses: 0,
                player2weapon: "",
                player2wins: 0,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            })

            $playerName.text("Player: " + player1)
            $gameStyle.removeClass("display_none")
            

        } else if (currentSnapshot.player2 === "") {

            player2 = $("#name-txt").val().toUpperCase()
            sessionStorage.setItem("player", "2")

            database.ref().set({
                gameStyle: gameStyle,
                player1: player1,
                player1image: player1image,
                player1weapon: player1weapon,
                player1wins: player1wins,
                player1losses: player1losses,
                player2: player2,
                player2image: player2image,
                player2weapon: player2weapon,
                player2wins: player2wins,
                player2losses: player2losses,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            })

            $playerName.text("Player: " + player2)
        }

    }

})

function populate_weapons(array) {

    $("#weapons-div").remove();

    newDiv = $("<div>")
    newDiv.attr("id", "weapons-div")
    newDiv.addClass("card")
    newBody = $("<div>")
    newBody.addClass("card-body")
    while (array.length > 0) {

        let random = Math.floor(Math.random() * array.length);

        newButton = $("<button>");
        newButton.addClass("btn btn-secondary m-1 js_weapon");
        newButton.val(array[random].value);
        newButton.attr("data-image", array[random].image)
        newButton.html("<span class='fa " + array[random].faClass + "'></span> " + array[random].name.toUpperCase());
        newButton.appendTo(newBody);

        //Remove from array
        array.splice(random, 1)
    }
    newBody.appendTo(newDiv);
    newDiv.appendTo($("#player-div"));

    $(".js_weapon").on("click", function () {
        console.log(this.value)

        playerImage = $(this).attr("data-image")


        if (sessionStorage.getItem("player") === "1") {
            database.ref().set({
                player1: player1,
                player1image: $(this).attr("data-image"),
                player1weapon: this.value,
                player1wins: player1wins,
                player1losses: player1losses,
                player2: player2,
                player2image: player2image,
                player2weapon: player2weapon,
                player2wins: player2wins,
                player2losses: player2losses,
                gameStyle: gameStyle,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP



            })
        } else if (sessionStorage.getItem("player") === "2") {
            database.ref().set({

                player1: player1,
                player1image: player1image,
                player1weapon: player1weapon,
                player1wins: player1wins,
                player1losses: player1losses,
                player2: player2,
                player2image: $(this).attr("data-image"),
                player2weapon: this.value,
                player2wins: player2wins,
                player2losses: player2losses,
                gameStyle: gameStyle,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP


            })
        }



    })
}
//Reset Game
function reset_game() {

    $gameBoard.addClass("display_none")
    $welcomeDiv.removeClass("display_none")
    
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

    $("#weapons-div").remove();
}
function update_score(winner) {

    if (winner === "player1") {
        player1wins++
        player2losses++
    } else if (winner === "player2") {
        player1losses++
        player2wins++
    }

    database.ref().set({

        player1: player1,
        player1image: "",
        player1weapon: "",
        player1wins: player1wins,
        player1losses: player1losses,
        player2: player2,
        player2image: "",
        player2weapon: "",
        player2wins: player2wins,
        player2losses: player2losses,
        gameStyle: gameStyle,
        lastUpdate: firebase.database.ServerValue.TIMESTAMP


    })
}
//Weapon prototype
function weapon(name, value, faClass, img) {
    this.name = name;
    this.value = value;
    this.faClass = faClass;
    this.image = img;
}





