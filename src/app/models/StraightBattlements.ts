import {
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  Texture,
  MathUtils,
  Group,
} from "three";

export class StraightBattlements extends Group {
  constructor(
    length: number,
    rotate: number,
    x: number,
    y: number,
    z: number,
    texture: Texture
  ) {
    super();

    let battlementPosX = -length / 2;
    for (let i = 0; i < length; i += 100) {
      let battlement = new Mesh(
        new BoxGeometry(60, 40, 20),
        new MeshPhongMaterial({ map: texture })
      );
      battlement.position.x = battlementPosX;
      battlement.castShadow = true;
      battlement.receiveShadow = true
      this.add(battlement);
      battlementPosX += 100;
    }

    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    this.rotation.y = MathUtils.degToRad(rotate);

    this.castShadow = true;
    this.receiveShadow = true;
  }
}
