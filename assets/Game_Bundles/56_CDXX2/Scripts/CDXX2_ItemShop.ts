import { _decorator, Component, Enum, Node } from 'cc';
import { CDXX2_PICKAXE } from './CDXX2_Constant';
const { ccclass, property } = _decorator;

//“商城条目”目前仅声明一把镐子枚举类型，后续可扩展价格、图标、购买逻辑等。

@ccclass('CDXX2_ItemShop')
export class CDXX2_ItemShop extends Component {
    @property({ type: Enum(CDXX2_PICKAXE) })
    Type: CDXX2_PICKAXE = CDXX2_PICKAXE.良品影刀;

}


