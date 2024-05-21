import * as THREE from 'three'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Sky } from 'three/addons/objects/Sky.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let camera, scene, renderer, cube

let sky, sun

init()
render()

function initSky() {
  sky = new Sky()
  sky.scale.setScalar(4500.0)
  scene.add(sky)
  sun = new THREE.Vector3()

  const boxGeometry = new THREE.BoxGeometry(300, 40, 400)
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x243c4c })
  cube = new THREE.Mesh(boxGeometry, boxMaterial)
  cube.position.set(-700, -100, -50)
  scene.add(cube)

  const spotLight = new THREE.SpotLight(0x8194a4)
  spotLight.position.set(200, -1000, 500)
  spotLight.intensity = 2
  scene.add(spotLight)

  let model

  const gLoader = new GLTFLoader()

  gLoader.load(
    'assets/M-Logo.glb',
    function (gltf) {
      model = gltf.scene
      model.scale.set(25, 25, 25)
      model.position.set(500, -200, 250)
      model.rotation.set(0, -20, -20)
      scene.add(model)
    },

    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },

    function (error) {
      console.log('An error happened')
    }
  )

  const effectController = {
    turbidity: 30,
    rayleigh: 1.492,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.705,
    elevation: 10.3,
    azimuth: 153.4,
    exposure: renderer.toneMappingExposure,
  }

  function guiChanged() {
    const uniforms = sky.material.uniforms

    uniforms['turbidity'].value = 30
    uniforms['rayleigh'].value = 1.492
    uniforms['mieCoefficient'].value = 0.001
    uniforms['mieDirectionalG'].value = 0.705

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation)
    const theta = THREE.MathUtils.degToRad(effectController.azimuth)

    sun.setFromSphericalCoords(1, phi, theta)

    uniforms['sunPosition'].value.copy(sun)

    renderer.toneMappingExposure = effectController.exposure
    renderer.render(scene, camera)
  }

  const gui = new GUI()

  gui.add(effectController, 'turbidity', 0.0, 2.0, 0.1).onChange(guiChanged)
  gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged)
  gui
    .add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001)
    .onChange(guiChanged)
  gui
    .add(effectController, 'mieDirectionalG', 0.0, 1, 0.001)
    .onChange(guiChanged)
  gui.add(effectController, 'elevation', 0, 90, 0.1).onChange(guiChanged)
  gui.add(effectController, 'azimuth', -180, 180, 0.1).onChange(guiChanged)
  gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged)

  guiChanged()
  gui.hide()
}

function init() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    100,
    2000000
  )
  camera.position.set(200, -1000, 500)

  scene = new THREE.Scene()

  // const helper = new THREE.GridHelper(10000, 2, 0xffffff, 0xffffff)
  // scene.add(helper)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  document.body.appendChild(renderer.domElement)
  renderer.setPixelRatio(4)

  const controls = new OrbitControls(camera, renderer.domElement)
  // controls.addEventListener('change', render)
  //controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = false
  controls.enablePan = true

  initSky()
  controls.update()
  window.addEventListener('resize', onWindowResize)
}

function animateCube() {
  requestAnimationFrame(animateCube)
  cube.rotation.y += 0.001
  cube.rotation.x += 0.001
  cube.rotation.z += 0.01

  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

  render()
}

function render() {
  renderer.render(scene, camera)
}

animateCube()
