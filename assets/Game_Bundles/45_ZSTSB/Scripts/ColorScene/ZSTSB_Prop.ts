import { _decorator, Component, director, instantiate, Label, Node, Sprite } from 'cc';
import { ZSTSB_GameData } from '../ZSTSB_GameData';
import { ZSTSB_GameMgr } from '../ZSTSB_GameMgr';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import Banner from 'db://assets/Scripts/Banner';
import { ZSTSB_AudioManager } from '../ZSTSB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Prop')
export class ZSTSB_Prop extends Component {

    //道具名称
    @property()
    public propName: string = "";

    private adSprite: Node = null;

    public label: Label = null;

    //道具个数
    private propNum: number = 0;
    start() {
        this.init();

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);

        director.getScene().on("钻石填色本_使用道具", (propName: string) => {
            if (this.propName === propName) {
                this.useProp();
            }
        }, this);

        director.getScene().on("钻石填色本_获得道具", (propName: string) => {
            if (this.propName === propName) {
                this.getProp();
            }
        }, this);
    }

    onClick() {

        ZSTSB_AudioManager.instance.playSFX("按钮");

        if (this.adSprite.active) {
            ZSTSB_GameMgr.instance.isUseProp = false;
            Banner.Instance.ShowVideoAd(() => {
                this.getProp();
            })
        }
        else {
            ZSTSB_GameMgr.instance.isUseProp = true;
            ZSTSB_GameMgr.instance.propName = this.propName;
            ZSTSB_GameMgr.instance.selectNodeRoot = this.node;
            console.log("点击道具：" + this.propName);
            ZSTSB_GameMgr.instance.SelectProp();
        }
    }

    init() {
        this.label = this.node.getChildByName("道具数量").getComponent(Label);
        this.adSprite = this.node.getChildByName("广告");
        let data = ZSTSB_GameData.Instance.getPropByName(this.propName);
        if (data) {
            this.propNum = data;
            this.label.string = this.propNum.toString();
        }
    }

    refreshUI() {
        this.label.string = this.propNum.toString();

        if (this.propNum <= 0) {
            this.getComponent(Sprite).grayscale = true;
            this.adSprite.active = true;
            ZSTSB_GameMgr.instance.isUseProp = false;
        }
        else {
            this.getComponent(Sprite).grayscale = false;
            this.adSprite.active = false;
        }
    }

    useProp() {
        if (ZSTSB_GameData.Instance.subPropByName(this.propName, 1)) {
            this.propNum--;
            this.refreshUI();
        }
    }

    getProp() {
        if (ZSTSB_GameData.Instance.pushPropByName(this.propName, 1)) {
            this.propNum++;
            this.refreshUI();
        }
    }

}


