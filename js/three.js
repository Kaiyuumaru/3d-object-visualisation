import * as TWEEN from "https://esm.sh/@tweenjs/tween.js@25.0.0";
import * as THREE from "https://esm.sh/three@0.180.0";
import {CSS3DRenderer, CSS3DObject} from "https://esm.sh/three@0.180.0/examples/jsm/renderers/CSS3DRenderer.js";
import {TrackballControls} from "https://esm.sh/three@0.180.0/examples/jsm/controls/TrackballControls.js";

const tweenGroup = new TWEEN.Group();

//Scene -> Camera -> Renderer -> Objects/Geometry/Materials -> Lights -> Animation Loop
//SCENE ----------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

//CAMERA ---------------------------------------------
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 3000);

//RENDERER -------------------------------------------
const renderer = new CSS3DRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("threeJS").appendChild(renderer.domElement);

//CONTROLS -------------------------------------------
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 0.4;
controls.zoomSpeed = 4;
controls.panSpeed = 4;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.15;
controls.minDistance = 500;
controls.maxDistance = 6000;

//OBJECTS AND LAYOUT ---------------------------------
const rows = storedData.values;
const elements = rows.slice(1).map(function(row){
    return{
        name: row[0] || "",
        photo: row[1] || "",
        age: row[2] || "",
        country: row[3] || "",
        interest: row[4] || "",
        netWorth: row[5] || ""
    };
});

console.log("Number of records :", elements.length);
console.log("First record: ", elements[0]);

function parseNetWorth(netWorth){
    if(typeof netWorth ==="Number"){return netWorth;}
    if(!netWorth){return 0;}

    let text = String(netWorth).trim().replace(/[$,]/g, "").toUpperCase();
    const number = parseFloat(text);
    return isNaN(number) ? 0 : number;
}

const netWorthValues = elements.map(function(data){
    return parseNetWorth(data.netWorth);
})

const minNetWorth = Math.min(...netWorthValues);
const maxNetWorth = Math.max(...netWorthValues);

function getNetWorthColor(netWorth){
    const value = parseNetWorth(netWorth);

    if(maxNetWorth === minNetWorth){
        return "#FDCA36";
    }

    const t = (value - minNetWorth) / (maxNetWorth - minNetWorth);

    if(t <= 0.5){
        return interpolateColor("#EF3022", "#FDCA36", t/0.5);
    }

    return interpolateColor("#FDCA36", "#3A9F48", (t-0.5)/0.5);
}

function interpolateColor(color1, color2, amount){
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const R = Math.round(r1 + (r2-r1)*amount);
    const G = Math.round(g1 + (g2-g1)*amount);
    const B = Math.round(b1 + (b2-b1)*amount);

    return `rgb(${R}, ${G}, ${B})`;
}

function rgbToRGBA(rgb, alpha){
    const values = rgb.match(/\d+/g).map(Number);

    return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
}

const objects = [];
elements.forEach(function(data){
    const element = document.createElement("div");
    element.className = "element";
    element.style.backgroundColor = rgbToRGBA(getNetWorthColor(data.netWorth), 0.5);
    element.style.borderColor = getNetWorthColor(data.netWorth);
    element.innerHTML = `<div class="top-row">
                            <div class="country">${data.country}</div>
                            <div class="age">${data.age}</div>
                         </div>

                         <div class="photo-container">
                            <div class="photo" alt="${data.name}"><img src="${data.photo}" style="width:100px; height:100px"></div>
                         </div>
                         
                         <div class="name">${data.name}</div>
                         <div class="interest">${data.interest}</div>`;

    const object = new CSS3DObject(element);
    object.position.set(0, 0, 0);
    scene.add(object);
    objects.push(object);
});

//TABLE-FORMAT OBJECTS ------------------------------
const targets = {table: []};
const tableColumns = 20;
const tableRows = 10;
const tableSpacingX = 150;
const tableSpacingY = 180;

elements.forEach(function(data, index){
    const column = index % tableColumns;
    const row = Math.floor(index/tableColumns);

    const target = new THREE.Object3D();
    target.position.x = (column - 9.5) * tableSpacingX;
    target.position.y = -(row - 4.5) * tableSpacingY;
    target.position.z = 0;
    targets.table.push(target);
});

//GRID-FORMAT OBJECTS -------------------------------
targets.grid = [];
const gridX = 5;
const gridY = 4;
const gridZ = 10;
const gridSpacingX = 300;
const gridSpacingY = 300;
const gridSpacingZ = 180;

elements.forEach(function(data, index){
    const x = index % gridX;
    const y = Math.floor(index/gridX) % gridY;
    const z = Math.floor(index/(gridX * gridY)) % gridZ;

    const target = new THREE.Object3D();
    target.position.x = (x-(gridX-1)/2) * gridSpacingX;
    target.position.y = -(y-(gridY-1)/2) * gridSpacingY;
    target.position.z = (z-(gridZ-1)/2) * gridSpacingZ;
    targets.grid.push(target);
})

//HELIX-FORMAT OBJECTS ------------------------------
targets.helix = [];
const helixRadius = 800;
const helixHeight = 1800;
const helixTurns = 4;
const elementsPerStrand = Math.ceil(elements.length/2);

elements.forEach(function(data, index){
    const strand = index % 2;
    const strandIndex = Math.floor(index/2);
    const progress = strandIndex / (elementsPerStrand - 1);
    const theta = progress * Math.PI * 2 * helixTurns;
    const offset = strand * Math.PI;
    const angle = theta + offset;

    const target = new THREE.Object3D();
    target.position.x = helixRadius * Math.cos(angle);
    target.position.y = (0.5 - progress) * helixHeight;
    target.position.z = helixRadius * Math.sin(angle);
    target.lookAt(0, target.position.y, 0);
    targets.helix.push(target);
})

//SPHERE-FORMAT OBJECTS -----------------------------
targets.sphere = [];
const sphereRadius = 900;
elements.forEach(function(data, index){
    const phi = Math.acos(-1 + (2 * index)/elements.length);
    const theta = Math.sqrt(elements.length * Math.PI) * phi;

    const target = new THREE.Object3D();
    target.position.x = sphereRadius * Math.cos(theta) * Math.sin(phi);
    target.position.y = sphereRadius * Math.sin(theta) * Math.sin(phi);
    target.position.z = sphereRadius * Math.cos(phi);
    target.lookAt(0, 0, 0);
    targets.sphere.push(target);
});

function transform(targetsArray, duration){
    tweenGroup.removeAll();

    for(let i = 0; i < objects.length; i++){
        const object = objects[i];
        const target = targetsArray[i];

        const positionTween = new TWEEN.Tween(object.position)
            .to({x: target.position.x, y: target.position.y, z: target.position.z}, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        const rotationTween =new TWEEN.Tween(object.rotation)
            .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        tweenGroup.add(positionTween);
        tweenGroup.add(rotationTween);
        positionTween.start();
        rotationTween.start();
    }
}

//ANIMATION LOOP -------------------------------------
function animate(time){
    requestAnimationFrame(animate);

    tweenGroup.update(time);
    controls.update();
    renderer.render(scene, camera);
}

animate();
transform(targets.table, 2000);
document.getElementById("tableFormat").addEventListener("click", function(){transform(targets.table, 2000)});
document.getElementById("gridFormat").addEventListener("click", function(){transform(targets.grid, 2000)});
document.getElementById("helixFormat").addEventListener("click", function(){transform(targets.helix, 2000)});
document.getElementById("sphereFormat").addEventListener("click", function(){transform(targets.sphere, 2000)});

//RESPONSIVE ---------------------------------------
window.addEventListener("resize", function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log("Three.js version: ", THREE.REVISION);