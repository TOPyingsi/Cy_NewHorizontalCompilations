import { _decorator, Component, math, Node, Prefab, Vec3 } from 'cc';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
import { CDXX2_EnemyController } from './CDXX2_EnemyController';
const { ccclass, property } = _decorator;

//“敌人管理器”作为单例，按索引从对象池取出对应敌人预制体并摆到指定坐标，战斗结束一键清空场景内所有敌人回池。

@ccclass('CDXX2_EnemyManager')
export class CDXX2_EnemyManager extends Component {
    public static Instance: CDXX2_EnemyManager = null;

    @property(Prefab)
    EnemyPrefab: Prefab[] = [];

    protected onLoad(): void {
        CDXX2_EnemyManager.Instance = this;
    }

    CreateEnemy(index: number, pos: Vec3) {
        const enemy: Node = CDXX2_PoolManager.Instance.get(this.EnemyPrefab[math.clamp(index, 0, this.EnemyPrefab.length - 1)]);
        enemy.parent = this.node;
        enemy.setWorldPosition(pos);
        enemy.getComponent(CDXX2_EnemyController).Init();
    }

    Clear() {
        this.node.children.forEach(e => {
            CDXX2_PoolManager.Instance.put(e);
        })
    }
}


