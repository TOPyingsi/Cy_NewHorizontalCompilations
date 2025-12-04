import { _decorator, BoxCollider2D, Camera, Color, Component, ERigidBody2DType, find, Event, Node, PhysicsSystem2D, Prefab, resources, RigidBody2D, Sprite, TiledMap, UITransform, v2, Vec2, instantiate, director, Vec3 } from 'cc';
import { SJZ_ContainerType, SJZ_ItemData, SJZ_ItemType, SJZ_WorkbenchType } from './SJZ_Data';
import SJZ_Item from './UI/SJZ_Item';
import { SJZ_Constant, SJZ_Quality, SJZ_QualityColorHex } from './SJZ_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import SJZ_CharacterController from './SJZ_CharacterController';
import { GridCellState, SJZ_GridCell } from './UI/SJZ_GridCell';
import { SJZ_InventoryGrid } from './SJZ_InventoryGrid';
import { SJZ_PoolManager } from './SJZ_PoolManager';
import { SJZ_UIManager } from './UI/SJZ_UIManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_GameManager')
export class SJZ_GameManager extends Component {

    public static Instance: SJZ_GameManager = null;

    public static IsGameOver = false;

    player: SJZ_CharacterController = null;

    @property([Prefab])
    poolPrefabs: Prefab[] = [];

    prefabMap: Map<string, Prefab> = new Map();

    cells: SJZ_GridCell[] = [];//提示格子

    killedPCCount: number = 0;//击杀的PC数量
    killedPECount: number = 0;//击杀的PE数量

    protected onLoad(): void {
        SJZ_GameManager.Instance = this;

        for (let i = 0; i < this.poolPrefabs.length; i++) {
            this.prefabMap.set(this.poolPrefabs[i].name, this.poolPrefabs[i]);
            SJZ_PoolManager.Instance.Preload(this.poolPrefabs[i], 50);
        }

        PhysicsSystem2D.instance.debugDrawFlags = 0;
        director.addPersistRootNode(this.node);
    }

    //刷新提示格子
    ShowTipCells(canPlace: boolean, points: Vec2[], trans: UITransform) {
        this.cells.forEach(e => {
            if (e.isValid) SJZ_PoolManager.Instance.Put(e.node); else {
                console.error("cell 失效");
            }
        })
        this.cells = [];

        for (let i = 0; i < points.length; i++) {
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.GridCell, trans.node);
            let position = SJZ_InventoryGrid.GridPointToWorldPosition(points[i], trans);
            node.setWorldPosition(position);
            let cell = node.getComponent(SJZ_GridCell);
            cell.SetState(canPlace ? GridCellState.CanPut : GridCellState.CanntPut);
            this.cells.push(cell);
        }
    }

    HideTipCells() {
        this.cells.forEach(e => {
            SJZ_PoolManager.Instance.Put(e.node);
        })

        this.cells = [];
    }

    //endregion

    public static FillContainer(data: SJZ_ItemData[], gridCtrl: SJZ_InventoryGrid, parentTrans: UITransform) {
        for (let i = 0; i < data.length; i++) {
            //表现
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Item, parentTrans.node);
            node.getComponent(SJZ_Item).Init(data[i]);
            node.setPosition(data[i].Point.x * SJZ_Constant.itemSize + SJZ_Constant.itemSize / 2, -data[i].Point.y * SJZ_Constant.itemSize - SJZ_Constant.itemSize / 2);

            //数据
            SJZ_InventoryGrid.PlaceItem(gridCtrl, data[i].Point.x, data[i].Point.y, data[i].Size.width, data[i].Size.height);
        }
    }

    public static FillContainerByData(data: SJZ_ItemData[], gridCtrl: SJZ_InventoryGrid) {
        let gridLength = gridCtrl.width * gridCtrl.height;
        let finalData: SJZ_ItemData[] = [];

        for (let i = 0; i < data.length; i++) {
            let e = data[i];
            for (let j = 0; j < gridLength; j++) {
                let x = j % gridCtrl.width;
                let y = Math.floor(j / gridCtrl.width);
                if (gridCtrl.grid[y][x] == 0) {
                    if (SJZ_InventoryGrid.CanPlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height)) {
                        SJZ_InventoryGrid.PlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height);
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
    public static FillLootContainer(data: SJZ_ItemData[], gridCtrl: SJZ_InventoryGrid) {
        let gridLength = gridCtrl.width * gridCtrl.height;
        let finalData: SJZ_ItemData[] = [];

        for (let i = 0; i < data.length; i++) {
            let e = data[i];
            for (let j = 0; j < gridLength; j++) {
                let x = j % gridCtrl.width;
                let y = Math.floor(j / gridCtrl.width);
                if (gridCtrl.grid[y][x] == 0) {
                    if (SJZ_InventoryGrid.CanPlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height)) {
                        SJZ_InventoryGrid.PlaceItem(gridCtrl, x, y, e.Size.width, e.Size.height);
                        e.Point.x = x;
                        e.Point.y = y;
                        finalData.push(e);
                        break;
                    }
                }

            }
        }

        data.length = 0;
        data.push(...finalData);
    }

    public static GetColorHexByQuality(quality: SJZ_Quality): Color {
        switch (quality) {
            case SJZ_Quality.None:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Common);
            case SJZ_Quality.Common:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Common);
            case SJZ_Quality.Uncommon:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Uncommon);
            case SJZ_Quality.Rare:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Rare);
            case SJZ_Quality.Superior:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Superior);
            case SJZ_Quality.Legendary:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Legendary);
            case SJZ_Quality.Mythic:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Mythic);
            default:
                return Tools.GetColorFromHex(SJZ_QualityColorHex.Common);
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
                SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.ShopPanel);

                // SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.SellPanel);

                // let data = Tools.Clone(SJZ_DataManager.ContainerData.find(e => e.Type == SJZ_ContainerType.SafeBox));
                // data.ItemData = SJZ_LootManager.GetContainerResult(SJZ_ContainerType.SafeBox);

                // BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/ContainerInventory`).then((prefab: Prefab) => {

                //     const spawnInverntory = (parent: Node) => {
                //         let node = instantiate(prefab);
                //         node.setParent(parent);
                //         node.setPosition(Vec3.ZERO);
                //         let inventory = node.getComponent(SJZ_ContainerInventory);
                //         inventory.InitContainer(data);
                //         return inventory;
                //     }

                //     SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.InventoryPanel, [spawnInverntory]);
                // });
                break;
        }
    }
}