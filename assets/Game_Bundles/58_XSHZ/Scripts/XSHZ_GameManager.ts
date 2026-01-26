import { _decorator, color, Component, director, instantiate, Node, PhysicsSystem2D, Prefab, random, Sprite, SpriteFrame, v3, v4, Vec4 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XSHZ_incident } from './XSHZ_incident';
import { XSHZ_PlayerControl } from './XSHZ_PlayerControl';
import { XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_AIControl } from './XSHZ_AIControl';
import { XSHZ_Constant } from './XSHZ_Constant';
import { XSHZ_Unit } from './XSHZ_Unit';
import { XSHZ_GameData } from './XSHZ_GameData';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_GameManager')
export class XSHZ_GameManager extends Component {
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
    public static Instance: XSHZ_GameManager = null;

    public LoadIndex: number = 0;//加载进度
    public LoadMaxIndex: number = 3;//所需加载数量
    protected onLoad(): void {
        XSHZ_GameManager.Instance = this;
    }
    start() {
        this.Init();
        // PhysicsSystem2D.instance.debugDrawFlags = 1;

        director.getScene().on(XSHZ_EasyControllerEvent.角色死亡, this.UnitDie, this);
        this.InitBg();
    }


    //初始化随机背景
    InitBg() {
        let index = Math.ceil(Math.random() * 8);
        XSHZ_incident.LoadSprite(`Sprite/Bg/${index}`).then((sp: SpriteFrame) => {
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
        let ramdomnum = Math.floor(Math.random() * XSHZ_Constant.UnitData.length);
        XSHZ_GameManager.TeamData[3] = XSHZ_Constant.UnitData[ramdomnum].Name;
    }
    Init() {

        if (XSHZ_GameManager.GameMode == "1V1" || XSHZ_GameManager.GameMode == "演练" || XSHZ_GameManager.GameMode == "无尽试炼" ||
            XSHZ_GameManager.GameMode == "强者挑战"
        ) {
            if (XSHZ_GameManager.GameMode == "无尽试炼") {
                this.GetRamdonEnemyData();//无尽随机敌人
            }
            this.LoadUnit(XSHZ_GameManager.TeamData[0], false);
            this.LoadUnit(XSHZ_GameManager.TeamData[3], true);
            XSHZ_GameManager.PlayerID = 0;
            XSHZ_GameManager.EnemyID = 3;
        }
        if (XSHZ_GameManager.GameMode == "3V3") {
            for (let index = 0; index < 3; index++) {
                if (XSHZ_GameManager.TeamisDie[index] == false) {
                    this.LoadUnit(XSHZ_GameManager.TeamData[index], false);
                    XSHZ_GameManager.PlayerID = index;
                    break;
                }
            }
            for (let index = 3; index < 6; index++) {
                if (XSHZ_GameManager.TeamisDie[index] == false) {
                    this.LoadUnit(XSHZ_GameManager.TeamData[index], true);
                    XSHZ_GameManager.EnemyID = index;
                    break;
                }
            }
        }

        director.getScene().emit(XSHZ_EasyControllerEvent.主程序就绪);
    }



    //初始化人物
    LoadUnit(Name: string, IsEnemy: boolean) {
        let pos = v3(-400, -400, 0);
        if (IsEnemy) {
            pos = v3(800, -200, 0);
        }
        //初始化角色
        XSHZ_incident.Loadprefab("PreFab/角色/" + Name).then((prefab: Prefab) => {
            let node = instantiate(prefab);
            node.setParent(this.BG);
            node.position = pos;
            this.AddLoadIndex();
            if (XSHZ_GameManager.GameMode == "演练") {
                node.getComponent(XSHZ_Unit).AddBuff("无限血", 0);
                node.getComponent(XSHZ_Unit).AddBuff("无限蓝", 0);
                node.getComponent(XSHZ_Unit).AddBuff("无限豆子", 0);
            }
            if (IsEnemy) {
                //如果敌人和主角是同一个角色，色调改变
                if (XSHZ_GameManager.TeamData[XSHZ_GameManager.PlayerID] == XSHZ_GameManager.TeamData[XSHZ_GameManager.EnemyID]) {
                    node.getChildByName("图").getComponent(Sprite).color = color(255, 0, 0, 255);
                }
                if (XSHZ_GameManager.GameMode == "无尽试炼") {
                    node.getComponent(XSHZ_Unit).AddBuff("血量倍率", (1 + XSHZ_GameManager.WinNum * 0.2));
                }
                if (XSHZ_GameManager.GameMode == "强者挑战") {
                    if (XSHZ_GameManager.difficulty == "困难") {
                        node.getComponent(XSHZ_Unit).AddBuff("血量倍率", 8);
                        node.getComponent(XSHZ_Unit).AddBuff("攻击倍率", 3);
                    }
                    if (XSHZ_GameManager.difficulty == "极难") {
                        node.getComponent(XSHZ_Unit).AddBuff("血量倍率", 15);
                        node.getComponent(XSHZ_Unit).AddBuff("攻击倍率", 5);
                    }
                }
                node.addComponent(XSHZ_AIControl);
                this.EnemyNode = node;
                director.getScene().emit(XSHZ_EasyControllerEvent.EnemyOnLoad, this.EnemyNode);
            } else {
                node.addComponent(XSHZ_PlayerControl);
                this.PlayerNode = node;
                director.getScene().emit(XSHZ_EasyControllerEvent.PlayerOnLoad, this.PlayerNode);
            }
        })
    }


    //角色死亡处理
    UnitDie(IsEnemy: boolean) {
        if (XSHZ_GameManager.GameMode == "1V1" || XSHZ_GameManager.GameMode == "强者挑战") {
            director.getScene().emit(XSHZ_EasyControllerEvent.弹出结算窗口, IsEnemy);
        }
        if (XSHZ_GameManager.GameMode == "3V3") {
            if (IsEnemy) {
                XSHZ_GameManager.TeamisDie[XSHZ_GameManager.EnemyID] = true;
                if ((XSHZ_GameManager.EnemyID + 1) >= 6) {//敌人没有后续人选
                    director.getScene().emit(XSHZ_EasyControllerEvent.弹出结算窗口, true);
                } else {//敌人还有后续人选
                    director.getScene().emit(XSHZ_EasyControllerEvent.弹出下一场);
                    this.scheduleOnce(() => {
                        director.loadScene(director.getScene().name);
                    }, 3)
                }

            } else {
                XSHZ_GameManager.TeamisDie[XSHZ_GameManager.PlayerID] = true;
                if ((XSHZ_GameManager.PlayerID + 1) >= 3) {//玩家没有后续人选
                    director.getScene().emit(XSHZ_EasyControllerEvent.弹出结算窗口, false);
                } else {//我方还有后续人选
                    director.getScene().emit(XSHZ_EasyControllerEvent.弹出下一场);
                    this.scheduleOnce(() => {
                        director.loadScene(director.getScene().name);
                    }, 3)
                }
            }

        }
        if (XSHZ_GameManager.GameMode == "无尽试炼") {
            if (IsEnemy) {
                XSHZ_GameManager.WinNum++;
                director.getScene().emit(XSHZ_EasyControllerEvent.弹出下一场);
                this.scheduleOnce(() => {
                    director.loadScene(director.getScene().name);
                }, 3)
            } else {
                XSHZ_GameData.Instance.GameData[1] = XSHZ_GameManager.WinNum;
                director.getScene().emit(XSHZ_EasyControllerEvent.弹出结算窗口, false);
            }
        }

    }
    //增加加载进度
    AddLoadIndex() {
        this.LoadIndex++;
        if (this.LoadIndex >= this.LoadMaxIndex) {
            director.getScene().emit(XSHZ_EasyControllerEvent.隐藏加载界面, false);
        }
    }

}


