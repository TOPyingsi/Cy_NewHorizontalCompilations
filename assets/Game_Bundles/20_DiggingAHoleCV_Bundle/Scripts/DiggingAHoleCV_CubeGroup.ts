import { _decorator, Collider, Component, MeshRenderer, Node, randomRange, randomRangeInt, v3, Vec2, Vec3 } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { DiggingAHoleCV_CubeManager } from './DiggingAHoleCV_CubeManager';
import { DiggingAHoleCV_PlayerController } from './DiggingAHoleCV_PlayerController';
import { DiggingAHoleCV_GameUI } from './DiggingAHoleCV_GameUI';
import { DiggingAHoleCV_Audio } from './DiggingAHoleCV_Audio';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHoleCV_CubeGroup')
export class DiggingAHoleCV_CubeGroup extends Component {

    cubes: CubeData[][][] = [];

    groupPos: Vec3;

    treasures: TreaData[] = [];

    // Init(pos: Vec3, cubeData: (number | Node)[][][][] = [], treas: (TreasureType | Vec3 | Node)[] = []) {
    Init(pos: Vec3, a: number, b: number) {
        this.groupPos = pos;
        this.node.setWorldPosition(v3(this.groupPos.x, this.groupPos.y * 24, this.groupPos.z));
        // if (cubeData.length > 0 && treas.length > 0) {
        //     for (let i = 0; i < cubeData.length; i++) {
        //         for (let j = 0; j < cubeData[i].length; j++) {
        //             for (let k = 0; k < cubeData[i][j].length; k++) {
        //                 const element = cubeData[i][j][k];
        //                 if (element[0] == 1) {
        //                     let cube = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.cubePrefab, this.node.children[0]);
        //                     cube.setPosition(v3(i, j, k));
        //                     element[1] = cube;
        //                 }
        //             }
        //         }
        //     }
        //     for (let i = 0; i < this.treasures.length; i++) {
        //         const element = this.treasures[i];
        //         let trea: Node = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.treasPrefab[element[0]], this.node.children[1]);
        //         trea.setPosition(element[1]);
        //         element[2] = trea;
        //     }
        // }
        // else {
        if (a == null || b == null) {
            for (let x = 0; x < 11; x++) {
                this.cubes.push([]);
                for (let y = 0; y < 24; y++) {
                    this.cubes[x].push([]);
                    for (let z = 0; z < 24; z++) {
                        if (x == 0 || x == 10 || z == 0 || z == 23) {
                            let cube: Node = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.cubePrefab, this.node.children[0]);
                            cube.setPosition(v3(x, y, z));
                            cube.children[3].active = true;
                            cube.getComponent(Collider).enabled = true;
                            this.cubes[x][y].push(new CubeData(cube, CubeType.Based));
                        }
                        else if (this.groupPos.y == 0 && y == 23) {
                            let cube: Node = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.cubePrefab, this.node.children[0]);
                            cube.setPosition(v3(x, y, z));
                            if (this.groupPos.y == 0) cube.children[0].active = true;
                            else cube.children[1].active = true;
                            cube.getComponent(Collider).enabled = true;
                            this.cubes[x][y].push(new CubeData(cube, CubeType.Collided));
                        }
                        else this.cubes[x][y].push(new CubeData(null, CubeType.Hided));
                    }
                }
            }
        }
        else {
            for (let x = 0; x < 11; x++) {
                this.cubes.push([]);
                for (let y = 0; y < 24; y++) {
                    this.cubes[x].push([]);
                    for (let z = 0; z < 24; z++) {
                        if (y != 23) this.cubes[x][y].push(new CubeData(null, CubeType.Hided));
                        else if (x < a - 1 || x > a + 1 || z < b - 1 || z > b + 1) this.cubes[x][y].push(new CubeData(null, CubeType.Hided));
                        else {
                            if (x == 0 || x == 10 || z == 0 || z == 23) {
                                let cube: Node = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.cubePrefab, this.node.children[0]);
                                cube.setPosition(v3(x, y, z));
                                cube.children[3].active = true;
                                cube.getComponent(Collider).enabled = true;
                                this.cubes[x][y].push(new CubeData(cube, CubeType.Based));
                            }
                            else {
                                let cube: Node = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.cubePrefab, this.node.children[0]);
                                cube.setPosition(v3(x, y, z));
                                cube.children[2].active = true;
                                cube.getComponent(Collider).enabled = true;
                                this.cubes[x][y].push(new CubeData(cube, CubeType.Collided));
                            }
                        }
                    }
                }
            }
        }
        let depth = this.groupPos.y;
        let treasLength = depth < 2 ? 1000 : 2000;
        for (let i = 0; i < treasLength; i++) {
            let randomTrea = randomRangeInt(0, DiggingAHoleCV_CubeManager.Instance.treasPrefab.length);
            let trea: Node = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.treasPrefab[randomTrea], this.node.children[1]);
            let randomPos = v3(randomRangeInt(0, 11), randomRangeInt(0, 24), randomRangeInt(0, 24));
            trea.setPosition(randomPos);
            let euler = v3(randomRange(0, 360), randomRange(0, 360), randomRange(0, 360));
            trea.setRotationFromEuler(euler);
            let data = new TreaData(randomTrea, randomPos, trea);
            this.treasures.push(data);
        }
        // }

    }

    Dig(cube: Node) {
        let pos = cube.getPosition();
        let data = this.cubes[pos.x][pos.y][pos.z];
        if (data.state == CubeType.Based) return;
        data.hp--;
        if (data.hp <= 0 + parseInt(localStorage.getItem("DAHCV_Dig"))) {
            data.cube = null;
            data.state = CubeType.Destroyed;
            for (let i = 0; i < cube.children.length; i++) {
                const element = cube.children[i];
                element.active = false;
            }
            cube.getComponent(Collider).enabled = false;
            cube.active = false;
            PoolManager.PutNode(cube);
            this.CheckDig(pos.x, pos.y, pos.z);
            DiggingAHoleCV_Audio.Instance.PlayAudio("dig");
        }
        else DiggingAHoleCV_Audio.Instance.PlayAudio("dig2");
    }

    CheckDig(x: number, y: number, z: number) {
        for (let i = x - 1; i < x + 2; i++) {
            for (let j = y - 1; j < y + 2; j++) {
                for (let k = z - 1; k < z + 2; k++) {
                    // if (i < 0 || i > 23 || j < 0 || j > 23 || k < 0 || k > 23) continue;
                    if (j < 0) {
                        let cubeGroup = DiggingAHoleCV_CubeManager.Instance.cubeGroups.find((value, index, obj) => {
                            if (value.groupPos.y == this.groupPos.y - 1) return value;
                        });
                        if (!cubeGroup) DiggingAHoleCV_CubeManager.Instance.Init(this.groupPos.y - 1, x, z);
                        else {
                            cubeGroup.CheckSingleDig(x, 23, z);
                        }
                        continue;
                    }
                    if (j > 23) {
                        let cubeGroup = DiggingAHoleCV_CubeManager.Instance.cubeGroups.find((value, index, obj) => {
                            if (value.groupPos.y == this.groupPos.y + 1) return value;
                        });
                        if (!cubeGroup && this.groupPos.y != 0) DiggingAHoleCV_CubeManager.Instance.Init(this.groupPos.y - 1, x, z);
                        else if (cubeGroup) {
                            cubeGroup.CheckSingleDig(x, 23, z);
                        }
                        continue;
                    }
                    let data = this.cubes[i][j][k];
                    if (data.state != CubeType.Hided) continue;
                    let cube = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.cubePrefab, this.node.children[0]);
                    cube.setPosition(v3(i, j, k));
                    cube.getComponent(Collider).enabled = true;
                    if (this.groupPos.y == 0) {
                        data.hp = 1;
                        if (i == 0 || i == 10 || k == 0 || k == 23) {
                            cube.children[3].active = true;
                            this.cubes[i][j][k].state = CubeType.Based;
                        }
                        else {
                            cube.children[1].active = true;
                            this.cubes[i][j][k].state = CubeType.Collided;
                        }
                    }
                    else {
                        data.hp = 5;
                        cube.children[2].active = true;
                        this.cubes[i][j][k].state = CubeType.Collided;
                    }
                    data.state = CubeType.Collided;
                }
            }
        }
    }

    CheckSingleDig(x: number, y: number, z: number) {
        for (let i = x - 1; i < x + 1; i++) {
            for (let j = z - 1; j < z + 1; j++) {
                let data = this.cubes[i][y][j];
                if (data.state != CubeType.Hided) continue;
                let cube = PoolManager.GetNodeByPrefab(DiggingAHoleCV_CubeManager.Instance.cubePrefab, this.node.children[0]);
                cube.setPosition(v3(i, y, j));
                cube.getComponent(Collider).enabled = true;
                if (this.groupPos.y == 0) {
                    data.hp = 1;
                    if (i == 0 || i == 10 || j == 0 || j == 23) {
                        cube.children[3].active = true;
                        this.cubes[i][y][j].state = CubeType.Based;
                    }
                    else {
                        cube.children[1].active = true;
                        this.cubes[i][y][j].state = CubeType.Collided;
                    }
                }
                else {
                    data.hp = 5;
                    cube.children[2].active = true;
                    this.cubes[i][y][j].state = CubeType.Collided;
                }
                data.state = CubeType.Collided;
            }
        }
    }

    DigTreasure(trea: Node) {
        let ind = -1;
        let data = this.treasures.find((value, index, obj) => {
            if (value.node == trea) {
                ind = index;
                return value;
            }
        });
        DiggingAHoleCV_GameUI.Instance.GetTrea(data.type);
        PoolManager.PutNode(trea);
        this.treasures.splice(ind, 1);
        let playerData = DiggingAHoleCV_PlayerController.Instance.Treasures;
        playerData[data.type]++;
        DiggingAHoleCV_PlayerController.Instance.Treasures = playerData;
    }

}

class CubeData {
    cube: Node;
    state: CubeType;
    hp: number = 1;
    constructor(_cube: Node, _state: CubeType) {
        this.cube = _cube;
        this.state = _state;
    }
}

class TreaData {
    type: TreasureType;
    pos: Vec3;
    node: Node;
    constructor(_type: TreasureType, _pos: Vec3, _node: Node) {
        this.type = _type;
        this.pos = _pos;
        this.node = _node;
    }
}

export enum TreasureType {
    煤炭, 绿宝石, 金块, 紫宝石, 红宝石, 钻石
}

export enum CubeType {
    Hided,
    Collided,
    Destroyed,
    Based
}
