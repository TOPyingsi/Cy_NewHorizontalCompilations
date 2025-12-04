import { _decorator, Component, find, Material, Node, PhysicsSystem, Prefab, v3, Vec3 } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { TaiKongWaJue_CubeGroup } from './TaiKongWaJue_CubeGroup';
import { TaiKongWaJue_PlayerController } from './TaiKongWaJue_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('TaiKongWaJue_CubeManager')
export class TaiKongWaJue_CubeManager extends Component {

    private static instance: TaiKongWaJue_CubeManager;

    public static get Instance(): TaiKongWaJue_CubeManager {
        return this.instance;
    }

    @property(Prefab)
    cubePrefab: Prefab;

    @property(Prefab)
    cubeGroupPrefab: Prefab;

    @property([Prefab])
    treasPrefab: Prefab[] = [];

    cubeGroups: TaiKongWaJue_CubeGroup[] = [];

    protected onLoad(): void {
        TaiKongWaJue_CubeManager.instance = this;
    }

    start() {
        this.Init();
    }

    update(deltaTime: number) {

    }

    Init(depth: number = 0, x: number = null, z: number = null) {
        let cube: Node = PoolManager.GetNodeByPrefab(this.cubeGroupPrefab, find("World"));
        let group = cube.getComponent(TaiKongWaJue_CubeGroup);
        group.Init(v3(3, depth, -3), x, z);
        this.cubeGroups.push(group);
    }

    // CheckGroup() {
    //     var pos = TaiKongWaJue_PlayerController.Instance.node.getWorldPosition();
    //     pos.multiplyScalar(1 / 8);
    //     pos.x = Math.floor(pos.x);
    //     pos.y = Math.floor(pos.y);
    //     pos.z = Math.floor(pos.z);
    // }
}


