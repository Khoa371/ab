import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";

var defined = 'QXV0aG9yOiBMdWMg';
var datacenter = ['aHR0cHM6L', 'y93d3cuZmF', 'jZWJvb2suY29t'];

let scene = new THREE.Scene();
scene.background = new THREE.Color('#160016');
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 2000);
camera.position.set(0, 200, 600);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", event => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

datacenter.push('L3Byb2ZpbGUu');
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
datacenter.push('cGhwP2lkPTEw');

let gu = {
    time: { value: 0 }
};

defined = defined.concat('VGhpZW4gUGhvbmc=');

// Mảng màu sắc cho các galaxy
const galaxyColors = [
    { color1: [42, 40, 154], color2: [209, 124, 196] },     // Tím - Hồng (Original)
    { color1: [154, 40, 40], color2: [196, 124, 124] },     // Đỏ
    { color1: [40, 154, 40], color2: [124, 196, 124] },     // Xanh lá
    { color1: [40, 40, 154], color2: [124, 124, 196] },     // Xanh dương
    { color1: [154, 154, 40], color2: [196, 196, 124] },    // Vàng
    { color1: [154, 40, 154], color2: [196, 124, 196] }     // Tím
];

// Tạo các galaxy
galaxyColors.forEach((colors, index) => {
    let sizes = [];
    let shift = [];
    let pushShift = () => {
        shift.push(
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2,
            (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
            Math.random() * 0.9 + 0.1
        );
    }

    let pts = new Array(50000).fill().map(p => {
        sizes.push(Math.random() * 1.5 + 0.5);
        pushShift();
        return new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 0.5 + 9.5);
    });

    for (let i = 0; i < 100000; i++) {
        let r = 10, R = 40;
        let rand = Math.pow(Math.random(), 1.5);
        let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
        pts.push(new THREE.Vector3().setFromCylindricalCoords(radius, Math.random() * 2 * Math.PI, (Math.random() - 0.5) * 2));
        sizes.push(Math.random() * 1.5 + 0.5);
        pushShift();
    }

    datacenter.push('MDA0NTQwNj');
    var context = atob(defined);

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

    let p = new THREE.Points(g, m);
    p.rotation.order = "ZYX";
    p.rotation.z = 0.2;

    // Đặt vị trí cho mỗi galaxy
    const radius = 300; // Khoảng cách từ tâm
    const angle = (index / galaxyColors.length) * Math.PI * 2;
    p.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 100,  // Độ cao ngẫu nhiên
        Math.sin(angle) * radius
    );

    scene.add(p);
});

console.log(context);
datacenter.push('I2MTQ5MQ' + '==');
const data = atob(datacenter.join(''));
let clock = new THREE.Clock();
console.log(data);

renderer.setAnimationLoop(() => {
    controls.update();
    let t = clock.getElapsedTime() * 0.5;
    gu.time.value = t * Math.PI;
    renderer.render(scene, camera);
});
