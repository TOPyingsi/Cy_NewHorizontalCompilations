import { _decorator, Button, Component, EventHandler, Label, Node, Sprite, SpriteFrame } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import Banner from '../../../../Scripts/Banner';
import { MTRNX_Water_Constant, MTRNX_Water_GameMode, MTRNX_Water_JKType } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_EventManager, MTRNX_Water_MyEvent } from '../MTRNX_Water_EventManager';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_JKItem')
export class MTRNX_Water_JKItem extends Component {
    sprite: Sprite = null;
    coldDownLabel: Label = null;
    noEnergyLabel: Label = null;
    video: Node = null;

    type: MTRNX_Water_JKType = MTRNX_Water_JKType.None;
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
        clickEventHandler.component = 'MTRNX_Water_JKItem';// 这个是脚本类名
        clickEventHandler.handler = 'OnButtonClick';
        const button = this.node.getComponent(Button);
        button.clickEvents.push(clickEventHandler);
        if (MTRNX_Water_GameManager.GameMode == MTRNX_Water_GameMode.背后能源) {
            this.schedule(() => {
                this.Refresh();
            }, 0.5)
        }
    }

    Init(type: MTRNX_Water_JKType, cb: Function) {
        this.type = type;
        this.cb = cb;

        this.coldDown = true;

        BundleManager.LoadSpriteFrame("56_MTRNX_Water_Bundle", `Icons/JK_${this.type}`).then((sp: SpriteFrame) => {
            this.sprite.spriteFrame = sp;
        })

        MTRNX_Water_EventManager.off(MTRNX_Water_MyEvent.PointChanged, this.Refresh, this);
        MTRNX_Water_EventManager.on(MTRNX_Water_MyEvent.PointChanged, this.Refresh, this);

        this.video.active = MTRNX_Water_GameManager.GameMode == MTRNX_Water_GameMode.Endless && MTRNX_Water_Constant.JKBOSS.some(e => e == this.type);
        this.unlock = !this.video.active;
    }

    Refresh() {
        this.canPut = MTRNX_Water_GameManager.Instance.Point >= MTRNX_Water_Constant.JKTypePointCost[this.type];
        this.noEnergyLabel.node.active = !this.canPut;
        this.coldDownLabel.node.active = !this.coldDown;
    }

    OnButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");

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

            MTRNX_Water_GameManager.Instance.Point -= MTRNX_Water_Constant.JKTypePointCost[this.type];

            if (MTRNX_Water_Constant.JKBOSS.some(e => e == this.type)) {
                this.node.active = false;
            } else {
                if (MTRNX_Water_GameManager.Instance.noCD) {
                    this.coldDown = true;
                    this.Refresh();
                    return;
                }

                this.scheduleOnce(() => {
                    this.coldDown = true;
                    this.Refresh();
                }, MTRNX_Water_Constant.JKTypeColdDownCost[this.type]);
            }

        }
    }

}