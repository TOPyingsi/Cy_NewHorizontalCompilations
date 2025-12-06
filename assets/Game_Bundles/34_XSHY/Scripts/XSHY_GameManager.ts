import { _decorator, color, Component, director, instantiate, Node, PhysicsSystem2D, Prefab, random, Sprite, SpriteFrame, v3, v4, Vec4 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XSHY_incident } from './XSHY_incident';
import { XSHY_PlayerControl } from './XSHY_PlayerControl';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_AIControl } from './XSHY_AIControl';
import { XSHY_Constant } from './XSHY_Constant';
import { XSHY_Unit } from './XSHY_Unit';
import { XSHY_GameData } from './XSHY_GameData';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_GameManager')
export class XSHY_GameManager extends Component {
    @property(Node)
    BG: Node = null;
    @property(Node)
    UI: Node = null;
    public PlayerNode: Node = null;
    public EnemyNode: Node = null;
    public MapData: Vec4 = v4(274, -527, -1221, 1213);


    public static GameMode: string = "";//1V1,3V3,无尽试炼，强者挑战,演练
    public static TeamData: string[] = ["", "", "", "", "", ""];//队伍数据012己方345敌方
    public static TeamisDie: boolean[] = [false, false, false, false, false, false];//是否死亡
    public static SkillData: number[] = [0, 0, 0, 0, 0, 0];//队伍数据012己方345敌方

    public static GameIndex: number = 0;//游戏进度
    public static difficulty: string = "困难";//强者挑战难度，困难和极难
    public static WinNum: number = 0;//无尽试炼连胜次数

    public static PlayerID: number = 0;//玩家ID(在数据中的位置)
    public static EnemyID: number = 0;//敌人ID
    public static Instance: XSHY_GameManager = null;

    public LoadIndex: number = 0;//加载进度
    public LoadMaxIndex: number = 3;//所需加载数量
    protected onLoad(): void {
        XSHY_GameManager.Instance = this;
    }
    start() {
        this.Init();
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
        ProjectEventManager.emit(ProjectEvent.游戏开始);
        director.getScene().on(XSHY_EasyControllerEvent.角色死亡, this.UnitDie, this);
        this.InitBg();
    }


    //初始化随机背景
    InitBg() {
        let index = Math.ceil(Math.random() * 8);
        XSHY_incident.LoadSprite(`Sprite/Bg/${index}`).then((sp: SpriteFrame) => {
            this.BG.getChildByName("GameBg").getComponent(Sprite).spriteFrame = sp;
            this.AddLoadIndex();
        });
    }

    //重置数据
    public static ReSetData() {
        this.TeamisDie = [false, false, false, false, false, false];
    }
    //获取随机敌人数据
    public GetRamdonEnemyData() {
        let ramdomnum = Math.floor(Math.random() * XSHY_Constant.UnitData.length);
        XSHY_GameManager.TeamData[3] = XSHY_Constant.UnitData[ramdomnum].Name;
    }
    Init() {

        if (XSHY_GameManager.GameMode == "1V1" || XSHY_GameManager.GameMode == "演练" || XSHY_GameManager.GameMode == "无尽试炼" ||
            XSHY_GameManager.GameMode == "强者挑战"
        ) {
            if (XSHY_GameManager.GameMode == "无尽试炼") {
                this.GetRamdonEnemyData();//无尽随机敌人
            }
            this.LoadUnit(XSHY_GameManager.TeamData[0], false);
            this.LoadUnit(XSHY_GameManager.TeamData[3], true);
            XSHY_GameManager.PlayerID = 0;
            XSHY_GameManager.EnemyID = 3;
        }
        if (XSHY_GameManager.GameMode == "3V3") {
            for (let index = 0; index < 3; index++) {
                if (XSHY_GameManager.TeamisDie[index] == false) {
                    this.LoadUnit(XSHY_GameManager.TeamData[index], false);
                    XSHY_GameManager.PlayerID = index;
                    break;
                }
            }
            for (let index = 3; index < 6; index++) {
                if (XSHY_GameManager.TeamisDie[index] == false) {
                    this.LoadUnit(XSHY_GameManager.TeamData[index], true);
                    XSHY_GameManager.EnemyID = index;
                    break;
                }
            }
        }

        director.getScene().emit(XSHY_EasyControllerEvent.主程序就绪);
    }



    //初始化人物
    LoadUnit(Name: string, IsEnemy: boolean) {
        let pos = v3(-400, -400, 0);
        if (IsEnemy) {
            pos = v3(800, -200, 0);
        }
        //初始化角色
        XSHY_incident.Loadprefab("PreFab/角色/" + Name).then((prefab: Prefab) => {
            let node = instantiate(prefab);
            node.setParent(this.BG);
            node.position = pos;
            this.AddLoadIndex();
            if (XSHY_GameManager.GameMode == "演练") {
                node.getComponent(XSHY_Unit).AddBuff("无限血", 0);
                node.getComponent(XSHY_Unit).AddBuff("无限蓝", 0);
                node.getComponent(XSHY_Unit).AddBuff("无限豆子", 0);
            }
            if (IsEnemy) {
                //如果敌人和主角是同一个角色，色调改变
                if (XSHY_GameManager.TeamData[XSHY_GameManager.PlayerID] == XSHY_GameManager.TeamData[XSHY_GameManager.EnemyID]) {
                    node.getChildByName("图").getComponent(Sprite).color = color(255, 0, 0, 255);
                }
                if (XSHY_GameManager.GameMode == "无尽试炼") {
                    node.getComponent(XSHY_Unit).AddBuff("血量倍率", (1 + XSHY_GameManager.WinNum * 0.2));
                }
                if (XSHY_GameManager.GameMode == "强者挑战") {
                    if (XSHY_GameManager.difficulty == "困难") {
                        node.getComponent(XSHY_Unit).AddBuff("血量倍率", 8);
                        node.getComponent(XSHY_Unit).AddBuff("攻击倍率", 3);
                    }
                    if (XSHY_GameManager.difficulty == "极难") {
                        node.getComponent(XSHY_Unit).AddBuff("血量倍率", 15);
                        node.getComponent(XSHY_Unit).AddBuff("攻击倍率", 5);
                    }
                }
                node.addComponent(XSHY_AIControl);
                this.EnemyNode = node;
                director.getScene().emit(XSHY_EasyControllerEvent.EnemyOnLoad, this.EnemyNode);
            } else {
                node.addComponent(XSHY_PlayerControl);
                this.PlayerNode = node;
                director.getScene().emit(XSHY_EasyControllerEvent.PlayerOnLoad, this.PlayerNode);
            }
        })
    }


    //角色死亡处理
    UnitDie(IsEnemy: boolean) {
        if (XSHY_GameManager.GameMode == "1V1" || XSHY_GameManager.GameMode == "强者挑战") {
            ProjectEventManager.emit(ProjectEvent.游戏结束);
            director.getScene().emit(XSHY_EasyControllerEvent.弹出结算窗口, IsEnemy);
        }
        if (XSHY_GameManager.GameMode == "3V3") {
            if (IsEnemy) {
                XSHY_GameManager.TeamisDie[XSHY_GameManager.EnemyID] = true;
                if ((XSHY_GameManager.EnemyID + 1) >= 6) {//敌人没有后续人选
                    ProjectEventManager.emit(ProjectEvent.游戏结束);
                    director.getScene().emit(XSHY_EasyControllerEvent.弹出结算窗口, true);
                } else {//敌人还有后续人选
                    director.getScene().emit(XSHY_EasyControllerEvent.弹出下一场);
                    this.scheduleOnce(() => {
                        director.loadScene(director.getScene().name);
                    }, 3)
                }

            } else {
                XSHY_GameManager.TeamisDie[XSHY_GameManager.PlayerID] = true;
                if ((XSHY_GameManager.PlayerID + 1) >= 3) {//玩家没有后续人选
                    ProjectEventManager.emit(ProjectEvent.游戏结束);
                    director.getScene().emit(XSHY_EasyControllerEvent.弹出结算窗口, false);
                } else {//我方还有后续人选
                    director.getScene().emit(XSHY_EasyControllerEvent.弹出下一场);
                    this.scheduleOnce(() => {
                        director.loadScene(director.getScene().name);
                    }, 3)
                }
            }

        }
        if (XSHY_GameManager.GameMode == "无尽试炼") {
            if (IsEnemy) {
                XSHY_GameManager.WinNum++;
                director.getScene().emit(XSHY_EasyControllerEvent.弹出下一场);
                this.scheduleOnce(() => {
                    director.loadScene(director.getScene().name);
                }, 3)
            } else {
                XSHY_GameData.Instance.GameData[1] = XSHY_GameManager.WinNum;
                ProjectEventManager.emit(ProjectEvent.游戏结束);
                director.getScene().emit(XSHY_EasyControllerEvent.弹出结算窗口, false);
            }
        }

    }
    //增加加载进度
    AddLoadIndex() {
        this.LoadIndex++;
        if (this.LoadIndex >= this.LoadMaxIndex) {
            director.getScene().emit(XSHY_EasyControllerEvent.隐藏加载界面, false);
        }
    }

}


