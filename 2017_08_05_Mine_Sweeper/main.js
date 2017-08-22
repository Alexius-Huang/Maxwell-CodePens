Node.prototype.addClass    = function(className) { this.classList.add(className);      }
Node.prototype.removeClass = function(className) { this.classList.remove(className);   }
Node.prototype.hasClass    = function(className) { return this.classList.contains(className); }
function randomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1) + min); }

var $game = {
  mode: 'trigger', /* Trigger mode or Flag mode */
  modeBtn: null,
  statistic: null,
  btnGroup: null,
  newGameBtn: null,
  hintBtn:null,
  newGameModal: null,
  startGameBtn: null,
  successModal: null,
  resumeBtn: null,
  resultTime: null,
  timeCount: 0,
  timeCounterId: undefined,
  inputs: null,
  sweptUnits: 0,
  flags: 0,
  maximumMines: NaN,
  is_finished: function() {
    return this.sweptUnits === $grid.row * $grid.col && this.flags === $grid.mines;
  },
  getInputs: function() {
    var inputs = {};
    inputs.rows  = parseInt(this.inputs.rows.value);
    inputs.cols  = parseInt(this.inputs.cols.value);
    inputs.mines = parseInt(this.inputs.mines.value);
    return inputs;
  },
  validatesInputs: function() {
    var inputs = this.getInputs();
    var errors = {};
    if (inputs.rows < 1 || inputs.rows > 30) { errors.rows = true; }
    if (inputs.cols < 1 || inputs.cols > 30) { errors.cols = true; }
    if (!(errors.rows || errors.cols) && (inputs.mines < 1 || inputs.mines > this.maximumMines)) { errors.mines = true; }
    return errors;
  },
  currentTimeString: function() {
    var hours   = Math.floor(this.timeCount / 3600);
    var minutes = Math.floor((this.timeCount - hours * 3600) / 60);
    var seconds = Math.floor((this.timeCount - hours * 3600 - minutes * 60));
    hours   = String(hours).length   === 1 ? '0' + hours   : String(hours);
    minutes = String(minutes).length === 1 ? '0' + minutes : String(minutes);
    seconds = String(seconds).length === 1 ? '0' + seconds : String(seconds);
    return [hours, minutes, seconds].join(':');
  },
  setTimeCounter: function() {
    this.timeCounterId = setInterval(function() {
      $game.timeCount++;
      $game.statistic.timeCounter.innerHTML = $game.currentTimeString();
    }, 1000);
  },
  stopTimeCounter: function() {
    clearInterval(this.timeCounterId);
    this.timeCounterId = undefined;
  },
  tooMuchFlag: function() {
    return this.flags > $grid.mines;
  }
}
var $grid = {
  element: null,
  row: 20,
  col: 20,
  unitWidth: 20,
  unitHeight: 20,
  gap: 3,
  mines: 50,
  minesMap: [],
  getPanelSize: function() {
    var size = {};
    size.width  = (this.unitWidth  + this.gap) * this.col;
    size.height = (this.unitHeight + this.gap) * this.row;
    return size;
  },
  parseUnit: function(row, col) {
    var div = document.createElement('div')
    div.addClass('grid-unit');
    div.addClass('enabled');
    div.id = 'position-' + row + '-' + col;
    div.style.top = (row - 1) * (this.unitHeight + this.gap) + 'px';
    div.style.left = (col - 1) * (this.unitWidth + this.gap) + 'px';
    return div;
  },
  getUnit: function(row, col) {
    return document.getElementById('position-' + row + '-' + col);
  },
  getUnitData: function(row, col) {
    var data = {};
    data.isMine = $grid.minesMap[row - 1][col - 1] === 1;
    if (data.isMine) {
      data.surroundings = null;
    } else {
      var surroundings = 0;
      var i = 0;
      loopSurroundings(row, col, function(row, col) {
        if ($grid.minesMap[row - 1][col - 1] === 1) surroundings++;
      });
      data.surroundings = surroundings;
    }
    return data;
  },
  updateByInputs() {
    var inputs = $game.getInputs();
    this.row = inputs.rows;
    this.col = inputs.cols;
    this.mines = inputs.mines;
  },
  destroy() {
    this.element.innerHTML = '';
  }
}

function loopThroughGrid(callback, initRow) {
  for (var row = 1; row <= $grid.row; row++) {
    initRow ? initRow(row) : undefined;
    for (var col = 1; col <= $grid.col; col++) {
      callback(row, col);
    }
  }
}

function loopSurroundings(row, col, callback, debug) {
  row = row - 1;
  col = col - 1;
  /* Upper Row */
  if (row - 1 >= 0) {
    if (col - 1 >= 0)         { callback(row, col);         }
                                callback(row, col + 1);
    if (col + 1 < $grid.col ) { callback(row, col + 2);     }
  }
  /* Medium Row */
  if (col - 1 >= 0 )          { callback(row + 1, col);     }
  if (col + 1 < $grid.col )   { callback(row + 1, col + 2); }
  /* Lower Row */
  if (row + 1 < $grid.row) {
    if (col - 1 >= 0 )        { callback(row + 2, col);     }
                                callback(row + 2, col + 1);
    if (col + 1 < $grid.col ) { callback(row + 2, col + 2); }
  }
}

function initGridSystem() {
  $grid.element = document.getElementById('mine-sweeper-grid');
  loopThroughGrid(function(row, col) {
    $grid.element.appendChild($grid.parseUnit(row, col));
  });
  randomizeMineMap();
}

function initGameElements() {
  $game.btnGroup     = document.getElementsByClassName('btn-group')[0];
  $game.modeBtn      = document.getElementById('change-mode');
  $game.newGameBtn   = document.getElementById('new-game');
  $game.newGameModal = document.getElementById('new-game-modal');
  $game.hintBtn      = document.getElementById('hint');
  $game.startGameBtn = document.getElementById('start-game');
  $game.successModal = document.getElementById('success-modal');
  $game.resumeBtn    = document.getElementById('resume-btn');
  $game.resultTime   = document.getElementById('result-time');
  $game.statistic = {
    element:     document.getElementById('statistic'),
    flags:       document.getElementById('flags-count'),
    sweptUnits:  document.getElementById('swept-unit-count'),
    timeCounter: document.getElementById('time-counter')
  };
  $game.inputs = {
    rows:  document.querySelector('input[name="rows"]'),
    cols:  document.querySelector('input[name="cols"]'),
    mines: document.querySelector('input[name="mines"]')
  };
}

function initControlSystem() {
  initGameElements();

  $game.modeBtn.addEventListener('click', function(event) {
    event.preventDefault();
    if ($game.mode === 'trigger') {
      $game.mode = 'flag';
      this.innerHTML = 'Flag Mode';
    } else if ($game.mode === 'flag') {
      $game.mode = 'trigger';
      this.innerHTML = 'Trigger Mode';
    }
  });

  $game.newGameBtn.addEventListener('click', function(event) {
    $game.newGameModal.style.display = 'block';
    $game.stopTimeCounter();
  });

  $game.hintBtn.addEventListener('click',function(){
    var hint = $mineSweeperAI.getHint();
    if(hint){
      var unit = $grid.getUnit(hint.row,hint.col);
      if(hint.type == 'mine'){
        unit.addClass('hint-mine')
      }else{
        unit.addClass('hint-safe')
      }
    }else{
      alert("can't find any Hint! ")
    }
  });

  var inputEvent = function(event) {
    var inputs = $game.getInputs();
    $game.maximumMines = inputs.rows * inputs.cols;
    document.getElementById('maximum-mines').innerHTML = $game.maximumMines;
  }

  $game.inputs.rows.addEventListener('input', inputEvent);
  $game.inputs.cols.addEventListener('input', inputEvent);
  $game.inputs.mines.addEventListener('input', inputEvent);

  $game.startGameBtn.addEventListener('click', function(event) {
    var nodes = $game.inputs;
    /* Remove errors if error class presents */
    if (nodes.rows.parentNode.hasClass('error'))  { nodes.rows.parentNode.removeClass('error'); }
    if (nodes.cols.parentNode.hasClass('error'))  { nodes.cols.parentNode.removeClass('error'); }
    if (nodes.mines.parentNode.hasClass('error')) { nodes.mines.parentNode.removeClass('error'); }
    var errors = $game.validatesInputs();
    if (errors.rows || errors.cols || errors.mines) {
      if (errors.rows)  nodes.rows.parentNode.addClass('error');
      if (errors.cols)  nodes.cols.parentNode.addClass('error');
      if (errors.mines) nodes.mines.parentNode.addClass('error');
    } else {
      $game.newGameModal.style.display = 'none';
      setGame();
    }
  });

  $game.resumeBtn.addEventListener('click', function() {
    $game.successModal.style.display = 'none';
  });
}

function initControlSystemStyle() {
  var size = $grid.getPanelSize();
  $game.statistic.element.style.marginTop = -size.height / 2 - 80 + 'px';
  $game.btnGroup.style.marginLeft = -(100 * 2 / 2) + 'px';
  $game.btnGroup.style.marginTop  = +size.height / 2 + 10 + 'px';
}

function randomizeMineMap() {
  loopThroughGrid(function(row, col) {
    $grid.minesMap[row - 1][col - 1] = 0;
  }, function(row) {
    $grid.minesMap[row - 1] = [];
  });

  var i = 1;
  while(i <= $grid.mines) {
    var rowIndex = randomNumber(0, $grid.row - 1);
    var colIndex = randomNumber(0, $grid.col - 1);
    if ($grid.minesMap[rowIndex][colIndex] === 0) {
      $grid.minesMap[rowIndex][colIndex] = 1;
      i++;
    }
  }

  var size = $grid.getPanelSize();
  $grid.element.style.marginLeft = -size.width  / 2 + 'px';
  $grid.element.style.marginTop  = -size.height / 2 + 'px';
}

function setClickEvent() {
  loopThroughGrid(function(row, col) {
    var data = $grid.getUnitData(row, col);
    var unit = $grid.getUnit(row, col);
    unit.addEventListener('click', function(event) {
      unit.removeClass('enabled');
      if ($game.mode === 'trigger' && !unit.hasClass('flagged')) {
        if (data.isMine) {
          unit.innerHTML = 'X';
          unit.addClass('mine');
          gameOver();
        } else recursiveSweep(row, col);
      } else if ($game.mode === 'flag') {
        if (unit.hasClass('flagged')) {
          unit.removeClass('flagged');
          unit.addClass('enabled');
          unit.innerHTML = '';
          $game.flags--;
          $game.sweptUnits--;
        } else {
          unit.addClass('flagged');
          unit.innerHTML = '🚩';
          $game.flags++;
          $game.sweptUnits++;

          var flagElement = $game.statistic.flags;
          if ($game.tooMuchFlag() && !flagElement.hasClass('too-much-flags')) {
            flagElement.addClass('too-much-flags');
          } else if (!$game.tooMuchFlag() && flagElement.hasClass('too-much-flags')) {
            flagElement.removeClass('too-much-flags');
          }
        }
      }
      updateStatistic();
      if ($game.is_finished()) { gameSuccess(); }
    });
  });
}

function recursiveSweep(row, col) {
  var unit = $grid.getUnit(row, col);
  var data = $grid.getUnitData(row, col);
  if (unit.hasClass('enabled')) { unit.removeClass('enabled'); }
  
  /* Unit already being swept, then return */
  if (unit.hasClass('swept')) { return; }

  /* Unit approach flag which certainly do not contain mines will be swept automatically */
  if (unit.hasClass('flagged')) { 
    unit.removeClass('flagged');
    unit.innerHTML = '';
    $game.flags--;
    $game.sweptUnits--;
    var flagElement = $game.statistic.flags;
    if (!$game.tooMuchFlag() && flagElement.hasClass('too-much-flags')) {
      flagElement.removeClass('too-much-flags');
    }
  }

  unit.addClass('swept');
  unit.addClass('swept-num-' + data.surroundings);
  $game.sweptUnits++;
  if (data.surroundings === 0) {
    loopSurroundings(row, col, function(row, col) {
      recursiveSweep(row, col);
    }, true);
  } else unit.innerHTML = data.surroundings;
}

function updateStatistic(bool) {
  $game.statistic.flags.innerHTML       = bool ? 0 : $game.flags;
  $game.statistic.sweptUnits.innerHTML  = bool ? 0 : $game.sweptUnits;
  $game.statistic.timeCounter.innerHTML = bool ? '00:00:00' : $game.currentTimeString();
  if (bool) {
    var flagElement = $game.statistic.flags;
    if (flagElement.hasClass('too-much-flags')) {
      flagElement.removeClass('too-much-flags');
    }
  }
}

function gameSuccess() {
  $game.stopTimeCounter();
  $game.resultTime.innerHTML = $game.currentTimeString();
  $game.successModal.style.display = 'block';
}

function gameOver() {
  $game.stopTimeCounter();

  loopThroughGrid(function(row, col) {
    var unit = $grid.getUnit(row, col);
    var data = $grid.getUnitData(row, col);
    if (unit.hasClass('enabled')) {
      unit.addClass('game-over');
      if (data.isMine) {
        unit.addClass('mine');
        unit.innerHTML = 'X';
      } else {
        unit.addClass('swept');
        unit.addClass('swept-num-' + data.surroundings);
      }
    } else if (unit.hasClass('flagged')) {
      unit.addClass('game-over');
      if (!data.isMine) { unit.addClass('not-mine'); }
    }
  });
}

function setGame() {
  $game.sweptUnits = 0;
  $game.flags = 0;
  $game.timeCount = 0;
  $grid.updateByInputs();
  $grid.destroy();
  initGridSystem();
  initControlSystemStyle();
  setClickEvent();
  updateStatistic(true);
  $game.setTimeCounter();
}

window.addEventListener('load', function() {
  initGridSystem();
  initControlSystem();
  initControlSystemStyle();
  setClickEvent();
  $game.setTimeCounter();
});
