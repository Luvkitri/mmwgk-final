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
  DirectionalLight,
  PCFSoftShadowMap,
  CameraHelper,
} from "three";
import { Stats } from "stats.ts";
import { Sky } from "./models/Sky";
import { Water } from "./models/Water";
import { Terrain } from "./models/Terrain";
import { OrbitControls } from "@three-ts/orbit-controls";
import * as dat from "dat.gui";

// Textures
import * as WaterTexture from "./assets/textures/waternormals.jpg";
import * as GrassTexture from "./assets/textures/grass-texture.jpg";
import * as DirtTexture from "./assets/textures/dirt-texture.jpg";
import * as WallTexture from "./assets/textures/stone-wall-texture.jpg";
import { Wall } from "./models/Wall";
import { Tower } from "./models/Tower";
import { StraightBattlements } from "./models/StraightBattlements";
import { CircularBattlements } from "./models/CircularBattlements";
import { GateBase } from "./models/GateBase";

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
    elevation: 40,
    azimuth: 68,
    exposure: 0.5,
  };

  private stats: Stats;
  private sun: Vector3;
  private sky: Sky;
  private terrain: Terrain;
  private gui: any;
  private water: Water;
  private light: DirectionalLight;

  constructor() {
    // Renderer config
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

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
      fog: true,
    });
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);

    // Add Light
    this.light = new DirectionalLight(0xffffff, 0.8);
    this.light.castShadow = true; // default false
    this.scene.add(this.light);

    this.light.shadow.camera.far = 10000;
    this.light.shadow.camera.left = -3000;
    this.light.shadow.camera.bottom = -3000;
    this.light.shadow.camera.right = 3000;
    this.light.shadow.camera.top = 3000;
    this.light.shadow.camera.near = 0.5;

    // Add Fog
    this.scene.fog = new Fog(new Color(0xdfe9f3), 1000, 10000);

    // Add gui
    this.gui = new dat.GUI();
    this.initGuiControls();

    // Add Terrain
    const terrainMultiplier = 8;
    this.terrain = new Terrain(
      512 * terrainMultiplier,
      512,
      512 * terrainMultiplier,
      new TextureLoader().load(GrassTexture, function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(terrainMultiplier, terrainMultiplier);
      }),
      new TextureLoader().load(DirtTexture, function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(terrainMultiplier, 2);
      })
    );
    this.scene.add(this.terrain);

    // Add Walls
    this.initWalls();

    // Add Towers
    this.initTowers();

    // Add Gate
    this.initGate();

    // Add Castle
    this.initCastle();

    // Add camera
    this.camera.position.set(5000, 1000, 5000);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.initCameraControls();

    // const helper = new CameraHelper(this.light.shadow.camera);
    // this.scene.add(helper);

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

    this.light.position.set(
      4000 * this.sun.x,
      4000 * this.sun.y,
      4000 * this.sun.z
    );

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

  private initWalls() {
    const wallTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(3, 2);
      }
    );

    const battlementTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(0.2, 0.2);
      }
    );

    const walls = [
      new Wall(700, 400, 100, 0, 0, 880, wallTexture), // north-west
      new Wall(350, 400, 100, 30, 550, 800, wallTexture), // west
      new Wall(500, 400, 100, 75, 800, 400, wallTexture), // left-gate-wall
      new Wall(500, 400, 100, 105, 800, -400, wallTexture), // rigth-gate-wall
      new Wall(350, 400, 100, 150, 550, -800, wallTexture), //south
      new Wall(700, 400, 100, 180, 0, -880, wallTexture), // south-east
      new Wall(700, 400, 100, 225, -600, -600, wallTexture), // east
      new Wall(700, 400, 100, 270, -880, 0, wallTexture), // north-east
      new Wall(700, 400, 100, 315, -600, 600, wallTexture), // north
    ];

    const battlements = [
      new StraightBattlements(700, 0, 0, 476, 920, battlementTexture),
      new StraightBattlements(350, 30, 620, 476, 805, battlementTexture),
      new StraightBattlements(500, 75, 820, 476, 490, battlementTexture),
      new StraightBattlements(500, 105, 820, 476, -490, battlementTexture),
      new StraightBattlements(350, 150, 570, 476, -835, battlementTexture),
      new StraightBattlements(700, 180, 0, 476, -920, battlementTexture),
      new StraightBattlements(700, 225, -630, 476, -630, battlementTexture),
      new StraightBattlements(700, 270, -920, 476, 0, battlementTexture),
      new StraightBattlements(700, 315, -630, 476, 630, battlementTexture),
    ];

    for (const wall of walls) {
      this.scene.add(wall);
    }

    for (const battlement of battlements) {
      this.scene.add(battlement);
    }
  }

  private initTowers() {
    const towerTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(2, 2);
      }
    );

    const battlementTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(2, 0.2);
      }
    );

    const towers = [
      new Tower(100, 600, 350, 880, towerTexture),
      new Tower(100, 600, -350, 880, towerTexture),
      new Tower(100, 600, 690, 690, towerTexture),
      new Tower(100, 600, -880, 300, towerTexture),
      new Tower(100, 600, -880, -300, towerTexture),
      new Tower(100, 600, 690, -690, towerTexture),
      new Tower(100, 600, -350, -880, towerTexture),
      new Tower(100, 600, 350, -880, towerTexture),
    ];

    const battlements = [
      new CircularBattlements(100, 40, 350, 576, 880, battlementTexture),
      new CircularBattlements(100, 40, -350, 576, 880, battlementTexture),
      new CircularBattlements(100, 40, 690, 576, 690, battlementTexture),
      new CircularBattlements(100, 40, -880, 576, 300, battlementTexture),
      new CircularBattlements(100, 40, -880, 576, -300, battlementTexture),
      new CircularBattlements(100, 40, 690, 576, -690, battlementTexture),
      new CircularBattlements(100, 40, -350, 576, -880, battlementTexture),
      new CircularBattlements(100, 40, 350, 576, -880, battlementTexture),
    ];

    for (const tower of towers) {
      this.scene.add(tower);
    }

    for (const battlement of battlements) {
      this.scene.add(battlement);
    }
  }

  private initGate() {
    const gateBaseTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(3, 2);
      }
    );

    const battlementTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(0.2, 0.2);
      }
    );

    const gateBaseBattlements = [
      new StraightBattlements(600, 90, 1030, 650, -50, battlementTexture),
      new StraightBattlements(600, 90, 770, 650, -50, battlementTexture),
      new StraightBattlements(300, 0, 950, 650, -270, battlementTexture),
      new StraightBattlements(300, 0, 950, 650, 270, battlementTexture),
    ];

    const gateBase = new GateBase(560, 750, 280, 90, 900, 0, gateBaseTexture);
    this.scene.add(gateBase);

    for (const gateBaseBattlement of gateBaseBattlements) {
      this.scene.add(gateBaseBattlement);
    }
  }

  private initCastle() {
    const wallTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(2, 2);
      }
    );

    const towerTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(3, 3);
      }
    );

    const straightBattlementTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(0.2, 0.2);
      }
    );

    const circularBattlementsTexture = new TextureLoader().load(
      WallTexture,
      function (texture) {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(2, 0.2);
      }
    );

    const castleWalls = [new Wall(700, 800, 700, 0, 0, 0, wallTexture)];

    const castleTowers = [
      new Tower(120, 1200, 350, -350, towerTexture),
      new Tower(120, 1200, 350, 350, towerTexture),
      new Tower(120, 1200, -350, -350, towerTexture),
      new Tower(120, 1200, -350, 350, towerTexture),
    ];

    const straightbBattlements = [
      new StraightBattlements(700, 0, 0, 676, -340, straightBattlementTexture),
      new StraightBattlements(700, 90, 340, 676, 0, straightBattlementTexture),
      new StraightBattlements(
        700,
        270,
        -340,
        676,
        0,
        straightBattlementTexture
      ),
      new StraightBattlements(700, 180, 0, 676, 340, straightBattlementTexture),
    ];

    const circularBattlements = [
      new CircularBattlements(
        120,
        40,
        350,
        876,
        -350,
        circularBattlementsTexture
      ),
      new CircularBattlements(
        120,
        40,
        350,
        876,
        350,
        circularBattlementsTexture
      ),
      new CircularBattlements(
        120,
        40,
        -350,
        876,
        -350,
        circularBattlementsTexture
      ),
      new CircularBattlements(
        120,
        40,
        -350,
        876,
        350,
        circularBattlementsTexture
      ),
    ];

    for (const wall of castleWalls) {
      this.scene.add(wall);
    }

    for (const tower of castleTowers) {
      this.scene.add(tower);
    }

    for (const battlement of straightbBattlements) {
      this.scene.add(battlement);
    }

    for (const battlement of circularBattlements) {
      this.scene.add(battlement);
    }
  }

  private render() {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
    this.adjustCanvasSize();

    // Water movement
    this.water.material.uniforms["time"].value += 1.0 / 60.0;
    this.stats.end();
  }
}
