import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZGMMT_Constant, SJZGMMT_PropDataItem } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_KnapsackPropBox')
export class SJZGMMT_KnapsackPropBox extends Component {
    public PropData: SJZGMMT_PropDataItem = null;
    start() {
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.背包物品选中, this.Select, this);
    }

    Init(Name: string) {
        this.PropData = SJZGMMT_Constant.getPropDataByName(Name);
        this.node.getChildByName("背包选中框").active = false;
        this.node.getChildByName("名字").getComponent(Label).string = this.PropData.Name;
        this.node.getChildByName("重量").getComponent(Label).string = `重量:${this.PropData.weight}`;
        this.node.getChildByName("价格").getComponent(Label).string = `${SJZGMMT_Incident.GetMaxNum(this.PropData.price)}`;
        SJZGMMT_UIManager.Instance.GetPropSprite(this.PropData.Name).then((sp: SpriteFrame) => {
            this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
        })
        SJZGMMT_Incident.LoadSprite("Sprites/仓库/" + SJZGMMT_Constant.QuaLityList[this.PropData.quality]).then((sp: SpriteFrame) => {
            this.node.getChildByName("框").getComponent(Sprite).spriteFrame = sp;
        })
    }
    Select(node: Node) {
        if (node == this.node) {
            this.node.getChildByName("背包选中框").active = true;
        } else {
            this.node.getChildByName("背包选中框").active = false;
        }
    }
    OnClick() {
        SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.背包物品选中, this.node);
    }
}


