import {
  BoxGeometry,
  Mesh,
  Texture,
  MathUtils,
  MeshPhongMaterial,
  CylinderGeometry,
  Group,
} from "three";
import { CSG } from "three-csg-ts";

export class Gate extends Group {
  public openGate = false;

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

    const gateBottomCutOut = new Mesh(
      new BoxGeometry(length / 2, height / 2, thickness),
      new MeshPhongMaterial({ map: texture })
    );

    gateBottomCutOut.rotation.y = MathUtils.degToRad(90);
    gateBottomCutOut.updateMatrix();

    const gateTopCutOut = new Mesh(
      new CylinderGeometry(length / 4, length / 4, thickness, 38),
      new MeshPhongMaterial({ map: texture })
    );

    gateTopCutOut.position.y += 80;
    gateTopCutOut.rotation.z = MathUtils.degToRad(90);
    gateTopCutOut.updateMatrix();

    const top = CSG.subtract(gateTopCutOut, gateBottomCutOut);

    this.add(gateBottomCutOut, top);

    this.position.x = 0;
    this.position.y = 88; // 344
    this.position.z = 0;

    this.castShadow = true;
    this.receiveShadow = true;
  }
}
