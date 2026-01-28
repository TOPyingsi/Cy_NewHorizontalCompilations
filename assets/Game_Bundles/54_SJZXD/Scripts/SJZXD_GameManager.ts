import { _decorator, BoxCollider2D, Component, director, ERigidBody2DType, instantiate, Node, PhysicsSystem2D, Prefab, RigidBody2D, TiledMap, UITransform, v2, v3, Vec3 } from 'cc';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { SJZXD_Unit } from './SJZXD_Unit';
import { SJZXD_Constant } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_FollowCamera } from './SJZXD_FollowCamera';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { SJZXD_I_SkillBtn } from './InterFace/SJZXD_I_SkillBtn';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_GameManager')
export class SJZXD_GameManager extends Component {
    @property(Node)
    GameNode: Node = null;
    @property(Node)
    GamePanel: Node = null;
    public static Instance: SJZXD_GameManager = null;
    public static GameScene: string = "荒野营地";
    public tiledMap: TiledMap = null;
    public UnitArray: SJZXD_Unit[] = [];
    public knapsackCapacity: number = 30;//背包容量上限
    public IsAddknapsackCapacity: boolean = false;//是否已经拓展背包上限
    public MedicalKit: number[] = [3, 1, 0];//医疗包数量
    public ExtraDetonation: number = 0;//场景额外爆率
    public static KillEnemy: number = 0;//杀敌数
    public PlayerNode: Node = null;
    onLoad() {
        SJZXD_GameManager.Instance = this;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
        //研究所增加背包上限
        this.knapsackCapacity += SJZXD_Constant.LaboratoryLevelData[3][SJZXD_GameData.Instance.LaboratoryLevel[3]];
        //针剂效果
        if (SJZXD_GameData.Instance.Enhance == "爆率针") {
            this.ExtraDetonation = 5;
            SJZXD_GameData.Instance.Enhance = "无";
        }
    }
    start() {
        SJZXD_GameManager.KillEnemy = 0;
        ProjectEventManager.emit(ProjectEvent.游戏开始);
        SJZXD_AudioManager.globalAudioPlay("直升机音效");
        //设定相机初始位置
        this.GameNode.getChildByName("Camera").position = SJZXD_Constant.GetSceneDataByName(SJZXD_GameManager.GameScene).PlayerStartPos.clone()
        SJZXD_GameData.Instance.ClearKnapsack();
        director.getScene().on(SJZXD_EventManager.撤离点时间耗尽, this.Leave, this);
        this.LoadMap();
    }
    //初始化主角
    InitPlayer() {
        SJZXD_Incident.Loadprefab("Prefabs/Player").then((prefab: Prefab) => {
            let player = instantiate(prefab);
            player.setParent(this.GameNode.getChildByPath(SJZXD_GameManager.GameScene + "/Map/对象层/单位"));
            player.setPosition(SJZXD_Constant.GetSceneDataByName(SJZXD_GameManager.GameScene).PlayerStartPos.clone());
            this.GameNode.getChildByName("Camera").getComponent(SJZXD_FollowCamera).FindNode = player;//设定相机跟随
            this.PlayerNode = player;
            let name = SJZXD_Constant.getAgentDataByName(SJZXD_GameData.Instance.AgentSelect).主动技能;
            if (name != "无") {
                //初始化技能
                SJZXD_Incident.Loadprefab("Prefabs/UI/按键/技能_" + name).then((prefab: Prefab) => {
                    let skill = instantiate(prefab);
                    skill.setParent(this.GamePanel.getChildByName("技能"));
                    skill.setPosition(v3(0, 0, 0));
                    skill.getComponent(SJZXD_I_SkillBtn).FindNode = player;
                    skill.getComponent(SJZXD_I_SkillBtn).FindUnit = player.getComponent(SJZXD_Unit);
                });
            }
        });
    }

    LoadMap() {
        SJZXD_Incident.Loadprefab("Prefabs/Map/" + SJZXD_GameManager.GameScene).then((prefab: Prefab) => {
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
                    body.group = SJZXD_Constant.Group.Obstacle;
                    collider.group = SJZXD_Constant.Group.Obstacle;
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
        SJZXD_GameData.Instance.GameData[0] = 0;//撤离成功
        SJZXD_GameData.Instance.GameData[1] = 0;
        SJZXD_GameData.Instance.UnlockNextScene(SJZXD_GameManager.GameScene);
        SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.LoadingPanel, ["SJZXD_Star"]);
    }
    //直接退出游戏
    public ExitGame() {
        SJZXD_GameData.Instance.GameData[0] = 1;//撤离失败
        SJZXD_GameData.Instance.GameData[1] = 0;
        SJZXD_GameData.Instance.GameData[2] = 0;
        SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.LoadingPanel, ["SJZXD_Star"]);
    }


}


