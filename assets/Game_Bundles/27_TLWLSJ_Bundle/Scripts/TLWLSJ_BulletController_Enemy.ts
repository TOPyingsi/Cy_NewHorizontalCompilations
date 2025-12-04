import { _decorator, JsonAsset, misc, } from 'cc';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_BulletController_Enemy')
export class TLWLSJ_BulletController_Enemy extends TLWLSJ_BulletController {
    fire(bulletName: string, dirX: number, dirY: number) {
        this.Name = bulletName;
        this.DirX = dirX;
        this.DirY = dirY;

        BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "EnemyData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this.Name];
            this.Harm = json.harm;
        })

        let angleRadians = Math.atan2(this.DirY, this.DirX);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        this.node.angle = angleDegrees;
    }
}


