//Deterine 1 player or 2 player
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
//var mode2 = $('input[name=mode]:checked').val()

var currentSnapshot = "";
var player1 = "";
var player2 = "";
var lastUpdate = "";
var player1weapon = "";
var player2weapon = "";
var player1wins = 0;
var player1losses = 0;
var player2wins = 0;
var player2losses = 0;

database.ref().on("value", function (snapshot) {
    console.log(snapshot.val());
    currentSnapshot = snapshot.val();
    player1 = currentSnapshot.player1;
    player1weapon = currentSnapshot.player1weapon;
    player1wins = currentSnapshot.player1wins;
    player1losses = currentSnapshot.player1losses;
    player2 = currentSnapshot.player2;    
    player2weapon = currentSnapshot.player2weapon;    
    player2wins = currentSnapshot.player1wins;
    player2losses = currentSnapshot.player1losses;
    lastUpdate = currentSnapshot.lastUpdate;

})


$("#btnSubmit").on("click", function () {
    
    //Find desired mode (1 player or 2)
    mode = $("#mode input:radio:checked").val()

    //If 2 player, check firebase fields
    if (mode === "2") {
        
        //If lastUpdate is more than 15 minutes ago, or if player1 is not populated, then populate player1
        if ((Date.now() - lastUpdate > (15 * 60 * 1000)) || (player1 ==="") || !player1 ) {
            // Save the new in Firebase
            database.ref().set({
                player1: $("#txtName").val().toUpperCase(),
                player1weapon: "",
                player1wins: 0,
                player1losses: 0,
                player2: "",    
                player2weapon: "",    
                player2wins: 0,
                player2losses: 0,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            })
        }else if (currentSnapshot.player2 === "") {
            let player1 = currentSnapshot.player1

            database.ref().set({
                player1: player1,
                player1weapon: player1weapon,
                player1wins: player1wins,
                player1losses: player1losses,
                player2: $("#txtName").val().toUpperCase(),
                player2weapon: player2weapon,
                player2wins: player2wins,
                player2losses: player2losses,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            })
        }




    }


})

