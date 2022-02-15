import { Object3D } from "three";

export class GatePivot extends Object3D {
  public openGate = false;

  constructor(x: number, y: number, z: number) {
    super();

    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  public close() {
    this.openGate = false;
  }

  public open() {
    this.openGate = true;
  }

  public animation() {
    if (this.openGate) {
      if (this.rotation.z > -Math.PI / 2) {
        this.rotation.z -= 0.01;
      }
    } else {
      if (this.rotation.z < 0) {
        this.rotation.z += 0.01;
      }
    }
  }
}
