import { _decorator, Button, Component, EventHandler, Label, Node, Sprite, SpriteFrame } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import Banner from '../../../../Scripts/Banner';
import { MTRNX_Constant, MTRNX_GameMode, MTRNX_JKType } from '../Data/MTRNX_Constant';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_EventManager, MTRNX_MyEvent } from '../MTRNX_EventManager';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_JKItem')
export class MTRNX_JKItem extends Component {
    sprite: Sprite = null;
    coldDownLabel: Label = null;
    noEnergyLabel: Label = null;
    video: Node = null;

    type: MTRNX_JKType = MTRNX_JKType.None;
    cb: Function = null;
    canPut: boolean = false;
    coldDown: boolean = false;
    useCount: number = -1;

    unlock: boolean = true;

    protected onLoad(): void {
        this.sprite = this.node.getComponent(Sprite);
        this.coldDownLabel = this.node.getChildByName("ColdDownLabel").getComponent(Label);
        this.noEnergyLabel = this.node.getChildByName("NoEnergyLabel").getComponent(Label);
        this.video = this.node.getChildByName("Video");

        const clickEventHandler = new EventHandler();
        clickEventHandler.target = this.node;// 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = 'MTRNX_JKItem';// 这个是脚本类名
        clickEventHandler.handler = 'OnButtonClick';
        const button = this.node.getComponent(Button);
        button.clickEvents.push(clickEventHandler);
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.背后能源) {
            this.schedule(() => {
                this.Refresh();
            }, 0.5)
        }
    }

    Init(type: MTRNX_JKType, cb: Function) {
        this.type = type;
        this.cb = cb;

        this.coldDown = true;

        BundleManager.LoadSpriteFrame("2_MTRNX_Bundle", `Icons/JK_${this.type}`).then((sp: SpriteFrame) => {
            this.sprite.spriteFrame = sp;
        })

        MTRNX_EventManager.off(MTRNX_MyEvent.PointChanged, this.Refresh, this);
        MTRNX_EventManager.on(MTRNX_MyEvent.PointChanged, this.Refresh, this);

        this.video.active = MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless && MTRNX_Constant.JKBOSS.some(e => e == this.type);
        this.unlock = !this.video.active;
    }

    Refresh() {
        this.canPut = MTRNX_GameManager.Instance.Point >= MTRNX_Constant.JKTypePointCost[this.type];
        this.noEnergyLabel.node.active = !this.canPut;
        this.coldDownLabel.node.active = !this.coldDown;
    }

    OnButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");

        if (!this.unlock) {
            Banner.Instance.ShowVideoAd(() => {
                this.video.active = false;
                this.unlock = true;
            });
            return;
        }

        if (this.canPut && this.coldDown) {
            this.cb && this.cb(this.type);
            this.coldDown = false;

            MTRNX_GameManager.Instance.Point -= MTRNX_Constant.JKTypePointCost[this.type];

            if (MTRNX_Constant.JKBOSS.some(e => e == this.type)) {
                this.node.active = false;
            } else {
                if (MTRNX_GameManager.Instance.noCD) {
                    this.coldDown = true;
                    this.Refresh();
                    return;
                }

                this.scheduleOnce(() => {
                    this.coldDown = true;
                    this.Refresh();
                }, MTRNX_Constant.JKTypeColdDownCost[this.type]);
            }

        }
    }

}