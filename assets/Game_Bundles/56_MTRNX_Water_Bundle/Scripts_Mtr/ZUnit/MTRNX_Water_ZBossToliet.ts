import { Prefab, Sprite, _decorator } from 'cc';
import { MTRNX_Water_ZUnit } from './MTRNX_Water_ZUnit';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_ZBossToliet')
export class MTRNX_Water_ZBossToliet extends MTRNX_Water_ZUnit {

    Die(): void {
        super.Die();
        var sprite = this.node.children[0].children[0].getComponent(Sprite);
        if (sprite.color.a != 0) sprite.color.set(255, 0, 0, 0);
    }
}


