import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZXD_Constant, SJZXD_PropDataItem } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_KnapsackPropBox')
export class SJZXD_KnapsackPropBox extends Component {
    public PropData: SJZXD_PropDataItem = null;
    start() {
        SJZXD_UIManager.Instance.SJZXD_On(SJZXD_EventManager.背包物品选中, this.Select, this);
    }

    Init(Name: string) {
        this.PropData = SJZXD_Constant.getPropDataByName(Name);
        this.node.getChildByName("背包选中框").active = false;
        this.node.getChildByName("名字").getComponent(Label).string = this.PropData.Name;
        this.node.getChildByName("重量").getComponent(Label).string = `重量:${this.PropData.weight}`;
        this.node.getChildByName("价格").getComponent(Label).string = `${SJZXD_Incident.GetMaxNum(this.PropData.price)}`;
        SJZXD_UIManager.Instance.GetPropSprite(this.PropData.Name).then((sp: SpriteFrame) => {
            this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
        })
        SJZXD_Incident.LoadSprite("Sprites/仓库/" + SJZXD_Constant.QuaLityList[this.PropData.quality]).then((sp: SpriteFrame) => {
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
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.背包物品选中, this.node);
    }
}


