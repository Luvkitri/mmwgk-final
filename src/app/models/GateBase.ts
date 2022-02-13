import {
  BoxGeometry,
  Mesh,
  Texture,
  MathUtils,
  MeshPhongMaterial,
  MeshNormalMaterial,
  CylinderGeometry,
} from "three";
import { CSG } from "three-csg-ts";

export class GateBase extends Mesh {
  constructor(
    length: number,
    height: number,
    thickness: number,
    rotate: number,
    x: number,
    z: number,
    texture: Texture
  ) {
    super();

    const base = new Mesh(
      new BoxGeometry(length, height, thickness),
      new MeshPhongMaterial({ map: texture })
    );

    const gateBottomCutOut = new Mesh(
      new BoxGeometry(length / 2, height / 2, thickness),
      new MeshNormalMaterial()
    );

    const gateTopCutOut = new Mesh(
      new CylinderGeometry(length / 4, length / 4, thickness, 38),
      new MeshNormalMaterial()
    );

    gateTopCutOut.rotation.x = MathUtils.degToRad(90);
    gateTopCutOut.position.y += length / 4 + 25;

    gateBottomCutOut.updateMatrix();
    gateTopCutOut.updateMatrix();
    const gateCutOut = CSG.union(gateBottomCutOut, gateTopCutOut);

    gateCutOut.updateMatrix();
    base.updateMatrix();
    const gateBase = CSG.subtract(base, gateCutOut);


    this.geometry = gateBase.geometry;
    this.material = new MeshPhongMaterial({ map: texture });

    this.position.x = x;
    this.position.y = 256;
    this.position.z = z;

    this.rotation.y = MathUtils.degToRad(rotate);

    this.castShadow = true;
    this.receiveShadow = true;
  }
}
