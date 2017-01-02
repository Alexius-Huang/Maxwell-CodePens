$(document).ready(function() {
  function degToRad(degree) {
    var factor = Math.PI / 180;
    return degree * factor;
  }

  function drawMainCircle(ctx, skillName, skillXPosition, percentage) {
    ctx.lineWidth = 15;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#4ad3f0';
    ctx.shadowColor = '#4ad3f0';

    ctx.beginPath();
    ctx.arc(125, 125, 70, degToRad(270), degToRad((percentage / 100 * 360) - 90));
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';

    ctx.beginPath();
    ctx.arc(125, 125, 70, degToRad(270), degToRad(0 - 90));
    ctx.stroke();

    ctx.font = "30pt Comfortaa";
    ctx.fillStyle = '#4ad3f0';
    ctx.fillText(String(percentage) + "%", 90, 140);

    ctx.font = "20pt Comfortaa";
    ctx.fillStyle = '#4ad3f0';
    ctx.fillText(skillName, skillXPosition, 240);
  }

  function drawHalfCircle(ctx, skillName, xPosition, percentage) {
    ctx.lineWidth = 10;
    ctx.shadowBlur = 5;
    ctx.strokeStyle = '#4ad3f0';
    ctx.shadowColor = '#4ad3f0';

    ctx.beginPath();
    ctx.arc(60, 60, 45, degToRad(180), degToRad(180 + percentage / 100 * 180));
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';

    ctx.beginPath();
    ctx.arc(60, 60, 45, degToRad(180), degToRad(0));
    ctx.stroke();

    ctx.font = "20pt Comfortaa";
    ctx.fillStyle = '#4ad3f0';
    ctx.fillText(String(percentage) + "%", 35, 60);

    ctx.font = "14pt Comfortaa";
    ctx.fillStyle = '#4ad3f0';
    ctx.fillText(skillName, xPosition, 90);
  }

  $('#programming-skills').css('width', $('body').width());
  setTimeout(function() {
    var mainSkills = ['HTML5 & CSS3', 'JavaScript', 'PHP', 'Ruby', 'Python'];
    var skillDetails = {
      'HTML5 & CSS3': {
        percentage: 90,
        xPos: 20,
        child: {
          'Bootstrap': {
            percentage: 95,
            x: 10
          },
          'Sass': {
            percentage: 80,
            x: 40
          },
          'Canvas': {
            percentage: 65,
            x: 30
          },
          'RWD': {
            percentage: 60,
            x: 40
          }
        }
      },
      'JavaScript': {
        percentage: 85,
        xPos: 60,
        child: {
          'jQuery': {
            percentage: 95,
            x: 30
          },
          'ES6': {
            percentage: 80,
            x: 40
          },
          'ReactJS': {
            percentage: 85,
            x: 25
          },
        }
      },
      'PHP': {
        percentage: 90,
        xPos: 100,
        child: {
          'CodeIgniter 3': {
            percentage: 90,
            x: 1
          },
          'PHPExcel': {
            percentage: 65,
            x: 20
          },
        }
      },
      'Ruby': {
        percentage: 85,
        xPos: 95,
        child: {
          'Ruby on Rails': {
            percentage: 70,
            x: 1
          },
        }
      },
      'Python': {
        percentage: 55,
        xPos: 80
      }
    };
    var count = 0;
    for (var skill of mainSkills) {
      count++;
      
      /* Create Elements in order to append the canvas to image content */
      var spanElement = document.createElement('span');
      spanElement.className += "programming-skill-item";
      var imgElement  = document.createElement('img');
      imgElement.setAttribute('id',  'skill-' + count);
      imgElement.setAttribute('src', '');
      imgElement.setAttribute('alt', 'image-' + count);
      var divElement  = document.createElement('div');
      divElement.setAttribute('id', 'skill-' + count + '-child');
      divElement.className += 'row';
      
      spanElement.appendChild(imgElement);
      spanElement.appendChild(divElement);
      document.getElementById('programming-skills').appendChild(spanElement);

      /* Crafting the canvas element */
      var detail = skillDetails[skill];
      var canvas = document.createElement('canvas');
      canvas.width = 250;
      canvas.height = 250 + 25;
      if (canvas.getContext('2d')) {
        var ctx = canvas.getContext('2d');
        drawMainCircle(ctx, skill, detail.xPos, detail.percentage);
      }
      document.getElementById('skill-' + count).src = canvas.toDataURL();

      var subcount = 0;
      for (var childSkill in detail.child) {
        /* Crafting with child skills */
        subcount++;
        var childDetail = detail.child[childSkill];
        var node = document.createElement('div');
        node.className += "col-lg-6 col-md-6 col-sm-6 col-xs-6";
        node.setAttribute('id', childSkill);
        node.style['text-align'] = subcount % 2 == 1 ? 'right' : 'left';

        var imgNode = document.createElement('img');

        var childCanvas = document.createElement('canvas');
        childCanvas.width = 130;
        childCanvas.height = 100;
        if (childCanvas.getContext('2d')) {
          var childCtx = childCanvas.getContext('2d');
          drawHalfCircle(childCtx, childSkill, childDetail.x, childDetail.percentage);
        }

        /* Transform the canvas to image and append into the img content */
        imgNode.src = childCanvas.toDataURL();
        node.appendChild(imgNode);
        document.getElementById('skill-' + count + '-child').appendChild(node)
      }
    }
  }, 100);

});