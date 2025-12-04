import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_PropBox')
export class XYRZZ_PropBox extends Component {
    public id: number = 0;//道具id
    public Propnumber: number = 0;//道具数量
    public IsUpLevelProp: boolean = false;//是否为升级形道具
    Init(id) {
        this.id = id;
        if (XYRZZ_Constant.PropData[this.id].LevelUpMoney > 0) {
            this.IsUpLevelProp = true;
        } else {
            this.IsUpLevelProp = false;
        }
        this.Loadsprite();
    }

    //初始化图片
    Loadsprite() {
        XYRZZ_Incident.LoadSprite(`UI/背包/${XYRZZ_Constant.PropData[this.id].Name}缩略图`).then((sp: SpriteFrame) => {
            this.node.getChildByName("图").getComponent(Sprite).spriteFrame = sp;
        });
    }

    AddNumBer(num: number): number {
        this.Propnumber += num;
        if (this.Propnumber > 1 && !this.IsUpLevelProp) {
            this.node.getChildByName("数量").active = true;
            this.node.getChildByName("数量").getComponent(Label).string = `X${this.Propnumber}`;
        } else {
            this.node.getChildByName("数量").active = false;
        }
        return this.Propnumber;
    }
    //被单击
    Onclick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_PropMessage, [this.id]);
    }
}


