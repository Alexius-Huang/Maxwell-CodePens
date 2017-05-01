$(document).ready(function() {
  var imgs = [];
  var imgCount = $('.gallery-img').length;
  var maxZIndex = Math.ceil(imgCount / 2);
  var degreePerImage = 360 / imgCount;
  var galleryRadius = 1000;
  var imgSize = 250;
  var minImgSize = 100;
  var animating = false;
  var autoPlaying = true;
  var autoPlayID = null;

  function degToRad(degree) { return degree / 180 * Math.PI; }

  /* Initializing the image gallery view */
  for (var i = 1; i <= imgCount; i++) {
    var imgObj = {
      element: $('#img-' + i),
      angle: degreePerImage * (i - 1),
      zIndex: Math.abs(maxZIndex - i)
    };
    imgObj.left = parseInt(imgObj.element.css('left')) + galleryRadius * Math.sin(degToRad(imgObj.angle));
    imgObj.opacity = Math.abs(imgObj.angle - 180) / 180;
    imgObj.size = (imgSize - minImgSize) * Math.abs(imgObj.angle - 180) / 180 + minImgSize;
    imgs.push(imgObj);
  }

  for (var j = 0; j < imgCount; j++) {
    var imgElement = imgs[j].element;
    var imgAngle = imgs[j].angle;
    imgElement.css({
      'left': imgs[j].left,
      'z-index': imgs[j].zIndex,
      'opacity': imgs[j].opacity,
      'width': imgs[j].size,
      'height': imgs[j].size
    });
  }

  /* Setting Up Events */
  $('button').on('click', function(event) {
    event.preventDefault();
    if (animating) { return; } else animating = true;
    
    if (this.id === 'right-button') {
      var mem = imgs[0].element;
      for (var i = 1; i < imgCount; i++) {
        imgs[i - 1].element = imgs[i].element;
      }
      imgs[imgCount - 1].element = mem;
    } else if (this.id === 'left-button') {
      var mem = imgs[imgCount - 1].element;
      for (var i = imgCount - 1; i >= 1; i--) {
        imgs[i].element = imgs[i - 1].element;
      }
      imgs[0].element = mem;
    }

    /* Animate and assign next state */
    for (var j = 1; j <= imgCount; j++) {
      imgElement = imgs[j - 1].element;
      imgElement.animate({
        left: imgs[j - 1].left,
        opacity: imgs[j - 1].opacity,
        width: imgs[j - 1].size,
        height: imgs[j - 1].size,
      }, 500, 'easeOutQuart', function() {
        if (animating) animating = false;
      });
    }
  });

  function autoPlay() {
    autoPlayID = setTimeout(function() {
      $('#right-button').click();
      if (autoPlaying)autoPlay();
    }, 2000);
  }

  $('#auto-play-trigger').on('click', function(event) {
    event.preventDefault();
    autoPlaying = !autoPlaying;
    if (autoPlaying) {
      $(this).text('Stop Auto Play');
      $('#left-button').addClass('disabled');
      $('#right-button').addClass('disabled');
      autoPlay();
    } else {
      window.clearTimeout(autoPlayID);
      $(this).text('Auto Play');
      $('#left-button').removeClass('disabled');
      $('#right-button').removeClass('disabled');
    }
  })
  autoPlay();
  
});