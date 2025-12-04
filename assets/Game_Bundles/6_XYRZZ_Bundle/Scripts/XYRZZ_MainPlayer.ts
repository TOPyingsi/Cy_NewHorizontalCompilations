import { _decorator, Component, debug, log, Node, Skeleton, sp, SpriteFrame, Texture2D } from 'cc';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_GameManager } from './Game/XYRZZ_GameManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_MainPlayer')
export class XYRZZ_MainPlayer extends Component {
    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;
    @property({ type: [Texture2D] })
    FishingRod: Texture2D[] = [];

    start() {
        XYRZZ_GameManager.Instance.Game.getChildByPath("MainPlayer").on(Node.EventType.TOUCH_START, () => { this.MainPlayerTouchStar(); })
        XYRZZ_GameManager.Instance.Game.getChildByPath("MainPlayer").on(Node.EventType.TOUCH_END, () => { this.MainPlayerTouchEnd(); })
        XYRZZ_GameManager.Instance.Game.getChildByPath("MainPlayer").on(Node.EventType.TOUCH_CANCEL, () => { this.MainPlayerTouchEnd(); })
    }

    //角色被按下
    MainPlayerTouchStar() {
        XYRZZ_AudioManager.globalAudioPlay("拉鱼线");
        XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.点击主页玩家);
        XYRZZ_GameManager.Instance.LoadTweenMonney();
        this.skeleton.loop = false;
        this.skeleton.setAnimation(0, "diaoyu");
    }
    //角色被抬起
    MainPlayerTouchEnd() {
        this.skeleton.loop = true;
        this.skeleton.setAnimation(0, "daiji");
    }
    private keletonName: string[] = ["pifu/juese_ashuai", "pifu/juese_agan", "pifu/juese_jianglao", "pifu/juese_axin"];
    //切换身体
    ChanggeShenti(index: number) {
        this.skeleton.setSkin(this.keletonName[index]);
    }

    //切换鱼竿
    ChanggeYuGane(index: number) {
        this.skeleton.setSlotTexture("yugan", this.FishingRod[index]);
    }
}


