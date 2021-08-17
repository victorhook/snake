const btnUp = document.getElementsByClassName('btn-up')[0];
const btnRight = document.getElementsByClassName('btn-right')[0];
const btnDown = document.getElementsByClassName('btn-down')[0];
const btnLeft = document.getElementsByClassName('btn-left')[0];
const popup = document.getElementById('popup');
const popupStart = document.getElementById('popup-start');
const popupRestart = document.getElementById('popup-restart');
const popupText = document.getElementById('popup-message');
const finalScore = document.getElementById('final-score');

let activeBtns = {
    'btnUp': false,
    'btnRight': false,
    'btnDown': false,
    'btnLeft': false,
}

let keyButtons = {
    'w': 'btnUp',
    'd': 'btnRight',
    's': 'btnDown',
    'a': 'btnLeft',
}

let buttons = {
    'btnUp': [btnUp, 'button_up.svg', 'button_up_green.svg'],
    'btnRight': [btnRight, 'button_right.svg', 'button_right_green.svg'],
    'btnDown': [btnDown, 'button_down.svg', 'button_down_green.svg'],
    'btnLeft': [btnLeft, 'button_left.svg', 'button_left_green.svg']
}

document.addEventListener('keydown', key => keyDown(key));
document.addEventListener('keyup', key => keyUp(key));


const KEY_STATE = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

let keyState = KEY_STATE.UP


function keyDown(key) {
    if (key.key == 'w' || key.key == 'ArrowUp') {
        keyState = KEY_STATE.UP;
    } else if (key.key == 'd' || key.key == 'ArrowRight') {
        keyState = KEY_STATE.RIGHT;
    } else if (key.key == 's' || key.key == 'ArrowDown') {
        keyState = KEY_STATE.DOWN;
    } else if (key.key == 'a' || key.key == 'ArrowLeft') {
        keyState = KEY_STATE.LEFT;
    }

    let currentBtn = keyButtons[key.key];
    changeBtn(currentBtn);
    activeBtns[currentBtn] = true;
}

function keyUp(key) {
    let currentBtn = keyButtons[key.key];
    changeBtn(currentBtn);
    activeBtns[currentBtn] = false;
}


function changeBtn(btn) {
    if (btn == undefined)
        return;

    activeBtns[btn] = !activeBtns[btn];
}

function show(obj) {
    obj.classList.add('visible');
    obj.classList.remove('hidden');
    obj.style.visiblity = 'visible';
}

function hide(obj) {
    obj.classList.add('hidden');
    obj.classList.remove('visible');
    obj.style.visiblity = 'hidden';
}

function togglePopup(msg) {
    show(popup);
    popupText.innerHTML = msg;
    setInterval(() => hide(popup), 2000);
}

for (let close of document.getElementsByClassName('popup-close')) {
    close.addEventListener('click', () => {
        for (let pop of document.getElementsByClassName('popup')) {
            hide(pop);
        }
    })
}