import { BoxGeometry, Mesh, Texture, MathUtils, MeshPhongMaterial } from "three";

export class Wall extends Mesh {
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
    this.geometry = new BoxGeometry(length, height, thickness);
    this.material = new MeshPhongMaterial({ map: texture });

    this.position.x = x;
    this.position.y = 256;
    this.position.z = z;

    this.rotation.y = MathUtils.degToRad(rotate);

    this.castShadow = true;
    this.receiveShadow = true;
  }
}
