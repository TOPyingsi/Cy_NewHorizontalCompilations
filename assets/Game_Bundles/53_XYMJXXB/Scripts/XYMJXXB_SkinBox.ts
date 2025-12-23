import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJXXB_Incident } from './XYMJXXB_Incident';
import Banner from '../../../Scripts/Banner';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_AudioManager } from './XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_SkinBox')
export class XYMJXXB_SkinBox extends Component {
    @property()
    public Name: string = "";
    @property()
    public IsVideoUnLock: boolean = false;//是否是视屏解锁
    @property()
    public IsactivityUnLock: boolean = false;//是否是活动解锁
    @property()
    public price: number = 0;//金砖价格

    start() {
        this.init();
    }
    protected onEnable(): void {
        this.ShowState();
    }
    init() {
        XYMJXXB_Incident.LoadSprite("Sprites/皮肤/" + this.Name).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("皮肤").getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.node.getChildByPath("灰色遮罩/金砖解锁/数量").getComponent(Label).string = this.price + ``;
        this.ShowState();

    }
    //根据解锁状态来判断显示
    ShowState() {
        let isUnlock = XYMJXXB_GameData.Instance.SkinData.indexOf(this.Name) >= 0;
        if (isUnlock) {
            this.node.getChildByName("灰色遮罩").active = false;
        } else {
            this.node.getChildByName("灰色遮罩").active = true;
            if (this.IsVideoUnLock) {
                this.node.getChildByPath("灰色遮罩/视频解锁").active = true;
            } else if (this.IsactivityUnLock) {

            } else {
                this.node.getChildByPath("灰色遮罩/金砖解锁").active = true;
            }
        }
    }

    //点击事件
    OnClick() {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        let isUnlock = XYMJXXB_GameData.Instance.SkinData.indexOf(this.Name) >= 0;
        if (isUnlock) {
            XYMJXXB_GameData.Instance.Skin = this.Name;
            UIManager.ShowTip("穿戴成功！");
            return;
        }
        if (this.IsVideoUnLock) {
            Banner.Instance.ShowVideoAd(() => {
                this.UnLock();
                this.ShowState();
            })
        } else if (this.IsactivityUnLock) {
            UIManager.ShowTip("此皮肤为活动解锁，请前往抽取或者兑换！");
        } else {
            if (XYMJXXB_GameData.Instance.GoldBar >= this.price) {
                XYMJXXB_GameData.Instance.ChanggeGoldBar(-this.price);
                this.UnLock();
                this.ShowState();
            } else {
                UIManager.ShowTip("金砖不足！无法兑换！");
            }
        }
    }

    //解锁皮肤
    UnLock() {
        XYMJXXB_GameData.Instance.SkinData.push(this.Name);
        UIManager.ShowTip("解锁成功！");
    }
}


