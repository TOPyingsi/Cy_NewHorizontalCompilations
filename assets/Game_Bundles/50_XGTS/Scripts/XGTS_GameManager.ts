import { _decorator, BoxCollider2D, Camera, Color, Component, ERigidBody2DType, find, Event, Node, PhysicsSystem2D, Prefab, resources, RigidBody2D, Sprite, TiledMap, UITransform, v2, Vec2, instantiate, director, Vec3, Director } from 'cc';
import { XGTS_ContainerType, XGTS_ItemData, XGTS_ItemType, XGTS_WorkbenchType } from './XGTS_Data';
import XGTS_Item from './UI/XGTS_Item';
import { XGTS_Constant, XGTS_Quality, XGTS_QualityColorHex } from './XGTS_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import XGTS_CharacterController from './XGTS_CharacterController';
import { GridCellState, XGTS_GridCell } from './UI/XGTS_GridCell';
import { XGTS_InventoryGrid } from './XGTS_InventoryGrid';
import { XGTS_PoolManager } from './XGTS_PoolManager';
import { XGTS_UIManager } from './UI/XGTS_UIManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_GameManager')
export class XGTS_GameManager extends Component {

    public static Instance: XGTS_GameManager = null;

    public static IsGameOver = false;

    public static IsDoubleMode:boolean = false;

    public static itemPlayerNum:number = 0;

    public static isChangeScene:boolean = false;

    public static currentBackpackNum:number = 0;

    playerNode: Node = null;
    player: XGTS_CharacterController = null;

    playerNodes: Node[] = [];
    players: XGTS_CharacterController[] = [];

    suppliesNodes :Map<number,string> = new Map();

    @property([Prefab])
    poolPrefabs: Prefab[] = [];

    prefabMap: Map<string, Prefab> = new Map();

    cells: XGTS_GridCell[] = [];//提示格子

    killedPCCount: number = 0;//击杀的PC数量
    killedPECount: number = 0;//击杀的PE数量

    protected onLoad(): void {
        XGTS_GameManager.Instance = this;

        for (let i = 0; i < this.poolPrefabs.length; i++) {
            this.prefabMap.set(this.poolPrefabs[i].name, this.poolPrefabs[i]);
            XGTS_PoolManager.Instance.Preload(this.poolPrefabs[i], 50);
        }

        PhysicsSystem2D.instance.debugDrawFlags = 0;
        director.addPersistRootNode(this.node);
        ProjectEventManager.emit(ProjectEvent.游戏开始, "三角洲");

                console.log("GameManager输出：",XGTS_GameManager.IsDoubleMode);

        // 添加场景切换监听
        director.on(Director.EVENT_BEFORE_SCENE_LOADING, this.resetGameRuningData, this);
    }

    resetGameRuningData(){
        if(XGTS_GameManager.isChangeScene){
            XGTS_GameManager.isChangeScene = false;
            return;
        }
        XGTS_GameManager.IsDoubleMode = false;
        if (XGTS_GameManager.Instance.player) XGTS_GameManager.Instance.player.destroy();
        if (XGTS_GameManager.Instance.playerNode) XGTS_GameManager.Instance.playerNode.destroy();

        XGTS_GameManager.Instance.player = null;
        XGTS_GameManager.Instance.playerNode = null;

         EventManager.Scene.emit(XGTS_Constant.Event.RESET_CAMERA);

        XGTS_GameManager.Instance.playerNodes.forEach((node) => {
            node.destroy();
        })
        XGTS_GameManager.Instance.players.forEach((player) => {
            player.destroy();
        })
        XGTS_GameManager.Instance.playerNodes = [];
        XGTS_GameManager.Instance.players = [];
    
    }

    //刷新提示格子
    ShowTipCells(canPlace: boolean, points: Vec2[], trans: UITransform) {
        this.cells.forEach(e => {
            if (e.isValid) XGTS_PoolManager.Instance.Put(e.node); else {
                console.error("cell 失效");
            }
        })
        this.cells = [];

        for (let i = 0; i < points.length; i++) {
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.GridCell, trans.node);
            let position = XGTS_InventoryGrid.GridPointToWorldPosition(points[i], trans);
            node.setWorldPosition(position);
            let cell = node.getComponent(XGTS_GridCell);
            cell.SetState(canPlace ? GridCellState.CanPut : GridCellState.CanntPut);
            this.cells.push(cell);
        }
    }

    HideTipCells() {
        this.cells.forEach(e => {
            XGTS_PoolManager.Instance.Put(e.node);
        })

        this.cells = [];
    }

    //endregion

    public static FillContainer(data: XGTS_ItemData[], gridCtrl: XGTS_InventoryGrid, parentTrans: UITransform) {
        for (let i = 0; i < data.length; i++) {
            //表现
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Item, parentTrans.node);
            node.getComponent(XGTS_Item).Init(data[i]);
            node.setPosition(data[i].Point.x * XGTS_Constant.itemSize + XGTS_Constant.itemSize / 2, -data[i].Point.y * XGTS_Constant.itemSize - XGTS_Constant.itemSize / 2);

            //数据
            XGTS_InventoryGrid.PlaceItem(gridCtrl, data[i].Point.x, data[i].Point.y, data[i].Size.width, data[i].Size.height);
        }
    }

    public static FillContainerByData(data: XGTS_ItemData[], gridCtrl: XGTS_InventoryGrid) {
        let gridLength = gridCtrl.width * gridCtrl.height;
        let finalData: XGTS_ItemData[] = [];

        for (let i = 0; i < data.length; i++) {
            let e = data[i];
            for (let j = 0; j < gridLength; j++) {
                let x = j % gridCtrl.width;
                let y = Math.floor(j / gridCtrl.width);
                if (gridCtrl.grid[y][x] == 0) {
                    if (XGTS_InventoryGrid.CanPlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height)) {
                        XGTS_InventoryGrid.PlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height);
                        e.Point.x = x;
                        e.Point.y = y;
                        finalData.push(e);
                        break;
                    }
                }

            }
        }

        data = finalData;
    }

    /**填充掉落物品容器 */
    public static FillLootContainer(data: XGTS_ItemData[], gridCtrl: XGTS_InventoryGrid) {
        let gridLength = gridCtrl.width * gridCtrl.height;
        let finalData: XGTS_ItemData[] = [];

        for (let i = 0; i < data.length; i++) {
            let e = data[i];
            for (let j = 0; j < gridLength; j++) {
                let x = j % gridCtrl.width;
                let y = Math.floor(j / gridCtrl.width);
                if (gridCtrl.grid[y][x] == 0) {
                    // 首先尝试正常放置（横向）
                    if (XGTS_InventoryGrid.CanPlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height)) {
                        XGTS_InventoryGrid.PlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height);
                        e.Point.x = x;
                        e.Point.y = y;
                        e.Rotated = false; // 确保旋转状态正确
                        finalData.push(e);
                        break;
                    }
                    // 如果无法横向放置，则尝试纵向放置（旋转90度）
                    else if (XGTS_InventoryGrid.CanPlaceItem(gridCtrl, x, y, e.Size.height, e.Size.width)) {
                        XGTS_InventoryGrid.PlaceItem(gridCtrl, x, y, e.Size.height, e.Size.width);
                        e.Point.x = x;
                        e.Point.y = y;
                        e.Rotated = true; // 标记物品已被旋转
                        finalData.push(e);
                        break;
                    }
                }

            }
        }

        data.length = 0;
        data.push(...finalData);
    }

    public static GetColorHexByQuality(quality: XGTS_Quality): Color {
        switch (quality) {
            case XGTS_Quality.None:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Common);
            case XGTS_Quality.Common:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Common);
            case XGTS_Quality.Uncommon:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Uncommon);
            case XGTS_Quality.Rare:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Rare);
            case XGTS_Quality.Superior:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Superior);
            case XGTS_Quality.Legendary:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Legendary);
            case XGTS_Quality.Mythic:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Mythic);
            default:
                return Tools.GetColorFromHex(XGTS_QualityColorHex.Common);
        }
    }


    //设置图片不超过格子范围
    public static SetImagePreferScale(image: Sprite, width: number, height: number, padding: number = 15) {
        // 获取原图尺寸（单位：像素）
        let originalWidth = image.getComponent(UITransform).contentSize.width;
        let originalHeight = image.getComponent(UITransform).contentSize.height;

        // 获取目标容器（格子）尺寸
        let targetWidth = width - padding;
        let targetHeight = height - padding;

        // 计算缩放比例
        let scaleX = targetWidth / originalWidth;
        let scaleY = targetHeight / originalHeight;

        // 取最小缩放比例，保持比例同时不超出格子
        let scale = scaleX > scaleY ? scaleY : scaleX;
        image.node.setScale(scale, scale, 1);
    }

    OnButtonClick(event: Event) {
        switch (event.target.name) {
            case "ShopPanelButton":
                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.ShopPanel);//TODO LCH_不知道按钮在哪

                // XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.SellPanel);

                // let data = Tools.Clone(XGTS_DataManager.ContainerData.find(e => e.Type == XGTS_ContainerType.SafeBox));
                // data.ItemData = XGTS_LootManager.GetContainerResult(XGTS_ContainerType.SafeBox);

                // BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/ContainerInventory`).then((prefab: Prefab) => {

                //     const spawnInverntory = (parent: Node) => {
                //         let node = instantiate(prefab);
                //         node.setParent(parent);
                //         node.setPosition(Vec3.ZERO);
                //         let inventory = node.getComponent(XGTS_ContainerInventory);
                //         inventory.InitContainer(data);
                //         return inventory;
                //     }

                //     XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel, [spawnInverntory]);
                // });
                break;
        }
    }
}