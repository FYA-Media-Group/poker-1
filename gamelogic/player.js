module.exports = Player;

var Server = require('./../server');

function Player(socket) {
    this.socket = socket;
    this.cards = [];
    this.stack = 0;
    this.bet = 0;
}

Player.prototype.setStack = function (startStack) {
    this.stack = startStack;
};

Player.prototype.clearAmt = function () {
    this.bet = 0;
};

Player.prototype.postBlind = function (pos,blind) {
    var posted = Math.min(this.stack, blind);
    this.stack -= posted;
    this.bet = posted;
    var player = this;
    Server.io().sockets.emit("player"+(pos+1)+"Bet", player.bet,
                             player.stack);
};

Player.prototype.isAllIn = function () {
    return this.stack === 0;
};

Player.prototype.dealCard = function(card) {
    this.cards.push(card);
    if (this.cards.length === 2)
        this.socket.emit('dealCards', this.cards);
};

Player.prototype.amt = function () {
    return this.bet;
};

Player.prototype.move = function (pos, toCall, action) {
    var amtToCall = toCall - this.bet;
    var minRaise = Math.min(this.bet+this.stack, this.bet + 2*amtToCall);
    var maxRaise = this.stack + this.bet;
    this.socket.emit('yourTurn', amtToCall, minRaise, maxRaise, this.bet);
    var player = this;
    this.socket.once('makeMove', function (b) {
        if (b === -1) {
            action(true);
        } else {
            player.bet += b;
            player.stack -= b;
            if (b > 0) {
                Server.io().sockets.emit("player"+(pos+1)+"Bet", player.bet,
                                         player.stack);
            }
            action(false);
        }
    });
};

Player.prototype.ship = function (amt) {
    this.stack += amt;
    this.bet -= amt;

};

Player.prototype.getCards = function () {
    return this.cards;
};

Player.prototype.broke = function () {
    return this.stack === 0;
};

Player.prototype.muck = function () {
    this.cards = [];
};

Player.prototype.getStack = function () {
    return this.stack;
};
