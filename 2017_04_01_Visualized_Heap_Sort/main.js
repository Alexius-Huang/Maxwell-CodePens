var $helpers = {
  getRandomInt: function(min, max) {
    /* Get random integer between min and max and both edges are all inclusive */
    return Math.round(Math.random() * (max - min) + min);
  }
}
Array.prototype.insert = function(item, index) { this.splice(index, 0, item); };
Array.prototype.swap = function(index1, index2) {
  var mem = this[index1 - 1];
  this[index1 - 1] = this[index2 - 1];
  this[index2 - 1] = mem;
  return this;
};
var $canvas = {
  element: null,
  width: NaN,
  height: NaN,
  refresh: function() { $ctx.clearRect(0, 0, this.width, this.height); },
  intervalID: null
};
var $ctx = null;
var $bar = {
  count: 100,
  mainColorAngle: 270,
  compareBarColor: "hsl(210, 100%, 50%)",
  swapBarColor: "hsl(300, 100%, 80%)",
  getHeapColorFromBarIndex: function(barIndex) {
    if (barIndex == 1) {
      return "hsl(0, 100%, 50%)";
    } else if (barIndex <= 3) {
      return "hsl(25, 100%, 50%)";
    } else if (barIndex <= 7) {
      return "hsl(50, 100%, 50%)";
    } else if (barIndex <= 15) {
      return "hsl(75, 100%, 50%)";
    } else if (barIndex <= 31) {
      return "hsl(100, 100%, 50%)";
    } else if (barIndex <= 63) {
      return "hsl(125, 100%, 50%)";
    } else if (barIndex <= 127) {
      return "hsl(150, 100%, 50%)";
    }
  },
  state: new Array(this.count).join().split(',').map(function(item, index) { return ++index; }),
  getState: function(index) { if (index) { return this.state[index - 1]; } else if (isNaN(index)) { return 0; } else return this.state; },
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
      $sorting.nextState($sorting.states.INIT_HEAP_SORT_PARAMS);

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
    INIT_HEAP_SORT_PARAMS: 1,
    ASSIGN_AND_HEAP_COMPARE: 2,
    SWAP_AND_CALIBRATE_MAIN_INDEX: 3,
    REGISTER_TO_NEXT_INDEX: 4,
    SWAP_BEGINNING_WITH_LAST: 5,
    HEAP_SORT_PROCESS_DONE: 6
  },
  sortedCount: NaN,
  registeredBarIndex: NaN,
  mainBarIndex: NaN,
  leftBarIndex: NaN,
  rightBarIndex: NaN,
  swapBarIndex: [],
  assignHeapCompareBarIndex: function() {
    var mainBarIndex = this.mainBarIndex;
    var leftBarIndex = mainBarIndex * 2;
    var rightBarIndex = leftBarIndex + 1;
    if (leftBarIndex > $bar.count - this.sortedCount) {
      /* No need to sort */
      return false;
    } else if (rightBarIndex > $bar.count - this.sortedCount) {
      /* Assign Left Bar Only */
      this.leftBarIndex = leftBarIndex;
      this.rightBarIndex = NaN;
      return true;
    } else {
      this.leftBarIndex = leftBarIndex;
      this.rightBarIndex = rightBarIndex;
      return true;
    }
  },
  wipeOutHeapCompareBarIndex: function() {
    this.leftBarIndex = NaN;
    this.rightBarIndex = NaN;
    this.swapBarIndex = [];
  },
  heapCompare: function() {
    var mainBar = $bar.getState(this.mainBarIndex);
    var leftBar = $bar.getState(this.leftBarIndex);
    var rightBar = $bar.getState(this.rightBarIndex);

    var maxVal = Math.max(mainBar, leftBar, rightBar);
    switch(maxVal) {
      case mainBar: return true;
      case leftBar:
        this.swapBarIndex = [this.mainBarIndex, this.leftBarIndex];
        return false;
      case rightBar:
        this.swapBarIndex = [this.mainBarIndex, this.rightBarIndex];
        return false;
    }
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
  renderBars: function(options) {
    $canvas.refresh();
    var states = $sorting.states;
    for (var i = 1; i <= $bar.count; i++) {
      currentBar = $bar.state[i - 1];

      if ($sorting.swapBarIndex[0] === i || $sorting.swapBarIndex[1] === i) {
        this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.swapBarColor);
      } else if ($sorting.mainBarIndex === i || $sorting.leftBarIndex === i || $sorting.rightBarIndex === i) {
        this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.compareBarColor);
      } else if (!isNaN($sorting.sortedCount) && i <= $bar.count - $sorting.sortedCount) {
        this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHeapColorFromBarIndex(i));
      } else {
        this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
      }
    }
  },
  init: function() {
    $bar.count = 100;
    
    $bar.randomizeState();
  },
  main: function() {
    this.renderBars();

    if (this.sort) {
      $canvas.intervalID = setInterval(function() {
        var states = $sorting.states;
        console.log($sorting.currentState)
        switch($sorting.currentState) {
          case states.INIT_HEAP_SORT_PARAMS:
            $sorting.sortedCount = 0;
            $sorting.mainBarIndex = Math.ceil($bar.count / 2);
            $sorting.registeredBarIndex = $sorting.mainBarIndex; // Record the initial bar sorting index
            this.renderBars();
            
            $sorting.nextState(states.ASSIGN_AND_HEAP_COMPARE);
            break;

          case states.ASSIGN_AND_HEAP_COMPARE:
            if ($sorting.assignHeapCompareBarIndex()) {
              this.renderBars();
              if ($sorting.heapCompare()) {
                /* Main bar is maximum */
                if (this.registeredBarIndex === 1) {
                  $sorting.nextState(states.SWAP_BEGINNING_WITH_LAST);
                } else {
                  $sorting.nextState(states.REGISTER_TO_NEXT_INDEX);
                }
              } else {
                $sorting.nextState(states.SWAP_AND_CALIBRATE_MAIN_INDEX);
              };
            } else if (this.registeredBarIndex === 1) {
              this.renderBars();
              $sorting.nextState(states.SWAP_BEGINNING_WITH_LAST);  
            } else {
              this.renderBars();
              /* No need to heap compare due to it is the bottom of the heap array */
              $sorting.nextState(states.REGISTER_TO_NEXT_INDEX);
            }
            break;

          case states.SWAP_AND_CALIBRATE_MAIN_INDEX:
            this.renderBars();

            $bar.state.swap($sorting.swapBarIndex[0], $sorting.swapBarIndex[1]);
            this.renderBars();
            
            $sorting.mainBarIndex = $sorting.swapBarIndex[1];
            $sorting.swapBarIndex = [];
            $sorting.nextState(states.ASSIGN_AND_HEAP_COMPARE);
            break;

          case states.REGISTER_TO_NEXT_INDEX:
            $sorting.wipeOutHeapCompareBarIndex();
              
            if ($sorting.registeredBarIndex === 1) {
              /* Since then, no more action will related to register next index */
              $sorting.mainBarIndex = 1;
              $sorting.swapBarIndex = [1, $bar.count - $sorting.sortedCount];
              this.renderBars();
              $sorting.nextState(states.SWAP_BEGINNING_WITH_LAST);
            } else {
              $sorting.registeredBarIndex--;
              $sorting.mainBarIndex = $sorting.registeredBarIndex;
              this.renderBars();
              $sorting.nextState(states.ASSIGN_AND_HEAP_COMPARE);  
            }
            break;

          case states.SWAP_BEGINNING_WITH_LAST:
            $bar.state.swap(1, $bar.count - $sorting.sortedCount);
            $sorting.sortedCount++;
            if ($sorting.sortedCount === 100) {
              $sorting.nextState(states.HEAP_SORT_PROCESS_DONE);
              return;
            } 
            this.renderBars();
            $sorting.wipeOutHeapCompareBarIndex();
            $sorting.nextState(states.ASSIGN_AND_HEAP_COMPARE);
            break;

          case states.HEAP_SORT_PROCESS_DONE:
            $sorting.wipeOutHeapCompareBarIndex();
            $sorting.mainBarIndex = NaN;
            $sorting.registeredBarIndex = NaN;
            $sorting.sortedCount = NaN;
            this.renderBars();
            
            $('button#randomize-btn').prop('disabled', false);
            clearInterval($canvas.intervalID);
            this.sort = false;
            $canvas.intervalID = null;
            break;

        }
        
      }.bind(this), 50);
    }
  }
}

$(document).ready(function() {
  $canvas.width = $('#main-canvas').width();
  $canvas.height = $('#main-canvas').width();
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