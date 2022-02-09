import {
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  MathUtils,
  sRGBEncoding,
  ACESFilmicToneMapping,
  PlaneGeometry,
  TextureLoader,
  RepeatWrapping,
  Fog,
} from "three";
import { Stats } from "stats.ts";
import { Sky } from "./models/Sky";
import { Water } from "./models/Water";
import { OrbitControls } from "@three-ts/orbit-controls";
import { Brick } from "./brick";
import * as dat from "dat.gui";
import * as WaterTexture from "./assets/textures/waternormals.jpg";

export class App {
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(
    45,
    innerWidth / innerHeight,
    0.1,
    10000
  );
  private readonly renderer = new WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("main-canvas") as HTMLCanvasElement,
  });

  private effectController = {
    turbidity: 0,
    rayleigh: 0.3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 14,
    azimuth: -135,
    exposure: 0.5,
  };

  private stats: Stats;
  private sun: Vector3;
  private sky: Sky;
  private brick: Brick;
  private gui: any;
  private water: Water;

  constructor() {
    this.brick = new Brick(100, new Color("rgb(255,0,0)"));
    this.scene.add(this.brick);

    // Add FPS Counter
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    // Add Sky
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    this.scene.add(this.sky);

    // Add Sun
    this.sun = new Vector3(0, 0, 0);

    // Add Water
    this.water = new Water(new PlaneGeometry(10000, 10000), {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new TextureLoader().load(WaterTexture, function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
      }),
      sunDirection: new Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: true
    });
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);

    // Add Fog
    this.scene.fog = new Fog(new Color(0xDFE9F3), 1000, 8000)

    // Add gui
    this.gui = new dat.GUI();

    // Add camera
    this.camera.position.set(1000, 100, 1000);
    this.camera.lookAt(new Vector3(0, 0, 0));

    // Renderer config
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMapping = ACESFilmicToneMapping;

    this.initCameraControls();
    this.initGuiControls();
    this.render();
  }

  private initCameraControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;

    // How far you can dolly in and out ( PerspectiveCamera only )
    controls.minDistance = 0;
    controls.maxDistance = Infinity;

    controls.enableZoom = true; // Set to false to disable zooming
    controls.zoomSpeed = 1.0;

    controls.enablePan = true; // Set to false to disable panning (ie vertical and horizontal translations)

    controls.enableDamping = true; // Set to false to disable damping (ie inertia)
    controls.dampingFactor = 0.25;
  }

  private guiChanged() {
    const uniforms = this.sky.material.uniforms;
    uniforms["turbidity"].value = this.effectController.turbidity;
    uniforms["rayleigh"].value = this.effectController.rayleigh;
    uniforms["mieCoefficient"].value = this.effectController.mieCoefficient;
    uniforms["mieDirectionalG"].value = this.effectController.mieDirectionalG;

    const phi = MathUtils.degToRad(90 - this.effectController.elevation);
    const theta = MathUtils.degToRad(this.effectController.azimuth);

    this.sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(this.sun);
    this.water.material.uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();

    this.renderer.toneMappingExposure = this.effectController.exposure;
  }

  private initGuiControls() {
    // Add controls
    const folderSky = this.gui.addFolder("Sky");
    folderSky
      .add(this.effectController, "elevation", 0, 90, 0.1)
      .onChange(() => this.guiChanged());
    folderSky
      .add(this.effectController, "azimuth", -180, 180, 0.1)
      .onChange(() => this.guiChanged());
    folderSky.open();

    const waterUniforms = this.water.material.uniforms;

    const folderWater = this.gui.addFolder("Water");
    folderWater
      .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
      .name("distortionScale");
    folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
    folderWater.open();

    this.guiChanged();
  }

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private render() {
    this.stats.begin()
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
    this.adjustCanvasSize();
    this.brick.rotateY(0.03);

    // Water movement
    this.water.material.uniforms["time"].value += 1.0 / 60.0;
    this.stats.end()
  }
}
