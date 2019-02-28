function Background(game) {
    this.type = 'background';
    game.warp = false;
    this.animation = new Animation(ASSET_MANAGER.getAsset("./images/space.png"), 0, 0, 80, 80, 1, 1, true, true);
    this.hyperSpaceAnimation = new Animation(ASSET_MANAGER.getAsset("./images/hyperspace.png"),
        0, 0, 80, 80, 0.04, 10, false, false);
    this.reverseHyperSpaceAnimation = new Animation(ASSET_MANAGER.getAsset("./images/hyperspace.png"),
        0, 0, 80, 80, 0.04, 10, false, true);
    this.hyperspace = false;
    this.reverseHyperSpace = false;
    Entity.call(this, game, 0, 0);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    if(this.game.warp) this.hyperspace = true;

    if(this.hyperspace || this.reverseHyperSpace) {
        if(this.hyperSpaceAnimation.isDone()) {
            this.hyperspace = false;
            this.reverseHyperSpace = true;
            //this.hyperSpaceAnimation.elapsedTime = 0;
        }
        if(this.reverseHyperSpaceAnimation.isDone()) {
            this.reverseHyperSpace = false;
            //this.reverseHyperSpaceAnimation.elapsedTime = 0;
            this.game.addEntity(new Alien(this.game, Math.random() * 75, 0));
            this.game.warp = false;
        }
    }
}

Background.prototype.draw = function (ctx) {
    if(this.hyperspace) {
        this.hyperSpaceAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if(this.reverseHyperSpace) {
        this.reverseHyperSpaceAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else {
        this.animation.drawStatic(ctx, this.x, this.y); 
    }
    Entity.prototype.draw.call(this);
}

/////////////////////////////////////////////////////////////////////////////////////////

function Ship(game) {
    this.type = 'ship';
    this.animation = new Animation(ASSET_MANAGER.getAsset("./images/ship.png"), 0, 0, 10, 10, 1, 1, true, false);
    this.speed = 1;
    this.leftGun = true;
    Entity.call(this, game, 35, 55);
    this.colliderCircle = {radius: 5, x: this.x + 5, y: this.y + 5};
}

Ship.prototype = new Entity();
Ship.prototype.constructor = Ship;

Ship.prototype.update = function () {
    this.colliderCircle = {radius: 5, x: this.x + 5, y: this.y + 5};
    if(this.game.space) {
        this.game.addEntity(new Laser(this.game, this.x + 4.5, this.y));
    }
    if(this.x > 0 && this.game.a) {
        this.x -= this.speed;
    }
    if(this.x < 70 && this.game.d) {
        this.x += this.speed;
    }
}

Ship.prototype.draw = function (ctx) {
    this.animation.drawStatic(ctx, this.x, this.y);
}

/////////////////////////////////////////////////////////////////////////////////////////

function Laser(game, posx, posy) {
    this.type = 'laser';
    this.animation = new Animation(ASSET_MANAGER.getAsset("./images/laser.png"), 0, 0, 1, 4, 1, 1, true, false);
    Entity.call(this, game, posx, posy);
    this.colliderCircle = {radius: 1, x: this.x + 0.5, y: this.y + 1}
}

Laser.prototype = new Entity();
Laser.prototype.constructor = Laser;

Laser.prototype.update = function () {
    if(this.y < 0) {
        this.removeFromWorld = true;
    }
    this.y--;
    this.colliderCircle = {radius: 1, x: this.x + 0.5, y: this.y + 1};
    var that = this;
    this.game.entities.forEach(function(e) {
        if(e.type == 'alien') {
            if(detectCollision(that.colliderCircle, e.colliderCircle)) {
                that.removeFromWorld = true;
                e.removeFromWorld = true;
            }
        }
    })
}

Laser.prototype.draw = function (ctx) {
    this.animation.drawStatic(ctx, this.x, this.y);
}

/////////////////////////////////////////////////////////////////////////////////////////

function Alien(game, posx, posy) {
    this.type = 'alien';
    this.attacktimer = 0;
    this.attackdelay = 50 + Math.random() * 100;
    this.animation = new Animation(ASSET_MANAGER.getAsset("./images/alien.png"), 0, 0, 15, 14, 1, 1, true, false);
    Entity.call(this, game, posx, posy);
    this.colliderCircle = {radius: 2.5, x: this.x + 3.5, y: this.y + 2};
}

Alien.prototype = new Entity();
Alien.prototype.constructor = Alien;

Alien.prototype.update = function () {
    if(this.y > 80) {
        this.removeFromWorld = true;
    }
    if(this.attacktimer++ > this.attackdelay) {
        this.animation = new Animation(ASSET_MANAGER.getAsset("./images/alien.png"), 
            15, 0, 15, 14, 1, 1, true, false);
        this.y++;
        if(detectCollision(this.colliderCircle, this.game.entities[1].colliderCircle)) {
            location.reload();
        }
    }
    this.colliderCircle = {radius: 2.5, x: this.x + 3.5, y: this.y + 2};
}

Alien.prototype.draw = function (ctx) {
    ctx.save();
    ctx.scale(0.5, 0.5);
    ctx.imageSmoothingEnabled = false;
    this.animation.drawFrame(this.game.clockTick, ctx, this.x * 2, this.y * 2);
    ctx.restore();
}

/////////////////////////////////////////////////////////////////////////////////////////

function Mothership(game) {
    this.type = 'mothership';
    this.spawntimer = 0;
    this.spawnthreshold = 30;
    Entity.call(this, game, 0, 0);
}

Mothership.prototype = new Entity();
Mothership.prototype.constructor = Mothership;

Mothership.prototype.update = function () {
    if(!this.remainingAliens()) {
        this.game.warp = true;
    }
    if(this.spawntimer++ > this.spawnthreshold && this.game.warp == false) {
        this.game.addEntity(new Alien(this.game, Math.random() * 75, 0));
        this.spawntimer = 0;
    }
}

Mothership.prototype.remainingAliens = function() {
    var aliensRemaining = false;
    this.game.entities.forEach(function(e) {
        if(e.type == 'alien') {
            aliensRemaining = true;
        }
    });
    return aliensRemaining;
}

/////////////////////////////////////////////////////////////////////////////////////////

function Card(game, type) {
    this.type = type;
    this.animation = new Animation(ASSET_MANAGER.getAsset("./images/" + this.type + ".png"), 0, 0, 80, 40, 1, 1, true, false);
    Entity.call(this, game, 0, 0);
}

Card.prototype = new Entity();
Card.prototype.constructor = Card;

Card.prototype.update = function () {
}

Card.prototype.draw = function (ctx) {
    this.animation.drawStatic(ctx, this.x, this.y);
}