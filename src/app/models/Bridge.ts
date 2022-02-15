import {
  BoxGeometry,
  Mesh,
  Texture,
  MathUtils,
  MeshPhongMaterial,
  Group,
} from "three";

export class Bridge extends Group {
  constructor(
    length: number,
    height: number,
    thickness: number,
    rotate: number,
    x: number,
    y: number,
    z: number,
    bridgeTexture: Texture,
    supportTexture: Texture
  ) {
    super();

    const platform = new Mesh(
      new BoxGeometry(length, height, thickness),
      new MeshPhongMaterial({ map: bridgeTexture })
    );

    const leftBridgeSupport = new Mesh(
      new BoxGeometry(80, 300, 80),
      new MeshPhongMaterial({ map: supportTexture })
    );

    leftBridgeSupport.position.x -= 110;
    leftBridgeSupport.position.y -= 150 + height / 2;
    leftBridgeSupport.position.z -= 120;

    const rightBridgeSupport = new Mesh(
      new BoxGeometry(80, 300, 80),
      new MeshPhongMaterial({ map: supportTexture })
    );

    rightBridgeSupport.position.x += 110;
    rightBridgeSupport.position.y -= 150 + height / 2;
    rightBridgeSupport.position.z -= 120;

    this.add(platform, leftBridgeSupport, rightBridgeSupport);

    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    this.rotation.y = MathUtils.degToRad(rotate);

    this.castShadow = true;
    this.receiveShadow = true;
  }
}
