import { _decorator, Component, EventTouch, Layout, Node, v2, v3, Vec2, Vec3 } from 'cc';
import { SJZGMMT_OfficePanel2 } from './Panel/SJZGMMT_OfficePanel2';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Office2Box')
export class SJZGMMT_Office2Box extends Component {
    @property()
    id: number = 0;

    start() {

        this.Init();
    }
    //初始化
    Init() {
        this.OnToucjhandler();
    }
    OnTouchStart(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("厚重点击");
    }

    OnTouchMove(event: EventTouch) {
        this.node.worldPosition = v3(event.getUILocation().x, event.getUILocation().y, 0);

    }
    OnTouchEnd(event: EventTouch) {
        let isreturn = true;
        this.node.parent.parent.getChildByName("槽位").children.forEach((element, index) => {
            if (element.worldPosition.clone().subtract(this.node.worldPosition.clone()).length() < 50) {
                SJZGMMT_AudioManager.globalAudioPlay("放置");
                if (SJZGMMT_OfficePanel2.indexData[index] != -1) {
                    this.node.parent.parent.getChildByPath("符文存放槽/符文" + (SJZGMMT_OfficePanel2.indexData[index])).getComponent(SJZGMMT_Office2Box).Extrusion();
                }
                this.node.setParent(this.node.parent.parent.getChildByName("符文存放槽"));
                this.node.worldPosition = element.worldPosition.clone();
                SJZGMMT_OfficePanel2.indexData[index] = this.id;
                this.OnTouchCancel();
                if (SJZGMMT_OfficePanel2.indexData[0] != -1 && SJZGMMT_OfficePanel2.indexData[1] != -1 && SJZGMMT_OfficePanel2.indexData[2] != -1
                    && SJZGMMT_OfficePanel2.indexData[3] != -1
                ) {
                    this.node.parent.parent.parent.emit("解开机关");
                }
                isreturn = false
                return;
            }
        });
        if (isreturn) {
            this.node.setParent(this.node.parent.parent.getChildByName("符文"));
            this.node.y = 0;
            this.node.parent.getComponent(Layout).updateLayout(true);
        }
    }
    //被挤下去
    Extrusion() {
        this.node.setParent(this.node.parent.parent.getChildByName("符文"));
        this.node.y = 0;
        this.OnToucjhandler();
    }

    //注册监听
    OnToucjhandler() {
        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
    }
    //屏蔽监听
    OnTouchCancel() {
        this.node.off(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
    }
}


