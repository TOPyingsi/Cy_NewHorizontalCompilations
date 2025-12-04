import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJDWY_Incident } from './XYMJDWY_Incident';
import { XYMJDWY_Constant } from './XYMJDWY_Constant';
import { XYMJDWY_GameData } from './XYMJDWY_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJDWY_AudioManager } from './XYMJDWY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_SellBox')
export class XYMJDWY_SellBox extends Component {
    @property()
    public Name: string = "";
    public value: number = 0;
    private _isactivate: boolean = true;
    start() {

    }
    protected onEnable(): void {
        this.Isactivate();
    }
    Init() {
        this.node.getChildByName("道具名").getComponent(Label).string = this.Name;
        XYMJDWY_Incident.LoadSprite("Sprites/Prop/" + this.Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.value = XYMJDWY_Constant.GetDataByName(this.Name).value;
        this.node.getChildByPath("价格/价格").getComponent(Label).string = this.value + ``;
        this.Isactivate();
    }

    Onclick() {
        if (this._isactivate == true) {
            //执行出售逻辑
            XYMJDWY_GameData.Instance.SubKnapsackData(this.Name, 1);
            XYMJDWY_GameData.Instance.ChanggeMoney(this.value);
            UIManager.ShowTip("出售成功！");
            this.Isactivate();
            XYMJDWY_AudioManager.globalAudioPlay("获得钞票");
        } else {
            XYMJDWY_AudioManager.globalAudioPlay("点击");
        }
    }

    //判断是否激活
    Isactivate() {
        if (XYMJDWY_GameData.Instance.GetPropNum(this.Name) > 0) {
            this.node.getChildByName("灰色遮罩").active = false;
            this._isactivate = true;
        } else {
            this.node.getChildByName("灰色遮罩").active = true;
            this._isactivate = false;
        }
    }

}


