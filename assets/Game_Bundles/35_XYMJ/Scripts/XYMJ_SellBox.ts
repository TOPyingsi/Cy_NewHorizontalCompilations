import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJ_Incident } from './XYMJ_Incident';
import { XYMJ_Constant } from './XYMJ_Constant';
import { XYMJ_GameData } from './XYMJ_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_AudioManager } from './XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_SellBox')
export class XYMJ_SellBox extends Component {
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
        XYMJ_Incident.LoadSprite("Sprites/Prop/" + this.Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.value = XYMJ_Constant.GetDataByName(this.Name).value;
        this.node.getChildByPath("价格/价格").getComponent(Label).string = this.value + ``;
        this.Isactivate();
    }

    Onclick() {
        if (this._isactivate == true) {
            //执行出售逻辑
            XYMJ_GameData.Instance.SubKnapsackData(this.Name, 1);
            XYMJ_GameData.Instance.ChanggeMoney(this.value);
            UIManager.ShowTip("出售成功！");
            this.Isactivate();
            XYMJ_AudioManager.globalAudioPlay("获得钞票");
        } else {
            XYMJ_AudioManager.globalAudioPlay("点击");
        }
    }

    //判断是否激活
    Isactivate() {
        if (XYMJ_GameData.Instance.GetPropNum(this.Name) > 0) {
            this.node.getChildByName("灰色遮罩").active = false;
            this._isactivate = true;
        } else {
            this.node.getChildByName("灰色遮罩").active = true;
            this._isactivate = false;
        }
    }

}


