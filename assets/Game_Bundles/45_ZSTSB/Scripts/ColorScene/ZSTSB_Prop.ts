import { _decorator, Button, Component, director, instantiate, Label, Node, Sprite, tween, v3 } from 'cc';
import { ZSTSB_GameData } from '../ZSTSB_GameData';
import { ZSTSB_GameMgr } from '../ZSTSB_GameMgr';
import Banner from 'db://assets/Scripts/Banner';
import { ZSTSB_AudioManager } from '../ZSTSB_AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Prop')
export class ZSTSB_Prop extends Component {

    //道具名称
    @property()
    public propName: string = "";

    @property(Node)
    AdNode: Node = null;

    private adSprite: Node = null;

    public label: Label = null;

    //道具个数
    private propNum: number = 0;

    start() {
        this.init();
        this.initEvent();
    }

    private isFirst: boolean = true;
    onClick() {

        ZSTSB_AudioManager.instance.playSFX("按钮");

        if (ZSTSB_GameData.Instance.isGameFirst && this.isFirst) {
            this.isFirst = false;
            director.getScene().emit("钻石填色本_新手教程");
        }

        if (this.adSprite.active) {
            ZSTSB_GameMgr.instance.isUseProp = false;
            this.ShowAd(true);
        }
        else {
            ZSTSB_GameMgr.instance.isUseProp = true;
            ZSTSB_GameMgr.instance.propName = this.propName;
            ZSTSB_GameMgr.instance.selectNodeRoot = this.node;
            console.log("点击道具：" + this.propName);
            ZSTSB_GameMgr.instance.SelectProp();
        }
    }

    ShowAd(flag: boolean) {
        let adBtn = this.AdNode.getChildByName("观看广告").getComponent(Button);
        let closeBtn = this.AdNode.getChildByName("关闭广告").getComponent(Button);

        if (!adBtn.enabled) {
            return;
        }

        if (flag) {

            this.AdNode.active = true;
            adBtn.enabled = false;
            closeBtn.enabled = false;

            tween(this.AdNode)
                .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backInOut" })
                .call(() => {
                    adBtn.enabled = true;
                    closeBtn.enabled = true;
                })
                .start();
        }
        else {
            adBtn.enabled = false;
            closeBtn.enabled = false;

            tween(this.AdNode)
                .to(0.3, { scale: v3(0, 0, 0) }, { easing: "backInOut" })
                .call(() => {
                    adBtn.enabled = true;
                    closeBtn.enabled = true;
                    this.AdNode.active = false;
                })
                .start();
        }
    }

    onClose() {
        this.ShowAd(false);
    }

    LookAd() {
        this.ShowAd(false);
        Banner.Instance.ShowVideoAd(() => {
            this.getProp(10);
        });
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

    initEvent() {
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);

        director.getScene().on("钻石填色本_使用道具", (propName: string) => {
            if (this.propName === propName) {
                this.useProp();
            }
        }, this);

        director.getScene().on("钻石填色本_获得道具", (propName: string, propNum: number) => {
            if (this.propName === propName) {
                this.getProp(propNum);
            }
        }, this);
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

    getProp(propNum: number) {
        if (ZSTSB_GameData.Instance.pushPropByName(this.propName, propNum)) {
            this.propNum += propNum;
            UIManager.ShowTip("获得" + propNum + "个道具！");
            this.refreshUI();
        }
    }

}


