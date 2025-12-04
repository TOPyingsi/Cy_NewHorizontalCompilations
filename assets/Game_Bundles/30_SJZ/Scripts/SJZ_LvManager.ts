import { _decorator, BoxCollider2D, Camera, Color, Component, ERigidBody2DType, find, Event, Node, PhysicsSystem2D, Prefab, resources, RigidBody2D, Sprite, TiledMap, UITransform, v2, Vec2, instantiate, CCString, Vec3, sys } from 'cc';
import { SJZ_Constant, SJZ_Quality, SJZ_QualityColorHex } from './SJZ_Constant';
import { SJZ_GameManager } from './SJZ_GameManager';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { SJZ_DataManager } from './SJZ_DataManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import SJZ_CharacterController from './SJZ_CharacterController';
import SJZ_CameraController from './SJZ_CameraController';
import { SJZ_MatchData } from './SJZ_Data';
import { SJZ_Audio, SJZ_AudioManager } from './SJZ_AudioManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import SJZ_PlayerInventory from './UI/SJZ_PlayerInventory';
import { SJZ_UIManager } from './UI/SJZ_UIManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';

const { ccclass, property } = _decorator;

@ccclass('SJZ_LvManager')
export class SJZ_LvManager extends Component {
    public static Instance: SJZ_LvManager = null;

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

    matchData: SJZ_MatchData = null;

    protected onLoad(): void {
        SJZ_GameManager.IsGameOver = false;
        SJZ_LvManager.Instance = this;
        this.InitMap();

        this.Layer_Supplies = this.Game.getChildByName("Supplies");
        this.Layer_Characters = this.Game.getChildByName("Characters");
        this.Layer_Effects = this.Game.getChildByName("Effects");

        if (!this.Layer_Supplies) console.error(`Game 下面没有叫 Supplies 的节点`);
        if (!this.Layer_Characters) console.error(`Game 下面没有叫 Characters 的节点`);
        if (!this.Layer_Effects) console.error(`Game 下面没有叫 Effects 的节点`);

        this.matchData = new SJZ_MatchData(this.MapName, "", 0, 0, 0, 0);
        this.matchData.MapName = this.MapName;

        if (this.MapName == "特勤处") {
            SJZ_AudioManager.Instance.PlayBGM(SJZ_Audio.BG);
        } else {
            SJZ_AudioManager.Instance.StopBGM();
        }
    }

    start() {
        this.InitPlayer();

        const firstInGame = sys.localStorage.getItem(SJZ_Constant.Key.isHavePassTutorial);
          console.log(firstInGame);
        if (this.matchData.MapName !== "训练场" && (!firstInGame || firstInGame === null || firstInGame === undefined|| firstInGame === "false")) {
            console.log("第一次进入游戏");
            sys.localStorage.setItem(SJZ_Constant.Key.isHavePassTutorial, false);
            SJZ_DataManager.SetDefaultEquip(SJZ_DataManager.PlayerData);
            UIManager.ShowPanel(Panel.LoadingPanel, "SJZ_Tutorial");
        } else {
            console.log("不是第一次");
            //大红放置引导，如果没放置过大红
            if (PrefsManager.GetBool(SJZ_Constant.Key.FirstPutInventory, true) && this.matchData.MapName == "特勤处") {
                SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.TutorialPanel);
                // let result = SJZ_DataManager.PlayerData.GetBackpackItem("摄影机");
                // if (result) {
                //     BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/PlayerInventory`).then((prefab: Prefab) => {
                //         const spawnInverntory = (parent: Node) => {
                //             let node = instantiate(prefab);
                //             node.setParent(parent);
                //             node.setPosition(Vec3.ZERO);
                //             let inventory = node.getComponent(SJZ_PlayerInventory);
                //             inventory.InitPlayerInventory();
                //             return inventory;
                //         }

                //         SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.InventoryPanel, [spawnInverntory]);
                //     });
                // }
            }
        }

        // if (this.matchData.MapName == "训练场") {
        //     PrefsManager.SetBool(SJZ_Constant.Key.FirstInGame, true);
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
                    body.group = SJZ_Constant.Group.Obstacle;
                    collider.group = SJZ_Constant.Group.Obstacle;

                    tiled.node.getComponent(UITransform).setContentSize(tiledSize.width, tiledSize.height);
                    collider.offset = v2(tiledSize.width / 2, tiledSize.height / 2);
                    collider.size = tiledSize;
                    collider.apply();
                }
            }
        }
    }

    InitPlayer() {
        if (SJZ_GameManager.Instance.player) SJZ_GameManager.Instance.player.destroy();
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `Player`).then((prefab: Prefab) => {
            let node = instantiate(prefab);
            node.setParent(this.Layer_Characters);
            node.setWorldPosition(this.playerPosition.worldPosition);

            SJZ_GameManager.Instance.player = node.getComponent(SJZ_CharacterController);
            SJZ_CameraController.Instance.target = node;

            if (SJZ_LvManager.Instance.Guides && SJZ_LvManager.Instance.Guides.length > 0) {
                this.AddGuideIndex();
            }
            else if (SJZ_LvManager.Instance.GuideTarget) {
                EventManager.Scene.emit(SJZ_Constant.Event.SHOW_TUTORIAL, SJZ_LvManager.Instance.GuideTarget);
            }
        });
    }

    AddGuideIndex() {
        this.guideIndex = Tools.Clamp(this.guideIndex + 1, 0, this.Guides.length - 1);
        console.log(`显示第 ${this.guideIndex} 个引导`);
        EventManager.Scene.emit(SJZ_Constant.Event.SHOW_TUTORIAL, SJZ_LvManager.Instance.Guides[this.guideIndex]);
    }

    protected update(dt: number): void {
        if (SJZ_GameManager.IsGameOver) return;
        this.matchData.Time += dt;
    }
}