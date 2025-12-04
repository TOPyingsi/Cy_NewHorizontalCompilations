import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView } from 'cc';
import { SJZ_InventoryGrid } from '../SJZ_InventoryGrid';
import SJZ_Item from './SJZ_Item';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { SJZ_Constant, SJZ_Quality } from '../SJZ_Constant';
import { SJZ_ItemData } from '../SJZ_Data';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import SJZ_Showcases from '../SJZ_Showcases';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_LvManager } from '../SJZ_LvManager';

const { ccclass, property } = _decorator;

const v3_0 = v3();
const v2_0 = v2();

@ccclass('SJZ_Inventory')
export default class SJZ_Inventory extends Component {
    ItemContent: Node = null;
    ItemContentTrans: UITransform = null;

    data: SJZ_ItemData[] = [];
    items: SJZ_Item[] = [];

    gridCtrl: SJZ_InventoryGrid = null;

    lastResult: Vec2 = v2(-1, -1);

    stopSearch: boolean = false;

    /**
     * 初始化仓库
     * @param data 数据
     * @param width 仓库的宽度
     * @param height 仓库的高度
     */
    protected Init(data: SJZ_ItemData[], gridCtrl: SJZ_InventoryGrid) {
        this.data = data;
        this.gridCtrl = gridCtrl;

        this.ClearItems();

        for (let i = 0; i < data.length; i++) {
            //表现
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Item, this.ItemContentTrans.node);
            let item = node.getComponent(SJZ_Item);
            item.Init(data[i]);
            item.belongInventory = this;
            node.setPosition(data[i].Point.x * SJZ_Constant.itemSize + SJZ_Constant.itemSize / 2, -data[i].Point.y * SJZ_Constant.itemSize - SJZ_Constant.itemSize / 2);
            this.items.push(item);

            //数据
            SJZ_InventoryGrid.PlaceItem(this.gridCtrl, data[i].Point.x, data[i].Point.y, data[i].Size.width, data[i].Size.height);
        }

        //搜索容器
        let unsearchedItems = this.items.filter(item => !item.data.Searched);
        const Search = (index) => {
            if (index >= unsearchedItems.length || this.stopSearch) {
                return;
            }

            unsearchedItems[index].Search(() => {
                Search(index + 1);
            });
        }

        Search(0);
    }

    /**生成物资数据 */
    InitLootContainer(data: SJZ_ItemData[], width: number, height: number) {
        this.data = data;
        this.gridCtrl = new SJZ_InventoryGrid(width, height);
        this.ClearItems();

        SJZ_GameManager.FillLootContainer(this.data, this.gridCtrl);

        for (let i = 0; i < this.data.length; i++) {
            const d = this.data[i];
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Item, this.ItemContentTrans.node);
            node.setPosition(d.Point.x * SJZ_Constant.itemSize + SJZ_Constant.itemSize / 2, -d.Point.y * SJZ_Constant.itemSize - SJZ_Constant.itemSize / 2);
            let item = node.getComponent(SJZ_Item);
            item.Init(d);
            item.belongInventory = this;
            this.items.push(item);
        }

        //搜索容器
        let unsearchedItems = this.items.filter(item => !item.data.Searched);
        const Search = (index) => {
            if (index >= unsearchedItems.length || this.stopSearch) {
                return;
            }

            unsearchedItems[index].Search(() => {
                Search(index + 1);
            });
        }

        Search(0);
    }

    AddItem(data: SJZ_ItemData) {
        let gridLength = this.gridCtrl.width * this.gridCtrl.height;
        for (let j = 0; j < gridLength; j++) {
            let x = j % this.gridCtrl.width;
            let y = Math.floor(j / this.gridCtrl.width);
            if (this.gridCtrl.grid[y][x] == 0) {
                if (SJZ_InventoryGrid.CanPlaceItem(this.gridCtrl, x, y, data.Size.width, data.Size.height)) {
                    SJZ_InventoryGrid.PlaceItem(this.gridCtrl, x, y, data.Size.width, data.Size.height);
                    data.Point.x = x;
                    data.Point.y = y;

                    let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Item, this.ItemContentTrans.node);
                    node.setPosition(data.Point.x * SJZ_Constant.itemSize + SJZ_Constant.itemSize / 2, -data.Point.y * SJZ_Constant.itemSize - SJZ_Constant.itemSize / 2);
                    let item = node.getComponent(SJZ_Item);
                    item.Init(data);
                    this.items.push(item);

                    return true;
                }
            }
        }

        return false;
    }

    ClearItems() {
        if (!this.items || this.items.length == 0) return;
        this.items.forEach(e => {
            if (e.node.parent == this.ItemContentTrans.node) {
                SJZ_PoolManager.Instance.Put(e.node);
            }
        });

        this.items.length = 0;
        SJZ_InventoryGrid.ClearGrid(this.gridCtrl);
    }

    AddItemToArray(data: SJZ_ItemData) {
        if (this.data.findIndex(e => e === data) === -1) {
            this.data.push(data);
        }
    }

    RemoveItemFromArray(data: SJZ_ItemData) {
        if (this.items.findIndex(e => e.data === data) !== -1) {
            let item = this.items.find(e => e.data === data);
            Tools.RemoveItemFromArray(this.items, item);
            SJZ_PoolManager.Instance.Put(item.node);
        }
        if (this.data.findIndex(e => e === data) !== -1) {
            Tools.RemoveItemFromArray(this.data, data);
        }
    }

    OnDragStart(item: SJZ_Item) {
        if (item.isShopItem) return;
        if (this.data.findIndex(e => e === item.data) !== -1) {
            SJZ_InventoryGrid.RemoveItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.width, item.data.Size.height);
        }
    }

    OnDragging(item: SJZ_Item, point: Vec2) {
        if (item.isShopItem) return;
        this.ItemContentTrans.convertToNodeSpaceAR(v3_0.set(point.x, point.y), v3_0)

        //边界判断
        if (v3_0.x < 0 || v3_0.x > this.ItemContentTrans.width || -v3_0.y < 0 || -v3_0.y > this.ItemContentTrans.height) return;

        v2_0.set(v3_0.x, v3_0.y);
        v2_0.set(Math.floor(v2_0.x / 100), Math.floor(-v2_0.y / 100));

        if (v2_0.x < 0 || v2_0.y < 0) return;
        let canPlace = SJZ_InventoryGrid.CanPlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.width, item.data.Size.height);
        let points = SJZ_InventoryGrid.GetPlaceItemPoints(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.width, item.data.Size.height);
        if (v2_0.x != this.lastResult.x || v2_0.y != this.lastResult.y) {
            this.lastResult.set(v2_0);
            SJZ_GameManager.Instance.ShowTipCells(canPlace, points, this.ItemContentTrans);
        }
    }

    OnDragEnd(item: SJZ_Item, position: Vec2) {
        if (item.isShopItem) return;
        this.lastResult.set(-1, -1);
        this.ItemContentTrans.convertToNodeSpaceAR(v3_0.set(position.x, position.y), v3_0);
        SJZ_GameManager.Instance.HideTipCells();

        //边界判断
        if (v3_0.x < 0 || v3_0.x > this.ItemContentTrans.width || -v3_0.y < 0 || -v3_0.y > this.ItemContentTrans.height) {
            return;
        }

        v2_0.set(v3_0.x, v3_0.y);
        v2_0.set(Math.floor(v2_0.x / 100), Math.floor(-v2_0.y / 100));
        let canPlace = SJZ_InventoryGrid.CanPlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.width, item.data.Size.height);
        if (canPlace) {
            //当前放入的是玩家的仓库，且第一次放入大红，引导玩家放置大红
            if (this.data == SJZ_DataManager.PlayerData.InventoryItemData && item.data.Quality >= SJZ_Quality.Mythic && SJZ_ItemData.IsCollection(item.data.Type)) {
                //第一次放入仓库且大红展览有此数据
                if (PrefsManager.GetBool(SJZ_Constant.Key.FirstPutInventory, true) && SJZ_Showcases.Instance.GetTarget(item.data.Name)) {
                    let target = SJZ_Showcases.Instance.GetTarget(item.data.Name, () => {
                        PrefsManager.SetBool(SJZ_Constant.Key.FirstPutInventory, false);
                        EventManager.Scene.emit(SJZ_Constant.Event.SHOW_TUTORIAL, SJZ_LvManager.Instance.GuideTarget);
                    });

                    if (target) {
                        EventManager.Scene.emit(SJZ_Constant.Event.SHOW_TUTORIAL, target.node);
                    }
                }
            }

            //跨背包放入
            if (this.data.findIndex(e => e === item.data) == -1) {
                item.belongInventory.RemoveItemFromArray(item.data);
                item.belongInventory = this;
                this.AddItemToArray(item.data);
            }

            //数据
            item.data.Point.x = v2_0.x;
            item.data.Point.y = v2_0.y;
            SJZ_InventoryGrid.PlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.width, item.data.Size.height);

            //表现
            item.node.setParent(this.ItemContent);

            v3_0.set(v2_0.x * 100 + 50, -v2_0.y * 100 - 50, 0)
            item.node.setPosition(v3_0);

            this.items.push(item);
        } else {
            //同容器放置
            if (this.data.findIndex(e => e === item.data) !== -1) {
                SJZ_InventoryGrid.PlaceItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.width, item.data.Size.height);
            }

        }

        SJZ_DataManager.SaveData();
    }
}