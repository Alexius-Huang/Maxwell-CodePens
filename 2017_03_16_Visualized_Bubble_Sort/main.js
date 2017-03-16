var $helpers = {
  getRandomInt: function(min, max) {
    /* Get random integer between min and max and both edges are all inclusive */
    return Math.round(Math.random() * (max - min) + min);
  },
  swap: function(array, index1, index2) {
    var mem = array[index1];
    array[index1] = array[index2];
    array[index2] = mem;
    return array;
  }
}
Array.prototype.insert = function(item, index) {
  this.splice(index, 0, item);
};
var $canvas = {
  element: null,
  width: 600,
  height: 600,
  fps: 90,
  intervalID: null,
  refresh: function() { $ctx.clearRect(0, 0, this.width, this.height); }
};
var $ctx = null;
var $sorting = {
  instructionCount: 0,
  currentState: 1,
  nextState: function(next) { this.currentState = next },
  comparison: 0,
  compareIndex: [],
  compareColor: 'hsl(60, 100%, 50%)',
  complete: 0,
  COMPARE_TWO_BARS: 1,
  SWITCH_BARS: 2,
  CHANGE_TO_COMPARE_NEXT_BAR_PAIR: 3,
  LAST_PAIR_COMPLETED: 4,
  COMPARE_TASK_ALL_DONE: 5
};
var $bar = {
  count: 50,
  state: new Array(this.count).join().split(',').map(function(item, index) { return ++index; }),
  mainColorAngle: 210,
  getState: function(index) { if (index) { return this.state[index - 1]; } else return this.state; },
  randomizeState: function() {
    var newArr = [];
    for (var i = 1; i <= this.count; i++) {
      newArr.insert(i, $helpers.getRandomInt(0, i));
    }
    this.state = newArr;
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
      $sorting.compareIndex = [1, 2];
      $draw.sort = true;
      $canvas.refresh();
      $draw.main();
    });
  },
}
var $draw = {
  init: function() {
    $bar.randomizeState();
  },
  sort: false,
  intervalID: null,
  line: function(fromX, fromY, toX, toY, width, style) {
    $ctx.strokeStyle = style ? style : '#ddd';
    $ctx.lineWidth = width ? width : 1;
    $ctx.beginPath();
    $ctx.moveTo(fromX, fromY);
    $ctx.lineTo(toX, toY);
    $ctx.stroke();
  },
  renderBars: function() {
    for (var i = 1; i <= $bar.count; i++) {
      currentBar = $bar.state[i - 1];
      if ($sorting.compareIndex.indexOf(i) != -1) {
        this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.compareColor);
      } else {
        this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
      }
    }
  },
  main: function() {
    this.renderBars();

    if ($draw.sort) {
      $canvas.intervalID = setInterval(function() {
        switch($sorting.currentState) {
          case $sorting.COMPARE_TWO_BARS:
            var bar1 = $bar.getState($sorting.compareIndex[0]);
            var bar2 = $bar.getState($sorting.compareIndex[1]);
            $sorting.comparison++;
            if (bar1 > bar2) {
              $sorting.nextState($sorting.SWITCH_BARS);
            } else {
              $sorting.nextState($sorting.CHANGE_TO_COMPARE_NEXT_BAR_PAIR);
            }
            break;
          case $sorting.SWITCH_BARS:
            currentState = $bar.getState();
            nextState = $helpers.swap(currentState, $sorting.compareIndex[0] - 1, $sorting.compareIndex[1] - 1);
            $bar.state = nextState;
            $canvas.refresh();
            $draw.renderBars();
            $sorting.nextState($sorting.CHANGE_TO_COMPARE_NEXT_BAR_PAIR);
            break;
          case $sorting.CHANGE_TO_COMPARE_NEXT_BAR_PAIR:
            if ($sorting.compareIndex[1] == $bar.count - $sorting.complete) {
              $sorting.compareIndex = [1, 2];
              $sorting.nextState($sorting.LAST_PAIR_COMPLETED);
            } else {
              $sorting.compareIndex[0]++;
              $sorting.compareIndex[1]++;
              $sorting.nextState($sorting.COMPARE_TWO_BARS);
            }
            $canvas.refresh();
            $draw.renderBars();
            break;
          case $sorting.LAST_PAIR_COMPLETED:
            $sorting.complete++;
            if ($sorting.complete == $bar.count - 1) { 
              $sorting.nextState($sorting.COMPARE_TASK_ALL_DONE);
            } else $sorting.nextState($sorting.COMPARE_TWO_BARS);
            break;
          case $sorting.COMPARE_TASK_ALL_DONE:
            $sorting.nextState($sorting.COMPARE_TWO_BARS);
            $sorting.compareIndex = [];
            $sorting.comparison = 0;
            $sorting.complete = 0;

            $canvas.refresh();
            $draw.renderBars();

            $('button#randomize-btn').prop('disabled', false);

            clearInterval($canvas.intervalID);
            $canvas.intervalID = null;
            break;
        }
      }, 1000 / $canvas.fps);
    }
  }
};

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