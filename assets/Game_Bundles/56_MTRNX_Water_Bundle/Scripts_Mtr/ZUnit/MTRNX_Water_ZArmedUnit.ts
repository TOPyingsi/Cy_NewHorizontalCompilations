import { _decorator, Node } from 'cc';
import { MTRNX_Water_ZUnit } from './MTRNX_Water_ZUnit';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_ZArmedUnit')
export class MTRNX_Water_ZArmedUnit extends MTRNX_Water_ZUnit {

    @property(Node)
    weapons: Node;

    onEnable(): void {
        super.onEnable();
        this.weapons.active = true;
    }

    Die(): void {
        super.Die();
        this.weapons.active = false;
    }
}


