import { _decorator, Component, Node, Sprite, Tween, tween } from 'cc';
import { LBB_GameManager } from './LBB_GameManager';
import { PLAY_AUDIO } from './LBB_Event';
import { AUDIO_ENUM, EVENT_ENUM } from './LBB_Enum';
const { ccclass, property } = _decorator;

@ccclass('LBB_RoleCtrl')
export class LBB_RoleCtrl extends Component {
    public static Instance: LBB_RoleCtrl = null

    role1_index: number = 1;
    role2_index: number = 1;
    role3_index: number = 5;

    @property(Node) role1_mon1: Node = null;
    @property(Node) role1_mon3: Node = null;
    @property(Node) role1_mon4: Node = null;
    @property(Node) role1_mainMon: Node = null;
    @property(Node) role1_tulian: Node = null;

    @property(Node) role2_mon1: Node = null;
    @property(Node) role2_mon2: Node = null;
    @property(Node) role2_mainMon: Node = null;
    @property(Node) role2_tulian: Node = null;

    @property(Node) role3_mon5: Node = null;
    @property(Node) role3_tulian: Node = null;

    @property(Node) wdj: Node = null;//温度计
    @property(Node) flameButton: Node = null;

    isRole1Attack: boolean = false;
    isRole2Attack: boolean = false;
    isRole3Attack: boolean = false;

    role1TimeOut: number = 0;
    role2TimeOut: number = 0;
    role3TimeOut: number = 0;

    protected onLoad(): void {
        LBB_RoleCtrl.Instance = this;

        if (this.flameButton) {
            this.flameButton.on(Node.EventType.TOUCH_START, this.onFlameTouchStart, this);
            this.flameButton.on(Node.EventType.TOUCH_END, this.onFlameTouchEnd, this);
            this.flameButton.on(Node.EventType.TOUCH_CANCEL, this.onFlameTouchEnd, this);
        }
    }

    protected start(): void {
        this.role1_move();
        this.role2_move();
        this.startTemperatureDecrease();
    }


    role1_move() {
        this.role1TimeOut = setTimeout(() => {
            this.role1_index = 3;
            this.refeshRoles();

            this.role1TimeOut = setTimeout(() => {
                this.role1_index = 4;
                this.refeshRoles();

                this.role1TimeOut = setTimeout(() => {
                    this.role1_index = 6;
                    PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.ROLE1, this);
                    this.refeshRoles();

                    this.role1TimeOut = setTimeout(() => {
                        PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.ATTACK, this);
                        this.role1_index = 7;
                        this.refeshRoles();

                        this.role2TimeOut = setTimeout(() => {
                            LBB_GameManager.Instance.gameOver(false);
                        }, 1000)

                    }, 7000);
                }, 15000);
            }, 15000);
        }, 20000);
    }

    role2_move() {
        this.role2TimeOut = setTimeout(() => {
            this.role2_index = 2;
            this.refeshRoles();

            this.role2TimeOut = setTimeout(() => {
                this.role2_index = 1;
                this.refeshRoles();

                this.role2TimeOut = setTimeout(() => {
                    this.role2_index = 2;
                    this.refeshRoles();

                    this.role2TimeOut = setTimeout(() => {
                        this.role2_index = 6;
                        PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.ROLE2, this);
                        this.refeshRoles();

                        this.role2TimeOut = setTimeout(() => {
                            this.role2_index = 7;
                            PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.ATTACK, this);
                            this.refeshRoles();
                            this.role2TimeOut = setTimeout(() => {
                                LBB_GameManager.Instance.gameOver(false);
                            }, 1000)

                        }, 5000);
                    }, 10000);
                }, 10000);
            }, 8000);
        }, 7000);
    }

    refesh() {
        this.role1_index = 1;
        this.role2_index = 1;
        this.role3_index = 5;
        this.refeshRoles();
    }

    refeshRoles() {
        console.log("refeshRoles")
        this.refeshRole1();
        this.refeshRole2();
        this.refeshRole3();
    }

    refeshRole1() {
        switch (this.role1_index) {
            case 1:
                this.role1_mon1.active = true;
                this.role1_mon3.active = false;
                this.role1_mon4.active = false;
                this.role1_mainMon.active = false;
                this.role1_tulian.active = false;
                break;
            case 3:
                this.role1_mon1.active = false;
                this.role1_mon3.active = true;
                this.role1_mon4.active = false;
                this.role1_mainMon.active = false;
                this.role1_tulian.active = false;
                break;
            case 4:
                this.role1_mon1.active = false;
                this.role1_mon3.active = false;
                this.role1_mon4.active = true;
                this.role1_mainMon.active = false;
                this.role1_tulian.active = false;
                break;
            case 6:
                this.role1_mon1.active = false;
                this.role1_mon3.active = false;
                this.role1_mon4.active = false;
                this.role1_mainMon.active = true;
                this.role1_tulian.active = false;
                break;
            case 7:
                this.role1_mon1.active = false;
                this.role1_mon3.active = false;
                this.role1_mon4.active = false;
                this.role1_mainMon.active = false;
                this.role1_tulian.active = true;
                break;
        }
    }

    refeshRole2() {
        switch (this.role2_index) {
            case 1:
                this.role2_mon1.active = true;
                this.role2_mon2.active = false;
                this.role2_mainMon.active = false;
                this.role2_tulian.active = false;
                break;
            case 2:
                this.role2_mon1.active = false;
                this.role2_mon2.active = true;
                this.role2_mainMon.active = false;
                this.role2_tulian.active = false;
                break;
            case 6:
                this.role2_mon1.active = false;
                this.role2_mon2.active = false;
                this.role2_mainMon.active = true;
                this.role2_tulian.active = false;
                break;
            case 7:
                this.role2_mon1.active = false;
                this.role2_mon2.active = false;
                this.role2_mainMon.active = false;
                this.role2_tulian.active = true;
                break;
        }
    }

    refeshRole3() {
        switch (this.role3_index) {
            case 5:
                this.role3_mon5.active = true;
                this.role3_tulian.active = false;
                break;
            case 7:
                this.role3_mon5.active = false;
                this.role3_tulian.active = true;
                break;
        }
    }


    startTemperatureDecrease() {
        if (!this.wdj) return;
        const sprite = this.wdj.getComponent(Sprite);
        if (!sprite) return;

        if (this.heatTween) return;

        tween(sprite)
            .to(30, { fillRange: 0.5 })
            .call(() => {
                PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.WRONG, this);

                LBB_GameManager.Instance.yellow.active = true;
                LBB_GameManager.Instance.y.active = true;
            })
            .to(15, { fillRange: 0.25 })
            .call(() => {
                PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.WRONG, this);

                LBB_GameManager.Instance.yellow.active = false;
                LBB_GameManager.Instance.y.active = false;
                LBB_GameManager.Instance.red.active = true;
                LBB_GameManager.Instance.r.active = true;
            })
            .to(15, { fillRange: 0 })
            .call(() => {
                PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.ATTACK, this);
                this.role3_index = 7;
                this.refeshRoles();
                this.scheduleOnce(() => {
                    LBB_GameManager.Instance.gameOver(false);
                }, 1);
            }).tag(1)
            .start();
    }

    private heatTween: any = null;

    private onFlameTouchStart() {
        const sprite = this.wdj.getComponent(Sprite);
        Tween.stopAllByTag(1);

        this.heatTween = tween(sprite)
            .to(0.5, { fillRange: Math.min(sprite.fillRange + 0.1, 1) }) // 每0.5秒增加0.1，不超过1
            .call(() => {
                this.onFlameTouchStart();
            })
            .start();
        if (sprite.fillRange >= 0.5 && LBB_GameManager.Instance.yellow.active && LBB_GameManager.Instance.y.active) {
            LBB_GameManager.Instance.yellow.active = false;
            LBB_GameManager.Instance.y.active = false;
        } else if (sprite.fillRange >= 0.25 && LBB_GameManager.Instance.red.active && LBB_GameManager.Instance.r.active) {
            LBB_GameManager.Instance.red.active = false;
            LBB_GameManager.Instance.r.active = false;
        }
    }

    private onFlameTouchEnd() {
        // 停止升温动画
        if (this.heatTween) {
            this.heatTween.stop();
            this.heatTween = null;
        }
        this.startTemperatureDecrease();
    }
}


