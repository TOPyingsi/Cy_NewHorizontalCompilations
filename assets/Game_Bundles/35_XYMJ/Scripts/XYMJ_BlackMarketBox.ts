import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJ_Incident } from './XYMJ_Incident';
import { XYMJ_Constant } from './XYMJ_Constant';
import { XYMJ_GameData } from './XYMJ_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_AudioManager } from './XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_BlackMarketBox')
export class XYMJ_BlackMarketBox extends Component {
    @property()
    public Name: string = "";

    private Price: number = 0;//价格
    start() {
        this.Init();
    }

    Init() {
        XYMJ_Incident.LoadSprite("Sprites/Prop/" + this.Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.node.getChildByName("名字").getComponent(Label).string = this.Name;
        this.node.getChildByName("描述").getComponent(Label).string = XYMJ_Constant.GetDataByName(this.Name).describe;
        this.Price = XYMJ_Constant.GetDataByName(this.Name).value;
        this.node.getChildByName("价格").getComponent(Label).string = XYMJ_Incident.GetMaxNum(this.Price);
    }
    //被单击
    OnClick() {
        if (XYMJ_GameData.Instance.Money >= this.Price) {
            if (XYMJ_GameData.Instance.pushKnapsackData(this.Name, 1)) {
                XYMJ_GameData.Instance.ChanggeMoney(-this.Price);
                XYMJ_AudioManager.globalAudioPlay("获得钞票");
                UIManager.ShowTip("购买成功！");
            } else {
                XYMJ_AudioManager.globalAudioPlay("点击");
                UIManager.ShowTip("背包已满！请先整理背包！");
            }
        } else {
            XYMJ_AudioManager.globalAudioPlay("点击");
            UIManager.ShowTip("钞票不足，无法购买！");
        }

    }
}


