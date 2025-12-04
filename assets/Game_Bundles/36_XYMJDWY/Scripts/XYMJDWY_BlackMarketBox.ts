import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJDWY_Incident } from './XYMJDWY_Incident';
import { XYMJDWY_Constant } from './XYMJDWY_Constant';
import { XYMJDWY_GameData } from './XYMJDWY_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJDWY_AudioManager } from './XYMJDWY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_BlackMarketBox')
export class XYMJDWY_BlackMarketBox extends Component {
    @property()
    public Name: string = "";

    private Price: number = 0;//价格
    start() {
        this.Init();
    }

    Init() {
        XYMJDWY_Incident.LoadSprite("Sprites/Prop/" + this.Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.node.getChildByName("名字").getComponent(Label).string = this.Name;
        this.node.getChildByName("描述").getComponent(Label).string = XYMJDWY_Constant.GetDataByName(this.Name).describe;
        this.Price = XYMJDWY_Constant.GetDataByName(this.Name).value;
        this.node.getChildByName("价格").getComponent(Label).string = XYMJDWY_Incident.GetMaxNum(this.Price);
    }
    //被单击
    OnClick() {
        if (XYMJDWY_GameData.Instance.Money >= this.Price) {
            if (XYMJDWY_GameData.Instance.pushKnapsackData(this.Name, 1)) {
                XYMJDWY_GameData.Instance.ChanggeMoney(-this.Price);
                XYMJDWY_AudioManager.globalAudioPlay("获得钞票");
                UIManager.ShowTip("购买成功！");
            } else {
                XYMJDWY_AudioManager.globalAudioPlay("点击");
                UIManager.ShowTip("背包已满！请先整理背包！");
            }
        } else {
            XYMJDWY_AudioManager.globalAudioPlay("点击");
            UIManager.ShowTip("钞票不足，无法购买！");
        }

    }
}


