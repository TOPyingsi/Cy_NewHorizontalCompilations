import { _decorator, BoxCollider2D, Component, ERigidBody2DType, find, instantiate, Node, PhysicsSystem2D, Prefab, RigidBody, RigidBody2D, size, TiledMap, UITransform, v2 } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_PlayerController from "./XGTW_PlayerController";
import { XGTW_UIManager } from './Framework/Managers/XGTW_UIManager';
import { XGTW_QualityColorHex, XGTW_Constant } from './Framework/Const/XGTW_Constant';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
export enum GameMode {
    ESCAPE,
    TEAM
}

@ccclass('XGTW_GameManager')
export default class XGTW_GameManager extends Component {
    public static Instance: XGTW_GameManager = null;
    static IsFirstUnlock = true;
    static IsGameOver: boolean = false;
    @property(Node)
    playerNd: Node | null = null;
    @property(Node)
    ItemsNd: Node | null = null;
    player: Node | null = null;
    playerCtrl: XGTW_PlayerController = null;
    static GameMode: GameMode = GameMode.ESCAPE;
    static MapIndex: number = 0;
    static Mode: number = 0;

    static JJMode: boolean = false;

    onLoad() {
        XGTW_GameManager.Instance = this;
        // director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().enabledAccumulator = true;
        // cc.director.getPhysicsManager().debugDrawFlags = 1;

        // PhysicsSystem2D.instance.debugDrawFlags = 1;

        this.InitPlayer();
        this.InitMap();

        if (XGTW_GameManager.GameMode == GameMode.ESCAPE) {
            XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.CommonTipPanel, ["搜寻物资并找到撤离点。", "知道了", ``, () => {
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.CommonTipPanel);
            }]);
        } else {
            if (Banner.RegionMask) {
                // Banner.Instance.ShowVideoAd(() => { });
            }
        }
    }

    //#region 地图
    @property(TiledMap)
    tiledMap: TiledMap | null = null;
    @property(Node)
    MapNodes: Node | null = null;
    map: Map<string, Node> = new Map<string, Node>();
    aStarMap: Map<string, Node> = new Map<string, Node>();//标记为障碍物的节点
    timer: number = 0;
    // @property({ type: [cc.Node] })
    // RedTeam: cc.Node[] = [];
    // @property({ type: [cc.Node] })
    // BuleTeam: cc.Node[] = [];
    InitPlayer() {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `Player`).then((prefab: Prefab) => {
            if (this.player) this.player.destroy();
            this.player = instantiate(prefab);
            this.player.setParent(find("Canvas"));
            this.player.setSiblingIndex(this.playerNd.getSiblingIndex());
            // NodeUtil.SetWorldPositionToOtherNode(this.player, this.playerNd);
            this.player.setWorldPosition(this.playerNd.getWorldPosition());
            this.playerCtrl = this.player.getComponent(XGTW_PlayerController);
        })
    }
    InitMap() {
        // AStarManager.Instance.InitMapInfo(this.tiledMap.getLayer(`Background`).getLayerSize().width, this.tiledMap.getLayer(`Background`).getLayerSize().height);

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
                    body.group = XGTW_Constant.Group.Obstacle;
                    collider.group = XGTW_Constant.Group.Obstacle;

                    tiled.node.getComponent(UITransform).setContentSize(tiledSize.width, tiledSize.height);
                    collider.offset = v2(tiledSize.width / 2, tiledSize.height / 2);
                    collider.size = tiledSize;
                    collider.apply();
                }
            }
        }

        // //Astar 寻路层 - 用于敌人寻路（要比碰撞层大一圈）
        // layer = this.tiledMap.getLayer(`AStar`);
        // for (let i = 0; i < layer.getLayerSize().width; i++) {
        //     for (let j = 0; j < layer.getLayerSize().height; j++) {
        //         let tiled = layer.getTiledTileAt(i, j, true);
        //         AStarManager.Instance.SetMap(i, j, tiled.gid != 0 ? AStar_Node_Type.Obstacle : AStar_Node_Type.Normal);
        //         let node = new cc.Node();
        //         node.setParent(this.MapNodes);
        //         node.setContentSize(tiledSize.width * this.tiledMap.node.scaleX, tiledSize.height * this.tiledMap.node.scaleX);
        //         NodeUtil.SetWorldPosition(node, NodeUtil.GetWorldPosition(tiled.node));
        //         node.setPosition(node.position.x + tiledSize.width / 2 * this.tiledMap.node.scaleX, node.position.y + tiledSize.height / 2 * this.tiledMap.node.scaleY);
        //         this.map.set(`${i}_${j}`, node);

        //         if (tiled.gid != 0) { this.aStarMap.set(`${i}_${j}`, node); }
        //     }
        // }
    }
    protected update(dt: number): void {
        this.timer += dt;
    }
    GetMapPosition(node: Node): string {
        const result = Array.from(this.map.entries()).find(([k, v]) => {
            return v.getComponent(UITransform).getBoundingBoxToWorld().contains(v2(node.getWorldPosition().x, node.getWorldPosition().y));
        });
        if (result) return result[0];
        return "";
    }
    //    //玩家在标记为障碍物的位置时不寻路
    IsInCantArrivePosition(node: Node): boolean {
        const result = Array.from(this.aStarMap.entries()).find(([k, v]) => {
            return v.getComponent(UITransform).getBoundingBoxToWorld().contains(v2(node.getWorldPosition().x, node.getWorldPosition().y));
        });

        if (result) {
            return true;
        }

        return false;
    }
    //    //#endregion
    public static GetSceneName(): string {
        let scene = "XGTW_Lv_5"
        if (this.MapIndex == 0) scene = "XGTW_Lv_5";
        if (this.MapIndex == 1) scene = "XGTW_Lv_6";
        if (this.MapIndex == 2) scene = "XGTW_Lv_7";
        return scene;
    }
    public static GetQualityColor(quality) {
        let q = Number(quality);
        let hex = XGTW_QualityColorHex.Common;

        switch (q) {
            case 0: hex = XGTW_QualityColorHex.Common; break;
            case 1: hex = XGTW_QualityColorHex.Uncommon; break;
            case 2: hex = XGTW_QualityColorHex.Rare; break;
            case 3: hex = XGTW_QualityColorHex.Superior; break;
            case 4: hex = XGTW_QualityColorHex.Epic; break;
            case 5: hex = XGTW_QualityColorHex.Legendary; break;
            case 6: hex = XGTW_QualityColorHex.Mythic; break;
        }

        return Tools.GetColorFromHex(hex);
    }
}