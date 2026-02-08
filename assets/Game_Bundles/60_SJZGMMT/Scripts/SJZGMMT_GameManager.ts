import { _decorator, BoxCollider2D, Component, director, ERigidBody2DType, instantiate, Node, PhysicsSystem2D, Prefab, RigidBody2D, TiledMap, UITransform, v2, v3, Vec3 } from 'cc';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { SJZGMMT_Unit } from './SJZGMMT_Unit';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_FollowCamera } from './SJZGMMT_FollowCamera';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_I_SkillBtn } from './InterFace/SJZGMMT_I_SkillBtn';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
import { SJZGMMT_vessel } from './SJZGMMT_vessel';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_GameManager')
export class SJZGMMT_GameManager extends Component {
    @property(Node)
    GameNode: Node = null;
    @property(Node)
    GamePanel: Node = null;
    public static Instance: SJZGMMT_GameManager = null;
    public static GameScene: string = "锢灵青铜墟";
    public tiledMap: TiledMap = null;
    public UnitArray: SJZGMMT_Unit[] = [];
    public knapsackCapacity: number = 30;//背包容量上限
    public IsAddknapsackCapacity: boolean = false;//是否已经拓展背包上限
    public MedicalKit: number[] = [3, 1, 0];//医疗包数量
    public ExtraDetonation: number = 0;//场景额外爆率
    public static KillEnemy: number = 0;//杀敌数
    public PlayerNode: Node = null;
    onLoad() {
        SJZGMMT_GameManager.Instance = this;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
        //研究所增加背包上限
        this.knapsackCapacity += SJZGMMT_Constant.LaboratoryLevelData[3][SJZGMMT_GameData.Instance.LaboratoryLevel[3]];
        //针剂效果
        if (SJZGMMT_GameData.Instance.Enhance == "爆率针") {
            this.ExtraDetonation = 5;
            SJZGMMT_GameData.Instance.Enhance = "无";
        }
    }
    start() {
        SJZGMMT_GameManager.KillEnemy = 0;
        ProjectEventManager.emit(ProjectEvent.游戏开始);
        SJZGMMT_AudioManager.globalAudioPlay("直升机音效");
        //设定相机初始位置
        this.GameNode.getChildByName("Camera").position = SJZGMMT_Constant.GetSceneDataByName(SJZGMMT_GameManager.GameScene).PlayerStartPos.clone()
        SJZGMMT_GameData.Instance.ClearKnapsack();
        director.getScene().on(SJZGMMT_EventManager.撤离点时间耗尽, this.Leave, this);
        this.LoadMap();
    }
    //初始化主角
    InitPlayer() {
        SJZGMMT_Incident.Loadprefab("Prefabs/Player").then((prefab: Prefab) => {
            let player = instantiate(prefab);
            player.setParent(this.GameNode.getChildByPath(SJZGMMT_GameManager.GameScene + "/Map/对象层/单位"));
            player.setPosition(SJZGMMT_Constant.GetSceneDataByName(SJZGMMT_GameManager.GameScene).PlayerStartPos.clone());
            this.GameNode.getChildByName("Camera").getComponent(SJZGMMT_FollowCamera).FindNode = player;//设定相机跟随
            this.PlayerNode = player;
            let name = SJZGMMT_Constant.getAgentDataByName(SJZGMMT_GameData.Instance.AgentSelect).主动技能;
            if (name != "无") {
                //初始化技能
                SJZGMMT_Incident.Loadprefab("Prefabs/UI/按键/技能_" + name).then((prefab: Prefab) => {
                    let skill = instantiate(prefab);
                    skill.setParent(this.GamePanel.getChildByName("技能"));
                    skill.setPosition(v3(0, 0, 0));
                    skill.getComponent(SJZGMMT_I_SkillBtn).FindNode = player;
                    skill.getComponent(SJZGMMT_I_SkillBtn).FindUnit = player.getComponent(SJZGMMT_Unit);
                });
            }
        });
    }
    LoadMap() {
        SJZGMMT_Incident.Loadprefab("Prefabs/Map/" + SJZGMMT_GameManager.GameScene).then((prefab: Prefab) => {
            let map = instantiate(prefab);
            map.setParent(this.GameNode);
            map.setPosition(v3(0, 0, 0));
            map.setSiblingIndex(3);
            this.tiledMap = map.getChildByName("Map").getComponent(TiledMap);
            this.InitMap();
            this.InitPlayer();
        });
    }
    InitMap() {
        let tiledSize = this.tiledMap.getTileSize();//每个格子的大小
        //动态生成碰撞层 - 用于主角与地图的碰撞
        let layer = this.tiledMap.getLayer(`Obstacle`);
        for (let i = 0; i < layer.getLayerSize().width; i++) {
            for (let j = 0; j < layer.getLayerSize().height; j++) {
                console.log("生成");
                let tiled = layer.getTiledTileAt(i, j, true);
                if (tiled.grid != 0) {
                    let body: RigidBody2D = tiled.node.addComponent(RigidBody2D);
                    body.type = ERigidBody2DType.Static;
                    let collider: BoxCollider2D = tiled.node.addComponent(BoxCollider2D);
                    body.group = SJZGMMT_Constant.Group.Obstacle;
                    collider.group = SJZGMMT_Constant.Group.Obstacle;
                    tiled.node.getComponent(UITransform).setContentSize(tiledSize.width, tiledSize.height);
                    collider.offset = v2(tiledSize.width / 2, tiledSize.height / 2);
                    collider.size = tiledSize;
                    collider.apply();
                }
            }
        }
    }
    //撤离
    public Leave() {
        SJZGMMT_GameData.Instance.GameData[0] = 0;//撤离成功
        SJZGMMT_GameData.Instance.GameData[1] = 0;
        SJZGMMT_GameData.Instance.UnlockNextScene(SJZGMMT_GameManager.GameScene);
        SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.LoadingPanel, ["SJZGMMT_Star"]);
    }
    //直接退出游戏
    public ExitGame() {
        SJZGMMT_GameData.Instance.GameData[0] = 1;//撤离失败
        SJZGMMT_GameData.Instance.GameData[1] = 0;
        SJZGMMT_GameData.Instance.GameData[2] = 0;
        SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.LoadingPanel, ["SJZGMMT_Star"]);
    }

    //展示特定位置附近的容器
    public ShowNearbyContainer(pos: Vec3, radius: number) {
        if (!this.tiledMap) return;
        let num = 0;
        this.tiledMap.node.getChildByPath("对象层/容器").children.forEach(element => {
            if (element.worldPosition.clone().subtract(pos).length() < radius && element.activeInHierarchy == false) {
                element.getComponent(SJZGMMT_vessel)?.ShowActive();
                num++;
            }
        });
        if (num > 0) {
            SJZGMMT_UIManager.Instance.ShowText("发现隐藏宝藏！");
        } else {
            SJZGMMT_UIManager.Instance.ShowText("没有发现附近有什么异样！");
        }
    }
}


