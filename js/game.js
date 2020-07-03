function Game(selector) {
    const $root = document.querySelector(selector);
    const self = this;

    this.store = {
        tiles: [],
        grid: [],
        score: 0
    }

    this.init = function () {
        $root.innerHTML = '';
        this.store.tiles = [];
        this.store.grid = [];
        this.store.score = 0;
        initGrid();
        addTile(2);
    }

    this.continue = function (store) {
        self.store = store;
        for (let i = 0; i < store.tiles.length; i++) {
            let tile = store.tiles[i];
            self.store.tiles[i] = new Tile({ x: tile.x, y: tile.y }, tile.val);
            $root.append(self.store.tiles[i].node);
            self.store.tiles[i].new();
        }
    }

    this.move = function (direction) {
        const vector = getVector(direction);
        const traversals = buildTraversals(vector);
        let moved = false;
        traversals.x.forEach(function (x) {
            traversals.y.forEach(function (y) {
                if (self.store.grid[x][y]) {
                    let curr = findByCoodinate({ x: x, y: y });
                    let coodinates = getFarthestEmptyCoodinate({ x: x, y: y }, vector);
                    let next = findByCoodinate(coodinates.next);
                    curr.ismerged = false;
                    curr.node.classList.remove('tile-new', 'tile-merged');
                    if (next && next.val == curr.val && !next.ismerged) {
                        self.store.score += curr.val * 2;
                        mergeTiles(curr, next);
                        next.ismerged = true;
                        moved = true;
                    } else {
                        if (moveTile(curr, coodinates.farthest)) moved = true;
                    }
                }
            });
        });
        if (self.store.tiles.length < 16 && moved) addTile(1);
    }

    function addTile(num) {
        let empty = shuffle(getEmptyCoordinate());
        if (num > empty.length) return false;
        for (let i = 0; i < num; i++) {
            let tile = new Tile(empty[i]);
            self.store.tiles.push(tile);
            self.store.grid[empty[i].x][empty[i].y] = 1;
            tile.new();
        }
    }

    function findByCoodinate(coodinate) {
        let result = self.store.tiles.filter(function (tile) {
            return tile.x == coodinate.x && tile.y == coodinate.y;
        });
        if (!result.length) return null;
        return result[0];
    }

    function getEmptyCoordinate() {
        let empty = [];
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                if (!self.store.grid[x][y]) empty.push({ x: x, y: y });
            }
        }
        if (!empty.length) return null;
        return empty;
    }

    function shuffle(array) {
        let i = array.length,
            j = 0,
            temp;
        while (i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function initGrid() {
        let arr = [];
        for (let x = 0; x < 4; x++) {
            arr[x] = [];
            for (let y = 0; y < 4; y++) {
                arr[x][y] = 0;
            }
        }
        self.store.grid = arr;
    }

    function moveTile(tile, coordinate) {
        if (tile.x == coordinate.x && tile.y == coordinate.y) return false;
        self.store.grid[tile.x][tile.y] = 0;
        self.store.grid[coordinate.x][coordinate.y] = 1;
        tile.move(coordinate);
        return true;
    }

    function mergeTiles(curr, next) {
        self.store.grid[curr.x][curr.y] = 0;
        curr.remove({ x: next.x, y: next.y });
        next.merged();
        let tiles = self.store.tiles;
        // 删除curr对象
        for (let key in tiles) {
            if (tiles[key].x == curr.x && tiles[key].y == curr.y) {
                self.store.tiles.splice(parseInt(key), 1);
                break;
            }
        }
    }

    function buildTraversals(vector) {
        let traversals = {
            x: [],
            y: []
        }
        for (let i = 0; i < 4; i++) {
            traversals.x.push(i);
            traversals.y.push(i);
        }
        // 总是从选定方向最远的格子开始遍历
        if (vector.x == 1) traversals.x = traversals.x.reverse();
        if (vector.y == 1) traversals.y = traversals.y.reverse();
        return traversals;
    }

    function getVector(direction) {
        const map = {
            0: { x: 0, y: -1 },   // Up
            1: { x: 1, y: 0 },    // Right
            2: { x: 0, y: 1 },    // Down
            3: { x: -1, y: 0 }    // Left
        };
        return map[direction];
    }

    function withinBounds(coodinate) {
        return coodinate.x >= 0 && coodinate.x < 4 && coodinate.y >= 0 && coodinate.y < 4;
    }

    function getFarthestEmptyCoodinate(coodinate, vector) {
        let curr;
        do {
            curr = coodinate;
            coodinate = {
                x: curr.x + vector.x,
                y: curr.y + vector.y
            };
        } while (withinBounds(coodinate) && !self.store.grid[coodinate.x][coodinate.y]);

        return {
            farthest: curr,
            next: coodinate // 用来检查是否合并
        };
    }

    // 以下用来操纵tile的html实体
    function removeElement(ele) {
        // 延时120ms删除ele
        setTimeout(function () {
            let parent = ele.parentElement;
            parent.removeChild(ele);
        }, 120);
    }

    function changeCoodinate(ele, coodinate) {
        ele.style.transform = `translate(${125 * coodinate.x}px, ${125 * coodinate.y}px)`;
    }

    function setVal(ele, val) {
        let level = val > 2048 ? 'super' : val;
        ele.innerHTML = `<div class="tile-${level} tile-inner">${val}</div>`
    }

    function createTile(coordinate, value) {
        let node = document.createElement('div');
        setVal(node, value);
        changeCoodinate(node, { x: coordinate.x, y: coordinate.y });
        node.className = 'tile';
        return node;
    }

    // Tile构造函数
    function Tile(coordinate, value) {
        this.val = value || (Math.random() < 0.9 ? 2 : 4);
        this.x = coordinate.x;
        this.y = coordinate.y;
        this.node = createTile({ x: this.x, y: this.y }, this.val);
        this.ismerged = false;
    }

    Tile.prototype = {
        merged: function () {
            this.node.classList.add('tile-merged');
            this.val *= 2;
            setVal(this.node, this.val);
        },
        new: function () {
            const self = this;
            setTimeout(function () {
                $root.append(self.node);
                self.node.classList.add('tile-new');
            }, 100);
        },
        move: function (coodinate) {
            this.x = coodinate.x;
            this.y = coodinate.y;
            changeCoodinate(this.node, coodinate);
        },
        remove: function (coodinate) {
            changeCoodinate(this.node, coodinate);
            removeElement(this.node);
        }
    }
}