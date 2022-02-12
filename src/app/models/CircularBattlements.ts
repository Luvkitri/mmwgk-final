import {
  Mesh,
  MeshPhongMaterial,
  Texture,
  CylinderGeometry,
  MeshNormalMaterial,
  BoxGeometry,
  MathUtils,
} from "three";

import { CSG } from "three-csg-ts";

export class CircularBattlements extends Mesh {
  constructor(
    radius: number,
    height: number,
    x: number,
    y: number,
    z: number,
    texture: Texture
  ) {
    super();

    const baseCylinder = new Mesh(
      new CylinderGeometry(radius, radius, height, 38),
      new MeshPhongMaterial({ map: texture })
    );

    const cuttingCylinder = new Mesh(
      new CylinderGeometry(radius - 20, radius - 20, height, 38),
      new MeshNormalMaterial()
    );

    const cuttingBlock = new Mesh(
      new BoxGeometry(radius * 2 + 10, height, 35),
      new MeshNormalMaterial()
    );

    baseCylinder.updateMatrix();
    cuttingCylinder.updateMatrix();
    const ring = CSG.subtract(baseCylinder, cuttingCylinder);

    ring.updateMatrix();
    cuttingCylinder.updateMatrix();
    let battlements = CSG.subtract(ring, cuttingBlock);

    cuttingBlock.rotation.y = MathUtils.degToRad(45);
    cuttingBlock.updateMatrix();
    battlements.updateMatrix();
    battlements = CSG.subtract(battlements, cuttingBlock);

    cuttingBlock.rotation.y = MathUtils.degToRad(90);
    cuttingBlock.updateMatrix();
    battlements.updateMatrix();
    battlements = CSG.subtract(battlements, cuttingBlock);

    cuttingBlock.rotation.y = MathUtils.degToRad(135);
    cuttingBlock.updateMatrix();
    battlements.updateMatrix();
    battlements = CSG.subtract(battlements, cuttingBlock);

    this.geometry = battlements.geometry;
    this.material = new MeshPhongMaterial({ map: texture });

    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    this.castShadow = true;
    this.receiveShadow = true;
  }
}
