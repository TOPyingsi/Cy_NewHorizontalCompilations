import { _decorator, Component, math, Node, Prefab, Vec3 } from 'cc';
import { CDXX_PoolManager } from './CDXX_PoolManager';
import { CDXX_EnemyController } from './CDXX_EnemyController';
const { ccclass, property } = _decorator;

@ccclass('CDXX_EnemyManager')
export class CDXX_EnemyManager extends Component {
    public static Instance: CDXX_EnemyManager = null;

    @property(Prefab)
    EnemyPrefab: Prefab[] = [];

    protected onLoad(): void {
        CDXX_EnemyManager.Instance = this;
    }

    CreateEnemy(index: number, pos: Vec3) {
        const enemy: Node = CDXX_PoolManager.Instance.get(this.EnemyPrefab[math.clamp(index, 0, this.EnemyPrefab.length - 1)]);
        enemy.parent = this.node;
        enemy.setWorldPosition(pos);
        enemy.getComponent(CDXX_EnemyController).Init();
    }

    Clear() {
        this.node.children.forEach(e => {
            CDXX_PoolManager.Instance.put(e);
        })
    }
}


