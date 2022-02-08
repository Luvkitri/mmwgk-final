import {
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  MathUtils,
  sRGBEncoding,
  ACESFilmicToneMapping,
} from "three";
import { Sky } from "./models/sky";
import { OrbitControls } from "@three-ts/orbit-controls";
import { Brick } from "./brick";
import * as dat from "dat.gui";

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

  private sun: Vector3;
  private sky: Sky;
  private brick: Brick;
  private gui: any;

  constructor() {
    this.brick = new Brick(100, new Color("rgb(255,0,0)"));
    this.scene.add(this.brick);

    // Add Sky
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    this.scene.add(this.sky);

    // Add Sun
    this.sun = new Vector3(0, 0, 0);

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

    this.renderer.toneMappingExposure = this.effectController.exposure;
  }

  private initGuiControls() {
    // Add controls
    const skyFolder = this.gui.addFolder("Sky");
    skyFolder
      .add(this.effectController, "elevation", 0, 90, 0.1)
      .onChange(() => this.guiChanged());
    skyFolder
      .add(this.effectController, "azimuth", -180, 180, 0.1)
      .onChange(() => this.guiChanged());
    skyFolder.open();

    this.guiChanged();
  }

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
    this.adjustCanvasSize();
    this.brick.rotateY(0.03);
  }
}
