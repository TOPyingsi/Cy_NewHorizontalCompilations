import { _decorator, Color, Component, Label, Node, NodeEventType, Sprite, SpriteFrame } from 'cc';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_BagMgr } from '../Bag/HJMSJ_BagMgr';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_BuyProp')
export class HJMSJ_BuyProp extends Component {

    private buyPropNameLabel: Label = null;
    private buyPropName: string = "";
    private payNode: Node = null;
    private bugProp: Sprite = null;
    // private needProp: Sprite = null;
    private needNumLabel: Label = null
    private needNum: number = 0;

    init(data: any) {
        this.bugProp = this.node.getChildByName("道具").getComponent(Sprite);
        this.buyPropNameLabel = this.node.getChildByName("道具名").getComponent(Label);
        this.payNode = this.node.getChildByName("支付框");
        // this.needProp = payNode.getChildByName("所需物品").getComponent(Sprite);
        this.needNumLabel = this.payNode.getChildByName("所需个数").getComponent(Label);

        HJMSJ_Incident.LoadSprite("Sprites/新手村/购买商店/" + data.buyProp).then((sp: SpriteFrame) => {
            this.buyPropName = data.buyProp;
            this.bugProp.spriteFrame = sp;
            this.needNum = data.needNum;
            this.needNumLabel.string = this.needNum.toString();
            this.buyPropNameLabel.string = this.buyPropName.toString();

            if (this.buyPropName.startsWith("金")) {
                this.buyPropNameLabel.color = new Color(234, 238, 87);
            }

            if (this.buyPropName.startsWith("钻石")) {
                this.buyPropNameLabel.color = new Color(132, 255, 235);
            }

            this.payNode.on(NodeEventType.TOUCH_END, this.onClick, this);
        });

    }

    onClick() {
        //判断背包中的所需物品是否足够
        console.log("购买");

        let propNum = HJMSJ_GameData.Instance.GetPropNum("绿宝石");

        if (propNum >= this.needNum) {
            if (HJMSJ_GameData.Instance.SubKnapsackData("绿宝石", this.needNum)) {
                HJMSJ_GameMgr.instance.BagMgrTs.subPropByName("绿宝石", this.needNum);
            }

            if (HJMSJ_GameData.Instance.pushKnapsackData(this.buyPropName, 1, HJMSJ_BagMgr.curBagID)) {
                HJMSJ_GameMgr.instance.BagMgrTs.pushPropByName(this.buyPropName, 1);
            }
        }
    }
}


