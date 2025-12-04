import { _decorator, instantiate, Prefab } from 'cc';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_Explosion_Bullet } from './TLWLSJ_Explosion_Bullet';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';

const { ccclass, property } = _decorator;


@ccclass('TLWLSJ_BulletController_LDP')
export class TLWLSJ_BulletController_LDP extends TLWLSJ_BulletController {

    removeSelf() {
        this.IsRemove = true;
        const worldPos = this.node.getWorldPosition().clone();
        const angle = this.node.angle;
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "爆炸效果_子弹").then((prefab: Prefab) => {
            const hit = instantiate(prefab);
            hit.parent = TLWLSJ_GameManager.Instance.Canvas;
            hit.getComponent(TLWLSJ_Explosion_Bullet).show(worldPos, angle, this.Harm, this.ArmorPenetration);
        })
        this.scheduleOnce(() => { this.node.destroy(); })
    }
}


