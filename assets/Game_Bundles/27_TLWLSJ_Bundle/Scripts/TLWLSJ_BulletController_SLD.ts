import { _decorator, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
import { TLWLSJ_Explosion_Grenade } from './TLWLSJ_Explosion_Grenade';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_BulletController_SLD')
export class TLWLSJ_BulletController_SLD extends TLWLSJ_BulletController {
    removeSelf() {
        this.IsRemove = true;
        const worldPos = this.node.getWorldPosition().clone();
        const angle = this.node.angle;
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "爆炸效果_手榴弹").then((prefab: Prefab) => {
            const hit = instantiate(prefab);
            hit.parent = TLWLSJ_GameManager.Instance.Canvas;
            hit.getComponent(TLWLSJ_Explosion_Grenade).show(worldPos, angle, this.Harm, this.ArmorPenetration);
        })
        this.scheduleOnce(() => { this.node.destroy(); })
    }

}


