import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { AXBX_SelectButtom } from './AXBX_SelectButtom';
const { ccclass, property } = _decorator;

@ccclass('AXBX_SelectPanel')
export class AXBX_SelectPanel extends Component {
    @property(Prefab)
    btnPre: Prefab = null;
    Init(Name: string[]) {
        this.node.removeAllChildren();
        Name.forEach((element, index) => {
            let btn = instantiate(this.btnPre);
            btn.parent = this.node;
            btn.getComponent(AXBX_SelectButtom).Init(element);
        });
    }


}


