import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Texture,
  TorusGeometry,
} from "three";
import { CSG } from 'three-csg-ts';

export class Terrain extends Mesh {
  constructor(
    width: number,
    height: number,
    depth: number,
    grassTexture: Texture,
    dirtTexture: Texture
  ) {
    super();
    const boxGeometry = new BoxGeometry(width, height, depth);
    const torusGeometry = new TorusGeometry(width / 3, height / 2, 16, 100)
    //const torusGeometry = new BoxGeometry(height, height * 2, height);
    // torusGeometry.translate(0, height * 2, 0);

    

    const materials = [
      new MeshBasicMaterial({ map: dirtTexture }),
      new MeshBasicMaterial({ map: grassTexture }),
      new MeshBasicMaterial({ map: dirtTexture }),
      new MeshBasicMaterial({ map: dirtTexture }),
      new MeshBasicMaterial({ map: dirtTexture }),
      new MeshBasicMaterial({ map: dirtTexture }),
    ];

    const torus = new Mesh(torusGeometry, new MeshNormalMaterial());
    torus.rotation.x = Math.PI / 2;
    torus.position.y += height / 3;
    const box = new Mesh(boxGeometry, new MeshNormalMaterial());
    
    // Make sure the .matrix of each mesh is current
    torus.updateMatrix();
    box.updateMatrix();

    const terrain = CSG.subtract(box, torus);

    this.geometry = terrain.geometry;
    this.material = materials;
  }
}
