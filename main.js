var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./images/title.png");
ASSET_MANAGER.queueDownload("./images/info.png");
ASSET_MANAGER.queueDownload("./images/space.png");
ASSET_MANAGER.queueDownload("./images/hyperspace.png");
ASSET_MANAGER.queueDownload("./images/ship.png");
ASSET_MANAGER.queueDownload("./images/alien.png");
ASSET_MANAGER.queueDownload("./images/laser.png");
ASSET_MANAGER.queueDownload("./images/gameover.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    canvas.focus();

    var gameEngine = new GameEngine();
    var card = new Card(gameEngine, 'title');
    var card2 = new Card(gameEngine, 'info');
    gameEngine.addEntity(card);

    var titleGone = false;
    function enterListener(e) {
        if (e.code === "Enter") {
            if(!titleGone) {
                card.removeFromWorld = true;
                titleGone = true;
                gameEngine.addEntity(card2);
            } else {
                card2.removeFromWorld = true;
                ctx.scale(10,10);
                ctx.imageSmoothingEnabled = false;
                var bg = new Background(gameEngine);
                var ship = new Ship(gameEngine);
                var mothership = new Mothership(gameEngine);

                gameEngine.addEntity(bg);
                gameEngine.addEntity(ship);
                gameEngine.addEntity(mothership, ship);
                ctx.canvas.removeEventListener("keypress", enterListener);
            }
        }
    }
    ctx.canvas.addEventListener("keypress", enterListener, false);

    gameEngine.init(ctx);
    gameEngine.start();
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