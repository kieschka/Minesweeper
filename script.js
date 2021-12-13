class Game {
    // Конструктор класса Game
    constructor(size = 9) {
        document.getElementById('emoji').src = "img/newgame.png";
        this.size = size;
        this.makeField();
    }

    // Создаём новое поле
    makeField() {
        let field = document.querySelector('.field');
        // Очищаем старое
        while(field.firstChild) {
            if (field.lastChild.firstChild) field.lastChild.removeChild(field.lastChild.firstChild);
            field.removeChild(field.lastChild);
        }
        // Устанавливаем стили для grid контейнера
        field.style.gridTemplateRows = "repeat(" + this.size + ", 1fr)";
        field.style.gridTemplateColumns = "repeat(" + this.size + ", 1fr)";
        // Создаём новые ячейки
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let block = document.createElement('div');
                block.classList.add('block');
                block.classList.add('bs'+this.size);
                block.classList.add('hidden');
                block.id = i*this.size + j;
                block.addEventListener("click", show);
                block.addEventListener("contextmenu", setFlag);
                field.appendChild(block);
            }
        }

        this.hideBombs();
    }
    // Распределяем бомбы
    hideBombs() {
        this.bombs = 0;
        switch(this.size) {
            case 9:
                this.bombs = 10;
                break;
            case 16:
                this.bombs = 40;
                break;
        }
        document.querySelector('.bombs-number').textContent = this.bombs;

        this.nonbomb = Math.pow(this.size, 2) - this.bombs;
        // Выбираем рандомную ячейку и, если в неё нет бомбы, ставим туда бомбу
        let blocks = document.querySelectorAll('.block');
        while (this.bombs > 0) {
            let i = random(0, this.size-1);
            let j = random(0, this.size-1);

            if (!blocks[i*this.size + j].classList.contains('bomb')) {
                blocks[i*this.size + j].classList.add('bomb');
                this.bombs--;
            }
        }

        this.buildMatrix();
    }
    // Строим матрицу по полю
    buildMatrix() {
        let blocks = document.querySelectorAll('.block');
        this.matr = [];
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                if (blocks[i*this.size + j].classList.contains('bomb')) {
                    row.push(-1);
                } else {
                    row.push(0);
                }
            }
            this.matr.push(row);
        }
        // Считываем число бомб в окружении ячейки
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.matr[i][j] != -1) {
                    if (i > 0 && this.matr[i-1][j] == -1) this.matr[i][j]++;
                    if (j > 0 && this.matr[i][j-1] == -1) this.matr[i][j]++;
                    if (i < this.size-1 && this.matr[i+1][j] == -1) this.matr[i][j]++;
                    if (j < this.size-1 && this.matr[i][j+1] == -1) this.matr[i][j]++;
                    if (j > 0 && i > 0 && this.matr[i-1][j-1] == -1) this.matr[i][j]++;
                    if (j > 0 && i < this.size-1 && this.matr[i+1][j-1] == -1) this.matr[i][j]++;
                    if (j < this.size-1 && i > 0 && this.matr[i-1][j+1] == -1) this.matr[i][j]++;
                    if (j < this.size-1 && i < this.size-1 && this.matr[i+1][j+1] == -1) this.matr[i][j]++;
                }
            }
        }
    }


}

// При начале игры создаём экземпляр класса
let game;
let size = parseInt(localStorage.getItem('size'));
if (size) {
    game = new Game(size);
    document.querySelector('.size').value = size;
}
else game = new Game();

// Удаляем старый и создаём новый экземпляр
function newGame() {
    delete game;
    game = new Game(parseInt(document.querySelector('.size').value));
}

// Функция при клике на ячейку
// Вскрываем ячейку
function show() {
    let i = Math.floor(this.id / game.size);
    let j = this.id % game.size;
    // Ставим флаг, если включена соответсвующая кнопка
    if (game.flag) {
        if (this.classList.contains('flag')) {
            this.classList.add('hidden');
            this.classList.remove('flag');
            document.querySelector('.bombs-number').textContent++;
            this.removeChild(this.firstChild);
        } else {
            this.classList.remove('hidden');
            this.classList.add('flag');
            document.querySelector('.bombs-number').textContent--;
            let img = document.createElement('img');
            img.src = "img/flag.png"; 
            img.classList.add('flag-img');
            this.appendChild(img);
        }
        flag();
        return;
    } else if (this.classList.contains('flag')) return;
    
    this.classList.remove('hidden');
    // Если в ячейке бомба
    if (game.matr[i][j] < 0) {
        document.querySelectorAll('.block')[i*game.size+j].style.backgroundColor = "red";
        gameOver();
    } 
    // Если ввокруг ячейки есть бомбы
    else if (game.matr[i][j] > 0) {
        this.textContent = game.matr[i][j];
        this.classList.add('n'+game.matr[i][j]);
        game.nonbomb--;
    } 
    // Если ячейка пуста
    else {
        showAround(this.id);
    }
    this.removeEventListener("click", show);
    this.removeEventListener("contextmenu", setFlag);

    checkWin();
}

// Проверяем на победу
function checkWin() {
    if (game.nonbomb == 0) { // Счётчик nonbomb показывает сколько ячеек ещё надо открыть
        document.getElementById('emoji').src = "img/win.png";
        document.querySelector('.bombs-number').textContent = 0;
        let blocks = document.querySelectorAll('.block');
        for (let i = 0; i < game.size; i++) {
            for (let j = 0; j < game.size; j++) {
                let block = blocks[i*game.size + j];
                if (block.classList.contains('hidden')) {
                    block.removeEventListener("click", show);
                    block.removeEventListener("contextmenu", setFlag);
                }
                
                if (game.matr[i][j] == -1) {
                    let img = document.createElement('img');
                    img.src = "img/flag.png";
                    img.classList.add('flag-img');
                    blocks[i*game.size + j].classList.remove('hidden');
                    if (blocks[i*game.size + j].firstChild) blocks[i*game.size + j].removeChild(blocks[i*game.size + j].firstChild);
                    blocks[i*game.size + j].appendChild(img);
                } 
            }
        }
    }
}

// Установка флажка при нажатии лкм на ячейку
function setFlag() {
    if (this.classList.contains('flag')) {
        this.classList.add('hidden');
        this.classList.remove('flag');
        document.querySelector('.bombs-number').textContent++;
        this.removeChild(this.firstChild);
    } else {
        this.classList.remove('hidden');
        this.classList.add('flag');
        document.querySelector('.bombs-number').textContent--;
        let img = document.createElement('img');
        img.src = "img/flag.png"; 
        img.classList.add('flag-img');
        this.appendChild(img);
    }
    return false;
}

// Изменение состояния кнопки флажка
function flag() {
    document.querySelector('.flag-cont').classList.toggle('flag-on');
    if (game.flag) game.flag = 0;
    else game.flag = 1;
}

// Если вскрыли бомбу
function gameOver() {
    document.getElementById('emoji').src = "img/gameover.png";
    let blocks = document.querySelectorAll('.block');
    for (let i = 0; i < game.size; i++) {
        for (let j = 0; j < game.size; j++) {
            let block = blocks[i*game.size + j];
            if (block.classList.contains('hidden')) {
                block.removeEventListener("click", show);
                block.removeEventListener("contextmenu", setFlag);
            }

            if (block.classList.contains('flag') && !block.classList.contains('bomb')) {
                block.style.backgroundColor = "#ff8c8c";
            }
            
            if (game.matr[i][j] == -1 && !block.classList.contains('flag')) {
                let img = document.createElement('img');
                img.src = "img/bomb.png";
                img.classList.add('bomb-img');
                blocks[i*game.size + j].classList.remove('hidden');
                blocks[i*game.size + j].appendChild(img);
            } 
        }
    }
}

// Если вскрыли пустую ячейку, открываем все ячейки близ неё
function showAround(id) {
    let blocks = document.querySelectorAll('.block');
    let i = Math.floor(id / game.size);
    let j = id % game.size;
    blocks[id].removeEventListener("click", show);
    blocks[id].classList.remove('hidden');
    game.nonbomb--;

    if (game.matr[i][j] > 0) {
        blocks[id].textContent = game.matr[i][j];
        blocks[id].classList.add('n'+game.matr[i][j]);
        return;
    }

    // Рекурсия на следуюзщие ячейки
    id = (i-1)*game.size + j;
    if (i > 0 && blocks[id].classList.contains('hidden')) showAround(id);
    id = i*game.size + (j-1);
    if (j > 0 && blocks[id].classList.contains('hidden')) showAround(id);
    id = (i+1)*game.size + j;
    if (i < game.size-1 && blocks[id].classList.contains('hidden')) showAround(id);
    id = i*game.size + (j+1);
    if (j < game.size-1 && blocks[id].classList.contains('hidden')) showAround(id);
    id = (i-1)*game.size + (j-1);
    if (j > 0 && i > 0 && blocks[id].classList.contains('hidden')) showAround(id);
    id = (i+1)*game.size + (j-1);
    if (j > 0 && i < game.size-1 && blocks[id].classList.contains('hidden')) showAround(id);
    id = (i-1)*game.size + (j+1);
    if (j < game.size-1 && i > 0 && blocks[id].classList.contains('hidden')) showAround(id);
    id = (i+1)*game.size + (j+1);
    if (j < game.size-1 && i < game.size-1 && blocks[id].classList.contains('hidden')) showAround(id);
}

// Функция рандомного числа
function random(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}


// Изменение размера
function changeSize() {
    let size = parseInt(document.querySelector('.size').value);
    delete game;
    localStorage.setItem('size', size);
    game = new Game(size);
}