var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./images/title.png");
ASSET_MANAGER.queueDownload("./images/info.png");
ASSET_MANAGER.queueDownload("./images/space.png");
ASSET_MANAGER.queueDownload("./images/hyperspace.png");
ASSET_MANAGER.queueDownload("./images/ship.png");
ASSET_MANAGER.queueDownload("./images/alien.png");
ASSET_MANAGER.queueDownload("./images/laser.png");
ASSET_MANAGER.queueDownload("./images/gameover.png");

var myGameEngine;
ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    canvas.focus();

    myGameEngine = new GameEngine();
    var card = new Card(myGameEngine, 'title');
    var card2 = new Card(myGameEngine, 'info');
    myGameEngine.addEntity(card);

    var titleGone = false;
    function enterListener(e) {
        if (e.code === "Enter") {
            if(!titleGone) {
                card.removeFromWorld = true;
                titleGone = true;
                myGameEngine.addEntity(card2);
            } else {
                card2.removeFromWorld = true;
                ctx.scale(10,10);
                ctx.imageSmoothingEnabled = false;
                var bg = new Background(myGameEngine);
                var ship = new Ship(myGameEngine, 35, 55);
                var mothership = new Mothership(myGameEngine);

                myGameEngine.addEntity(bg);
                myGameEngine.addEntity(ship);
                myGameEngine.addEntity(mothership, ship);
                ctx.canvas.removeEventListener("keypress", enterListener);
            }
        }
    }
    ctx.canvas.addEventListener("keypress", enterListener, false);

    myGameEngine.init(ctx);
    myGameEngine.start();
});

function detectCollision(colliderCircle1, colliderCircle2) {
    var collisionDetected = false;
    var dx = (colliderCircle1.x - colliderCircle2.x);
    var dy = (colliderCircle1.y - colliderCircle2.y);
    var distance = Math.sqrt(dx * dx + dy * dy);
    if( distance < (colliderCircle1.radius + colliderCircle2.radius)) {
        collisionDetected = true;
    }
    return collisionDetected;
}

function distance(e1, e2) {
    var dx = (e1.colliderCircle.x - e2.colliderCircle.x);
    var dy = (e1.colliderCircle.y - e2.colliderCircle.y);
    return Math.sqrt(dx * dx + dy * dy);
}

window.onload = function () {
    var socket = io.connect("http://24.16.255.56:8888");
  
    socket.on("load", function (data) {
        var newEntityArr = [];
        data.data.forEach(function(e) {
            if(e.type == 'title') {
                newEntityArr.push(new Card(myGameEngine, 'title'));
            } else if(e.type == 'info') {
                newEntityArr.push(new Card(myGameEngine, 'info'));
            } else if(e.type == 'background') {
                newEntityArr.push(new Background(myGameEngine));
            } else if(e.type == 'ship') {
                newEntityArr.push(new Ship(myGameEngine, e.x, e.y));
            } else if(e.type == 'laser') {
                newEntityArr.push(new Laser(myGameEngine, e.x, e.y));
            } else if(e.type == 'alien') {
                newEntityArr.push(new Alien(myGameEngine, e.x, e.y));
            } else if(e.type == 'mothership') {
                newEntityArr.push(new Mothership(myGameEngine));
            }
        })
        myGameEngine.entities = newEntityArr;
        console.log(myGameEngine.entities);
    });
  
    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");
  
    saveButton.onclick = function () {
      console.log("save");
      var SaveStateArr = [];
      myGameEngine.entities.forEach(function(e) {
        SaveStateArr.push(e.getSaveValues());
      })
      text.innerHTML = "Saved!";
      socket.emit("save", { studentname: "Logan Jenny", statename: "aState", data: SaveStateArr});
    };
  
    loadButton.onclick = function () {
      console.log("load");
      text.innerHTML = "Loaded."
      socket.emit("load", { studentname: "Logan Jenny", statename: "aState" });
    };
};