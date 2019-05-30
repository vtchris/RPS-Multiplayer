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
var lastUpdate = "";
var player1 = "";
var player1losses = 0;
var player1weapon = "";
var player1wins = 0;
var player2 = "";
var player2losses = 0;
var player2weapon = "";
var player2wins = 0;

//jQuery Variables
var $playerName = $("#playerName");
var $opponentName = $("#opponentName");
var $gameStyle = $("#divGameStyle");

//Attach Listeners
//If player 1 selects Rock-Paper-Scissors-Lizard-Spock
$("#btnRPSLS").on("click", function () {


    database.ref().set({
        player1: player1,
        player1weapon: player1weapon,
        player1wins: player1wins,
        player1losses: player1losses,
        player2: player2,
        player2weapon: player2weapon,
        player2wins: player2wins,
        player2losses: player2losses,
        gameStyle: "rpslv",
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
    })

})
//If player 1 selects Rock-Paper-Scissors
$("#btnRPS").on("click", function () {

    database.ref().set({
        player1: player1,
        player1weapon: player1weapon,
        player1wins: player1wins,
        player1losses: player1losses,
        player2: player2,
        player2weapon: player2weapon,
        player2wins: player2wins,
        player2losses: player2losses,
        gameStyle: "rps",
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
    })

})
//Deterine 1 player or 2 player
$("#btnSubmit").on("click", function () {

    //Find desired mode (1 player or 2)
    mode = $("#mode input:radio:checked").val()

    //If 2 player, check firebase fields
    if (mode === "2") {

        sessionStorage.clear()

        //If lastUpdate is more than 15 minutes ago, or if player1 is not populated, then populate player1
        if ((Date.now() - lastUpdate > (1 * 60 * 1000)) || (player1 === "") || !player1) {
            // Save the new in Firebase
            player1 = $("#txtName").val().toUpperCase()
            sessionStorage.setItem("player", "1")

            database.ref().set({
                gameStyle: "",
                player1: player1,
                player1losses: 0,
                player1weapon: "",
                player1wins: 0,
                player2: "",
                player2losses: 0,
                player2weapon: "",
                player2wins: 0,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            })

            $playerName.text("Player: " + player1)
            $gameStyle.removeClass("invisible")
        } else if (currentSnapshot.player2 === "") {

            player2 = $("#txtName").val().toUpperCase()
            sessionStorage.setItem("player", "2")

            database.ref().set({
                gameStyle: gameStyle,
                player1: player1,
                player1weapon: player1weapon,
                player1wins: player1wins,
                player1losses: player1losses,
                player2: player2,
                player2weapon: player2weapon,
                player2wins: player2wins,
                player2losses: player2losses,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            })

            $playerName.text("Player: " + player2)
        }

    }

})




function randomlyArrangeWeapons(array) {

    $("#divWeapons").remove();
    debugger

    newDiv = $("<div>")
    newDiv.attr("id", "divWeapons")
    newDiv.addClass("card")
    newBody = $("<div>")
    newBody.addClass("card-body")
    while (array.length > 0) {

        let iRandom = Math.floor(Math.random() * array.length);

        newButton = $("<button>");
        newButton.addClass("btn btn-secondary m-1");
        newButton.val(array[iRandom].value);
        newButton.html("<span class='fa " + array[iRandom].faClass + "'></span> " + array[iRandom].name.toUpperCase());
        newButton.appendTo(newBody);

        //Remove from array
        array.splice(iRandom, 1)
    }
    newBody.appendTo(newDiv);
    newDiv.appendTo($("#divPlayer"));
}

//Weapon prototype
function weapon(name, value, faClass, img) {
    this.name = name;
    this.value = value;
    this.faClass = faClass;
    this.image = img;
}

database.ref().on("value", function (snapshot) {
    console.log(snapshot.val());
    currentSnapshot = snapshot.val();
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

        randomlyArrangeWeapons(arrWeapons)

    }
    player1 = currentSnapshot.player1;
    player1weapon = currentSnapshot.player1weapon;
    player1wins = currentSnapshot.player1wins;
    player1losses = currentSnapshot.player1losses;
    player2 = currentSnapshot.player2;
    player2weapon = currentSnapshot.player2weapon;
    player2wins = currentSnapshot.player1wins;
    player2losses = currentSnapshot.player1losses;
    lastUpdate = currentSnapshot.lastUpdate;

    //debugger
    if (sessionStorage.getItem("player") === "1" && player2 != "") {
        $opponentName.text("Opponent: " + player2)
    } else if (sessionStorage.getItem("player") === "2" && player1 != "") {
        $opponentName.text("Opponent: " + player1)
    } else {
        $opponentName.text("")
    }

})



