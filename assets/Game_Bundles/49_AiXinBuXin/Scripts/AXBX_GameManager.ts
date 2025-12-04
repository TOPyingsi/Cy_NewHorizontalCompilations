import { _decorator, Animation, Component, director, log, Node, SkeletalAnimation, tween, UI, v3 } from 'cc';
import { AXBX_UIManager } from './AXBX_UIManager';
import { AXBX_Constant } from './AXBX_Constant';
import { AXBX_AudioManager } from './AXBX_AudioManager';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('AXBX_GameManager')
export class AXBX_GameManager extends Component {
    @property(Node)
    public GameNode: Node = null;
    @property(Node)
    public CameraNode: Node = null;

    private static _instance: AXBX_GameManager = null;
    static AXBX_AudioData: any;
    public static get instance(): AXBX_GameManager {
        if (!AXBX_GameManager._instance) {
            AXBX_GameManager._instance = new AXBX_GameManager();
        }
        return AXBX_GameManager._instance;
    }

    protected onLoad(): void {
        AXBX_GameManager._instance = this;
    }
    protected onDestroy(): void {
        AXBX_GameManager._instance.destroy();
    }

    public PlyaerHp: number = 5;//生命值
    public EnemyHp: number = 5;

    public GameOver: boolean = false;//游戏是否结束


    public goodsList: string[] = [];//剩余池子
    public AIgoods: string = "";//真实物品
    public Fraudulentgoods: string = "";//欺骗物品

    start() {
        this.goodsList = AXBX_Constant.AXBX_PropType.filter(a => a);
        director.getScene().on("爱信不信_执行行为", this.DoAction, this);
        director.getScene().on("爱信不信_播放音效", this.PlayAudio, this);
        this.PlayAnimation("idle");
        this.scheduleOnce(() => {
            this.CameraNode.getComponent(Animation).play();
        }, 4)
        this.scheduleOnce(() => {
            this.GameStart();
        }, 6)
    }

    update(deltaTime: number) {
        this.AudioCD -= deltaTime;
    }

    //开始一轮游戏
    GameStart() {
        //获取AI提供猜测
        this.InitOnce();
        console.log("AI实际物品为:" + this.AIgoods);
        console.log("AI骗你物品为:" + this.Fraudulentgoods);
        AXBX_UIManager.instance.OpenText("我这拿的物品是" + this.Fraudulentgoods + "！", 3, () => {
            AXBX_UIManager.instance.SelectPanelInit();
            AXBX_UIManager.instance.ShowSelectPanel();
        });
    }

    //判断是否有欺骗
    Judge(Isdeceive: boolean) {
        if (Isdeceive == (this.AIgoods != this.Fraudulentgoods)) {//猜对了
            AXBX_AudioManager.globalAudioPlay("胜利");
            this.PlayAnimation("Yes");
            AXBX_UIManager.instance.node.getChildByPath("对错/对").active = true;
            AXBX_UIManager.instance.node.getChildByPath("对错/对").getComponent(Animation).play();
            this.ChanggeHp(false, -1);
        } else {//猜错了
            AXBX_AudioManager.globalAudioPlay("失败");
            this.PlayAnimation("No");
            AXBX_UIManager.instance.node.getChildByPath("对错/错").active = true;
            AXBX_UIManager.instance.node.getChildByPath("对错/错").getComponent(Animation).play();
            this.ChanggeHp(true, -1);
        }
        this.scheduleOnce(() => {
            if (!this.GameOver) {
                if (Isdeceive == (this.AIgoods != this.Fraudulentgoods) && (this.Fraudulentgoods == this.AIgoods)) {//猜对了
                    this.GameStart();
                } else {
                    AXBX_UIManager.instance.ShowTestPanel();
                }
            }
        }, 3)
    }

    //执行行为
    DoAction(action: string) {
        AXBX_UIManager.instance.HideSelectPanel();
        let Audioname = this.getAudioNameByActionAndGoods(action, this.AIgoods);
        this.scheduleOnce(() => {
            this.PlayAnimation("Listen");
            AXBX_AudioManager.globalAudioPlay(Audioname);
        }, 1)
        this.scheduleOnce(() => {
            //判断是否进入下一轮
            if (AXBX_UIManager.instance.node.getChildByName("选择栏").children.length > 0) {
                AXBX_UIManager.instance.ShowSelectPanel();
            } else {
                //让玩家选择
                AXBX_UIManager.instance.node.getChildByName("判断框").active = true;
                AXBX_UIManager.instance.node.getChildByName("判断框").scale = v3(0, 0, 0);
                tween(AXBX_UIManager.instance.node.getChildByName("判断框"))
                    .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backOut" })
                    .start();
            }
        }, 6)
    }

    //获得音效
    public getAudioNameByActionAndGoods(action: string, fraudulentGoods: string): string {
        // 首先尝试查找完全匹配的数据
        const exactMatch = AXBX_Constant.AXBX_AudioData.find(audio =>
            audio.属于 === fraudulentGoods && audio.音效类型 === action
        );

        if (exactMatch) {
            return exactMatch.音效名字;
        }

        // 如果没有精确匹配，获取同一物品类型的所有音效数据
        const sameGoodsAudios = AXBX_Constant.AXBX_AudioData.filter(audio =>
            audio.属于 === fraudulentGoods
        );

        // 如果有同物品类型的音效数据，随机返回其中一个
        if (sameGoodsAudios.length > 0) {
            const randomIndex = Math.floor(Math.random() * sameGoodsAudios.length);
            return sameGoodsAudios[randomIndex].音效名字;
        }

        return "苹果砸";
    }

    //获取一轮次的初始数据
    InitOnce() {
        if (this.goodsList.length == 0) {
            this.goodsList = AXBX_Constant.AXBX_PropType.filter(a => a);
        }
        const randomIndex = Math.floor(Math.random() * this.goodsList.length);
        this.AIgoods = this.goodsList[randomIndex];
        if (Math.random() < 0.5) {
            this.Fraudulentgoods = this.AIgoods;
        } else {
            const randomOtherIndex = Math.floor(Math.random() * this.goodsList.length);
            this.Fraudulentgoods = this.goodsList[randomOtherIndex];
        }
        // 从goodsList中移除AIgoods
        this.goodsList = this.goodsList.filter(item => item != this.AIgoods);
        console.log("池子剩余" + this.goodsList);

    }


    //修改生命值
    ChanggeHp(IsPlayer: boolean, num: number) {
        if (IsPlayer) {
            this.PlyaerHp += num;
        } else {
            this.EnemyHp += num;
        }
        AXBX_UIManager.instance.ShowHP(this.PlyaerHp, this.EnemyHp);
        if (this.PlyaerHp <= 0) {
            this.GameOver = true;
            this.PlayAnimation("Lose");
            director.getScene().emit("爱信不信_游戏结束", false);
        }
        if (this.EnemyHp <= 0) {
            this.GameOver = true;
            this.PlayAnimation("Win");
            director.getScene().emit("爱信不信_游戏结束", true);
        }
    }

    //主角播放动画
    PlayAnimation(name: string) {
        this.GameNode.getChildByName("女孩").getComponent(SkeletalAnimation).play(name);
    }

    private AudioCD: number = 0;
    //播放音效
    PlayAudio(AudioName: string) {
        if (this.AudioCD > 0) {
            UIManager.ShowTip("请等当前音效完毕再点击播放！");
            return;
        }
        AXBX_AudioManager.globalAudioPlay(AudioName);
        this.AudioCD = 5;
    }
}


