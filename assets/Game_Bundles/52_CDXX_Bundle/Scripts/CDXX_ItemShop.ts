import { _decorator, Component, Enum, Node } from 'cc';
import { CDXX_PICKAXE } from './CDXX_Constant';
const { ccclass, property } = _decorator;

@ccclass('CDXX_ItemShop')
export class CDXX_ItemShop extends Component {
    @property({ type: Enum(CDXX_PICKAXE) })
    Type: CDXX_PICKAXE = CDXX_PICKAXE.丛林魅影;

}


