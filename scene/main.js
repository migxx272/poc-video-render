
import * as THREE from 'three';

const FPS = 24;
const TOTAL = 240;
const W = 1280;
const H = 720;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true
});
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd9f5);
// Sem fog: visão limpa até o horizonte.

const camera = new THREE.PerspectiveCamera(43, W / H, 0.1, 150);

scene.add(new THREE.HemisphereLight(0xe5f5ff, 0x718c55, 1.5));

const sun = new THREE.DirectionalLight(0xffe3b5, 3);
sun.position.set(-5, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -18;
sun.shadow.camera.right = 18;
sun.shadow.camera.top = 18;
sun.shadow.camera.bottom = -18;
sun.shadow.normalBias = 0.035;
scene.add(sun);

const mat = (color, roughness = 1) =>
  new THREE.MeshStandardMaterial({ color, roughness });

const grassMat = mat(0x72b95c);
const grassLight = mat(0x8bc96c);
const darkGrass = mat(0x579b4a);
const wood = mat(0x8b5938);
const woodLight = mat(0xb47a4b);
const leaf1 = mat(0x388c4c);
const leaf2 = mat(0x55a956);
const leaf3 = mat(0x78bd60);
const stone = mat(0x969b9a);
const cream = mat(0xf0dfbd);
const roofMat = mat(0x9f4938);
const roofLight = mat(0xc2674d);
const glass = new THREE.MeshStandardMaterial({
  color: 0x85cce7,
  roughness: 0.25,
  metalness: 0.05
});

function mesh(geometry, material, x, y, z, parent = scene) {
  const obj = new THREE.Mesh(geometry, material);
  obj.position.set(x, y, z);
  obj.castShadow = true;
  obj.receiveShadow = true;
  parent.add(obj);
  return obj;
}

function box(parent, material, x, y, z, sx, sy, sz, radius = 0) {
  let geometry = new THREE.BoxGeometry(sx, sy, sz);
  if (radius > 0) {
    geometry = new THREE.BoxGeometry(sx, sy, sz, 3, 3, 3);
  }
  return mesh(geometry, material, x, y, z, parent);
}

function sphere(parent, material, x, y, z, sx, sy = sx, sz = sx) {
  const obj = mesh(
    new THREE.SphereGeometry(1, 20, 16),
    material, x, y, z, parent
  );
  obj.scale.set(sx, sy, sz);
  return obj;
}

function capsule(parent, material, x, y, z, radius, length) {
  return mesh(
    new THREE.CapsuleGeometry(radius, length, 5, 10),
    material, x, y, z, parent
  );
}

// Ground
mesh(
  new THREE.PlaneGeometry(120, 120),
  grassMat, 0, -0.06, 0
).rotation.x = -Math.PI / 2;

// Grass patches
for (let i = 0; i < 85; i++) {
  const x = (Math.random() - 0.5) * 35;
  const z = (Math.random() - 0.5) * 28;
  const size = 0.12 + Math.random() * 0.22;
  const patch = mesh(
    new THREE.CircleGeometry(size, 7),
    Math.random() > 0.5 ? grassLight : darkGrass,
    x, 0.005, z
  );
  patch.rotation.x = -Math.PI / 2;
}

// Curved-looking stone path
const pathMat = mat(0xd6c5a3);
const pathPositions = [
  [1.5, 0.015, 4.2, 1.1, 0.12],
  [1.1, 0.015, 3.1, 1.0, 0.12],
  [0.5, 0.015, 2.0, 1.0, 0.12],
  [-0.1, 0.015, 0.9, 1.0, 0.12],
  [-0.8, 0.015, -0.2, 1.1, 0.12]
];
for (const [x, y, z, sx, sz] of pathPositions) {
  const p = mesh(
    new THREE.BoxGeometry(sx, 0.05, sz),
    pathMat, x, y, z
  );
  p.rotation.y = -0.45;
}

// Trees
function tree(x, z, s = 1) {
  const g = new THREE.Group();
  scene.add(g);
  g.position.set(x, 0, z);
  g.scale.setScalar(s);

  const trunk = mesh(
    new THREE.CylinderGeometry(0.22, 0.32, 1.7, 9),
    wood, 0, 0.85, 0, g
  );

  const branch1 = mesh(
    new THREE.CylinderGeometry(0.09, 0.13, 0.9, 7),
    wood, -0.35, 1.65, 0, g
  );
  branch1.rotation.z = -0.65;

  const branch2 = mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.8, 7),
    wood, 0.3, 1.75, 0, g
  );
  branch2.rotation.z = 0.6;

  sphere(g, leaf1, 0, 2.4, 0, 1.0, 1.05, 0.9);
  sphere(g, leaf2, -0.55, 2.25, 0.05, 0.68, 0.72, 0.7);
  sphere(g, leaf3, 0.48, 2.75, 0.08, 0.68, 0.72, 0.65);
  sphere(g, leaf2, 0.0, 3.2, 0, 0.62, 0.68, 0.6);

  return g;
}

// Trees kept away from the house and the character
tree(-8, -8, 1.5);
tree(7, -9, 1.4);
tree(10, -3, 1.1);
tree(-9, 2, 1.1);
tree(8, 5, 1.3);
tree(-11, -2, 0.9);

// Bushes
function bush(x, z, s = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  scene.add(g);
  sphere(g, leaf1, 0, 0.35 * s, 0, 0.65 * s, 0.48 * s, 0.5 * s);
  sphere(g, leaf2, -0.4 * s, 0.35 * s, 0.05, 0.4 * s);
  sphere(g, leaf3, 0.4 * s, 0.4 * s, 0.05, 0.42 * s);
  return g;
}

bush(-4.8, -4, 1.1);
bush(1.5, -7.2, 0.9);
bush(4.5, -4.5, 1.2);
bush(-6, 3, 1);

// House
const house = new THREE.Group();
house.position.set(-2.5, 0, -6.2);
scene.add(house);

// Foundation
box(house, stone, 0, 0.15, 0, 3.9, 0.3, 3.1);

// Walls
box(house, cream, 0, 1.35, 0, 3.5, 2.2, 2.8);

// Roof: two sloping panels
const roofA = box(
  house, roofMat, -0.85, 2.65, 0, 2.0, 0.2, 3.35
);
roofA.rotation.z = -0.48;

const roofB = box(
  house, roofLight, 0.85, 2.65, 0, 2.0, 0.2, 3.35
);
roofB.rotation.z = 0.48;

// Roof trim
box(house, wood, 0, 3.22, 0, 0.12, 0.12, 3.5);

// Door
box(house, wood, 0, 0.95, 1.42, 0.85, 1.75, 0.12);
box(house, woodLight, 0, 1.0, 1.5, 0.65, 1.55, 0.04);
sphere(house, mat(0xe9c56e), 0.25, 0.95, 1.55, 0.055);

// Windows
function windowFrame(x, z) {
  box(house, wood, x, 1.55, z, 0.95, 0.9, 0.13);
  box(house, glass, x, 1.55, z + 0.08, 0.77, 0.72, 0.04);
  box(house, cream, x, 1.55, z + 0.12, 0.07, 0.78, 0.05);
  box(house, cream, x, 1.55, z + 0.12, 0.82, 0.07, 0.05);
}

windowFrame(-1.15, 1.43);
windowFrame(1.15, 1.43);

// Window flower boxes
box(house, wood, -1.15, 1.05, 1.58, 1.0, 0.13, 0.18);
box(house, wood, 1.15, 1.05, 1.58, 1.0, 0.13, 0.18);

// Stones around the house
for (let i = 0; i < 9; i++) {
  const a = i * 0.7;
  const x = -2.5 + Math.cos(a) * 2.4;
  const z = -6.2 + Math.sin(a) * 2.2;
  const s = 0.12 + Math.random() * 0.1;
  sphere(scene, stone, x, 0.08, z, s, s * 0.55, s);
}

// Flowers
const flowerColors = [
  mat(0xf5c5d4),
  mat(0xffe38b),
  mat(0xe5b7ff),
  mat(0xffffff)
];

for (let i = 0; i < 28; i++) {
  const x = (Math.random() - 0.5) * 17;
  const z = (Math.random() - 0.5) * 15;
  if (x > -4 && x < 3 && z < 2 && z > -4) continue;

  const stem = mesh(
    new THREE.CylinderGeometry(0.018, 0.025, 0.35, 5),
    darkGrass, x, 0.18, z
  );
  sphere(
    scene,
    flowerColors[i % flowerColors.length],
    x, 0.39, z, 0.09, 0.09, 0.09
  );
}

// Clouds
const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

function cloud(x, y, z, s = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(s);
  scene.add(g);
  sphere(g, cloudMat, 0, 0, 0, 1.0, 0.45, 0.55);
  sphere(g, cloudMat, -0.65, -0.05, 0, 0.65, 0.4, 0.5);
  sphere(g, cloudMat, 0.6, 0.08, 0, 0.72, 0.48, 0.55);
}

cloud(-8, 8, -12, 1.5);
cloud(2, 9, -15, 1.2);
cloud(10, 7, -10, 1.4);

// Character
function buildCharacter() {
  const g = new THREE.Group();

  const skin = mat(0xe9b98e);
  const skinLight = mat(0xf4cba7);
  const shirt = mat(0x3478d4);
  const shirtLight = mat(0x5b9af1);
  const pants = mat(0x28364e);
  const shoes = mat(0x302b2a);
  const hair = mat(0x513321);
  const eyeWhite = mat(0xffffff);
  const iris = mat(0x34251e);
  const black = mat(0x171717);

  // Body
  const torso = mesh(
    new THREE.CapsuleGeometry(0.34, 0.42, 6, 12),
    shirt, 0, 1.05, 0, g
  );
  torso.scale.set(1, 1, 0.75);

  // Shirt collar
  const collar = mesh(
    new THREE.TorusGeometry(0.13, 0.045, 8, 16),
    shirtLight, 0, 1.39, 0, g
  );
  collar.rotation.x = Math.PI / 2;

  // Head
  const headP = new THREE.Group();
  headP.position.set(0, 1.72, 0);
  g.add(headP);

  sphere(headP, skinLight, 0, 0.28, 0, 0.37, 0.43, 0.34);

  // Ears
  sphere(headP, skin, -0.37, 0.25, 0, 0.09, 0.13, 0.1);
  sphere(headP, skin, 0.37, 0.25, 0, 0.09, 0.13, 0.1);

  // Hair cap
  sphere(headP, hair, 0, 0.52, -0.015, 0.38, 0.24, 0.35);

  // Hair fringe
  sphere(headP, hair, -0.23, 0.43, 0.22, 0.17, 0.14, 0.19);
  sphere(headP, hair, 0.0, 0.47, 0.25, 0.17, 0.13, 0.16);
  sphere(headP, hair, 0.22, 0.43, 0.21, 0.16, 0.13, 0.16);

  // Eyes
  for (const side of [-1, 1]) {
    sphere(headP, eyeWhite, side * 0.14, 0.29, 0.302, 0.075, 0.09, 0.035);
    sphere(headP, iris, side * 0.14, 0.29, 0.335, 0.038, 0.05, 0.02);
    sphere(headP, black, side * 0.14, 0.29, 0.351, 0.019, 0.027, 0.01);
    sphere(headP, eyeWhite, side * 0.14 - 0.01, 0.31, 0.362, 0.012);
  }

  // Nose and smile
  sphere(headP, skin, 0, 0.20, 0.36, 0.055, 0.065, 0.065);

  const smile = mesh(
    new THREE.TorusGeometry(0.065, 0.012, 6, 12, Math.PI),
    hair, 0, 0.12, 0.335, headP
  );
  smile.rotation.z = Math.PI;

  // Neck
  capsule(g, skin, 0, 1.48, 0, 0.105, 0.12);

  // Arms
  function arm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.36, 1.35, 0);
    g.add(pivot);

    const upper = capsule(pivot, shirt, 0, -0.25, 0, 0.115, 0.27);
    upper.rotation.z = side * -0.08;

    capsule(pivot, skin, 0, -0.55, 0, 0.105, 0.12);

    return pivot;
  }

  // Legs
  function leg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.16, 0.69, 0);
    g.add(pivot);

    capsule(pivot, pants, 0, -0.26, 0, 0.13, 0.3);

    const shoe = mesh(
      new THREE.CapsuleGeometry(0.12, 0.17, 4, 8),
      shoes, 0, -0.59, 0.09, pivot
    );
    shoe.rotation.x = Math.PI / 2;

    return pivot;
  }

  // Small clothing detail
  sphere(g, shirtLight, 0.16, 1.08, 0.23, 0.055, 0.08, 0.025);

  return {
    g,
    headP,
    armL: arm(-1),
    armR: arm(1),
    legL: leg(-1),
    legR: leg(1)
  };
}

const ch = buildCharacter();
scene.add(ch.g);

const WALK_END = 5;
const STEP_HZ = 1.9;
const TOTAL_T = TOTAL / FPS;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function updateCharacter(t) {
  const e = ease(t / WALK_END);

  ch.g.position.x = -3.5 + 5.0 * e;
  ch.g.position.z = 0;

  const fade = clamp01(1 - Math.max(0, t - WALK_END) / 0.35);
  const gp = ease((t - WALK_END) / 0.8);
  const s = Math.sin(2 * Math.PI * STEP_HZ * t);

  ch.legL.rotation.x = 0.55 * s * fade;
  ch.legR.rotation.x = -0.55 * s * fade;

  ch.armL.rotation.x = -0.45 * s * fade - 0.25 * gp;
  ch.armR.rotation.x = 0.45 * s * fade - 2.0 * gp;
  ch.armR.rotation.z = 0.35 * Math.sin(2 * Math.PI * 2.2 * t) * gp;

  ch.headP.rotation.x = 0.08 * Math.sin(2 * Math.PI * 1.1 * t) * gp;

  ch.g.rotation.y = (Math.PI / 2) * (1 - gp);
  ch.g.position.y =
    0.045 * Math.abs(Math.sin(2 * Math.PI * STEP_HZ * t)) * fade;
}

const camFrom = new THREE.Vector3(7.5, 4.2, 11);
const camTo = new THREE.Vector3(4.5, 3.2, 8);
const target = new THREE.Vector3();

function updateCamera(t) {
  camera.position.lerpVectors(camFrom, camTo, ease(t / TOTAL_T));

  const gp = ease((t - WALK_END) / 0.8);

  target.set(
    ch.g.position.x + 0.8 * (1 - gp),
    1.45,
    ch.g.position.z
  );

  camera.lookAt(target);
}

function tick(i) {
  const t = i / FPS;
  updateCharacter(t);
  updateCamera(t);
  renderer.render(scene, camera);
}

updateCharacter(0);
updateCamera(0);
renderer.render(scene, camera);

window.tick = tick;
window.__total = TOTAL;
window.__ready = true;

