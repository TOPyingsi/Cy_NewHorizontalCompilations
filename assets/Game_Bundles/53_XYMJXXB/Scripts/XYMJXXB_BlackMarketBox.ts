import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJXXB_Incident } from './XYMJXXB_Incident';
import { XYMJXXB_Constant } from './XYMJXXB_Constant';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_AudioManager } from './XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_BlackMarketBox')
export class XYMJXXB_BlackMarketBox extends Component {
    @property()
    public Name: string = "";

    private Price: number = 0;//价格
    start() {
        this.Init();
    }

    Init() {
        XYMJXXB_Incident.LoadSprite("Sprites/Prop/" + this.Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.node.getChildByName("名字").getComponent(Label).string = this.Name;
        this.node.getChildByName("描述").getComponent(Label).string = XYMJXXB_Constant.GetDataByName(this.Name).describe;
        this.Price = XYMJXXB_Constant.GetDataByName(this.Name).value;
        this.node.getChildByName("价格").getComponent(Label).string = XYMJXXB_Incident.GetMaxNum(this.Price);
    }
    //被单击
    OnClick() {
        if (XYMJXXB_GameData.Instance.Money >= this.Price) {
            if (XYMJXXB_GameData.Instance.pushKnapsackData(this.Name, 1)) {
                XYMJXXB_GameData.Instance.ChanggeMoney(-this.Price);
                XYMJXXB_AudioManager.globalAudioPlay("获得钞票");
                UIManager.ShowTip("购买成功！");
            } else {
                XYMJXXB_AudioManager.globalAudioPlay("点击");
                UIManager.ShowTip("背包已满！请先整理背包！");
            }
        } else {
            XYMJXXB_AudioManager.globalAudioPlay("点击");
            UIManager.ShowTip("钞票不足，无法购买！");
        }

    }
}


