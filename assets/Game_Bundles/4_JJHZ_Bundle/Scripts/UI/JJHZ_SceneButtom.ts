import { _decorator, AudioSource, Component, EventTouch, Node, Sprite, SpriteFrame } from 'cc';
import { JJHZ_GameData } from '../JJHZ_GameData';
import { JJHZ_Incident } from '../JJHZ_Incident';
import { JJHZ_MoreGame } from './JJHZ_MoreGame';
import Banner from '../../../../Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_SceneButtom')
export class JJHZ_SceneButtom extends Component {
    @property()
    public Scene: number = 0;
    public MoreGame: JJHZ_MoreGame = null;
    protected start(): void {
        if (Banner.RegionMask) {//黑包不显示视屏角标
            this.node.getChildByPath("关卡遮罩/视屏角标").active = false;
        }
    }

    //初始化
    Init() {
        this.MoreGame = this.node.parent.parent.getComponent(JJHZ_MoreGame);
        JJHZ_Incident.LoadSprite("Sprite/主页/下方关卡图/" + this.Scene).then((sp: SpriteFrame) => {
            this.node.getComponent(Sprite).spriteFrame = sp;
        });
        this.ChanggeState();
        if (this.node.getSiblingIndex() == 0) {
            this.node.getChildByName("按钮边框").active = true;
        }
    }

    //根据解锁状态来改变图形
    ChanggeState() {
        if (JJHZ_GameData.Instance.Unlook[this.Scene] == true) {
            this.node.getChildByName("关卡遮罩").active = false;
        } else {
            this.node.getChildByName("关卡遮罩").active = true;
        }
    }
    OnbuttomClick(event: EventTouch) {
        this.node.parent.parent.getComponent(AudioSource).play();
        if (JJHZ_GameData.Instance.Unlook[this.Scene] == false) {//未解锁
            if (Banner.RegionMask) {
                UIManager.ShowPanel(Panel.TreasureBoxPanel, [() => {
                    this.Unlook();
                }]);

            } else {
                Banner.Instance.ShowVideoAd(() => {
                    this.Unlook();
                })
            }
            return;
        }

        JJHZ_Incident.LoadSprite("Sprite/主页/荧幕关卡图/" + this.Scene).then((sp: SpriteFrame) => {
            this.MoreGame.BG.getChildByPath("关卡图").getComponent(Sprite).spriteFrame = sp;
        })
        this.MoreGame.Content.children.forEach((nd, index) => {
            nd.getChildByName("按钮边框").active = nd.getComponent(JJHZ_SceneButtom).Scene == this.Scene;
        })
        this.MoreGame.index = this.Scene;
    }

    //解锁当前关卡
    Unlook() {
        JJHZ_GameData.Instance.Unlook[this.Scene] = true;
        JJHZ_GameData.DateSave();
        this.ChanggeState();
    }
}


