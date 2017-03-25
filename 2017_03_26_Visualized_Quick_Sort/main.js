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
  mainColorAngle: 0,
  colorizeBar: { leftArrayRange: [], rightArrayRange: [], mergeArrayRange: [] },
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
  getHorizontalPosition: function(index) { return Math.round(this.getThickness() * (index - 1) + this.getThickness() / 2); },
  getSortedByRange: function(rangeArray) {
    var checkArray = [];
    for (var barIndex = rangeArray[0]; barIndex <= rangeArray[1]; barIndex++) {
      checkArray.push($bar.getState(barIndex));
    }
    return checkArray.sorted();
  }
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

      $sorting.nextState($sorting.states.INIT_QUICK_SORT_PARAMS);

      $draw.sort = true;
      $canvas.refresh();
      $draw.main();

      return false;
    });
  },
};
var $sorting = {
  currentState: NaN,
  nextState: function(next) { this.currentState = next },
  states: {
    INIT_QUICK_SORT_PARAMS: 1,
    PIVOT_RANDOM_BAR: 2,
    MOVE_PIVOTED_BAR: 3,
    SCAN: 4,
    SWAP: 5,
    RETURN_PIVOTED_BAR: 6,
    DIVIDE_AND_CONQUER: 7,
    QUICK_SORT_PROCESS_DONE: 8
  },
  pivotedBarColor: 'hsl(60, 100%, 50%)',
  scanBarColor: 'hsl(270, 100%, 50%)',
  swapBarColor: 'hsl(300, 100%, 50%)',
  pivotedBarIndex: NaN,
  pivotedBarValue: NaN,
  scanBarIndex: NaN,
  scanBarStart: NaN,
  swappedCount: NaN,
  stack: [],
  stackLevel: NaN,
  accessLevel: NaN,
  pushStack: function(nextStack) {
    this.stack.push(nextStack);
    this.stackLevel++;
    this.accessLevel++;
  },
  rollbackStack: function() {
    this.stack.pop();
    this.stackLevel--;
    this.accessLevel--;
  }
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
  renderPivotHorizontalLine: function() {
    if ($sorting.pivotedBarValue) {
      $ctx.setLineDash([10, 7]);
      var pivotedBarHorizontalPosition = $canvas.height - $bar.getHeight($sorting.pivotedBarValue) + 1;
      this.line(0, pivotedBarHorizontalPosition, $bar.getHorizontalPosition($sorting.pivotedBarIndex), pivotedBarHorizontalPosition, 2, $sorting.pivotedBarColor);
      $ctx.setLineDash([]);
    }
  },
  renderBars: function(options) {
    $canvas.refresh();
    var states = $sorting.states;
    for (var i = 1; i <= $bar.count; i++) {
      currentBar = $bar.state[i - 1];
      switch($sorting.currentState) {
        case states.PIVOT_RANDOM_BAR:
        case states.MOVE_PIVOTED_BAR:
        case states.RETURN_PIVOTED_BAR:
          if ($sorting.pivotedBarIndex === i) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.pivotedBarColor);  
          } else this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
        case states.SCAN:
          if ($sorting.pivotedBarIndex === i) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.pivotedBarColor);  
          } else if ($sorting.scanBarIndex === i) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.scanBarColor);  
          } else this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
        case states.SWAP:
          if ($sorting.pivotedBarIndex === i) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.pivotedBarColor);  
          } else if ($sorting.scanBarStart + $sorting.swappedCount === i) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.swapBarColor);  
          } else this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;

        case states.DIVIDE_AND_CONQUER:
        case states.QUICK_SORT_PROCESS_DONE:
        default:
          this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
      }
    }
    this.renderPivotHorizontalLine();
  },
  init: function() {
    $bar.randomizeState();
  },
  main: function() {
    this.renderBars();

    if (this.sort) {
      $canvas.intervalID = setInterval(function() {
        var states = $sorting.states;

        switch($sorting.currentState) {
          case states.INIT_QUICK_SORT_PARAMS:
            $sorting.stack = [];
            $sorting.stackLevel = 0;
            $sorting.accessLevel = 0;
            $sorting.pivotedBarIndex = NaN;
            $sorting.pivotedBarValue = NaN;
            $sorting.scanIndex = NaN;
            $sorting.scanBarStart = NaN;
            $sorting.swappedCount = NaN;

            $sorting.nextState(states.PIVOT_RANDOM_BAR);
            break;
          
          case states.PIVOT_RANDOM_BAR:
            if ($sorting.stackLevel === 0) {
              /* Randomly Select Pivot from Global Range */
              $sorting.pivotedBarIndex = $helpers.getRandomInt(1, $bar.count);
              $sorting.scanIndexEnd = $bar.count - 1;
            } else {
              var currentStack = $sorting.stack[$sorting.accessLevel - 1];
              if (currentStack.left != 'sorted') {
                var leftRange = currentStack.left;
                $sorting.pivotedBarIndex = $helpers.getRandomInt(leftRange[0], leftRange[1]);
                $sorting.scanIndexEnd = leftRange[1];
              } else if (currentStack.right != 'sorted') {
                var rightRange = currentStack.right;
                $sorting.pivotedBarIndex = $helpers.getRandomInt(rightRange[0], rightRange[1]);
                $sorting.scanIndexEnd = rightRange[1];
              }
            }
            $sorting.pivotedBarValue = $bar.getState($sorting.pivotedBarIndex);

            $draw.renderBars();
            $sorting.nextState(states.MOVE_PIVOTED_BAR);
            break;

          case states.MOVE_PIVOTED_BAR:
            if ($sorting.stackLevel === 0) {
              $bar.getState().swap($sorting.pivotedBarIndex, $bar.count);
              $sorting.pivotedBarIndex = $bar.count;
              $sorting.scanBarIndex    = 1;
              $sorting.scanBarStart    = 1;
            } else {
              var currentStack = $sorting.stack[$sorting.accessLevel - 1];
              if (currentStack.left != 'sorted') {
                var leftRange = currentStack.left;
                $bar.getState().swap($sorting.pivotedBarIndex, leftRange[1]);
                $sorting.pivotedBarIndex = leftRange[1];
                $sorting.scanBarIndex    = leftRange[0];
                $sorting.scanBarStart    = leftRange[0];
              } else if (currentStack.right != 'sorted') {
                var rightRange = currentStack.right;
                $bar.getState().swap($sorting.pivotedBarIndex, rightRange[1]);
                $sorting.pivotedBarIndex = rightRange[1];
                $sorting.scanBarIndex    = rightRange[0];
                $sorting.scanBarStart    = rightRange[0];
              }
            }

            $sorting.swappedCount = 0;

            $draw.renderBars();

            $sorting.nextState(states.SCAN);
            break;
          
          case states.SCAN:
            if ($sorting.scanBarIndex === $sorting.pivotedBarIndex) {
              /* Quick Sort Round Complete */
              $sorting.nextState(states.RETURN_PIVOTED_BAR);
              break;
            }

            $draw.renderBars();

            if ($bar.getState($sorting.scanBarIndex) < $sorting.pivotedBarValue) {
              $sorting.nextState(states.SWAP);
            } else $sorting.scanBarIndex++;
            break;
          
          case states.SWAP:
            $bar.getState().swap($sorting.scanBarIndex, $sorting.scanBarStart + $sorting.swappedCount);
            $draw.renderBars();
            
            $sorting.swappedCount++;
            $sorting.scanBarIndex++;
            $sorting.nextState(states.SCAN);
            break;
          
          case states.RETURN_PIVOTED_BAR:
            var returnedPivotedIndex = $sorting.scanBarStart + $sorting.swappedCount;
            $bar.getState().swap($sorting.scanBarIndex, returnedPivotedIndex);
            $sorting.pivotedBarIndex = returnedPivotedIndex;
            $draw.renderBars();

            $sorting.nextState(states.DIVIDE_AND_CONQUER);
            break;
          
          case states.DIVIDE_AND_CONQUER:
            var divideIndex = $sorting.pivotedBarIndex;

            if ($sorting.stackLevel === 0) {
              var range = [1, $bar.count];
            } else {
              var currentStack = $sorting.stack[$sorting.accessLevel - 1];
              if (currentStack.left != 'sorted') {
                var range = [currentStack.left[0], currentStack.left[1]];
              } else if (currentStack.right != 'sorted') {
                var range = [currentStack.right[0], currentStack.right[1]];
              }
            }
            var nextStack = { left: [range[0], undefined], right: [undefined, range[1]] };
            if (divideIndex === range[0]) nextStack.left     = 'sorted';
            if (divideIndex === range[1]) nextStack.right    = 'sorted';
            if (!nextStack.left[1])       nextStack.left[1]  = divideIndex - 1;
            if (!nextStack.right[0])      nextStack.right[0] = divideIndex + 1;
            
            /* Check Sorted Or Not */
            if (nextStack.left  != 'sorted' && $bar.getSortedByRange(nextStack.left))  nextStack.left  = 'sorted';
            if (nextStack.right != 'sorted' && $bar.getSortedByRange(nextStack.right)) nextStack.right = 'sorted';

            if (nextStack.left === 'sorted' && nextStack.right === 'sorted') {
              $sorting.rollbackStack();
              var foundNotSorted = false;

              while (!foundNotSorted) {
                var currentStack = $sorting.stack[$sorting.accessLevel - 1];
                if (currentStack.left  !== 'sorted' && $bar.getSortedByRange(currentStack.left))  currentStack.left  = 'sorted';
                if (currentStack.right !== 'sorted' && $bar.getSortedByRange(currentStack.right)) currentStack.right = 'sorted';

                if (currentStack.left === 'sorted' && currentStack.right === 'sorted') {
                  if ($sorting.stackLevel === 1) {
                    $sorting.nextState(states.QUICK_SORT_PROCESS_DONE);
                    return;
                  }
                  $sorting.rollbackStack();
                } else foundNotSorted = true;
              }
            } else $sorting.pushStack(nextStack);

            $sorting.pivotedBarIndex = NaN;
            $sorting.pivotedBarValue = NaN;
            $draw.renderBars();
            $sorting.nextState(states.PIVOT_RANDOM_BAR);
            break;

          case states.QUICK_SORT_PROCESS_DONE:
            $sorting.pivotedBarIndex = NaN;
            $sorting.pivotedBarValue = NaN;
            $draw.renderBars();
            this.sort = false;
            
            $('button#randomize-btn').prop('disabled', false);
            
            clearInterval($canvas.intervalID);
            $canvas.intervalID = null;
            
            break;
        }
      }, 10);
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