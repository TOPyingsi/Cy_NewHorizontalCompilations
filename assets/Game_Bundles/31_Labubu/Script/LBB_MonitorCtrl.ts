import { _decorator, Component, Event, Node, Sprite, SpriteFrame } from 'cc';
import { PLAY_AUDIO } from './LBB_Event';
import { AUDIO_ENUM, EVENT_ENUM } from './LBB_Enum';
const { ccclass, property } = _decorator;

@ccclass('LBB_MonitorCtrl')
export class LBB_MonitorCtrl extends Component {

    public static Instance: LBB_MonitorCtrl = null;

    @property(Node) mon1: Node = null;
    @property(Node) mon2: Node = null;
    @property(Node) mon3: Node = null;
    @property(Node) mon4: Node = null;
    @property(Node) mon5: Node = null;

    @property(Node) btn1: Node = null;
    @property(Node) btn2: Node = null;
    @property(Node) btn3: Node = null;
    @property(Node) btn4: Node = null;
    @property(Node) btn5: Node = null;

    @property(SpriteFrame) sf1: SpriteFrame = null;
    @property(SpriteFrame) sf2: SpriteFrame = null;

    private currentBtn: Node = null;

    protected onLoad(): void {
        LBB_MonitorCtrl.Instance = this;
    }

    onButtonClick(event: Event) {
        PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.MONITOR, this);
        console.log(this.currentBtn);
        switch (event.target.name) {
            case "Button1":
                if (this.currentBtn) {
                    this.currentBtn.getComponent(Sprite).spriteFrame = this.sf2;
                }
                this.currentBtn = this.btn1;
                this.btn1.getComponent(Sprite).spriteFrame = this.sf1;
                this.activeMonitor(this.mon1);
                break;
            case "Button2":
                if (this.currentBtn) {
                    this.currentBtn.getComponent(Sprite).spriteFrame = this.sf2;
                }
                this.currentBtn = this.btn2;
                this.btn2.getComponent(Sprite).spriteFrame = this.sf1;
                this.activeMonitor(this.mon2);
                break;
            case "Button3":
                if (this.currentBtn) {
                    this.currentBtn.getComponent(Sprite).spriteFrame = this.sf2;
                }
                this.currentBtn = this.btn3;
                this.btn3.getComponent(Sprite).spriteFrame = this.sf1;
                this.activeMonitor(this.mon3);
                break;
            case "Button4":
                if (this.currentBtn) {
                    this.currentBtn.getComponent(Sprite).spriteFrame = this.sf2;
                }
                this.currentBtn = this.btn4;
                this.btn4.getComponent(Sprite).spriteFrame = this.sf1;
                this.activeMonitor(this.mon4);
                break;
            case "Button5":
                if (this.currentBtn) {
                    this.currentBtn.getComponent(Sprite).spriteFrame = this.sf2;
                }
                this.currentBtn = this.btn5;
                this.btn5.getComponent(Sprite).spriteFrame = this.sf1;
                this.activeMonitor(this.mon5);
                break;
        }
    }

    activeMonitor(monitor: Node) {
        this.mon1.active = this.mon1 === monitor;
        this.mon2.active = this.mon2 === monitor;
        this.mon3.active = this.mon3 === monitor;
        this.mon4.active = this.mon4 === monitor;
        this.mon5.active = this.mon5 === monitor;
    }
}


