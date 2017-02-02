$(document).ready(function() {
  /* Scene Initialization */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 1000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  /* Render Torus Geometry Mesh*/

  var geometry = new THREE.TorusKnotGeometry(100, 30, 50, 10); 
  var material = new THREE.MeshPhysicalMaterial({
    color: 0x194c7f,
    polygenOffset: true,
    polygenOffsetFactor: 1,
    polygenOffsetUnits: 1
  });
  var torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  /* Adding wireframe to the torus */
  var wireFrameGeometry = new THREE.EdgesGeometry(torus.geometry);
  var wireFrameMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa })
  var wireFrame = new THREE.LineSegments(wireFrameGeometry, wireFrameMaterial);
  torus.add(wireFrame);

  /* Adding Lights */
  var light = new THREE.PointLight( 0xffffff, 100, 950);
  light.position.set(0, 1000, 500);
  scene.add(light);
  var light = new THREE.PointLight( 0xffffff, 100, 950);
  light.position.set(0, -1000, 500);
  scene.add(light);
  var light = new THREE.PointLight( 0xffffff, 5, 90);
  light.position.set(0, 0, 500);
  scene.add(light);

  /* Request Animation Frame */
  function animation() {
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer.render(scene, camera);
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
    torus.position.y = -50;
    torus.position.z = 500;
    requestAnimationFrame(animation);
  }
  animation();
  setupDraggableEvents();

  function setupDraggableEvents() {
    var hammer = new Hammer(document.getElementsByTagName('canvas')[0]);
    hammer.on('pan', function(event) {
      torus.rotation.y += event.velocityX / 10;
      torus.rotation.x += event.velocityY / 10;
    });
  }
});