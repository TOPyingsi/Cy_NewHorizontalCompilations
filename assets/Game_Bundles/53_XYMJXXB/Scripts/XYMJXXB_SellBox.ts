import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJXXB_Incident } from './XYMJXXB_Incident';
import { XYMJXXB_Constant } from './XYMJXXB_Constant';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_AudioManager } from './XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_SellBox')
export class XYMJXXB_SellBox extends Component {
    @property()
    public Name: string = "";
    public value: number = 0;
    private _isactivate: boolean = true;
    start() {
        this.Init();
    }
    protected onEnable(): void {
        this.Isactivate();
    }
    Init() {
        this.node.getChildByName("道具名").getComponent(Label).string = this.Name;
        XYMJXXB_Incident.LoadSprite("Sprites/Prop/" + this.Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.value = XYMJXXB_Constant.GetDataByName(this.Name).value;
        this.node.getChildByPath("价格/价格").getComponent(Label).string = this.value + ``;
        this.Isactivate();
    }

    Onclick() {
        if (this._isactivate == true) {
            //执行出售逻辑
            XYMJXXB_GameData.Instance.SubKnapsackData(this.Name, 1);
            XYMJXXB_GameData.Instance.ChanggeMoney(this.value);
            UIManager.ShowTip("出售成功！");
            this.Isactivate();
            XYMJXXB_AudioManager.globalAudioPlay("获得钞票");
        } else {
            XYMJXXB_AudioManager.globalAudioPlay("点击");
        }
    }

    //判断是否激活
    Isactivate() {
        if (XYMJXXB_GameData.Instance.GetPropNum(this.Name) > 0) {
            this.node.getChildByName("灰色遮罩").active = false;
            this._isactivate = true;
        } else {
            this.node.getChildByName("灰色遮罩").active = true;
            this._isactivate = false;
        }
    }

}


