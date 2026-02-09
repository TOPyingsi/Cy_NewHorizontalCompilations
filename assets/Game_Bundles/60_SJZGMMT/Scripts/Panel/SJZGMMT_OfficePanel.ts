import { _decorator, Component, Node, v3, Event, Label, UIOpacity, math, Color, EventTouch } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_vessel } from '../SJZGMMT_vessel';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';

const { ccclass, property } = _decorator;

const v3_0 = v3(0, 0, 0);

@ccclass('SJZGMMT_OfficePanel')
export class SJZGMMT_OfficePanel extends PanelBase {
    @property(Node)
    public TouchNode: Node = null;
    private MinX: number = -180;
    private MaxX: number = 180;
    private PointX: number = 0;
    private CallBack: Function = null;
    protected onLoad(): void {


    }
    protected start(): void {
        this.TouchNode.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.TouchNode.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.TouchNode.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
        this.schedule(() => {
            if (this.node.activeInHierarchy) {
                let audiosize = 1 - Math.abs(this.TouchNode.x - this.PointX) / 140;
                if (audiosize > 0) {
                    SJZGMMT_AudioManager.globalAudioPlay("机关_叮", (audiosize));
                }
            }
        }, 0.5)
    }
    Show(...args: any[]) {//参数0为成功回调
        super.Show(this.node.getChildByName("框"));
        this.CallBack = args[0];
        this.Init();
    }
    //初始化
    Init() {
        this.PointX = Math.random() * 380 - 190;
        this.TouchNode.x = 0;
        console.log("解密位置为：" + this.PointX);
    }

    OnTouchMove(event: EventTouch) {
        this.TouchNode.x += event.getUIDelta().x;
        if (this.TouchNode.x < this.MinX) {
            this.TouchNode.x = this.MinX;
        } else if (this.TouchNode.x > this.MaxX) {
            this.TouchNode.x = this.MaxX;
        }
    }
    OnTouchEnd(event: EventTouch) {
        if (Math.abs(this.TouchNode.x - this.PointX) < 20) {
            if (this.CallBack) this.CallBack();
            SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.OfficePanel);
        }
    }
    //关闭
    Close() {
        SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.OfficePanel);
    }
}


