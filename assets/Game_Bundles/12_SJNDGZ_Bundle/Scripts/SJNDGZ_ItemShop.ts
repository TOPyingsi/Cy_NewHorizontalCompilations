import { _decorator, Component, Enum, Node } from 'cc';
import { SJNDGZ_PICKAXE } from './SJNDGZ_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_ItemShop')
export class SJNDGZ_ItemShop extends Component {
    @property({ type: Enum(SJNDGZ_PICKAXE) })
    Type: SJNDGZ_PICKAXE = SJNDGZ_PICKAXE.木镐;
}


