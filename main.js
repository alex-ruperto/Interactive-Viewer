// import three.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { OutlinePass } from 'three/examples/jsm/Addons.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';

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

// outline effect
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(outlinePass);

// color inversion
const invertShaderColor = {
    uniforms: {
        "tDiffuse": { value: null}
    },
    vertexShader: 
    `
    varying vec2 vUv; 
    void main() {
        vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
    }
    `,

    fragmentShader: 
    `
    uniform sampler2D tDiffuse; 
    varying vec2 vUv;
    void main() {
        vec4 texture = texture2D(tDiffuse, vUv); 
        gl_FragColor = vec4(1.0 - texture.rgb, texture.a);
    }
    `
};

const invertShaderPass = new ShaderPass(invertShaderColor);
invertShaderPass.enabled = false;
composer.addPass(invertShaderPass);

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
    outlinePass.selectedObjects = [model];
}, undefined, function(error){
    console.error('An error occured, during model loading.', error);
});

// add directional lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // color, intensity
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// add ambient lighting
const ambientLight = new THREE.AmbientLight(0xcccccc); // color
scene.add(ambientLight);

// camera depth slider
const depthSlider = document.createElement('input');
depthSlider.type = 'range';
depthSlider.max = 3;
depthSlider.min = 0.05;
depthSlider.value = 1.5;
depthSlider.step = 0.01;
depthSlider.style.top = '10px';
depthSlider.style.right = '10px';
depthSlider.style.position = 'absolute';
document.body.appendChild(depthSlider);
depthSlider.oninput = function() {
    camera.far = parseFloat(this.value) * 2;
    camera.near = parseFloat(this.value) / 2;
    camera.updateProjectionMatrix;
}

// recursive loop to render animation
function animate() {
    requestAnimationFrame(animate);

    // check to see if the island was loaded
    if(island){
        island.rotation.y += 0.005; // rotate island
    }

    composer.render()

    controller.update();

    
}

animate();

