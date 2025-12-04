import { _decorator, BoxCollider2D, Camera, Color, Component, ERigidBody2DType, find, Event, Node, PhysicsSystem2D, Prefab, resources, RigidBody2D, Sprite, TiledMap, UITransform, v2, Vec2, instantiate, CCString, Vec3, Layout, sys } from 'cc';
import { XGTS_Constant, XGTS_Quality, XGTS_QualityColorHex } from './XGTS_Constant';
import { XGTS_GameManager } from './XGTS_GameManager';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_DataManager } from './XGTS_DataManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import XGTS_CharacterController from './XGTS_CharacterController';
import XGTS_CameraController from './XGTS_CameraController';
import { XGTS_MatchData } from './XGTS_Data';
import { XGTS_Audio, XGTS_AudioManager } from './XGTS_AudioManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import XGTS_PlayerInventory from './UI/XGTS_PlayerInventory';
import { XGTS_UIManager } from './UI/XGTS_UIManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import XGTS_CharacterFengYi_Double from './XGTS_CharacterFengYi_Double';

const { ccclass, property } = _decorator;

@ccclass('XGTS_LvManager')
export class XGTS_LvManager extends Component {
    public static Instance: XGTS_LvManager = null;

    @property(Node)
    Game: Node = null;

    @property(Node)
    UI: Node = null;

    @property(TiledMap)
    tiledMap: TiledMap | null = null;

    @property(Node)
    playerPosition: Node = null;

    @property(Node)
    GuideTarget: Node = null;

    @property({ type: [Node] })
    Guides: Node[] = [];

    guideIndex: number = -1;

    @property(CCString)
    MapName: string = "";

    @property(Vec2)
    MapSize: Vec2 = v2();

    Layer_Supplies: Node = null;
    Layer_Characters: Node = null;
    Layer_Effects: Node = null;

    matchData: XGTS_MatchData = null;


    playerPrefab: Prefab = null;

    playerPrefabs: Prefab[] = [];

    isRigistedEvent: boolean = false;

    isToTutorial: boolean = false;

    protected onLoad(): void {

        XGTS_GameManager.IsGameOver = false;
        XGTS_LvManager.Instance = this;
        this.InitMap();

        this.Layer_Supplies = this.Game.getChildByName("Supplies");
        this.Layer_Characters = this.Game.getChildByName("Characters");
        this.Layer_Effects = this.Game.getChildByName("Effects");

        if (!this.Layer_Supplies) console.error(`Game 下面没有叫 Supplies 的节点`);
        if (!this.Layer_Characters) console.error(`Game 下面没有叫 Characters 的节点`);
        if (!this.Layer_Effects) console.error(`Game 下面没有叫 Effects 的节点`);

        this.matchData = new XGTS_MatchData(this.MapName, "", 0, 0, 0, 0);
        this.matchData.MapName = this.MapName;

        this.RigistEvent();
        if (this.MapName == "特勤处") {
            XGTS_AudioManager.Instance.StopBGM();
            XGTS_AudioManager.Instance.PlayBGM(XGTS_Audio.BG);
        } else {
            XGTS_AudioManager.Instance.StopBGM();
            XGTS_AudioManager.Instance.PlayBGM(XGTS_Audio.游戏内BGM);
        }
    }

    start() {
        if (this.matchData.MapName == "特勤处") {
            this.InitPlayer();
        }
        else {
            if (!XGTS_GameManager.IsDoubleMode) {
                this.InitPlayer();
            }
            else {
                this.InitDoublePlayer();
            }
        }


        const firstInGame = sys.localStorage.getItem(XGTS_Constant.Key.isHavePassTutorial);
        console.log(firstInGame);
        if (this.matchData.MapName !== "训练场" && (!firstInGame || firstInGame === null || firstInGame === undefined || firstInGame === "false")) {
            console.log("第一次进入游戏");
            sys.localStorage.setItem(XGTS_Constant.Key.isHavePassTutorial, false);
            XGTS_DataManager.SetDefaultEquip(XGTS_DataManager.PlayerDatas[0]);
            XGTS_DataManager.SetDefaultEquip(XGTS_DataManager.PlayerDatas[1]);
            XGTS_DataManager.SetDefaultEquip(XGTS_DataManager.PlayerDatas[2]);
            XGTS_GameManager.isChangeScene = true;
            this.isToTutorial = true;
            UIManager.ShowPanel(Panel.LoadingPanel, "XGTS_Tutorial");
        } else {
            console.log("不是第一次");

            //大红放置引导，如果没放置过大红
            if (PrefsManager.GetBool(XGTS_Constant.Key.FirstPutInventory, true) && this.matchData.MapName == "特勤处") {
                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.TutorialPanel);
                // let result = XGTS_DataManager.PlayerDatas[0].GetBackpackItem("摄影机");
                // if (result) {
                //     BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/PlayerInventory`).then((prefab: Prefab) => {
                //         const spawnInverntory = (parent: Node) => {
                //             let node = instantiate(prefab);
                //             node.setParent(parent);
                //             node.setPosition(Vec3.ZERO);
                //             let inventory = node.getComponent(XGTS_PlayerInventory);
                //             inventory.InitPlayerInventory();
                //             return inventory;
                //         }

                //         XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel, [spawnInverntory]);
                //     });
                // }
            }
        }

        // if (this.matchData.MapName == "训练场") {
        //     PrefsManager.SetBool(XGTS_Constant.Key.FirstInGame, true);
        // }

    }

    InitMap() {
        let tiledSize = this.tiledMap.getTileSize();//每个格子的大小

        //碰撞层 - 用于主角与地图的碰撞
        let layer = this.tiledMap.getLayer(`Obstacle`);
        for (let i = 0; i < layer.getLayerSize().width; i++) {
            for (let j = 0; j < layer.getLayerSize().height; j++) {
                let tiled = layer.getTiledTileAt(i, j, true);
                if (tiled.grid != 0) {
                    let body: RigidBody2D = tiled.node.addComponent(RigidBody2D);
                    body.type = ERigidBody2DType.Static;
                    let collider: BoxCollider2D = tiled.node.addComponent(BoxCollider2D);
                    body.group = XGTS_Constant.Group.Obstacle;
                    collider.group = XGTS_Constant.Group.Obstacle;

                    tiled.node.getComponent(UITransform).setContentSize(tiledSize.width, tiledSize.height);
                    collider.offset = v2(tiledSize.width / 2, tiledSize.height / 2);
                    collider.size = tiledSize;
                    collider.apply();
                }
            }
        }
    }

    destoryPlayer() {
        if (XGTS_GameManager.Instance.player) XGTS_GameManager.Instance.player.destroy();
        if (XGTS_GameManager.Instance.playerNode) XGTS_GameManager.Instance.playerNode.destroy();

        XGTS_GameManager.Instance.player = null;
        XGTS_GameManager.Instance.playerNode = null;
        XGTS_CameraController.Instance.target = null;

        XGTS_CameraController.Instance.player1 = null;
        XGTS_CameraController.Instance.player2 = null;

        XGTS_GameManager.Instance.playerNodes.forEach((node) => {
            node.destroy();
        })
        XGTS_GameManager.Instance.players.forEach((player) => {
            player.destroy();
        })
        XGTS_GameManager.Instance.playerNodes = [];
        XGTS_GameManager.Instance.players = [];
    }

    InitPlayer() {
        this.destoryPlayer();

        let handle = (prefab: Prefab) => {
            let node = instantiate(prefab);
            node.setParent(this.Layer_Characters);
            node.setWorldPosition(this.playerPosition.worldPosition);
            XGTS_GameManager.Instance.playerNode = node;
            XGTS_GameManager.Instance.player = node.getComponent(XGTS_CharacterController);
            XGTS_CameraController.Instance.target = node;


            if (XGTS_LvManager.Instance.Guides && XGTS_LvManager.Instance.Guides.length > 0) {
                this.AddGuideIndex();
            }
            else if (XGTS_LvManager.Instance.GuideTarget) {
                EventManager.Scene.emit(XGTS_Constant.Event.SHOW_TUTORIAL, XGTS_LvManager.Instance.GuideTarget);
            }

            // if (XGTS_LvManager.Instance.GuideTarget) {
            //     EventManager.Scene.emit(XGTS_Constant.Event.SHOW_TUTORIAL, XGTS_LvManager.Instance.GuideTarget);
            // }
        }
        if (this.playerPrefab) {
            handle(this.playerPrefab);
        }
        else {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `Player`).then((prefab: Prefab) => {
                if (this.isToTutorial) return;
                handle(prefab);
                this.playerPrefab = prefab;
            });
        }
    }

    InitDoublePlayer() {
        this.destoryPlayer();
        let handle = (prefabs: Prefab[]) => {
            let playerNodes: Node[] = [];
            prefabs.forEach((prefab) => {
                let node = instantiate(prefab);
                playerNodes.push(node);
            });

            let node = new Node;
            node.setParent(this.Layer_Characters);
            node.setWorldPosition(this.playerPosition.worldPosition);
            let layout = node.addComponent(Layout);
            layout.type = Layout.Type.HORIZONTAL;
            layout.resizeMode = Layout.ResizeMode.CONTAINER;
            playerNodes.forEach((playerNode) => {
                playerNode.setParent(node);
                if (playerNode.name == "Player_1") {
                    playerNode.setSiblingIndex(0);
                }
            })
            layout.updateLayout();
            layout.enabled = false;

            playerNodes.forEach((playerNode) => {
                let worldPosition = playerNode.worldPosition;
                playerNode.setParent(this.Layer_Characters);
                playerNode.setWorldPosition(worldPosition);
                XGTS_GameManager.Instance.playerNodes.push(playerNode);
                XGTS_GameManager.Instance.players.push(playerNode.getComponent(XGTS_CharacterFengYi_Double));
            })
            node.destroy();
            // XGTS_CameraController.Instance.target = node;
            XGTS_CameraController.Instance.setDoublePlayer(playerNodes[0], playerNodes[1]);

            if (XGTS_LvManager.Instance.Guides && XGTS_LvManager.Instance.Guides.length > 0) {
                this.AddGuideIndex();
            }
            else if (XGTS_LvManager.Instance.GuideTarget) {
                EventManager.Scene.emit(XGTS_Constant.Event.SHOW_TUTORIAL, XGTS_LvManager.Instance.GuideTarget);
            }
        }
        if (this.playerPrefabs.length == 2) {
            handle(this.playerPrefabs);
        }
        else {
            this.playerPrefabs = [];
            let playerNames = ["Player_1", "Player_2"];
            playerNames.forEach((name) => {
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, name).then((prefab: Prefab) => {
                    this.playerPrefabs.push(prefab);

                    if (this.playerPrefabs.length == 2) {
                        handle(this.playerPrefabs);
                    }
                });
            })
        }
    }


    AddGuideIndex() {
        this.guideIndex = Tools.Clamp(this.guideIndex + 1, 0, this.Guides.length - 1);
        console.log(`显示第 ${this.guideIndex} 个引导`);
        EventManager.Scene.emit(XGTS_Constant.Event.SHOW_TUTORIAL, XGTS_LvManager.Instance.Guides[this.guideIndex]);
    }

    OnChangeDoubleMode() {
        // if (this.matchData.MapName == "训练场") {
        //     XGTS_GameManager.isChangeScene = true;
        //      UIManager.ShowPanel(Panel.LoadingPanel, "XGTS_Tutorial");
        //      return;
        // }
        this.InitDoublePlayer();
    }

    OnChangeSingleMode() {
        // if (this.matchData.MapName == "训练场") {
        //     XGTS_GameManager.isChangeScene = true;
        //      UIManager.ShowPanel(Panel.LoadingPanel, "XGTS_Tutorial");
        //      return;
        // }
        this.InitPlayer();
    }

    protected update(dt: number): void {
        if (XGTS_GameManager.IsGameOver) return;
        this.matchData.Time += dt;
    }


    protected RigistEvent(): void {
        EventManager.Scene.on(XGTS_Constant.Event.CHANGE_DOUBLE_MODE, this.OnChangeDoubleMode, this);
        EventManager.Scene.on(XGTS_Constant.Event.CHANGE_SINGLE_MODE, this.OnChangeSingleMode, this);
    }


    protected UnRegistEvent(): void {
        EventManager.Scene.off(XGTS_Constant.Event.CHANGE_DOUBLE_MODE, this.OnChangeDoubleMode, this);
        EventManager.Scene.off(XGTS_Constant.Event.CHANGE_SINGLE_MODE, this.OnChangeSingleMode, this);
    }

    protected onDisable(): void {
        this.UnRegistEvent();
    }
}