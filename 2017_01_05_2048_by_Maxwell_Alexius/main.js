/* Code Pen Limited */
// window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;

$(document).ready(function() {
  var $body = $('body');
  var $html = $('html');
  var $main = $('#main-container');
  var $mainSize = $main.width();
  var $mainData = [   // $mainData[row][col]
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  var $score = $('p#score');
  var $startBtn = $('button#start-btn');
  var $gapSize = $mainSize / 25;
  var $squareSize = ($mainSize - 5 * $gapSize) / 4;
  var $maxTileLevel = 0;
  $main.css('height', $mainSize);
  
  /* Setup Hammer.js */
  var $swipeArea = document.getElementById('swipe-area');
  var hammer     = new Hammer.Manager($swipeArea);
  var swipe      = new Hammer.Swipe();
  hammer.add(swipe);
  
  function initSquare(element, styles) {
    element.className = 'square';
    element.style['width']  = $squareSize + 'px';
    element.style['height'] = $squareSize + 'px';
    if (styles) for (var attr in styles) { element.style[attr]  = styles[attr]; }
  }
  
  function positionSquare(element, row, col) {
    element.style['top']  = (row + 1) * $gapSize + row * $squareSize + 'px';
    element.style['left'] = (col + 1) * $gapSize + col * $squareSize + 'px';
  }
  
  function generateNewSquare(level, animateType, row, col) {
    level = level ? level : (parseInt(Math.random() * 10) % 2 == 0 ? 2 : 1);
    animateType = animateType ? animateType : 'new';
    var position = row && col ? { row: row, col: col } : randomPosition();
    var popElement = document.createElement('div');
    var popTile = getTileData(level);
    var id = 'r' + position.row + 'c' + position.col;
    assignID(popElement, id);
    assignLevel(popElement, level);
    initSquare(popElement);
    popElement.className += ' square-movable';
      
    /* Assign Inner DIV Element */
    var innerDiv = document.createElement('div');
    assignID(innerDiv, id + '-innerDiv');
    innerDiv.style['width'] = '100%';
    innerDiv.style['height'] = '100%';
    innerDiv.style['background-color'] = popTile.color;
    
    /* Assign Inner P Element */
    var innerP = document.createElement('p');
    assignID(innerP, id + '-innerP');
    innerP.innerHTML = popTile.number;
    innerP.style['font-size'] = $squareSize * popTile.fontRatio + 'px';
    innerP.style['text-align'] = 'center'
    innerP.style['vertical-align'] = 'center';
    innerP.style['line-height'] = $squareSize + 'px';
    
    /* Combination & Positioning */
    innerDiv.append(innerP);
    popElement.append(innerDiv);
    positionSquare(popElement, position.row, position.col);
    renderSquare(popElement);
    
    if (animateType == 'new') {
      popIn(id + '-innerDiv');
    } else if (animateType == 'merge') {
      mergeIn(id + '-innerDiv');
    }
    
    /* Append new generated data to $mainData */
    $mainData[position.row][position.col] = level;
  }
  
  function renderSquare(element) { $main.append(element); }
  
  function moveSquare(id, direction, blockCount, timing, callback) {
    var pixels = ($gapSize + $squareSize) * blockCount + 'px';
    timing = timing ? timing :  500;
    id = '#' + id;
    switch(direction) {
      case 'up':    $(id).animate({ top:  '-=' + pixels }, timing, 'swing', callback); break;
      case 'down':  $(id).animate({ top:  '+=' + pixels }, timing, 'swing', callback); break;
      case 'left':  $(id).animate({ left: '-=' + pixels }, timing, 'swing', callback); break;
      case 'right': $(id).animate({ left: '+=' + pixels }, timing, 'swing', callback); break;
    }
  }
  
  function assignID(element, id) { element.setAttribute('id', id); }
  
  function assignLevel(element, level) { element.setAttribute('data-level', level); }
  
  function getTileData(level) {
    if (level === 0) { return null; }
    var number = Math.pow(2, level);
    var color, fontRatio;
    switch(level) {
      case  1: color = '#47b7ff'; fontRatio = 0.50; break;
      case  2: color = '#47a9ff'; fontRatio = 0.50; break;
      case  3: color = '#51a2ff'; fontRatio = 0.50; break;
      case  4: color = '#5c9bff'; fontRatio = 0.45; break;
      case  5: color = '#6794ff'; fontRatio = 0.45; break;
      case  6: color = '#718dff'; fontRatio = 0.45; break;
      case  7: color = '#7c86ff'; fontRatio = 0.40; break;
      case  8: color = '#877fff'; fontRatio = 0.40; break;
      case  9: color = '#9278ff'; fontRatio = 0.40; break;
      case 10: color = '#9c71ff'; fontRatio = 0.33; break;
      case 11: color = '#a76aff'; fontRatio = 0.33; break;
      case 12: color = '#b263ff'; fontRatio = 0.33; break;
      case 13: color = '#bc5cff'; fontRatio = 0.33; break;
      case 14: color = '#c755ff'; fontRatio = 0.27; break;
      case 15: color = '#d24eff'; fontRatio = 0.27; break;
      case 16: color = '#dd47ff'; fontRatio = 0.27; break;
    }
    return { number: number, color: color, fontRatio: fontRatio };
  }
  
  function randomPosition() {
    var counts = 0;
    for (var row = 0; row < 4; row++) {
      for (var col = 0; col < 4; col++) {
        if ($mainData[row][col] === 0) { counts++; }
      }
    }
    
    var num = parseInt(Math.random() * counts) + 1;
    var col = 0, row = 0;
    for (var i = 1, j = 0; i <= 16; i++) {
      if ($mainData[row][col] == 0) { j++; }
      if (j == num) { break; }
      col++;
      if (col > 3) { col = 0; row++; }
    }
    return { col: col, row: row };
  }
  
  function popIn(id) {
    id = '#' + id;
    $(id).addClass('animated zoomIn');
    $(id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function (e) {
        $(id).removeClass('animated zoomIn');
    });
  }

  function mergeIn(id) {
    id = '#' + id;
    $(id).addClass('animated bounceIn');
    $(id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function (e) {
      $(id).removeClass('animated bounceIn');
    });
  }
  
  function getScore() {
    return parseInt($score.html());
  }
  
  function updateScore(number) {
    $score.html(number);
  }

  /* Game Progress Functions */
  function adjustMoveBlockCountWhenEmptyTile(index, array) {
    if (array[index].level == 0) {
      for (var i = index + 1; i <= 3; i++) {
        if (array[i].level != 0) {
          array[i].moveBlocks++;
        }
      }
    }
  }

  function adjustMoveBlockCountWhenMerging(arr) {
    var mem1 = null;
    var mem2 = null;
    for (var i = 0; i <= 3; i++) {
      if (arr[i].level != 0) {
        if (mem1 == null) {
          mem1 = arr[i]; 
          mem1.index = i;
        } else if (mem2 == null) {
          mem2 = arr[i];
          mem2.index = i;
          if (mem1.level == mem2.level) {
            mem2.moveBlocks++;
            mem2.deleteAfterAnimation = true;
            document.getElementById(mem2.id).setAttribute('data-delete', 1);
            arr[mem1.index] = mem1;
            arr[mem2.index] = mem2;
            for (var j = mem2.index + 1; j <= 3; j++) { if (arr[j].level != 0) arr[j].moveBlocks++; }
            mem1 = null;
            mem2 = null;
          } else {
            mem1 = mem2;
            mem2 = null;
          }
        }
      }
    }
  }

  function arrayMerge(arr) {
    for (var i = 1; i <= arr.length - 1; i++) {
      if (arr[i - 1] == arr[i]) {
        arr[i - 1]++;
        arr[i] = 0;
      }
    }
  }

  function checkIfTileStatusNotChange(previous, current) {
    if (JSON.stringify(previous) == JSON.stringify(current)) {
      $preventNewTile = true;
    } else $mainData = current;
  }

  function deleteTilesIfNotNeeded() {
    for (var row = 0; row <= 3; row++) {
      for (var col = 0; col <= 3; col++) {
        var id = 'r' + row + 'c' + col;
        var $tile = $('#' + id);
        if ($tile && parseInt($tile.data('delete')) == 1) { $tile.remove(); }
      }
    }
  }

  function assignNewIDToTiles() {
    var tiles = document.getElementsByClassName('square-movable');
    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      var finalRow = tile.getAttribute('data-final-row');
      var finalCol = tile.getAttribute('data-final-col');
      tile.id = 'r' + finalRow + 'c' + finalCol;
      var innerDiv = tile.childNodes[0];
      innerDiv.id = tile.id + '-innerDiv';
      var innerP = innerDiv.childNodes[0];
      innerP.id = tile.id + '-innerP';
    }
  }

  function tileMergingProcess() {
    for (var row = 0; row <= 3; row++) {
      for (var col = 0; col <= 3; col++) {
        if ($mainData[row][col] != 0) {
          var level = $mainData[row][col];
          var id = 'r' + row + 'c' + col;
          var innerDiv = document.getElementById(id + '-innerDiv');
          var innerP = document.getElementById(id + '-innerP');
          var tileData = getTileData(level);
          if (parseInt(innerP.innerHTML) != tileData.number) {
            if (level + 1 > $maxTileLevel) {
              $maxTileLevel = level;
              $body.css('background-color', tileData.color);
              $html.css('background-color', tileData.color);
              $startBtn.hover(function() {
                $(this).css('background-color', tileData.color);
              }, function() {
                $(this).css('background-color', '#ccc');
              });
            }
            var score = getScore();
            updateScore(score + tileData.number);
            mergeIn(id + '-innerDiv');
            innerDiv.style['background-color'] = tileData.color;
            innerP.style['font-size'] = $squareSize * tileData.fontRatio + 'px';
            innerP.innerHTML = tileData.number;
          }
        }
      }
    }
  }

  function checkGameStatus() {
    if (!$preventNewTile) {
      setTimeout(function() { 
        generateNewSquare();
        if (checkIfGameFullFilled()) {
          if (checkIfGameOver()) {
            setTimeout(function() {
              window.alert('Game Over !');
            }, 1000);
          }
        }
        $gameOnProcess = false;
      }, 500);
    } else {
      $preventNewTile = false;
      $gameOnProcess = false;
    }
  }

  function checkIfGameFullFilled() {
    for (var i = 0; i <= 3; i++) {
      for (var j = 0; j <= 3; j++) {
        if ($mainData[i][j] != 0) {
          continue;
        } else return false;
      }
    }
    return true;
  }

  function checkIfGameOver() {
    for (var row = 0; row <= 3; row++) {
      for (var col = 0; col <= 3; col++) {
        var current = $mainData[row][col];
        if ( (row - 1 >= 0 && current == $mainData[row - 1][col]) /* Compare with upper tile */
          || (row + 1 <= 3 && current == $mainData[row + 1][col]) /* Compare with lover tile */
          || (col - 1 >= 0 && current == $mainData[row][col - 1]) /* Compare with left  tile */
          || (col + 1 <= 3 && current == $mainData[row][col + 1]) /* Compare with right tile */
        ) { return false; }
      }
    }
    return true;
  }
  
  /* Draw initial squares */
  for (var c = 0; c < 4; c++) {
    for (var r = 0; r < 4; r++) {
      var element = document.createElement('div');
      initSquare(element);
      positionSquare(element, r, c);
      renderSquare(element);
    }
  }
  
  /* Start Button Clicked */
  $startBtn.on('click touchstart', function(event) {
    event.stopImmediatePropagation();
    $mainData = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    $maxTileLevel = 0;
    for (var row = 0; row <= 3; row++) {
      for (var col = 0; col <= 3; col++) {
        var id = '#r' + row + 'c' + col;
        if ($(id)) $(id).remove();
      }
    }
    updateScore(0);
    
    $body.css('background-color', '#333');
    $html.css('background-color', '#333');
    $startBtn.hover(function() {
      $(this).css('background-color', '#333');
    }, function() {
      $(this).css('background-color', '#ccc');
    });
    
    /* Start Game */
    generateNewSquare(1);
  });
  
  /* Game Parameters */
  var $gameOnProcess = false;
  var $preventNewTile = false;
  
  var _moveUpEvent = function() {
    /* Prevent continuing if game still on process */
    if ($gameOnProcess) { return; } else $gameOnProcess = true;
    
    var beforeData = $mainData;
    var afterData  = [[], [], [], []];
    var animationData = [[], [], [], []];
    var colData, colAnimationData;
    
    for (var col = 0; col <= 3; col++) {
      colData = [];
      colAnimationData = [];
      for (var row = 0; row <= 3; row++) {
        colData.push(beforeData[row][col]);
        colAnimationData.push({
          id: 'r' + row + 'c' + col,
          level: beforeData[row][col],
          moveBlocks: 0,
          deleteAfterAnimation: false
        });
      }
      
      /* Merging Algorithm */
      colData = colData.filter(function(value) { return value != 0; });
      for (var row = 0; row <= 3; row++) { adjustMoveBlockCountWhenEmptyTile(row, colAnimationData); }
      
      /* Adjust The Count of Blocks Should Move When Merging */
      arrayMerge(colData);
      adjustMoveBlockCountWhenMerging(colAnimationData);
      
      // Round back to main data
      colData = colData.filter(function(value) { return value != 0; });
      while (colData.length < 4) { colData.push(0); }
      for (var row = 0; row <= 3; row++) {
        afterData[row][col] = colData[row];
        animationData[row][col] = colAnimationData[row];
      }
    }

    /* Check the after and before result */
    checkIfTileStatusNotChange(beforeData, afterData);
    
    /* Start Animation */
    if (!$preventNewTile) {
      var processAnimation = new Promise(function(resolve, reject) {
        for (var row = 0; row <= 3; row++) {
          for (var col = 0; col <= 3; col++) {
            var id = animationData[row][col].id;
            var moveBlocks = animationData[row][col].moveBlocks;
            moveSquare(id, 'up', moveBlocks);
            var tile = document.getElementById(id);
            if (tile) {
              var adjustRow = row, adjustCol = col;
              if (moveBlocks != 0) { adjustRow -= moveBlocks; }
              tile.setAttribute('data-final-row', adjustRow);
              tile.setAttribute('data-final-col', adjustCol);
            }
            
            if (col == 3 && row == 3) {
              setTimeout(function() { resolve('true'); }, 500)
            }
          }
        }  
      });
      
      var processMerging = processAnimation.then(function(accepted) {
        if (accepted) {
          deleteTilesIfNotNeeded();
          assignNewIDToTiles();
          tileMergingProcess();
        }
      });
    }
    
    checkGameStatus();
  }
  
  var _moveDownEvent = function() {
    /* Prevent continuing if game still on process */
    if ($gameOnProcess) { return; } else $gameOnProcess = true;
    
    var beforeData = $mainData;
    var afterData  = [[], [], [], []];
    var animationData = [[], [], [], []];
    var colData, colAnimationData;
    
    for (var col = 0; col <= 3; col++) {
      colData = [];
      colAnimationData = [];
      for (var row = 0; row <= 3; row++) {
        colData.push(beforeData[row][col]);
        colAnimationData.push({
          id: 'r' + row + 'c' + col,
          level: beforeData[row][col],
          moveBlocks: 0,
          deleteAfterAnimation: false
        });
      }
      
      colData = colData.reverse();
      colAnimationData = colAnimationData.reverse();
      
      /* Merging Algorithm */
      colData = colData.filter(function(value) { return value != 0; });
      for (var row = 0; row <= 3; row++) { adjustMoveBlockCountWhenEmptyTile(row, colAnimationData); }
      
            
              arrayMerge(colData);
      adjustMoveBlockCountWhenMerging(colAnimationData);
      
      // Round back to main data
      colData = colData.filter(function(value) { return value != 0; });
      while (colData.length < 4) { colData.push(0); }
      colData = colData.reverse();
      colAnimationData = colAnimationData.reverse();
      for (var row = 0; row <= 3; row++) {
        afterData[row][col] = colData[row];
        animationData[row][col] = colAnimationData[row];
      }
    }

    /* Check the after and before result */
    checkIfTileStatusNotChange(beforeData, afterData);
    
    /* Start Animation */
    if (!$preventNewTile) {
      var processAnimation = new Promise(function(resolve, reject) {
        for (var row = 0; row <= 3; row++) {
          for (var col = 0; col <= 3; col++) {
            var id = animationData[row][col].id;
            var moveBlocks = animationData[row][col].moveBlocks;
            moveSquare(id, 'down', moveBlocks);
            var tile = document.getElementById(id);
            if (tile) {
              var adjustRow = row, adjustCol = col;
              if (moveBlocks != 0) { adjustRow += moveBlocks; }
              tile.setAttribute('data-final-row', adjustRow);
              tile.setAttribute('data-final-col', adjustCol);
            }
            
            if (col == 3 && row == 3) {
              setTimeout(function() { resolve('true'); }, 500)
            }
          }
        }  
      });
      
      var processMerging = processAnimation.then(function(accepted) {
        if (accepted) {
          deleteTilesIfNotNeeded();
          assignNewIDToTiles();
          tileMergingProcess();
        }
      });
    }
    
    checkGameStatus();
  }
  
  var _moveLeftEvent = function() {
    /* Prevent continuing if game still on process */
    if ($gameOnProcess) { return; } else $gameOnProcess = true;
    
    var beforeData = $mainData;
    var afterData  = [[], [], [], []];
    var animationData = [[], [], [], []];
    var rowData, rowAnimationData;
    
    for (var row = 0; row <= 3; row++) {
      rowData = [];
      rowAnimationData = [];
      for (var col = 0; col <= 3; col++) {
        rowData.push(beforeData[row][col]);
        rowAnimationData.push({
          id: 'r' + row + 'c' + col,
          level: beforeData[row][col],
          moveBlocks: 0,
          deleteAfterAnimation: false
        });
      }
      
      /* Merging Algorithm */
      rowData = rowData.filter(function(value) { return value != 0; });
      for (var col = 0; col <= 3; col++) { adjustMoveBlockCountWhenEmptyTile(col, rowAnimationData); }
      
      /* Adjust The Count of Blocks Should Move When Merging */
      arrayMerge(rowData);
      adjustMoveBlockCountWhenMerging(rowAnimationData);
      
      // Round back to main data
      rowData = rowData.filter(function(value) { return value != 0; });
      while (rowData.length < 4) { rowData.push(0); }
      for (var col = 0; col <= 3; col++) {
        afterData[row][col] = rowData[col];
        animationData[row][col] = rowAnimationData[col];
      }
    }

    /* Check the after and before result */
    checkIfTileStatusNotChange(beforeData, afterData);
    
    /* Start Animation */
    if (!$preventNewTile) {
      var processAnimation = new Promise(function(resolve, reject) {
        for (var col = 0; col <= 3; col++) {
          for (var row = 0; row <= 3; row++) {
            var id = animationData[row][col].id;
            var moveBlocks = animationData[row][col].moveBlocks;
            moveSquare(id, 'left', moveBlocks);
            var tile = document.getElementById(id);
            if (tile) {
              var adjustRow = row, adjustCol = col;
              if (moveBlocks != 0) { adjustCol -= moveBlocks; }
              tile.setAttribute('data-final-row', adjustRow);
              tile.setAttribute('data-final-col', adjustCol);
            }
            
            if (col == 3 && row == 3) {
              setTimeout(function() { resolve('true'); }, 500)
            }
          }
        }  
      });
      
      var processMerging = processAnimation.then(function(accepted) {
        if (accepted) {
          deleteTilesIfNotNeeded();
          assignNewIDToTiles();
          tileMergingProcess();
        }
      });
    }
    
    checkGameStatus();
  }
  
  var _moveRightEvent = function() {
    /* Prevent continuing if game still on process */
    if ($gameOnProcess) { return; } else $gameOnProcess = true;
    
    var beforeData = $mainData;
    var afterData  = [[], [], [], []];
    var animationData = [[], [], [], []];
    var rowData, rowAnimationData;
    
    for (var row = 0; row <= 3; row++) {
      rowData = [];
      rowAnimationData = [];
      for (var col = 0; col <= 3; col++) {
        rowData.push(beforeData[row][col]);
        rowAnimationData.push({
          id: 'r' + row + 'c' + col,
          level: beforeData[row][col],
          moveBlocks: 0,
          deleteAfterAnimation: false
        });
      }

      /* Reverse Data Contrary to the left event */
      rowData = rowData.reverse();
      rowAnimationData = rowAnimationData.reverse();
      
      /* Merging Algorithm */
      rowData = rowData.filter(function(value) { return value != 0; });
      for (var col = 0; col <= 3; col++) { adjustMoveBlockCountWhenEmptyTile(col, rowAnimationData); }
      
      /* Adjust The Count of Blocks Should Move When Merging */
      arrayMerge(rowData);
      adjustMoveBlockCountWhenMerging(rowAnimationData);
      
      // Round back to main data
      rowData = rowData.filter(function(value) { return value != 0; });
      while (rowData.length < 4) { rowData.push(0); }
      /* Reverse Data Back Again */
      rowData = rowData.reverse();
      rowAnimationData = rowAnimationData.reverse();
      for (var col = 0; col <= 3; col++) {
        afterData[row][col] = rowData[col];
        animationData[row][col] = rowAnimationData[col];
      }
    }

    /* Check the after and before result */
    checkIfTileStatusNotChange(beforeData, afterData);
    
    /* Start Animation */
    if (!$preventNewTile) {
      var processAnimation = new Promise(function(resolve, reject) {
        for (var col = 0; col <= 3; col++) {
          for (var row = 0; row <= 3; row++) {
            var id = animationData[row][col].id;
            var moveBlocks = animationData[row][col].moveBlocks;
            moveSquare(id, 'right', moveBlocks);
            var tile = document.getElementById(id);
            if (tile) {
              var adjustRow = row, adjustCol = col;
              if (moveBlocks != 0) { adjustCol += moveBlocks; }
              tile.setAttribute('data-final-row', adjustRow);
              tile.setAttribute('data-final-col', adjustCol);
            }
            
            if (col == 3 && row == 3) {
              setTimeout(function() { resolve('true'); }, 500)
            }
          }
        }  
      });
      
      var processMerging = processAnimation.then(function(accepted) {
        if (accepted) {
          deleteTilesIfNotNeeded();
          assignNewIDToTiles();
          tileMergingProcess();
        }
      });
    }
      
    checkGameStatus();
  }
  
  var eventPairs = {
    "up": _moveUpEvent,
    "down": _moveDownEvent,
    "left": _moveLeftEvent,
    "right": _moveRightEvent
  }
  
  for (var action in eventPairs) {
    Mousetrap.bind(action, eventPairs[action]);
    hammer.on('swipe' + action, eventPairs[action]);
  }
  
  /* Start Game */
  generateNewSquare(1);
});