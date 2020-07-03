const game = new Game('#game-root');
let best;

if (ls.get('best')) {
    best = ls.get('best');
} else {
    ls.set('best', 0);
    best = 0;
}

document.getElementById('best').innerText = best;

if (ls.get('store')) {
    game.continue(ls.get('store'));
    document.getElementById('score').innerText = game.store.score;
} else {
    game.init();
    document.getElementById('score').innerText = 0;
}

resize();

window.onresize = resize;

function resize() {
    let zoom = document.getElementsByClassName('heading')[0].clientWidth / 515;
    document.getElementsByClassName('game-wrap')[0].style.zoom = `${zoom}`;
}

function restart() {
    ls.remove('store');
    game.init();
    document.getElementById('score').innerText = 0;
}

window.onkeyup = function (e) {
    if (e.keyCode == 38) {
        game.move(0);
    } // Up
    if (e.keyCode == 39) {
        game.move(1);
    } //Right
    if (e.keyCode == 40) {
        game.move(2);
    } //Down
    if (e.keyCode == 37) {
        game.move(3);
    } //Left
    if (e.keyCode >= 37 && e.keyCode <= 40) {
        ls.set('store', game.store);
        document.getElementById('score').innerText = game.store.score;
        if (game.store.score > best) {
            best = game.store.score;
            document.getElementById('best').innerText = best;
            ls.set('best', best);
        }
    }
}

let start_x,
    start_y,
    current_x,
    current_y;

function touchstart(e) {
    e.preventDefault();
    start_x = e.touches[0].clientX;
    start_y = e.touches[0].clientY;
}

function touchmove(e) {
    current_x = e.touches[0].clientX;
    current_y = e.touches[0].clientY;
}

function touchend() {
    let move = [], temp = 0, direction;
    move[0] = -(current_y - start_y);
    move[1] = current_x - start_x;
    move[2] = current_y - start_y;
    move[3] = -(current_x - start_x);
    for (key in move) {
        if (move[key] > temp) {
            temp = move[key];
            direction = key;
        }
    }
    game.move(direction);
    ls.set('store', game.store);
    document.getElementById('score').innerText = game.store.score;
    if (game.store.score > best) {
        best = game.store.score;
        document.getElementById('best').innerText = best;
        ls.set('best', best);
    }
}


