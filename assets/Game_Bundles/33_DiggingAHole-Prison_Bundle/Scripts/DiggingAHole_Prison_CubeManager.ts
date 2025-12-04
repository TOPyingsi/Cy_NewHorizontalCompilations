import { _decorator, Component, find, Material, Node, PhysicsSystem, Prefab, v3, Vec3 } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { DiggingAHole_Prison_CubeGroup } from './DiggingAHole_Prison_CubeGroup';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_CubeManager')
export class DiggingAHole_Prison_CubeManager extends Component {

    private static instance: DiggingAHole_Prison_CubeManager;

    public static get Instance(): DiggingAHole_Prison_CubeManager {
        return this.instance;
    }

    @property(Prefab)
    cubePrefab: Prefab;

    @property(Prefab)
    cubeGroupPrefab: Prefab;

    @property(Node)
    endRoom: Node;

    @property([Prefab])
    treasPrefab: Prefab[] = [];

    cubeGroups: DiggingAHole_Prison_CubeGroup[] = [];
    isTime = false;

    protected onLoad(): void {
        DiggingAHole_Prison_CubeManager.instance = this;
    }

    start() {
        this.Init();
        // this.isTime = true;
        // this.Init();
        this.scheduleOnce(() => { this.isTime = true; }, 300);
    }

    update(deltaTime: number) {

    }

    Init(depth: number = 0, x: number = null, z: number = null) {
        if (this.isTime) {
            if (this.endRoom.active) return;
            let group = this.cubeGroups[this.cubeGroups.length - 1];
            let y = group.node.getPosition().y;
            y -= 2.4;
            let pos = this.endRoom.getPosition();
            pos.y = y;
            this.endRoom.setPosition(pos);
            this.endRoom.active = true;
        }
        else {
            let cube: Node = PoolManager.GetNodeByPrefab(this.cubeGroupPrefab, find("World"));
            let group = cube.getComponent(DiggingAHole_Prison_CubeGroup);
            group.Init(v3(3, depth, -3), x, z);
            this.cubeGroups.push(group);
        }
    }

    // CheckGroup() {
    //     var pos = DiggingAHoleCV_PlayerController.Instance.node.getWorldPosition();
    //     pos.multiplyScalar(1 / 8);
    //     pos.x = Math.floor(pos.x);
    //     pos.y = Math.floor(pos.y);
    //     pos.z = Math.floor(pos.z);
    // }
}


