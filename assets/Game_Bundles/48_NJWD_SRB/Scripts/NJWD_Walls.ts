import { _decorator, CCBoolean, Component, Node, Prefab, randomRange, RigidBody, v3, Vec3 } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { NJWD_GameManager } from './NJWD_GameManager';
const { ccclass, property } = _decorator;

@ccclass('NJWD_Walls')
export class NJWD_Walls extends Component {

    @property(CCBoolean)
    isPlayer = false;

    @property(Prefab)
    brickPrefab: Prefab;

    groups: Node[][] = [];

    protected start(): void {
        for (let i = 0; i < 20; i++) {
            let nodes: Node[] = [];
            let y = i * 0.1;
            for (let j = 0; j < 80; j++) {
                if (j > 80 / 2 - 3 && j < 80 / 2 + 3) {
                    nodes.push(null);
                    continue;
                }
                let brick: Node = PoolManager.GetNodeByPrefab(this.brickPrefab, this.node);
                brick.setPosition(v3(j * 0.2 + (i % 2 == 0 ? 0 : 0.1), y));
                nodes.push(brick);
            }
            this.groups.push(nodes);
        }
    }

    Hit(brick: Node) {
        let x = -1;
        let y = -1;
        for (let i = 0; i < this.groups.length; i++) {
            const element = this.groups[i];
            if (element.indexOf(brick) != -1) {
                x = i;
                y = element.indexOf(brick);
                break;
            }
        }
        if (x == -1 || y == -1) return;
        for (let i = x - 1; i <= x + 1; i++) {
            if (i < 0 || i > 19) continue;
            for (let j = y - 1; j <= y + 1; j++) {
                let element = this.groups[i][j];
                if (element) {
                    let dir = v3(j - y, randomRange(1, 5), this.isPlayer ? 1 : -1);
                    dir = dir.normalize().multiply3f(randomRange(1, 5), 1, randomRange(10, 20)).multiplyScalar(2);
                    let rig = element.getComponent(RigidBody);
                    rig.type = RigidBody.Type.DYNAMIC;
                    rig.setLinearVelocity(dir);
                    let rotate = v3(randomRange(1, 5), randomRange(1, 5), randomRange(1, 5));
                    rig.setAngularVelocity(rotate);
                    this.groups[i][j] = null;
                    element.setParent(NJWD_GameManager.Instance.brokenBricks, true);
                    element.name = "BrokenBrick";
                }
            }
        }
    }

}


