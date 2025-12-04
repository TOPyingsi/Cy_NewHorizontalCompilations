import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, director } from 'cc';
import { XGTS_InventoryGrid } from '../XGTS_InventoryGrid';
import XGTS_Item from './XGTS_Item';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { XGTS_Constant, XGTS_Quality } from '../XGTS_Constant';
import { XGTS_ItemData } from '../XGTS_Data';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import XGTS_Showcases from '../XGTS_Showcases';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_LvManager } from '../XGTS_LvManager';

const { ccclass, property } = _decorator;

const v3_0 = v3();
const v2_0 = v2();

@ccclass('XGTS_Inventory')
export default class XGTS_Inventory extends Component {
    ItemContent: Node = null;
    ItemContentTrans: UITransform = null;

    data: XGTS_ItemData[] = [];
    items: XGTS_Item[] = [];

    gridCtrl: XGTS_InventoryGrid = null;

    lastResult: Vec2 = v2(-1, -1);

    stopSearch: boolean = false;
    protected start(): void {
        director.getScene().on("修勾逃生_展示表情", this.Showmeme, this);
    }
    /**
     * 初始化仓库
     * @param data 数据
     * @param width 仓库的宽度
     * @param height 仓库的高度
     */
    protected Init(data: XGTS_ItemData[], gridCtrl: XGTS_InventoryGrid) {
        this.data = data;
        this.gridCtrl = gridCtrl;

        this.ClearItems();

        for (let i = 0; i < data.length; i++) {
            //表现
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Item, this.ItemContentTrans.node);
            let item = node.getComponent(XGTS_Item);
            item.Init(data[i]);
            item.belongInventory = this;

            // 根据是否旋转来设置正确的初始位置
            if (data[i].Rotated) {
                node.setPosition(data[i].Point.x * XGTS_Constant.itemSize + data[i].Size.height * XGTS_Constant.itemSize / 2,
                    -data[i].Point.y * XGTS_Constant.itemSize - data[i].Size.width * XGTS_Constant.itemSize / 2);
            } else {
                node.setPosition(data[i].Point.x * XGTS_Constant.itemSize + data[i].Size.width * XGTS_Constant.itemSize / 2,
                    -data[i].Point.y * XGTS_Constant.itemSize - data[i].Size.height * XGTS_Constant.itemSize / 2);
            }

            this.items.push(item);

            //数据
            // 根据是否旋转来正确放置物品到网格中
            if (data[i].Rotated) {
                XGTS_InventoryGrid.PlaceItem(this.gridCtrl, data[i].Point.x, data[i].Point.y, data[i].Size.height, data[i].Size.width);
            } else {
                XGTS_InventoryGrid.PlaceItem(this.gridCtrl, data[i].Point.x, data[i].Point.y, data[i].Size.width, data[i].Size.height);
            }
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
    InitLootContainer(data: XGTS_ItemData[], width: number, height: number) {
        this.data = data;
        this.gridCtrl = new XGTS_InventoryGrid(width, height);
        this.ClearItems();

        XGTS_GameManager.FillLootContainer(this.data, this.gridCtrl);

        for (let i = 0; i < this.data.length; i++) {
            const d = this.data[i];
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Item, this.ItemContentTrans.node);

            // 根据是否旋转来设置正确的初始位置
            if (d.Rotated) {
                node.setPosition(d.Point.x * XGTS_Constant.itemSize + d.Size.height * XGTS_Constant.itemSize / 2,
                    -d.Point.y * XGTS_Constant.itemSize - d.Size.width * XGTS_Constant.itemSize / 2);
            } else {
                node.setPosition(d.Point.x * XGTS_Constant.itemSize + d.Size.width * XGTS_Constant.itemSize / 2,
                    -d.Point.y * XGTS_Constant.itemSize - d.Size.height * XGTS_Constant.itemSize / 2);
            }

            let item = node.getComponent(XGTS_Item);
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

    AddItem(data: XGTS_ItemData) {
        let gridLength = this.gridCtrl.width * this.gridCtrl.height;
        for (let j = 0; j < gridLength; j++) {
            let x = j % this.gridCtrl.width;
            let y = Math.floor(j / this.gridCtrl.width);
            if (this.gridCtrl.grid[y][x] == 0) {
                // 首先尝试正常放置（横向）
                if (XGTS_InventoryGrid.CanPlaceItem(this.gridCtrl, x, y, data.Size.width, data.Size.height)) {
                    XGTS_InventoryGrid.PlaceItem(this.gridCtrl, x, y, data.Size.width, data.Size.height);
                    data.Point.x = x;
                    data.Point.y = y;
                    // 确保旋转状态正确
                    data.Rotated = false;

                    let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Item, this.ItemContentTrans.node);
                    // 修正位置计算
                    node.setPosition(x * XGTS_Constant.itemSize + data.Size.width * XGTS_Constant.itemSize / 2,
                        -y * XGTS_Constant.itemSize - data.Size.height * XGTS_Constant.itemSize / 2);
                    let item = node.getComponent(XGTS_Item);
                    item.Init(data);
                    this.items.push(item);

                    return true;
                }
                // 如果无法横向放置，则尝试纵向放置（旋转90度）
                else if (XGTS_InventoryGrid.CanPlaceItem(this.gridCtrl, x, y, data.Size.height, data.Size.width)) {
                    XGTS_InventoryGrid.PlaceItem(this.gridCtrl, x, y, data.Size.height, data.Size.width);
                    data.Point.x = x;
                    data.Point.y = y;

                    // 标记物品已被旋转
                    data.Rotated = true;

                    let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Item, this.ItemContentTrans.node);
                    // 修正位置计算（旋转后宽高互换）
                    node.setPosition(x * XGTS_Constant.itemSize + data.Size.height * XGTS_Constant.itemSize / 2,
                        -y * XGTS_Constant.itemSize - data.Size.width * XGTS_Constant.itemSize / 2);
                    let item = node.getComponent(XGTS_Item);
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
            if (e.node?.parent == this.ItemContentTrans.node) {
                XGTS_PoolManager.Instance.Put(e.node);
            }
        });

        this.items.length = 0;
        XGTS_InventoryGrid.ClearGrid(this.gridCtrl);
    }

    AddItemToArray(data: XGTS_ItemData) {
        if (this.data.findIndex(e => e === data) === -1) {
            this.data.push(data);
        }
    }

    RemoveItemFromArray(data: XGTS_ItemData) {
        // 先从items数组中移除并回收节点
        let itemIndex = this.items.findIndex(e => e.data === data);
        if (itemIndex !== -1) {
            let item = this.items[itemIndex];
            // 从数组中移除
            this.items.splice(itemIndex, 1);
            // 回收节点
            if (item.node && item.node.parent) {
                XGTS_PoolManager.Instance.Put(item.node);
            }
        }

        // 从数据数组中移除
        let dataIndex = this.data.findIndex(e => e === data);
        if (dataIndex !== -1) {
            this.data.splice(dataIndex, 1);
        }

        // 从网格中移除占用
        if (data.Rotated) {
            XGTS_InventoryGrid.RemoveItem(this.gridCtrl, data.Point.x, data.Point.y, data.Size.height, data.Size.width);
        } else {
            XGTS_InventoryGrid.RemoveItem(this.gridCtrl, data.Point.x, data.Point.y, data.Size.width, data.Size.height);
        }
    }

    OnDragStart(item: XGTS_Item) {
        if (item.isShopItem) return;
        if (this.data.findIndex(e => e === item.data) !== -1) {
            // 根据当前是否旋转状态来移除物品
            if (item.data.Rotated) {
                XGTS_InventoryGrid.RemoveItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.height, item.data.Size.width);
            } else {
                XGTS_InventoryGrid.RemoveItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.width, item.data.Size.height);
            }
        }
    }

    OnDragging(item: XGTS_Item, point: Vec2) {
        if (item.isShopItem) return;
        this.ItemContentTrans.convertToNodeSpaceAR(v3_0.set(point.x, point.y), v3_0)

        //边界判断
        if (v3_0.x < 0 || v3_0.x > this.ItemContentTrans.width || -v3_0.y < 0 || -v3_0.y > this.ItemContentTrans.height) return;

        v2_0.set(v3_0.x, v3_0.y);
        v2_0.set(Math.floor(v2_0.x / 100), Math.floor(-v3_0.y / 100));

        //先移除
        if (this.lastResult.x != v2_0.x || this.lastResult.y != v2_0.y) {
            this.lastResult.set(v2_0.x, v2_0.y);
            XGTS_GameManager.Instance.HideTipCells();

            //根据当前是否旋转状态来移除物品
            if (item.data.Rotated) {
                XGTS_InventoryGrid.RemoveItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.height, item.data.Size.width);
            } else {
                XGTS_InventoryGrid.RemoveItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.width, item.data.Size.height);
            }

            //尝试放置
            let points: Vec2[] = [];
            // 首先尝试正常放置（横向）
            let canPlace = XGTS_InventoryGrid.CanPlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.width, item.data.Size.height);
            let isRotated = false;

            // 如果不能正常放置，则尝试旋转90度后放置（纵向）
            if (!canPlace) {
                canPlace = XGTS_InventoryGrid.CanPlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.height, item.data.Size.width);
                isRotated = canPlace; // 标记是否需要旋转
            }

            // 根据放置结果生成提示格子
            if (canPlace) {
                // 根据是否旋转来决定使用哪种尺寸生成提示格子
                let width = isRotated ? item.data.Size.height : item.data.Size.width;
                let height = isRotated ? item.data.Size.width : item.data.Size.height;

                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < height; y++) {
                        points.push(v2(v2_0.x + x, v2_0.y + y));
                    }
                }
                XGTS_GameManager.Instance.ShowTipCells(true, points, this.ItemContentTrans);
            } else {
                // 不能放置时也根据物品当前尺寸生成提示格子
                for (let x = 0; x < item.data.Size.width; x++) {
                    for (let y = 0; y < item.data.Size.height; y++) {
                        points.push(v2(v2_0.x + x, v2_0.y + y));
                    }
                }
                XGTS_GameManager.Instance.ShowTipCells(false, points, this.ItemContentTrans);
            }
        }
    }

    OnDragEnd(item: XGTS_Item, position: Vec2) {
        if (item.isShopItem) return;
        this.lastResult.set(-1, -1);
        this.ItemContentTrans.convertToNodeSpaceAR(v3_0.set(position.x, position.y), v3_0);
        XGTS_GameManager.Instance.HideTipCells();

        //边界判断
        if (v3_0.x < 0 || v3_0.x > this.ItemContentTrans.width || -v3_0.y < 0 || -v3_0.y > this.ItemContentTrans.height) {
            // 放回原位
            if (this.data.findIndex(e => e === item.data) !== -1) {
                // 根据当前旋转状态放置回原位
                if (item.data.Rotated) {
                    XGTS_InventoryGrid.PlaceItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.height, item.data.Size.width);
                } else {
                    XGTS_InventoryGrid.PlaceItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.width, item.data.Size.height);
                }

                // 重置位置
                if (item.data.Rotated) {
                    v3_0.set(item.data.Point.x * 100 + item.data.Size.height * 50, -item.data.Point.y * 100 - item.data.Size.width * 50, 0);
                } else {
                    v3_0.set(item.data.Point.x * 100 + item.data.Size.width * 50, -item.data.Point.y * 100 - item.data.Size.height * 50, 0);
                }
                item.node.setPosition(v3_0);
            }
            return;
        }

        v2_0.set(v3_0.x, v3_0.y);
        v2_0.set(Math.floor(v2_0.x / 100), Math.floor(-v3_0.y / 100));

        // 首先尝试正常放置（横向）
        let canPlace = XGTS_InventoryGrid.CanPlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.width, item.data.Size.height);
        let isRotated = false;

        // 如果不能正常放置，则尝试旋转90度后放置（纵向）
        if (!canPlace) {
            canPlace = XGTS_InventoryGrid.CanPlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.height, item.data.Size.width);
            isRotated = canPlace; // 标记是否需要旋转
        }

        // 检查是否是跨容器移动
        let isCrossContainer = this.data.findIndex(e => e === item.data) == -1;

        if (canPlace) {
            //当前放入的是玩家的仓库，且第一次放入大红，引导玩家放置大红
            let playerNum = 0;
            if (XGTS_GameManager.IsDoubleMode) {
                playerNum = 1;
            }
            if (this.data == XGTS_DataManager.PlayerDatas[playerNum].InventoryItemData && item.data.Quality >= XGTS_Quality.Mythic && XGTS_ItemData.IsCollection(item.data.Type)) {
                //第一次放入仓库且大红展览有此数据
                if (PrefsManager.GetBool(XGTS_Constant.Key.FirstPutInventory, true) && XGTS_Showcases.Instance.GetTarget(item.data.Name)) {
                    let target = XGTS_Showcases.Instance.GetTarget(item.data.Name, () => {
                        PrefsManager.SetBool(XGTS_Constant.Key.FirstPutInventory, false);
                        EventManager.Scene.emit(XGTS_Constant.Event.SHOW_TUTORIAL, XGTS_LvManager.Instance.GuideTarget);
                    });

                    if (target) {
                        EventManager.Scene.emit(XGTS_Constant.Event.SHOW_TUTORIAL, target.node);
                    }
                }
            }

            //跨背包放入
            if (isCrossContainer) {
                // 从原容器完全移除物品（包括数据和UI节点）
                item.belongInventory.RemoveItemFromArray(item.data);
                // 更新归属容器
                item.belongInventory = this;
                // 添加到当前容器数据数组
                this.AddItemToArray(item.data);
                // 添加到当前容器items数组
                this.items.push(item);
            }

            //数据
            item.data.Point.x = v2_0.x;
            item.data.Point.y = v2_0.y;

            // 设置旋转标记
            item.data.Rotated = isRotated;

            // 根据是否旋转来决定使用哪种尺寸放置
            if (isRotated) {
                XGTS_InventoryGrid.PlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.height, item.data.Size.width);
            } else {
                XGTS_InventoryGrid.PlaceItem(this.gridCtrl, v2_0.x, v2_0.y, item.data.Size.width, item.data.Size.height);
            }

            //表现
            item.node.setParent(this.ItemContent);

            // 根据是否旋转设置位置
            if (isRotated) {
                v3_0.set(v2_0.x * 100 + item.data.Size.height * 50, -v2_0.y * 100 - item.data.Size.width * 50, 0);
            } else {
                v3_0.set(v2_0.x * 100 + item.data.Size.width * 50, -v2_0.y * 100 - item.data.Size.height * 50, 0);
            }
            item.node.setPosition(v3_0);

            // 确保物品显示正确更新
            item.Init(item.data);
        } else {
            //同容器放置回原位
            if (this.data.findIndex(e => e === item.data) !== -1) {
                // 根据当前旋转状态放置回原位
                if (item.data.Rotated) {
                    XGTS_InventoryGrid.PlaceItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.height, item.data.Size.width);
                } else {
                    XGTS_InventoryGrid.PlaceItem(this.gridCtrl, item.data.Point.x, item.data.Point.y, item.data.Size.width, item.data.Size.height);
                }

                // 重置位置
                if (item.data.Rotated) {
                    v3_0.set(item.data.Point.x * 100 + item.data.Size.height * 50, -item.data.Point.y * 100 - item.data.Size.width * 50, 0);
                } else {
                    v3_0.set(item.data.Point.x * 100 + item.data.Size.width * 50, -item.data.Point.y * 100 - item.data.Size.height * 50, 0);
                }
                item.node.setPosition(v3_0);
            }
            // 跨容器放置失败，需要将物品放回原容器
            else {
                if (isCrossContainer && item.belongInventory) {
                    // 将物品数据添加回原容器
                    item.belongInventory.AddItemToArray(item.data);
                    // 将物品节点添加回原容器
                    item.belongInventory.items.push(item);
                    // 从当前容器移除节点引用
                    Tools.RemoveItemFromArray(this.items, item);
                    // 将节点设为原容器的子节点
                    item.node.setParent(item.belongInventory.ItemContent);
                    // 恢复物品在原容器中的位置
                    if (item.data.Rotated) {
                        v3_0.set(item.data.Point.x * 100 + item.data.Size.height * 50, -item.data.Point.y * 100 - item.data.Size.width * 50, 0);
                    } else {
                        v3_0.set(item.data.Point.x * 100 + item.data.Size.width * 50, -item.data.Point.y * 100 - item.data.Size.height * 50, 0);
                    }
                    item.node.setPosition(v3_0);
                }
            }
        }

        XGTS_DataManager.SaveData();
    }
    //展示表情
    Showmeme(MemeState: string) {
        if (!this.node.getChildByPath("Meme/" + MemeState)) return;
        this.node.getChildByPath("Meme/" + MemeState).active = true;
        this.scheduleOnce(() => {
            this.node.getChildByPath("Meme/" + MemeState).active = false;
        }, 2.5)
    }
}