var $helpers = {
  getRandomInt: function(min, max) {
    /* Get random integer between min and max and both edges are all inclusive */
    return Math.round(Math.random() * (max - min) + min);
  },
  copy: function(object) {
    return JSON.parse(JSON.stringify(object));
  }
}
Array.prototype.insert = function(item, index) { this.splice(index, 0, item); };
Array.prototype.swap = function(index1, index2) {
  var mem = this[index1 - 1];
  this[index1 - 1] = this[index2 - 1];
  this[index2 - 1] = mem;
  return this;
};
Array.prototype.sorted = function() {
  for (var i = 1; i < this.length; i++) {
    if (this[i - 1] > this[i]) return false;
  } return true;
};
var $canvas = {
  element: null,
  width: 600,
  height: 600,
  refresh: function() { $ctx.clearRect(0, 0, this.width, this.height); },
  intervalID: null
};
var $ctx = null;
var $bar = {
  count: 100,
  mainColorAngle: 90,
  state: new Array(this.count).join().split(',').map(function(item, index) { return ++index; }),
  getState: function(index) { if (index) { return this.state[index - 1]; } else return this.state; },
  setState: function(newState) { this.state = newState; },
  randomizeState: function() {
    var newArr = [];
    for (var i = 1; i <= this.count; i++) {
      newArr.insert(i, $helpers.getRandomInt(0, i));
    }
    this.setState(newArr);
  },
  getThickness: function() { return Math.round($canvas.width / this.count); },
  getHSLColor: function(index, angle) {
    angle = angle ? angle : this.mainColorAngle;
    return "hsl(" + angle + ", " + Math.round(index / this.count * 100) + "%, 50%)";
  },
  getHeight: function(barNum) { return Math.round($canvas.height * barNum / this.count); },
  getHorizontalPosition: function(index) { return Math.round(this.getThickness() * (index - 1) + this.getThickness() / 2); }
};
var $events = {
  setRandomizeButtonEvent: function() {
    $('button#randomize-btn').on('click', function(event) {
      event.preventDefault();
      $bar.randomizeState();
      $('button#sort-btn').prop('disabled', false);
      $canvas.refresh();
      $draw.main();
    });
  },
  setSortingButtonEvent: function() {
    $('button#sort-btn').on('click', function(event) {
      event.preventDefault();
      $(this).prop('disabled', true);
      $('button#randomize-btn').prop('disabled', true);

      /* Initialize State */
      $sorting.nextState($sorting.states.INIT_COMB_SORT_PARAMS);

      $draw.sort = true;
      $canvas.refresh();
      $draw.main();

      return false;
    });
  },
};
var $sorting = {
  compareColor: 'hsl(30, 100%, 50%)',
  swapColor: 'hsl(60, 100%, 50%)',
  currentState: NaN,
  compareBarIndex: [],
  nextState: function(next) { this.currentState = next },
  states: {
    INIT_COMB_SORT_PARAMS: 1,
    COMPARE: 2,
    SWAP: 3,
    SET_NEXT_COMPARE_INDEX: 4,
    SET_NEXT_ROUND: 5,
    COMB_SORT_PROCESS_DONE: 6
  },
  gapFactor: NaN,
  currentGap: $bar.count,
  shrinkGap: function() { this.currentGap = Math.floor(this.currentGap / this.gapFactor); }
};
var $draw = {
  sort: false,
  line: function(fromX, fromY, toX, toY, width, style) {
    $ctx.strokeStyle = style ? style : '#ddd';
    $ctx.lineWidth = width ? width : 1;
    $ctx.beginPath();
    $ctx.moveTo(fromX, fromY);
    $ctx.lineTo(toX, toY);
    $ctx.stroke();
  },
  renderBars: function(options) {
    $canvas.refresh();
    var states = $sorting.states;
    for (var i = 1; i <= $bar.count; i++) {
      currentBar = $bar.state[i - 1];

      switch($sorting.currentState) {
        case states.COMPARE:
          if ($sorting.compareBarIndex.indexOf(i) != -1) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.compareColor);
          } else this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
        case states.SWAP:
          if ($sorting.compareBarIndex.indexOf(i) != -1) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.swapColor);
          } else this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
        default:
          this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
      }
    }
  },
  init: function() {
    // $bar.count = 50;

    $bar.randomizeState();
  },
  main: function() {
    this.renderBars();

    if (this.sort) {
      $canvas.intervalID = setInterval(function() {
        var states = $sorting.states;

        switch($sorting.currentState) {
          case states.INIT_COMB_SORT_PARAMS:
            $sorting.currentGap = $bar.count;
            $sorting.gapFactor  = 1.3;
            $sorting.compareBarIndex = [1, $bar.count];
            $sorting.nextState(states.COMPARE);
            break;

          case states.COMPARE:
            $draw.renderBars();
            
            var index = $sorting.compareBarIndex;
            if ($bar.getState(index[0]) > $bar.getState(index[1])) {
              $sorting.nextState(states.SWAP);
            } else $sorting.nextState(states.SET_NEXT_COMPARE_INDEX);
            
            break;

          case states.SWAP:
            var newBarState = $helpers.copy($bar.getState());
            var index = $sorting.compareBarIndex;
            newBarState.swap(index[0], index[1]);
            $bar.setState(newBarState);
            
            $draw.renderBars();
            
            $sorting.nextState(states.SET_NEXT_COMPARE_INDEX);
            break;

          case states.SET_NEXT_COMPARE_INDEX:
            var index = $sorting.compareBarIndex;
            if (index[1] + 1 > $bar.count) {
              $sorting.nextState(states.SET_NEXT_ROUND);
            } else {
              $sorting.compareBarIndex[0]++;
              $sorting.compareBarIndex[1]++;
              $sorting.nextState(states.COMPARE);
            }

            // $draw.renderBars();
            break;

          case states.SET_NEXT_ROUND:
            if ($sorting.currentGap === 1) {
              if ($bar.getState().sorted()) {
                $draw.renderBars();
                $sorting.nextState(states.COMB_SORT_PROCESS_DONE);
              } else {
                /* Normal Bubble Sort */
                $sorting.compareBarIndex = [1, 2];
                $sorting.nextState(states.COMPARE);
              }
            } else {
              $sorting.shrinkGap();
              if ($sorting.currentGap === 9 || $sorting.currentGap === 10) { $sorting.currentGap = 11; }
              $sorting.compareBarIndex = [1, 1 + $sorting.currentGap];
              $sorting.nextState(states.COMPARE);
            }
            break;

          case states.COMB_SORT_PROCESS_DONE:
            /* Destructor */
            $sorting.compareBarIndex = [];
            $sorting.nextState(NaN);
            $sorting.currentGap = NaN;

            $('button#randomize-btn').prop('disabled', false);
            
            clearInterval($canvas.intervalID);
            $canvas.intervalID = null;
            
            break;
        }
        
      }, 25);
    }
  }
}

$(document).ready(function() {
  $canvas.element = document.getElementById('main-canvas');
  $canvas.element.height = $canvas.height;
  $canvas.element.width  = $canvas.width;

  if ($canvas.element.getContext) {
    $ctx = $canvas.element.getContext('2d');

    $draw.init();
    $draw.main();
    $events.setRandomizeButtonEvent();
    $events.setSortingButtonEvent();
  }
});