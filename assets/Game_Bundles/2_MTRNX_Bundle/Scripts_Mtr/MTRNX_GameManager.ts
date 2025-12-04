
import { _decorator, Animation, animation, AssetManager, assetManager, Camera, Color, Component, director, Event, EventTouch, game, instantiate, Label, log, Node, PhysicsSystem2D, Prefab, PrefabLink, randomRangeInt, resources, ScrollView, tween, UIOpacity, UITransform, v2, v3 } from 'cc';

import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import Banner from '../../../Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { MTRNX_Constant, MTRNX_GameMode, MTRNX_JKType, MTRNX_MTType } from './Data/MTRNX_Constant';
import { MTRNX_ZTool } from './Utils/MTRNX_ZTool';
import MTRNX_PrefsUtil from './Utils/MTRNX_PrefsUtil';
import { MTRNX_EventManager, MTRNX_MyEvent } from './MTRNX_EventManager';
import { MTRNX_Panel, MTRNX_UIManager } from './MTRNX_UIManager';
import { MTRNX_GameDate } from './MTRNX_GameDate';
import { MTRNX_ResourceUtil } from './Utils/MTRNX_ResourceUtil';
import { MTRNX_AudioManager } from './MTRNX_AudioManager';
import { MTRNX_Unit } from './MTRNX_Unit';
import { MTRNX_CameraShaking } from './MTRNX_CameraShaking';
import { MTRNX_StartPanel } from './UI/MTRNX_StartPanel';
import { MTRNX_WarningType } from './UI/MTRNX_GamePanel_Mtr';
import { MTRNX_ChallengePanel } from './UI/MTRNX_ChallengePanel';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_GameManager')
export class MTRNX_GameManager extends Component {
    private static _instance: MTRNX_GameManager = null;
    public static get Instance() {
        return this._instance;
    };
    static TestMode: boolean = true;
    //游戏模式
    static GameMode: MTRNX_GameMode = MTRNX_GameMode.Normal;
    //游戏难度
    static Gamedifficulty: number = 1;
    //关卡
    private static _lv: number = 1;
    static get Lv() {
        return MTRNX_GameManager._lv;
    }
    static set Lv(value: number) {
        value = MTRNX_ZTool.Clamp(value, 1, 15);
        MTRNX_GameManager._lv = value;
    }
    //钥匙
    static get Key() {
        return MTRNX_PrefsUtil.GetNumber(MTRNX_Constant.Key.Key);
    }
    static set Key(value: number) {
        value = value < 0 ? 0 : value;
        MTRNX_PrefsUtil.SetNumber(MTRNX_Constant.Key.Key, value);
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.KeysChanged);
    }
    @property(Node)
    GameNode: Node = null;
    //我方血量
    maxHp = 20;
    private _redHP: number = 100;
    get RedHP() {
        return this._redHP;
    }
    set RedHP(value: number) {
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Sandbox) {
            value = 999;//沙盒模式无敌
        }
        if (value <= 0 && !this.gameOver) {
            this.GameFail();
        }
        if (value > this.maxHp) {
            value = this.maxHp;
        }
        this._redHP = value;
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.RefrshRedHp, this._redHP, this.maxHp);
    }
    //敌方血量
    private _blueHP: number = 100;
    get BlueHP() {
        return this._blueHP;
    }
    set BlueHP(value: number) {
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Sandbox) {
            value = 999;//沙盒模式无敌
        }
        if (value <= 0 && !this.gameOver) {
            this.GameWin();
        }
        this._blueHP = value;
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.RefrshBlueHp, this._blueHP, MTRNX_Constant.MaxBlueHP[MTRNX_GameManager.Lv]);
    }
    //科技点
    private _point: number = 0;
    get Point() {
        return this._point;
    }
    set Point(value: number) {
        value = value < 0 ? 0 : value;
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.PointChanged);
        this._point = value;
    }
    //分数
    private _score: number = 0;
    get Score() {
        return this._score;
    }
    set Score(value: number) {
        value = value < 0 ? 0 : value;

        // if (value != 0 && value % Constant.MaxScoreReward == 0) {
        //     //TODO发放奖励
        //     console.error("发放奖励");
        // }

        this._score = value;

        if (MTRNX_StartPanel.IsBoss && value > 0) {//胜利 
            this.gameOver = false;
            MTRNX_GameManager.Instance.GameWin();
        }
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.ScoreChanged);

    }

    //科技等级
    scienceLv: number = 1;
    gameOver: boolean = false;

    //无CD
    noCD: boolean = false;

    SelectUnit: string = null;//杀戮模式下选择出场的单位
    MassacreUnit: Node = null;//杀戮模式主角单位

    protected onLoad(): void {
        MTRNX_GameManager._instance = this;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;//开启
    }

    protected onEnable(): void {
        MTRNX_EventManager.on(MTRNX_MyEvent.StartAddPoint, this.StartAddPoint, this);
        MTRNX_EventManager.on(MTRNX_MyEvent.StopAddPoint, this.StopAddPoint, this);
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal || MTRNX_GameManager.GameMode == MTRNX_GameMode.背后能源) {
            this.schedule(this.EnemyAI, 0.2);
        } else if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless) {
            this.schedule(this.EndlessAI, 0.2);
        } else if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) {
            if (MTRNX_StartPanel.IsBoss) {//Boss模式
                this.CreateBoss();
            } else {
                this.schedule(this.EndlessAI, 0.2);
            }
        }
    }

    protected onDisable(): void {
        MTRNX_EventManager.off(MTRNX_MyEvent.StartAddPoint, this.StartAddPoint, this);
        MTRNX_EventManager.off(MTRNX_MyEvent.StopAddPoint, this.StopAddPoint, this);
    }

    protected start(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "山海经逆袭");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UI.getChildByName("更多模式"));
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.StartAddPoint);
        this.RedHP = this.maxHp;
        this.BlueHP = MTRNX_Constant.MaxBlueHP[MTRNX_GameManager.Lv];

        this.LoadBg();
        this.Init();

        this.Score = 0;

        switch (MTRNX_GameManager.GameMode) {
            case MTRNX_GameMode.Endless:
                MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.GamePanel, [true]);//显示GamePanelUI
                break;
            case MTRNX_GameMode.Normal:
                MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.GamePanel, [true]);
                break;
            case MTRNX_GameMode.Massacre:
                MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.GamePanel, [false]);
                break;
            case MTRNX_GameMode.背后能源:
                MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.GamePanel, [true]);
                break;
        }

    }


    //游戏胜利
    GameWin() {
        if (this.gameOver) return;
        MTRNX_GameManager.Lv += 1;
        MTRNX_GameManager.SetLvUnlock(MTRNX_GameManager.Lv);
        this.gameOver = true;
        ProjectEventManager.emit(ProjectEvent.游戏结束, "山海经逆袭");
        this.StopEvents();
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.ShowWarning, MTRNX_WarningType.Win, () => {
            tween(this.GameNode.getChildByName("幕布").getComponent(UIOpacity))
                .to(1, { opacity: 255 }).call(() => {
                    MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.LoadingPanel, ["Start_Mtr"], () => {
                        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre && MTRNX_StartPanel.IsBoss) {
                            let point = Math.floor(this.Score * 10);
                            MTRNX_UIManager.HopHint("战胜Boss，获得奖励科技点：" + point);
                            MTRNX_GameDate.Instance.Money += point;
                            MTRNX_GameDate.DateSave();
                        } else {
                            MTRNX_UIManager.HopHint("进度已保存");
                        }
                        // UIManager.Instance.Treasure_box();
                    });
                }).start();
        });
    }

    //游戏失败
    GameFail() {
        if (this.gameOver) return;
        this.gameOver = true;

        ProjectEventManager.emit(ProjectEvent.游戏结束, "山海经逆袭");
        this.StopEvents();
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.ShowWarning, MTRNX_WarningType.Fail, () => {
            tween(this.GameNode.getChildByName("幕布").getComponent(UIOpacity))
                .to(1, { opacity: 255 }).call(() => {
                    MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.LoadingPanel, ["Start_Mtr"]);
                    if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) {
                        let point = Math.floor(this.Score * 1);
                        MTRNX_UIManager.HopHint("结算科技点：" + point);
                        MTRNX_GameDate.Instance.Money += point;
                        MTRNX_GameDate.DateSave();
                    }
                }).start();
        })
    }
    @property(Camera)
    MainCamera: Camera = null;
    LoadBg() {
        let name = "房子预制体/0";
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal) {
            name = "房子预制体/" + (MTRNX_GameManager.Lv - 1);
        }

        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless) {
            name = "房子预制体/" + (MTRNX_GameManager.Lv * 3 + MTRNX_GameManager.Lv - 1);
        }

        BundleManager.GetBundle("2_MTRNX_Bundle").load(name, Prefab, (err, event) => {
            if (err) return;
            let pre = instantiate(event);
            pre.setParent(this.GameNode.getChildByName("背景"));
        })
        let colors: Color[] = [new Color(173, 225, 255), new Color(163, 119, 86), new Color(18, 20, 24)];
        let color = colors[(MTRNX_GameManager.Lv - 1) % 3];
        this.MainCamera.clearColor = color;
    }
    Init() {
        // ResourceUtil.LoadPrefab("Unit/蜘蛛激光").then((prefab: Prefab) => {
        //     instantiate(prefab).setParent(this.GameNode.getChildByName("敌方单位"));
        // });
        // this.schedule(() => {
        //     ResourceUtil.LoadPrefab("Unit/人形哥").then((prefab: Prefab) => {
        //         instantiate(prefab).setParent(this.GameNode.getChildByName("敌方单位"));
        //     });
        // }, 3)
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) {
            this.SelectUnit = MTRNX_Constant.PlayerName[MTRNX_GameDate.Instance.CurrentSelect];
            MTRNX_ResourceUtil.LoadPrefab("杀戮模式/" + this.SelectUnit).then((prefab: Prefab) => {
                this.MassacreUnit = instantiate(prefab);
                this.MassacreUnit.setParent(MTRNX_GameManager.Instance.GameNode.getChildByName("我方单位"));
                this.MassacreUnit.getComponent(MTRNX_Unit).IsMassacreUnit = true;
                this.MassacreUnit.getComponent(MTRNX_Unit).InitMassacreEvent();
                MTRNX_AudioManager.AudioClipPlay("精英监控召唤");

                if (!this.MassacreUnit.getChildByName("image0").getComponent(Animation).getState("shoot")) {
                    MTRNX_GameManager.Instance.UI.getChildByName("技能一").active = false;
                }
                if (!this.MassacreUnit.getChildByName("image0").getComponent(Animation).getState("skill")) {
                    MTRNX_GameManager.Instance.UI.getChildByName("技能二").active = false;
                }
                if (!this.MassacreUnit.getChildByName("image0").getComponent(Animation).getState("skill2")) {
                    MTRNX_GameManager.Instance.UI.getChildByName("技能三").active = false;
                }
                if (!this.MassacreUnit.getChildByName("image0").getComponent(Animation).getState("skill3")) {
                    MTRNX_GameManager.Instance.UI.getChildByName("技能四").active = false;
                }
                let pre = this.MassacreUnit.getComponent(MTRNX_Unit);
                let data = MTRNX_Constant.GetPlayerDate(MTRNX_GameDate.Instance.CurrentSelect, MTRNX_GameDate.Instance.PlayerDate[MTRNX_GameDate.Instance.CurrentSelect]);
                //赋予属性
                pre.attack = data[0];
                pre.Hp = data[1];
                pre.Mp = data[2];
                pre.maxHp = data[1];
                pre.maxMp = data[2];
                this.MassacreUnit.getComponent(MTRNX_Unit).StateTime[0] = 99999999;
                this.MassacreUnit.getComponent(MTRNX_Unit).StateNum[0] = data[3];
                this.MassacreUnit.getComponent(MTRNX_Unit).StateTime[1] = 99999999;
                this.MassacreUnit.getComponent(MTRNX_Unit).StateNum[1] = data[4];
                this.MassacreUnit.getComponent(MTRNX_Unit).maxHp += MTRNX_GameDate.Instance.HpLevel * 50;
                this.MassacreUnit.getComponent(MTRNX_Unit).Hp += MTRNX_GameDate.Instance.HpLevel * 50;
            });
        }
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Sandbox) {
            this.UI.getChildByPath("测试工具/我方召唤").active = true;
            this.UI.getChildByPath("测试工具/敌方召唤").active = true;
            this.UI.getChildByPath("测试工具/无限科技").active = false;
            this.UI.getChildByPath("测试工具/无CD").active = false;
        }
    }

    /**停止一些定时器 */
    StopEvents() {
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.StopAddPoint);
        MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.StopAddRewardTimer);
    }

    /**增加最大血量 */
    AddMaxHp(value: number) {
        this.maxHp += value;
        this.RedHP += value;
    }

    //#region 科技点

    StartAddPoint() {
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.背后能源) {
            MTRNX_GameManager.Instance.Point = 1425;
            return;
        }
        this.schedule(this.AddPoint, 0.2)
    }

    StopAddPoint() {
        this.unschedule(this.AddPoint);
    }

    AddPoint() {
        MTRNX_GameManager.Instance.Point += 1 * MTRNX_GameManager.Instance.scienceLv;
    }

    GetAddPointPreSecond() {
        return 1 * MTRNX_GameManager.Instance.scienceLv * 5;
    }

    //#endregion

    ShakeWhite() {
        MTRNX_CameraShaking.Instance.Shaking();
        MTRNX_AudioManager.AudioClipPlay("爆炸扣血");
        tween(this.GameNode.getChildByName("闪屏").getComponent(UIOpacity))
            .to(0.1, { opacity: 150 })
            .to(0.1, { opacity: 0 })
            .start();
    }

    //敌人生成
    enemy = -1;
    enemyPoint = 0;
    enemyLevel = 1;
    enemyTime = 0;
    playTime = 0;
    haveHero = false;
    enemies: number[][];

    EnemyAI() {
        this.playTime++;
        if (this.scienceLv > this.enemyLevel) this.enemyLevel = this.scienceLv;
        // this.enemyPoint += GameManager_Mtr._lv * 20, 
        if (this.enemyTime > 0) this.enemyTime -= 0.2;
        if (!this.enemies) this.enemies = MTRNX_Constant.SceneMTData[MTRNX_GameManager._lv];
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.背后能源) this.enemies = MTRNX_Constant.SceneMTData[9];
        this.enemyPoint += 1 * this.enemyLevel;
        if (this.enemyLevel < 5 && this.enemyPoint >= MTRNX_Constant.ScienceCost[this.enemyLevel] && this.GameNode.getChildByName("我方单位").children.length == 0 && this.GameNode.getChildByName("敌方单位").children.length > 0) this.enemyPoint -= MTRNX_Constant.ScienceCost[this.enemyLevel], this.enemyLevel++;
        this.BossCreate();
        if (this.enemy == -1) {
            var enemyArr = this.enemies[0];
            var num = this.enemies[0].indexOf(105);
            this.enemy = -1;
            if (num != -1) {
                var sword = 0;
                var arrow = 0;
                for (let i = 0; i < this.GameNode.getChildByName("敌方单位").children.length; i++) {
                    const element = this.GameNode.getChildByName("敌方单位").children[i];
                    if (element.name != "马桶炮台") sword++;
                    else arrow++;
                }
                if (sword >= arrow) enemyArr.splice(num, 1), num = randomRangeInt(0, enemyArr.length), this.enemy = enemyArr[num];
                else this.enemy = 105;
            }
            else {
                num = randomRangeInt(0, enemyArr.length);
                this.enemy = enemyArr[num];
            }
        }
        if (this.enemyTime <= 0 && (this.GameNode.getChildByName("我方单位").children.length != 0 || this.GameNode.getChildByName("敌方单位").children.length == 0 || this.enemyPoint > 600)) this.EnemyCreate();
        // console.log("敌方科技" + this.enemyLevel, this.enemyPoint)
    }
    public EnemyDifficultyLevel: number = 0;
    public enemiesarray: number[][][] = [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], []],
    [[1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], []],
    [[1, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], []]];
    EndlessAI() {
        this.EnemyDifficultyLevel = Math.floor(Math.sqrt(Math.sqrt(this.Score)));
        this.enemyPoint += this.EnemyDifficultyLevel * 1.5;//无尽AI等级额外钱
        if (this.enemyTime > 0) this.enemyTime -= 0.2;
        if (!this.enemies) this.enemies = this.enemiesarray[MTRNX_GameManager.Lv - 1];
        this.enemyPoint += 1 * this.enemyLevel;
        if (this.enemyLevel < 5 && this.enemyPoint >= MTRNX_Constant.ScienceCost[this.enemyLevel] && this.GameNode.getChildByName("我方单位").children.length == 0 && this.GameNode.getChildByName("敌方单位").children.length > 0) this.enemyPoint -= MTRNX_Constant.ScienceCost[this.enemyLevel], this.enemyLevel++;
        this.BossCreate();
        if (this.enemy == -1) {
            var enemyArr = this.enemies[0];
            var num = this.enemies[0].indexOf(105);
            this.enemy = -1;
            if (num != -1) {
                var sword = 0;
                var arrow = 0;
                for (let i = 0; i < this.GameNode.getChildByName("敌方单位").children.length; i++) {
                    const element = this.GameNode.getChildByName("敌方单位").children[i];
                    if (element.name != "马桶炮台") sword++;
                    else arrow++;
                }
                if (sword >= arrow) enemyArr.splice(num, 1), num = randomRangeInt(0, enemyArr.length), this.enemy = enemyArr[num];
                else this.enemy = 105;
            }
            else {
                let max = this.EnemyDifficultyLevel > enemyArr.length ? enemyArr.length : this.EnemyDifficultyLevel;
                num = randomRangeInt(0, max);
                console.log("当前AI想要生成" + num);
                console.log("当前AI科技" + this.enemyLevel);
                console.log("当前AI钱" + this.enemyPoint);
                this.enemy = enemyArr[num];
            }
        }
        if (this.enemyTime <= 0 && (this.GameNode.getChildByName("敌方单位").children.length == 0 || this.enemyPoint > 600)) {
            this.EnemyCreate();
        }
    }


    EnemyCreate() {
        if (this.enemyPoint >= MTRNX_Constant.MTTypePointCost[this.enemy]) {
            this.enemyPoint -= MTRNX_Constant.MTTypePointCost[this.enemy];
            console.log("当前难度：" + this.EnemyDifficultyLevel);
            MTRNX_ResourceUtil.LoadPrefab("Unit/" + MTRNX_MTType[this.enemy]).then((prefab: Prefab) => {
                let pre = instantiate(prefab);
                pre.setParent(this.GameNode.getChildByName("敌方单位"));
                if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) {
                    let scale = (this.Score + 10000) / 10000;
                    pre.getComponent(MTRNX_Unit).maxHp *= MTRNX_GameManager.Gamedifficulty * scale;
                    pre.getComponent(MTRNX_Unit).Hp *= MTRNX_GameManager.Gamedifficulty * scale;
                }
                this.enemy = -1;
            });
            this.enemyTime += randomRangeInt(2, 5);
        }
    }

    BossCreate() {
        if (this.enemies[1].length == 0 || this.haveHero || this.BlueHP > 19 && this.playTime < 1500) return;
        this.haveHero = true;
        var num = randomRangeInt(0, this.enemies[1].length);
        // if (this.enemyPoint >= Constant.MTTypePointCost[this.enemies[1][num]]) {
        // this.enemyPoint -= Constant.MTTypePointCost[this.enemies[1][num]];
        MTRNX_ResourceUtil.LoadPrefab("Unit/" + MTRNX_MTType[this.enemies[1][num]]).then((prefab: Prefab) => {
            instantiate(prefab).setParent(this.GameNode.getChildByName("敌方单位"));
        });
        this.enemies[1].splice(num, 1);
        // }
    }

    //boss模式生成boss
    CreateBoss() {
        MTRNX_ResourceUtil.LoadPrefab("Boss/" + MTRNX_ChallengePanel.BossName).then((prefab: Prefab) => {
            instantiate(prefab).setParent(this.GameNode.getChildByName("敌方单位"));
        })
    }

    //-------------------------------------------杀戮模式----------------------------------------------------

    protected update(dt: number): void {
        //相机移动
        let Screenwidth = this.GameNode.getComponent(UITransform).width;
        if (this.MassacreUnit?.position) {
            let playerX: number = this.MassacreUnit.position.x;
            this.GameNode.getComponent(ScrollView).scrollTo(v2(playerX / Screenwidth, 0));
        }
    }


    //-------------------------------------------------------------------------------------------------------------------


    //#region 静态方法

    static GetLvUnlock(lv: number): boolean {
        if (lv == 1) return true;
        return MTRNX_PrefsUtil.GetBool(`${MTRNX_Constant.Key.Lv}_${lv}`);
    }

    static SetLvUnlock(lv: number) {
        console.error("解锁关卡", lv);
        MTRNX_PrefsUtil.SetBool(`${MTRNX_Constant.Key.Lv}_${lv}`, true);
    }

    static GetEndlessLvUnlock(lv: number) {
        if (MTRNX_GameManager.GetLvUnlock(lv * 3)) return true;
        return MTRNX_PrefsUtil.GetBool(`${MTRNX_Constant.Key.EndlessLv}_${lv}`);
    }

    static SetEndlessLvUnlock(lv: number) {
        MTRNX_PrefsUtil.SetBool(`${MTRNX_Constant.Key.EndlessLv}_${lv}`, true);
    }

    //#endregion
    @property(Node)
    UI: Node = null;
    cheaterIndex: number[] = [0];
    cheaterIndexMax: number[] = [3];//0科技
    //作弊区----------------------------
    OnCheatBtnClick(btn: EventTouch) {
        let name = btn.target.name;
        if (name == "无限科技") {
            Banner.Instance.ShowVideoAd(() => {
                this.cheaterIndex[0]++;
                this.UI.getChildByName("测试工具").getChildByName("无限科技").getComponentInChildren(Label).string = `无限科技(${this.cheaterIndex[0]}/3)`;
                if (this.cheaterIndex[0] >= this.cheaterIndexMax[0]) {
                    this.Point = 99999999;
                    btn.target.destroy();
                }
            })
        }
        if (name == "超级速度") {
            for (let pre of MTRNX_GameManager.Instance.GameNode.getChildByName("我方单位").children) {
                pre.getComponent(MTRNX_Unit).SpeedScale = 10;
            }
            for (let pre of MTRNX_GameManager.Instance.GameNode.getChildByName("敌方单位").children) {
                pre.getComponent(MTRNX_Unit).SpeedScale = 10;
            }
        }
        if (name == "无CD") {
            Banner.Instance.ShowVideoAd(() => {
                MTRNX_GameManager.Instance.noCD = true;
                btn.target.destroy();
            })
        }
        if (name == "我方自爆") {
            this.RedHP -= 9999999;
        }
        if (name == "直接获胜") {
            this.BlueHP -= 9999999;
        }
        if (name == "清场") {
            Banner.Instance.ShowVideoAd(() => {
                for (let pre of MTRNX_GameManager.Instance.GameNode.getChildByName("敌方单位").children) {
                    if (pre.getComponent(MTRNX_Unit) && pre.getComponent(MTRNX_Unit).Hp > 0) {
                        pre.getComponent(MTRNX_Unit).Hurt(99999999);
                    }
                }
            })
        }
        if (name == "我方召唤" || name == "敌方召唤") {
            btn.target.getChildByName("Bg").active = !btn.target.getChildByName("Bg").active;
        }
    }
    OnCallunit(btn: EventTouch) {
        let id = Number(btn.target.name);

        MTRNX_ResourceUtil.LoadPrefab("Unit/" + MTRNX_JKType[id]).then((prefab: Prefab) => {
            if (MTRNX_JKType[id] == "激光监控人") {
                for (let i = 0; i < 4; i++) {
                    let pre = instantiate(prefab);
                    pre.setParent(MTRNX_GameManager.Instance.GameNode.getChildByName("我方单位"));
                    pre.setPosition(pre.position.add(v3(-100 + i * 100)));
                }
            } else {
                instantiate(prefab).setParent(MTRNX_GameManager.Instance.GameNode.getChildByName("我方单位"));
            }
            if (MTRNX_JKType[id] == "泰坦监控人" || MTRNX_JKType[id] == "泰坦监控人2") {
                MTRNX_AudioManager.AudioClipPlay("精英监控召唤");
            }
            else {
                MTRNX_AudioManager.AudioClipPlay("普通监控召唤");
            }
        });
    }
    OnCallEnemyunit(btn: EventTouch) {
        let id = Number(btn.target.name);
        MTRNX_ResourceUtil.LoadPrefab("Unit/" + MTRNX_MTType[id]).then((prefab: Prefab) => {
            instantiate(prefab).setParent(this.GameNode.getChildByName("敌方单位"));
        });
    }
    //作弊区----------------------------

    //返回主页
    OnBackBtnClicked() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.LoadingPanel, ["Start_Mtr"]);
            if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) {
                let point = Math.floor(MTRNX_GameManager.Instance.Score * 1);
                MTRNX_UIManager.HopHint("结算科技点：" + point);
                MTRNX_GameDate.Instance.Money += point;
                MTRNX_GameDate.DateSave();
            }
        });
    }
}


