var $canvas = {
  element: null,
  width:  window.innerWidth,
  height: window.innerHeight,
  hammer: null,
  drawing: false
};
var $ctx;
var $controlPanel = {
  element: null,
  hammer: null,
  header: { element: null, hammer: null },
  colorpicker: { element: null, hammer: null },
  position: { x: NaN, y: NaN },
  getCurrentColor: null,
  mode: 'pen',
  eraser: null,
  pen: null,
  defaultPenSize: 10,
  gerCurrentPenSize: null
};
var $parameters = {
  enableToDrawOnCanvas: true,
  enableControlPanelDraggable: true,
  enableColorPicker: true,
  enablePenResizable: true
}

$(document).ready(function() {
  draw2DCanvas(function() {
    if ($parameters.enableControlPanelDraggable) { controlPanelDragEvent(); }
    if ($parameters.enableToDrawOnCanvas)        { drawOnCanvasEvents();    }
    if ($parameters.enableColorPicker)           { enableColorPicker();     }
    // if ($parameters.enableEraserMode)         { enableEraserMode();      }
    if ($parameters.enablePenResizable)          { penResizable();          }
  });
});

function draw2DCanvas(callback) {
  initCanvasObject();
  initControlPanelObject();

  if ($canvas.element.getContext) {
    $ctx = $canvas.element.getContext('2d');
    $ctx.lineCap = 'round';

    /* Clear Button for clearing the whole canvas */
    $('#clear-btn').on('click', function() { $ctx.clearRect(0, 0, $canvas.width, $canvas.height); })

    callback();
  }
}

function initCanvasObject() {
  $canvas.element = document.getElementById('main-canvas');
  $canvas.element.width  = $canvas.width;
  $canvas.element.height = $canvas.height;
  $canvas.hammer = new Hammer($canvas.element);
}

function initControlPanelObject() {
  $controlPanel.element = document.getElementById('control-panel');
  $controlPanel.header.element = document.getElementById('control-panel-header');
  $controlPanel.hammer = new Hammer($controlPanel.element);
  $controlPanel.header.hammer = new Hammer($controlPanel.header.element);
  $controlPanel.position.x = $controlPanel.element.offsetLeft;
  $controlPanel.position.y = $controlPanel.element.offsetTop;

  if ($parameters.enableColorPicker) {
    $controlPanel.colorpicker.element = document.getElementById('color-picker');
    $controlPanel.colorpicker.hammer = new Hammer($controlPanel.colorpicker.element);
  }

  $controlPanel.pen    = document.getElementById('pen-btn');
  $controlPanel.eraser = document.getElementById('eraser-btn');
  $controlPanel.pen.addEventListener('click', function() {
    $controlPanel.mode = 'pen';
    $('#pen-btn').addClass('active');
    $('#eraser-btn').removeClass('active');
  });
  $controlPanel.eraser.addEventListener('click', function() {
    $controlPanel.mode = 'eraser';
    $('#eraser-btn').addClass('active');
    $('#pen-btn').removeClass('active');
  });

  setTimeout(function() { $('.sp-button-container').remove(); }, 10)
  $('#pen-btn').click();
}

function drawOnCanvasEvents() {
  $canvas.element.addEventListener('mousedown', function(event) {
    $canvas.drawing = true;
    switch($controlPanel.mode) {
      case 'pen':
        $ctx.globalCompositeOperation = 'source-over';
        $ctx.strokeStyle = $controlPanel.getCurrentColor ? $controlPanel.getCurrentColor() : '#000000';
        break;
      case 'eraser':
        $ctx.globalCompositeOperation = 'destination-out';
        $ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';   
    }
    $ctx.lineWidth = $parameters.enablePenResizable ? $controlPanel.getCurrentPenSize() : $controlPanel.defaultPenSize;
    $ctx.beginPath();
    $ctx.moveTo(event.offsetX, event.offsetY);
  });
  $canvas.element.addEventListener('mouseup', function(event) {
    $canvas.drawing = false;
    $ctx.stroke();
  });
  $canvas.element.addEventListener('mousemove', function(event) {
    if ($canvas.drawing) {
      $ctx.lineTo(event.offsetX, event.offsetY);
      $ctx.stroke();
      $ctx.beginPath();
      $ctx.moveTo(event.offsetX, event.offsetY);      
    }
  });
}

/* Enable with the controlPanelDraggble parameter */
function controlPanelDragEvent() {
  $controlPanel.header.element.style['cursor'] = 'move';
  $controlPanel.header.hammer.on('panmove', function(event) {
    $controlPanel.element.style['left'] = $controlPanel.position.x + event.deltaX + 'px';
    $controlPanel.element.style['top']  = $controlPanel.position.y + event.deltaY + 'px';
  });
  $controlPanel.header.hammer.on('panend', function(event) {
    $controlPanel.position.x = $controlPanel.element.offsetLeft;
    $controlPanel.position.y = $controlPanel.element.offsetTop;
  });
}

function enableColorPicker() {
  $('div#color-picker').spectrum({
    flat: true,
    preferredFormat: 'rgb',
    showInput: true,
    showAlpha: true
  });
  var colorInputNode = document.getElementsByClassName('sp-input')[0];
  $controlPanel.getCurrentColor = function() { return colorInputNode.value; };
}

function penResizable() {
  var sizeInputNode = document.getElementById('pen-size-input');
  $controlPanel.getCurrentPenSize = function() { return sizeInputNode.value; }
}

