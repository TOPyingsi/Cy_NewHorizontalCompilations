import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_Constant } from '../HJMSJ_Constant';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_BagProp')
export class HJMSJ_BagProp extends Component {

    public bagID: number = 0;
    public boxID: number = 0;
    public propName: string = "";

    private propSprite: Sprite = null;
    private label: Label = null;
    start() {
        this.label = this.node.getChildByName("propNum").getComponent(Label);
        this.propSprite = this.node.getChildByName("propSprite").getComponent(Sprite);

        this.node.on(Node.EventType.TOUCH_END, this.clickProp, this);

        director.getScene().on("哈基米世界_刷新道具", (proName: string) => {
            this.refeshProp(proName);
        }, this);
    }

    refeshProp(proName: string) {
        if (proName === this.propName) {
            let propNum = HJMSJ_GameData.Instance.GetPropNum(this.propName);

            if (propNum <= 0) {
                this.propSprite.spriteFrame = null;
                this.label.string = "";
                this.node.name = "背包框-打开";
                let data = HJMSJ_GameData.Instance.getDataByBagID(this.bagID);
                data.BagID = -10;
                return;
            }
            // if (propNum >= 64) {
            //     //创建新格子

            //     return;
            // }
            let type = HJMSJ_Constant.getTypeByName(proName);
            if (type === "武器" || type === "防具") {
                this.label.string = "";
                return;
            }
            this.label.string = propNum.toString();

        }

    }

    clickProp() {
        director.getScene().emit("哈基米世界_点击道具", this.boxID);
    }

    resetData() {
        this.node.name = "背包框-打开";
        this.propName = "";
        this.label.string = "";
        this.propSprite.spriteFrame = null;
        // let data = HJMSJ_GameData.Instance.getDataByBagID(this.bagID);
        // data.BagID = -10;
    }

    refeshID(id: number) {
        this.boxID = id;
        this.bagID = id;
    }

    init(propData: any, sp: SpriteFrame) {

        this.propName = propData.Name;

        this.bagID = propData.BagID;

        this.refeshProp(this.propName);
        if (sp) {
            this.propSprite.spriteFrame = sp;
        }
    }
}


