import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJDWY_Incident } from './XYMJDWY_Incident';
import { XYMJDWY_AudioManager } from './XYMJDWY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_WarehouseKnapsackSmallBox')
export class XYMJDWY_WarehouseKnapsackSmallBox extends Component {
    public _name: string = "";
    public _num: number = 0;
    start() {
        director.getScene().on("选择背包按钮", this.SelectButtom, this);
    }


    //背包按钮被选中
    SelectButtom(nd: Node) {
        this.node.getChildByName("描边").active = nd == this.node;
    }

    //初始化
    Init(Name: string, Num: number) {
        this._name = Name;
        this._num = Num;
        XYMJDWY_Incident.LoadSprite("Sprites/Prop/" + Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("图片").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.node.getChildByName("数量").getComponent(Label).string = Num + ``;
        if (Num == 0) {
            this.node.destroy();
        }
    }
    OnClick() {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        director.getScene().emit("选择背包按钮", this.node)

    }
}


