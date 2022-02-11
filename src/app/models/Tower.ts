import { Mesh, MeshPhongMaterial, Texture, CylinderGeometry } from "three";

export class Tower extends Mesh {
  constructor(
    radius: number,
    height: number,
    x: number,
    z: number,
    texture: Texture
  ) {
    super();
    this.geometry = new CylinderGeometry(radius, radius, height, 38);
    this.material = new MeshPhongMaterial({ map: texture });

    this.position.x = x;
    this.position.y = 256;
    this.position.z = z;

    this.castShadow = true;
    this.receiveShadow = true;
  }
}
