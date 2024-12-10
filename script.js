import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

/*Canvas*/
const canvas = document.querySelector('canvas.webgl');

/*Scene*/
const scene = new THREE.Scene();

/*Camera*/
const sizes = {width: window.innerWidth, height: window.innerHeight};
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
camera.position.y = 1;
scene.add(camera);

/*Renderer*/
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/*Resize Listener*/
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
});

/*background*/

/*Light*/
const red_light = new THREE.DirectionalLight(0xff00ff, 0.5);
red_light.position.set(20, 0, 0);
red_light.castShadow = true;
scene.add(red_light);

const blue_light = new THREE.DirectionalLight(0x00ffff, 0.5);
blue_light.position.set(-20, 0, 0);
blue_light.castShadow = true;
scene.add(blue_light);

/*Miku Hatsune*/
let mixer = null;
const loader = new GLTFLoader();
let model = null;
loader.load( 
  'https://dex4short.github.io/THREE_JS_ACT_3/3d_model/miku_dance1.glb',
  (gltf) => {
    model = gltf.scene;
    model.traverse((child) => { 
      if (child.material) {
        child.material.side = THREE.DoubleSide;
      }
    });
    scene.add(model);
    //model.position.set(0, 0, 0);
    //model.scale.set(0.01, 0.01, 0.01);
   
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new AnimationMixer(model);
      const clip = gltf.animations[0];
      const action = mixer.clipAction(clip);
      action.play();
    }
  }
);
 
/*Audio*/
const audio = new Audio('https://dex4short.github.io/THREE_JS_ACT_3/sound/Miku.mp3');
let clock = null; 

/*Stage*/
const main_light = new THREE.DirectionalLight(0xffffff, 0.2);
main_light.position.set(0, 0.5, 1);
scene.add(main_light);

let boxes = new Array();
class BOX{
  constructor(box_mesh, range, iterate){
    this.box_mesh = box_mesh;
    this.box_mesh.position.y = range/Math.round(Math.random() * 10) - 0.5;
    
    this.y = Math.random();
    this.y_iterate = iterate;
    this.position_y = this.box_mesh.position.y;
  }
}
for(let x=-10.0; x<10; x++){
  for(let y=-10.0; y<10; y++){
    const box_geometry = new THREE.BoxGeometry(1,1,1);
    const box_material = new THREE.MeshStandardMaterial({
      color: 0x000000
    });
    const box_mesh = new THREE.Mesh(box_geometry, box_material);
    if(x>-5 && x<5 && y>-5 && y<5){
      box_mesh.position.set( x*1.02, -0.5, y*1.02);
    }
    else{
      box_mesh.position.set( x*1.03, (1 / (Math.random() * 10)) - 0.5, y*1.03);
      boxes.push(new BOX(box_mesh, 0.5,0.01));
    }
    box_mesh.castShadow = true;
    box_mesh.recieveShadow = true;
    scene.add(box_mesh);
  }
}

/*Particles*/
const particleCount = 1000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = 10 * ((Math.random() - 0.5) * 20);
  positions[i * 3 + 1] = 10 * ((Math.random() - 0.5) * 20);
  positions[i * 3 + 2] = 10 * ((Math.random() - 0.5) * 20);
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);



/*Player*/
let play = false;
canvas.addEventListener('click', (event) => {
  if(!play){
    audio.play();
    play = true;
    clock = new THREE.Clock();
  }
});

/*Animation*/
const tick = function() {
    renderer.render(scene, camera);
    controls.update();
  
    if(mixer && clock!=null){
      mixer.update(clock.getDelta());
    }
    particles.rotation.y += 0.0005;
    
    boxes.forEach((box) => {
      if(box.y > 0.5){
        box.y=0;
        box.y_iterate *= -1;
      }
      box.box_mesh.position.y += box.y_iterate;
      box.y+=0.01;
    });
  
    window.requestAnimationFrame(tick);
};
tick(); 

