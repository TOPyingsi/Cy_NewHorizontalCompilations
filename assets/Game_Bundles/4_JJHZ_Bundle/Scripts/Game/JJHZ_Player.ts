import { _decorator, Animation, AnimationClip, AudioClip, AudioSource, Color, color, Component, EventTouch, math, Node, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { JJHZ_Incident } from '../JJHZ_Incident';
import { JJHZ_GameManager } from './JJHZ_GameManager';
import { JJHZ_EventManager, JJHZ_MyEvent } from '../JJHZ_EventManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('JJHZ_Player')
export class JJHZ_Player extends Component {
    public ID: number = -1;//角色ID

    public Audio: AudioSource = null;
    public IsPause: boolean = false;

    public TouchPos: Vec2 = null;
    start() {
        this.Audio = this.node.getComponent(AudioSource);

        this.node.on(Node.EventType.TOUCH_START, (TouchData: EventTouch) => {
            this.TouchPos = TouchData.getLocation();
        }, this);
        this.node.on(Node.EventType.TOUCH_END, (TouchData: EventTouch) => {
            this.OnTouchEnd(TouchData);
        }, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, (TouchData: EventTouch) => {
            this.OnTouchEnd(TouchData);
        }, this);
        this.Init();
        JJHZ_EventManager.on(JJHZ_MyEvent.播放, () => {
            // if (this.Audio.clip != null && this.Audio.playing == false && this.ID != -1 && this.IsPause == false) {
            //     this.ReAudio();
            // }

            if (this.Audio.clip != null && this.ID != -1 && this.IsPause == false) {
                if (this.Audio.clip.getDuration() > 6 && this.Audio.playing == true) {
                } else {
                    this.ReAudio();
                }
            }
        })

        JJHZ_EventManager.on(JJHZ_MyEvent.开启音效, () => {
            this.AudioOpen();
        });
        JJHZ_EventManager.on(JJHZ_MyEvent.关闭音效, () => {
            this.AudioExit();
        });
        if (JJHZ_GameManager.IsPauseAudio) {
            this.AudioExit();
        }
    }

    //音效关闭
    AudioExit() {
        this.Audio.volume = 0;
    }
    //音效开启
    AudioOpen() {
        this.Audio.volume = 1;
    }

    //初始化裸人图像
    Init() {
        JJHZ_Incident.LoadSprite("默认图/" + JJHZ_GameManager.GameScene).then((sp: SpriteFrame) => {
            this.node.getComponent(Sprite).spriteFrame = sp;
        })
    }

    public SetState(id: number) {//-1表示回到默认态
        this.ID = id;
        if (id == -1) {
            this.node.getComponent(Sprite).enabled = true;
            this.node.getChildByName("身体").active = false;
            this.node.getChildByName("头").active = false;
            this.StopAudio();
            this.StopAnimation();
            this.node.getChildByName("身体").getComponent(Sprite).color = new Color(255, 255, 255, 255);
            this.node.getChildByName("头").getComponent(Sprite).color = new Color(255, 255, 255, 255);
            this.node.getChildByName("头").getComponent(Animation).removeClip(this.node.getChildByName("头").getComponent(Animation).defaultClip, true);
            JJHZ_GameManager.Instance.GameState();
            return;
        } else {
            this.node.getComponent(Sprite).enabled = false;
            this.node.getChildByName("身体").active = true;
            this.node.getChildByName("头").active = true;
        }
        this.IsPause = false;
        JJHZ_Incident.LoadSprite("Scene" + JJHZ_GameManager.GameScene + "Sprite/" + id + "/身体").then((sp: SpriteFrame) => {
            this.node.getChildByName("身体").getComponent(Sprite).spriteFrame = sp;
        })

        BundleManager.GetBundle("4_JJHZ_Bundle").load("Scene" + JJHZ_GameManager.GameScene + "Sprite/" + id + "/Play", AnimationClip, (err, data) => {
            if (err) {
                BundleManager.GetBundle("4_JJHZ_Bundle2").load("Scene" + JJHZ_GameManager.GameScene + "Sprite/" + id + "/Play", AnimationClip, (err, data) => {
                    if (err) {
                        console.log("没有找到资源AnimationClip");
                        return;
                    }
                    this.node.getChildByName("头").getComponent(Animation).defaultClip = data;
                    this.ReAnimation();
                })
                return;
            }
            this.node.getChildByName("头").getComponent(Animation).defaultClip = data;
            this.ReAnimation();
        })
        if (JJHZ_GameManager.Instance.AudioList[id]) {
            this.node.getComponent(AudioSource).stop();
            this.node.getComponent(AudioSource).clip = JJHZ_GameManager.Instance.AudioList[id];
            JJHZ_GameManager.Instance.GameState();
        } else {
            JJHZ_Incident.LoadMusic("Audio/" + JJHZ_GameManager.AudioIndex[JJHZ_GameManager.GameScene] + "/" + id).then((ad: AudioClip) => {
                this.node.getComponent(AudioSource).stop();
                this.node.getComponent(AudioSource).clip = ad;
                JJHZ_GameManager.Instance.GameState();
            })
        }
        this.node.getChildByName("身体").getComponent(Sprite).color = new Color(255, 255, 255, 255);
        this.node.getChildByName("头").getComponent(Sprite).color = new Color(255, 255, 255, 255);
    }

    //立马暂停音乐
    public StopAudio() {
        this.Audio.stop();
    }
    //立马继续音乐
    public ReAudio() {
        this.Audio.play();
    }
    //开始动画
    public ReAnimation() {
        this.node.getChildByName("头").getComponent(Animation).play();
    }
    //暂停动画
    public StopAnimation() {
        this.node.getChildByName("头").getComponent(Animation).stop();
    }


    //角色被点击
    public OnTouchEnd(TouchData: EventTouch) {
        if (Math.abs(TouchData.getLocation().y - this.TouchPos.y) < 30) {
            if (this.IsPause) {
                this.IsPause = false;
                this.ReAnimation();

                this.node.getChildByName("身体").getComponent(Sprite).color = new Color(255, 255, 255, 255);
                this.node.getChildByName("头").getComponent(Sprite).color = new Color(255, 255, 255, 255);
            } else {
                this.IsPause = true;
                this.StopAudio();
                this.StopAnimation();
                this.node.getChildByName("身体").getComponent(Sprite).color = new Color(90, 90, 90, 255);
                this.node.getChildByName("头").getComponent(Sprite).color = new Color(90, 90, 90, 255);
            }
        }
        if (this.TouchPos.y - TouchData.getLocation().y > 30) {//下滑
            this.ReStart();
        }
    }

    //重置
    ReStart() {
        JJHZ_EventManager.Scene.emit(JJHZ_MyEvent.RemoveMusic, this.ID);
        this.SetState(-1);
    }
}


