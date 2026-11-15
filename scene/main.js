import * as THREE from 'three';

const FPS = 24;
const TOTAL = 240; // 10 segundos
const W = 1280;
const H = 720;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd8ef);
scene.fog = new THREE.Fog(0x9fd8ef, 18, 42);

const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);

scene.add(new THREE.HemisphereLight(0xffffff, 0x6b8f71, 1.1));
const sun = new THREE.DirectionalLight(0xfff2d8, 1.6);
sun.position.set(6, 10, 4);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshToonMaterial({ color: 0x79c267 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

function tree(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * s, 0.32 * s, 1.1 * s, 6),
    new THREE.MeshToonMaterial({ color: 0x8a5a33 })
  );
  trunk.position.y = 0.55 * s;
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(1.05 * s, 2.0 * s, 7),
    new THREE.MeshToonMaterial({ color: 0x3f9d4f })
  );
  crown.position.y = 2.0 * s;
  g.add(trunk, crown);
  g.position.set(x, 0, z);
  return g;
}
[
  [-6, -2, 1.1],
  [5.5, 3, 1],
  [-8, 4, 1.3],
  [7, -3.5, 0.9],
  [0.5, -6.5, 1.2],
  [9, 1.5, 1],
].forEach(([x, z, s]) => scene.add(tree(x, z, s)));

const house = new THREE.Group();
const base = new THREE.Mesh(
  new THREE.BoxGeometry(3.2, 2.1, 2.6),
  new THREE.MeshToonMaterial({ color: 0xe9dcb8 })
);
base.position.y = 1.05;
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(2.9, 1.5, 4),
  new THREE.MeshToonMaterial({ color: 0xb5533c })
);
roof.position.y = 2.85;
roof.rotation.y = Math.PI / 4;
house.add(base, roof);
house.position.set(-1.5, 0, -5.5);
scene.add(house);

function buildCharacter() {
  const g = new THREE.Group();
  const mSkin = new THREE.MeshToonMaterial({ color: 0xf2c9a0 });
  const mShirt = new THREE.MeshToonMaterial({ color: 0x3b82f6 });
  const mPants = new THREE.MeshToonMaterial({ color: 0x2b3445 });
  const mShoe = new THREE.MeshToonMaterial({ color: 0x333333 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.32), mShirt);
  torso.position.y = 1.05;
  g.add(torso);

  const headP = new THREE.Group();
  headP.position.y = 1.42;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), mSkin);
  head.position.y = 0.26;
  headP.add(head);
  g.add(headP);

  function arm(side) {
    const p = new THREE.Group();
    p.position.set(0.38 * side, 1.36, 0);
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.58, 0.16), mShirt);
    a.position.y = -0.29;
    p.add(a);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), mSkin);
    hand.position.y = -0.62;
    p.add(hand);
    g.add(p);
    return p;
  }
  function leg(side) {
    const p = new THREE.Group();
    p.position.set(0.15 * side, 0.72, 0);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), mPants);
    l.position.y = -0.35;
    p.add(l);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), mShoe);
    f.position.set(0, -0.72, 0.05);
    p.add(f);
    g.add(p);
    return p;
  }
  return { g, headP, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) };
}

const ch = buildCharacter();
scene.add(ch.g);

const WALK_END = 5.0; // 0-5s: anda; 5-10s: para e acena
const STEP_HZ = 1.9;
const TOTAL_T = TOTAL / FPS;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (u) => {
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
};

function updateCharacter(t) {
  const e = ease(t / WALK_END);
  ch.g.position.x = -3.5 + 5.0 * e;
  ch.g.position.z = 0;

  const fade = clamp01(1 - Math.max(0, t - WALK_END) / 0.35); // desliga ciclo de andar
  const gp = ease((t - WALK_END) / 0.8); // liga gesto de acenar
  const s = Math.sin(2 * Math.PI * STEP_HZ * t);

  ch.legL.rotation.x = 0.55 * s * fade;
  ch.legR.rotation.x = -0.55 * s * fade;
  ch.armL.rotation.x = -0.45 * s * fade - 0.25 * gp;
  ch.armL.rotation.z = 0;
  ch.armR.rotation.x = 0.45 * s * fade - 2.15 * gp;
  ch.armR.rotation.z = 0.35 * Math.sin(2 * Math.PI * 2.2 * t) * gp;
  ch.headP.rotation.x = 0.12 * Math.sin(2 * Math.PI * 1.1 * t) * gp;
  ch.g.rotation.y = (Math.PI / 2) * (1 - gp);
  ch.g.position.y = 0.045 * Math.abs(Math.sin(2 * Math.PI * STEP_HZ * t)) * fade;
}

const camFrom = new THREE.Vector3(6.5, 2.7, 8.5);
const camTo = new THREE.Vector3(3.4, 1.7, 5.6);
const target = new THREE.Vector3();

function updateCamera(t) {
  camera.position.lerpVectors(camFrom, camTo, ease(t / TOTAL_T));
  const gp = ease((t - WALK_END) / 0.8);
  target.set(ch.g.position.x + 0.8 * (1 - gp), 1.35, ch.g.position.z + 0.4 * (1 - gp));
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
