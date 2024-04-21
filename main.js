// import three.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

// scene and camera setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, // field of view
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1, // clip when an object is near
    1000 // clip when an object is far
);

camera.position.set(0, 2, 25);

// set up WebGL renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// interactive viewing controls
const controller = new OrbitControls(camera, renderer.domElement);

// create a canvas element to draw the gradient on
const canvas = document.createElement('canvas');
canvas.width = 128; // width of the gradient image
canvas.height = 128; // height of the gradient image

// get the 2D drawing context
const context = canvas.getContext('2d');

// create a new gradient
const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, 'rgba(238, 175, 97, 1)'); // # eeaf61
gradient.addColorStop(1, 'rgba(251, 144, 198, 1)'); // # fb9062

// fill the canvas with the gradient
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

// use the canvas as a texture
const texture = new THREE.CanvasTexture(canvas);

// apply the texture as the scene's background
scene.background = texture;

// load model
let island; // declare 'island' in higher scope
const loader = new GLTFLoader();
loader.load('Island.glb', function(gltf) { 
    island = gltf.scene;
    island.scale.set(1, 1, 1); // scale the model
    scene.add(island);
}, undefined, function(error){
    console.error(error);
});

// add directional lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // color, intensity
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// add ambient lighting
const ambientLight = new THREE.AmbientLight(0xcccccc); // color
scene.add(ambientLight);

// recursive loop to render animation
function animate() {
    requestAnimationFrame(animate);

    // check to see if the island was loaded
    if(island){
        island.rotation.y += 0.005; // rotate island
    }

    controller.update();

    renderer.render(scene, camera);
}

animate();

