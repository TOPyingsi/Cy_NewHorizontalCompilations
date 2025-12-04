import { _decorator, Component, debug, easing, Node, sp, Texture2D, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

export enum XYRZZ_PlayerState {
    默认 = "daiji",
    甩杆 = "shuaigan",
    钓鱼 = "diaoyu",
    钓鱼2 = "diaoyu2",
    成功 = "chenggong",
    失败 = "shibai",
    窜天猴 = "1cuantianhou_diaofa",
    飞天无极钓 = "2feitianwujidiao_diaofa",
    飞天无极钓圆满 = "2feitianwujidiaodayuanman_diaofa",
    回首掏 = "4huishoutao_diaofa",
    太极钓法 = "5taiji_diaofa",
    老汉踩单车钓法 = "6laohancaidanche_diaofa",
    打鱼棒法 = "7dayubangfa_diaofa",
    乾坤大挪鱼 = "8qiankundanuoyu_diaofa",
    Z字抖动 = "9zzidoudong_diaofa",
}

@ccclass('XYRZZ_GamePlayer')
export class XYRZZ_GamePlayer extends Component {
    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;
    @property({ type: [Texture2D] })
    FishingRod: Texture2D[] = [];
    public FishNode: Node = null;//鱼节点

    public State: XYRZZ_PlayerState = XYRZZ_PlayerState.默认;
    start() {



    }


    //主角换动作
    public ChanggeState(state: XYRZZ_PlayerState, isLoop: boolean = false, CallBack?: Function) {
        this.State = state;
        this.skeleton.clearTracks();
        this.skeleton.setAnimation(0, state, isLoop);
        if (CallBack) {
            this.skeleton.setCompleteListener(() => {
                CallBack();
            });
        } else {
            this.skeleton.setCompleteListener(() => {

            })
        }
    }


    //主角换肤
    private keletonName: string[] = ["pifu/juese_ashuai", "pifu/juese_agan", "pifu/juese_jianglao", "pifu/juese_axin"];
    public ChanggeShenti(id: number) {
        this.skeleton.setSkin(this.keletonName[id]);
    }
    public ChanggeYuGane(id: number) {
        this.skeleton.setSlotTexture("yugan", this.FishingRod[id]);
    }

    //更换显示的鱼
    public ChanggeFish(id: number) {
        this.node.getChildByName("鱼").children.forEach((cd: Node, index: number) => {
            if (index == id) {
                this.FishNode = cd;
                cd.active = true;
            } else {
                cd.active = false;
            }
        })
    }

    //播放鱼游过来的动画
    public PlayTweenFish(CallBack: Function) {
        if (this.FishNode == null) {
            console.log("没有激活的鱼，无法播放动画！");
            return;
        }
        this.FishNode.getComponent(sp.Skeleton).clearAnimations();
        this.FishNode.active = false;
        tween(this.FishNode)
            .delay(1)
            .to(0, { worldPosition: v3(1800, 0), angle: 80 })
            .call(() => {
                this.FishNode.active = true;
            })
            .to(1, { worldPosition: v3(1500, 100) }, { easing: "backOut" })
            .delay(0.5)
            .to(1.2, { position: v3(0, 0) })
            .to(0, { angle: 0 })
            .call(() => {
                this.FishNode.getComponent(sp.Skeleton).setAnimation(0, "animation");
                CallBack();
            })
            .start();
    }
}


