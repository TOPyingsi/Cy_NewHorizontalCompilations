import { _decorator, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { XYRZZ_PlayerState, XYRZZ_GamePlayer } from './XYRZZ_GamePlayer';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_PoolManager } from './Utils/XYRZZ_PoolManager';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_SkillBox } from './XYRZZ_SkillBox';
import { XYRZZ_GameManager } from './Game/XYRZZ_GameManager';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_CombatPanel')
export class XYRZZ_CombatPanel extends Component {
    @property(Node)
    Player: Node = null;
    @property(Node)
    UINode: Node = null;
    @property(Node)
    CuoZhaoContent: Node = null;
    private myProgressBar: Sprite;
    private EnemyProgressBar: Sprite;
    public FishID: number = 0;//鱼的ID
    public FishData: { Name: string, price: number, weight: number, restrain: string, variation: string, place: string, describe: string } = null;
    public RecommendFishing: string = "";//推荐钓法
    public energy: number = 0;//能量条(满了可以搓招)
    public FishKill: string[] = [];//本局可以使用的钓法

    public My_pull: number = 0;//我方拉力
    public Enemy_pull: number = 0;//敌方拉力
    public My_Oncepull: number = 0;//我方单次拉力
    public Enemy_Oncepull: number = 0;//敌方单次拉力

    public Pause: boolean = false;//是否搓招
    public CuoZaoTime: number = 0;//搓招剩余时间
    public gameIsOver: boolean = false;//结束(包括胜利和失败)
    public gameIsBegin: boolean = false;//游戏是否开始(鱼上钩)
    public GameIndex: number = 50;//游戏当前进度

    public FishingRodIsRestrain: boolean = false;//鱼竿是否克制
    public FishingRodRestrainScale: number = 1;//鱼竿克制倍数

    private Lable_CuoZaoTime: Label = null;
    private Lable_BaiFenBi: Label = null;
    private Lable_Mypull: Label = null;
    private Lable_Enemypull: Label = null;

    protected start(): void {
        this.myProgressBar = this.node.getChildByPath("UI/进度条/进度条黄").getComponent(Sprite);
        this.EnemyProgressBar = this.node.getChildByPath("UI/进度条/进度条蓝").getComponent(Sprite);
        this.Lable_CuoZaoTime = this.UINode.getChildByPath("搓招区/时间条/时间").getComponent(Label);
        this.Lable_BaiFenBi = this.UINode.getChildByPath("进度条/百分比").getComponent(Label);
        this.Lable_Mypull = this.UINode.getChildByPath("进度条/我方拉力").getComponent(Label);
        this.Lable_Enemypull = this.UINode.getChildByPath("进度条/敌方拉力").getComponent(Label);
    }
    //参数是表示这局捕的是什么鱼
    Show(id: number) {

        if (XYRZZ_GameData.Instance.GameData[6] == 0) {//新手教程
            id = 0;
        }
        this.GameIndex = 50;
        this.energy = 0;
        this.My_pull = 0;
        this.Enemy_pull = 0;
        this.FishID = id;
        this.gameIsOver = false;
        this.Pause = false;
        this.CuoZaoTime = 0;
        this.FishData = XYRZZ_Constant.FishData[this.FishID];
        XYRZZ_Constant.FishingPoleData.forEach((cd, index) => {
            if (cd.restrain.indexOf(this.FishData.Name) != -1) {
                this.RecommendFishing = cd.Name;
            }
        })
        this.InitPlayer();
        this.GetFishKill();//获取本局可以使用的技能
        this.InitUI();
        this.My_Oncepull = XYRZZ_GameManager.Instance.Power;
        this.Enemy_Oncepull = this.FishData.price * this.FishData.weight;
        if (XYRZZ_GameData.Instance.GameData[6] == 0) this.Enemy_Oncepull = 0;//教程关卡敌人无战力
        this.gameIsBegin = false;

        //判断鱼竿是否克制
        let FishingRodName = XYRZZ_GameData.Instance.FishingPoleLevel[XYRZZ_GameData.Instance.GameData[1]].Name;
        if (this.FishData.restrain == FishingRodName) {
            this.FishingRodIsRestrain = true;
        } else {
            this.FishingRodIsRestrain = false;
        }
        this.FishingRodRestrainScale = XYRZZ_GameData.Instance.FishingPoleLevel[XYRZZ_GameData.Instance.GameData[1]].Level;
    }

    OnbuttonClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "甩杆":
                this.OnThrowRodClick();
                break;
            case "拉":
                this.OnLaClick();
                break;
            case "放":
                this.OnFangClick();
                break;
            case "搓招":
                this.OpenCuoZhao();
                break;
            case "上":
            case "下":
            case "左":
            case "右":
            case "A":
            case "B":
                XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
                this.OnCuoZhao(btn.target.name);
                break;
        }

    }



    protected update(dt: number): void {
        this.SetProgressBar(this.GameIndex);
        if (this.gameIsOver || !this.gameIsBegin) {
            return;
        }
        if (this.Pause) {//搓招
            this.CuoZaoTime -= dt;
            this.Lable_CuoZaoTime.string = this.CuoZaoTime.toFixed(1) + "S";
            if (this.CuoZaoTime <= 0) {
                this.OnFangClick();
            }
        } else {//正常情况
            this.Enemy_pull += this.Enemy_Oncepull * dt;
            if (this.Enemy_pull > this.My_pull) {
                this.GameIndex -= dt * 4;
            } else if (this.Enemy_pull < this.My_pull) {
                this.GameIndex += dt * 4;
            }

            if (this.GameIndex <= 0) {//失败(空军)
                this.GameOver(false);
            }
            if (this.GameIndex >= 100) {//成功
                this.GameOver(true);
            }

        }
    }

    public CuoZhaoData: string = "";//搓招数据
    //点击上下左右AB
    OnCuoZhao(str: string) {
        if (this.CuoZhaoData.length < 8) {
            this.CuoZhaoData += str;
            XYRZZ_Incident.Loadprefab("Prefabs/按键").then((prefab: Prefab) => {
                let pre = XYRZZ_PoolManager.Instance.GetNode(prefab, this.CuoZhaoContent);
                XYRZZ_Incident.LoadSprite("UI/人物界面/" + str).then((sp: SpriteFrame) => {
                    pre.getComponent(Sprite).spriteFrame = sp;
                })
            })
        }
    }



    //点击拉
    OnLaClick() {
        XYRZZ_AudioManager.globalAudioPlay("拉鱼线");
        if (this.FishingRodIsRestrain == true) {
            this.My_pull += (this.My_Oncepull * this.FishingRodRestrainScale);
        } else {
            this.My_pull += this.My_Oncepull;
        }
        if (this.energy < 100) {
            this.Addenergy(5);
        }
        if (this.energy == 100) {//弹出放按钮
            this.UINode.getChildByPath("拉起区/能量条").active = false;
            this.UINode.getChildByPath("拉起区/能量底").active = false;
            this.UINode.getChildByPath("拉起区/搓招").active = true;
        }
    }
    //设置能量条
    Addenergy(num: number) {
        this.energy += num;
        this.UINode.getChildByPath("拉起区/能量条").getComponent(Sprite).fillRange = this.energy / 100;
    }
    //点击放
    OnFangClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.点击放);
        this.Pause = false;
        this.UINode.getChildByPath("拉起区/能量条").active = true;
        this.UINode.getChildByPath("拉起区/能量底").active = true;
        this.UINode.getChildByPath("拉起区/拉").active = true;
        this.UINode.getChildByPath("搓招区").active = false;
        this.Addenergy(-100);
        console.log(this.FishKill);
        console.log(this.CuoZhaoData);
        let data = XYRZZ_Constant.GetTableData(XYRZZ_Constant.FishingPoleData, "Data", this.CuoZhaoData);
        if (data) {
            if (this.FishKill.includes(data.Name)) {
                //施放技能
                this.fireSKill(data.Name);
            } else {
                XYRZZ_UIManager.HopHint("该招数无法在此局生效");
            }
        } else {
            XYRZZ_UIManager.HopHint("搓招失败！");
        }
    }
    //点击甩杆
    OnThrowRodClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.点击甩杆按钮);
        this.node.getChildByPath("UI/甩杆").active = false;
        this.Player.getComponent(XYRZZ_GamePlayer).ChanggeState(XYRZZ_PlayerState.甩杆, false, () => {
            this.Player.getComponent(XYRZZ_GamePlayer).ChanggeFish(this.FishID);
            this.Player.getComponent(XYRZZ_GamePlayer).PlayTweenFish(() => {
                this.Player.getComponent(XYRZZ_GamePlayer).ChanggeState(XYRZZ_PlayerState.钓鱼, true);
                this.UINode.getChildByName("拉起区").active = true;
                this.UINode.getChildByPath("拉起区/能量条").active = true;
                this.UINode.getChildByPath("拉起区/能量底").active = true;
                this.UINode.getChildByPath("拉起区/能量条").getComponent(Sprite).fillRange = 0;
                this.UINode.getChildByPath("拉起区/搓招").active = false;
                this.gameIsBegin = true;
                XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.鱼上钩);
            });
        });
    }

    //初始化人
    InitPlayer() {
        //设置游戏人物和鱼竿
        this.Player.getComponent(XYRZZ_GamePlayer).ChanggeShenti(XYRZZ_GameData.Instance.GameData[0]);
        this.Player.getComponent(XYRZZ_GamePlayer).ChanggeYuGane(XYRZZ_GameData.Instance.GameData[1]);
        this.Player.getComponent(XYRZZ_GamePlayer).ChanggeState(XYRZZ_PlayerState.默认, true);
    }
    //初始化UI
    InitUI() {
        this.UINode.getChildByPath("甩杆").active = true;
        this.Player.getComponent(XYRZZ_GamePlayer).ChanggeFish(-1);
        this.UINode.getChildByPath("目标/名字").getComponent(Label).string = `目标：${this.FishData.Name}`;
        this.node.getChildByPath("技能提示/推荐钓法").getComponent(Label).string = `推荐钓法\n${this.RecommendFishing}`;
        this.UINode.getChildByPath("搓招区/技能栏").removeAllChildren();
        XYRZZ_Incident.Loadprefab("Prefabs/技能框").then((pre: Prefab) => {
            this.FishKill.forEach((cd) => {
                let nd = instantiate(pre);
                nd.setParent(this.UINode.getChildByPath("搓招区/技能栏"));
                nd.getComponent(XYRZZ_SkillBox).Show(cd);
            })
        })

    }

    //设置进度条(index100为赢0为输)
    public SetProgressBar(index: number) {
        this.myProgressBar.fillRange = index / 100;
        this.EnemyProgressBar.fillRange = 0 - (1 - index / 100);
        this.Lable_BaiFenBi.string = `${Math.floor(this.GameIndex)}%`;
        this.Lable_Mypull.string = `${XYRZZ_Incident.GetMaxNum(Math.floor(this.My_pull))}`;
        this.Lable_Enemypull.string = `${XYRZZ_Incident.GetMaxNum(Math.floor(this.Enemy_pull))}`;
    }

    //点击搓招
    public OpenCuoZhao() {
        XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.点击搓招);
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        this.UINode.getChildByPath("拉起区/搓招").active = false;
        this.UINode.getChildByPath("拉起区/拉").active = false;
        this.UINode.getChildByPath("搓招区").active = true;
        let num = this.CuoZhaoContent.children.length;
        for (let i = 0; i < num; i++) {
            XYRZZ_PoolManager.Instance.PutNode(this.CuoZhaoContent.children[0]);
        }
        this.CuoZhaoData = "";
        this.Pause = true;
        this.CuoZaoTime = 10;
        if (XYRZZ_GameData.Instance.GameData[6] == 0) {//新手教程
            this.CuoZaoTime = 9999;
        }
    }

    //获取本局可用招式
    public GetFishKill() {
        this.FishKill = [];
        let LevelKill: string[] = [];
        XYRZZ_GameData.Instance.FishingPoleDataLevel.forEach((cd, index) => {
            if (cd.Level > 0) {
                LevelKill.push(cd.Name);
            }
        })
        if (LevelKill.indexOf(this.RecommendFishing) != -1) {
            this.FishKill.push(this.RecommendFishing);
            LevelKill.splice(LevelKill.indexOf(this.RecommendFishing), 1);
        }
        let killleng = this.FishKill.length;
        for (let i = 0; i < (3 - killleng); i++) {
            if (LevelKill.length > 0) {
                let num = Math.floor(Math.random() * LevelKill.length);//获得随机数
                this.FishKill.push(LevelKill[num]);
                LevelKill.splice(num, 1);
            } else {
                break;
            }
        }
    }



    //游戏结束
    GameOver(IsWin: boolean) {
        this.gameIsOver = true;
        this.UINode.getChildByName("拉起区").active = false;
        if (IsWin) {
            this.Player.getComponent(XYRZZ_GamePlayer).ChanggeState(XYRZZ_PlayerState.成功, false);
        } else {
            this.Player.getComponent(XYRZZ_GamePlayer).ChanggeState(XYRZZ_PlayerState.失败, false);
        }
        XYRZZ_Incident.LoadSprite("UI/战斗场景/" + (IsWin ? "胜利" : "失败")).then((sp: SpriteFrame) => {
            let pre = this.UINode.getChildByPath("结算");
            pre.getComponent(Sprite).spriteFrame = sp;
            pre.setPosition(v3(2000, 220));
            tween(pre)
                .to(0.3, { position: v3(0, 220) })
                .delay(1)
                .to(0.5, { position: v3(-2000, 220) })
                .call(() => {
                    //结算关闭游戏场景
                    XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_CombatPanel);
                    if (IsWin) {
                        //打开卖钱界面
                        XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_SellFishPanel, [this.FishID]);
                        XYRZZ_GameData.Instance.FishRecord[this.FishID] += 1;
                    }
                })
                .start();
        })

    }



    //施放技能
    fireSKill(SkillName: string) {
        this.Show_SkillUI(SkillName);
        //计算增加的拉力，对于克制的鱼，增加的拉力是单次点击拉力*等级*Power开三次方根，不克制只有拉力*Power的开三次方根
        let pull = this.My_Oncepull;
        let data = XYRZZ_Constant.GetTableData(XYRZZ_Constant.FishingPoleData, "Name", SkillName);
        let Level: number = XYRZZ_Constant.GetTableData(XYRZZ_GameData.Instance.FishingPoleDataLevel, "Name", SkillName).Level;
        let Scale: number = 1;
        if (data.restrain.includes(this.FishData.Name)) {//克制
            Scale = Math.floor(Math.sqrt(Math.sqrt(Level * data.Power)));
        } else {//不克制
            Scale = Math.floor(Math.sqrt(Math.sqrt(data.Power)));
        }
        console.log("造成倍率+" + Scale);
        this.My_pull += this.My_Oncepull * Scale;

        let skillname: XYRZZ_PlayerState = null;
        switch (SkillName) {
            case "老汉踩单车": skillname = XYRZZ_PlayerState.老汉踩单车钓法; break;
            case "打鱼棒法": skillname = XYRZZ_PlayerState.打鱼棒法; break;
            case "乾坤大挪鱼": skillname = XYRZZ_PlayerState.乾坤大挪鱼; break;
            case "Z字抖动": skillname = XYRZZ_PlayerState.Z字抖动; break;
            case "窜天猴钓法": skillname = XYRZZ_PlayerState.窜天猴; break;
            case "飞天无极钓": skillname = XYRZZ_PlayerState.飞天无极钓; break;
            case "飞天无极钓圆满": skillname = XYRZZ_PlayerState.飞天无极钓圆满; break;
            case "回首掏": skillname = XYRZZ_PlayerState.回首掏; break;
            case "太极钓法": skillname = XYRZZ_PlayerState.太极钓法; break;
        }
        this.Player.getComponent(XYRZZ_GamePlayer).ChanggeState(skillname, false, () => {
            this.Player.getComponent(XYRZZ_GamePlayer).ChanggeState(XYRZZ_PlayerState.钓鱼, true);
        });
    }


    //技能图
    Show_SkillUI(Name: string) {
        let pre = this.UINode.getChildByName("技能图");
        pre.getChildByName("技能名").getComponent(Label).string = Name;
        pre.setPosition(v3(2000, 220));
        tween(pre)
            .to(0.3, { position: v3(400, 220) })
            .delay(1)
            .to(0.5, { position: v3(-2000, 220) })
            .start();
    }
}


