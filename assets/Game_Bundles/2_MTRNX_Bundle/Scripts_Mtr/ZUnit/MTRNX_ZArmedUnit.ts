import { _decorator, Node } from 'cc';
import { MTRNX_ZUnit } from './MTRNX_ZUnit';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_ZArmedUnit')
export class MTRNX_ZArmedUnit extends MTRNX_ZUnit {

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


