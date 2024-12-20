import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";

var defined = 'QXV0aG9yOiBMdWMg';
var datacenter = ['aHR0cHM6L', 'y93d3cuZmF', 'jZWJvb2suY29t'];

let scene = new THREE.Scene();
scene.background = new THREE.Color('#160016');
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 150, 400);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", event => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

let gu = {
    time: { value: 0 }
};

let clock = new THREE.Clock();

// Hàm tạo shift values
let pushShift = () => {
    return [
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
    ];
};

// Định nghĩa các màu cho các galaxy
const galaxyColors = [
    { color1: [42, 40, 154], color2: [209, 124, 196] },    // Tím - Hồng (màu gốc)
    { color1: [200, 40, 40], color2: [255, 150, 100] },    // Đỏ - Cam
    { color1: [40, 200, 40], color2: [150, 255, 100] },    // Xanh lá - Vàng nhạt
    { color1: [40, 40, 200], color2: [100, 150, 255] },    // Xanh dương - Xanh nhạt
    { color1: [200, 200, 40], color2: [255, 255, 100] },   // Vàng - Vàng nhạt
    { color1: [200, 40, 200], color2: [255, 100, 255] },   // Tím - Hồng
    { color1: [40, 200, 200], color2: [100, 255, 255] }    // Xanh ngọc - Xanh nhạt
];

// Tạo các galaxy
galaxyColors.forEach((colors, index) => {
    let sizes = [];
    let shift = [];
    let pts = [];

    // Tạo các điểm cho galaxy
    for (let i = 0; i < 50000; i++) {
        sizes.push(Math.random() * 1.5 + 0.5);
        shift.push(...pushShift());
        pts.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 0.5 + 9.5));
    }

    // Tạo thêm điểm cho hình dạng xoắn
    for (let i = 0; i < 100000; i++) {
        let r = 10, R = 40;
        let rand = Math.pow(Math.random(), 1.5);
        let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
        pts.push(new THREE.Vector3().setFromCylindricalCoords(
            radius,
            Math.random() * 2 * Math.PI,
            (Math.random() - 0.5) * 2
        ));
        sizes.push(Math.random() * 1.5 + 0.5);
        shift.push(...pushShift());
    }

    // Tạo geometry và material
    let g = new THREE.BufferGeometry().setFromPoints(pts);
    g.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
    g.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));

    let m = new THREE.PointsMaterial({
        size: 0.125,
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        onBeforeCompile: shader => {
            shader.uniforms.time = gu.time;
            shader.vertexShader = `
                uniform float time;
                attribute float sizes;
                attribute vec4 shift;
                varying vec3 vColor;
                ${shader.vertexShader}
            `.replace(
                `gl_PointSize = size;`,
                `gl_PointSize = size * sizes;`
            ).replace(
                `#include <color_vertex>`,
                `#include <color_vertex>
                float d = length(abs(position) / vec3(40., 10., 40));
                d = clamp(d, 0., 1.);
                vColor = mix(vec3(${colors.color1.join(',')}), vec3(${colors.color2.join(',')}), d) / 255.;
            `).replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                float t = time;
                float moveT = mod(shift.x + shift.z * t, PI2);
                float moveS = mod(shift.y + shift.z * t, PI2);
                transformed += vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.a;
            `);

            shader.fragmentShader = `
            varying vec3 vColor;
            ${shader.fragmentShader}
            `.replace(
                `#include <clipping_planes_fragment>`,
                `#include <clipping_planes_fragment>
                float d = length(gl_PointCoord.xy - 0.5);
                if (d > 0.5) discard;
            `).replace(
                `vec4 diffuseColor = vec4( diffuse, opacity );`,
                `vec4 diffuseColor = vec4( vColor, smoothstep(0.5, 0.1, d) );`
            );
        }
    });

    // Tạo và định vị galaxy
    let p = new THREE.Points(g, m);
    p.rotation.order = "ZYX";
    p.rotation.z = 0.2;
    
    // Đặt vị trí cho mỗi galaxy trong không gian 3D
    const radius = 200; // Khoảng cách từ tâm
    const angle = (index / galaxyColors.length) * Math.PI * 2;
    p.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 100, // Độ cao ngẫu nhiên
        Math.sin(angle) * radius
    );
    
    scene.add(p);
});

// Animation loop
renderer.setAnimationLoop(() => {
    controls.update();
    let t = clock.getElapsedTime() * 0.5;
    gu.time.value = t * Math.PI;
    renderer.render(scene, camera);
});
