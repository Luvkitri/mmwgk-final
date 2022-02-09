import { BoxGeometry, Mesh, MeshBasicMaterial, Texture, MathUtils } from "three";

export class Wall extends Mesh {
  constructor(
    length: number,
    height: number,
    rotate: number,
    x: number,
    z: number,
    texture: Texture
  ) {
    super();
    this.geometry = new BoxGeometry(length, height, 100);
    this.material = new MeshBasicMaterial({ map: texture });

    this.position.x = x;
    this.position.y = 256;
    this.position.z = z;

    this.rotation.y = MathUtils.degToRad(rotate);
  }
}
