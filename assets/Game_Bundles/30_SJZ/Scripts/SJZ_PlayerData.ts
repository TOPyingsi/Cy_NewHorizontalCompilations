import PrefsManager from "db://assets/Scripts/Framework/Managers/PrefsManager";
import { SJZ_ItemData, SJZ_ItemType, SJZ_WorkbenchType } from "./SJZ_Data";
import { SJZ_InventoryGrid } from "./SJZ_InventoryGrid";
import { EventManager } from "db://assets/Scripts/Framework/Managers/EventManager";
import { SJZ_Constant } from "./SJZ_Constant";
import { SJZ_DataManager } from "./SJZ_DataManager";
import { misc } from "cc";
import { Tools } from "db://assets/Scripts/Framework/Utils/Tools";

export class SJZ_PlayerData {
    constructor(private money: number = 1000000, public InventoryItemData: SJZ_ItemData[] = [], public Weapon_Primary: SJZ_ItemData = null, public Weapon_Secondary: SJZ_ItemData = null, public Weapon_Pistol: SJZ_ItemData = null, public Weapon_Melee: SJZ_ItemData = null, public Weapon_Helmet: SJZ_ItemData = null, public Weapon_BodyArmor: SJZ_ItemData = null,
        public PocketData: SJZ_ItemData[][] = [], public ChestRigData: SJZ_ItemData = null, public BackpackData: SJZ_ItemData = null, private safeBox = null,
        public ShowcaseData: SJZ_ItemData[] = []) {
        if (safeBox) this.SafeBox = safeBox;
        this.Money = money;

        this.InventoryGridCtrl = new SJZ_InventoryGrid(1, 1);

        //口袋
        this.SingleGrids = [];
        for (let i = 0; i < 5; i++) {
            this.SingleGrids.push(new SJZ_InventoryGrid(1, 1));
        }

        if (this.ChestRigData) {
            this.ChestRigGrid = new SJZ_InventoryGrid(this.ChestRigData.EquipData.CarryingSpace.width, this.ChestRigData.EquipData.CarryingSpace.height);
        }

        if (this.BackpackData) {
            this.BackpackGrid = new SJZ_InventoryGrid(this.BackpackData.EquipData.CarryingSpace.width, this.BackpackData.EquipData.CarryingSpace.height);
        }

        //保险箱
        this.SafeBoxGrid = new SJZ_InventoryGrid(this.SafeBox.width, this.SafeBox.height);


        this.Init(9, 19);
    }

    public get Money(): number {
        return this.money;
    }

    public set Money(value: number) {
        value = Math.floor(value);
        this.money = value;
        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_MONEY);
    }

    /**安全箱 */
    SafeBox: { width: number, height: number, ItemData: SJZ_ItemData[] } = { width: 2, height: 1, ItemData: [] };

    SingleGrids: SJZ_InventoryGrid[] = [];
    ChestRigGrid: SJZ_InventoryGrid = null;
    BackpackGrid: SJZ_InventoryGrid = null;
    SafeBoxGrid: SJZ_InventoryGrid = null;

    //#region 仓库

    InventoryGridCtrl: SJZ_InventoryGrid = null;

    private Init(width: number, height: number) {
        this.InventoryGridCtrl = new SJZ_InventoryGrid(width, height);
        let data = this.InventoryItemData;

        for (let i = 0; i < data.length; i++) {
            //数据
            SJZ_InventoryGrid.PlaceItem(this.InventoryGridCtrl, data[i].Point.x, data[i].Point.y, data[i].Size.width, data[i].Size.height);
        }
    }

    EquipChestRig(chestRig: SJZ_ItemData) {
        if (chestRig.Type != SJZ_ItemType.ChestRig) {
            console.error(`无法装备胸挂`, chestRig);
            return;
        }
        this.ChestRigData = chestRig;
        this.ChestRigGrid = new SJZ_InventoryGrid(this.ChestRigData.EquipData.CarryingSpace.width, this.ChestRigData.EquipData.CarryingSpace.height);
    }

    UnEquipChestRig() { }

    EquipBackpack(backpack: SJZ_ItemData) {
        if (backpack.Type != SJZ_ItemType.Backpack) {
            console.error(`无法装备背包`, backpack);
            return;
        }
        this.BackpackData = backpack;
        this.BackpackGrid = new SJZ_InventoryGrid(this.BackpackData.EquipData.CarryingSpace.width, this.BackpackData.EquipData.CarryingSpace.height);
    }

    UnEquipBackpack() { }

    SetSafeBox(width: number, height: number) {
        SJZ_DataManager.PlayerData.SafeBox = { width: width, height: height, ItemData: [] };
        this.SafeBoxGrid = new SJZ_InventoryGrid(width, height);
    }

    AddItemToBackpack(data: SJZ_ItemData) {
        if (this.BackpackData && this.BackpackData.EquipData) {
            SJZ_DataManager.FillContainer(this.BackpackGrid, [data], this.BackpackData.EquipData.ItemData);
        }
    }

    /**获取工作台等级 */
    GetWorkbenchLv(type: SJZ_WorkbenchType): number {
        return PrefsManager.GetNumber(`WorkbenchLv_${type}`, 0);
    }

    /**设置工作台等级 */
    SetWorkbenchLv(type: SJZ_WorkbenchType, value: number) {
        value = misc.clampf(value, 1, 3);
        PrefsManager.SetNumber(`WorkbenchLv_${type}`, value);
    }

    /**添加物品到仓库 */
    AddItemToInventory(data: SJZ_ItemData) {
        let gridLength = this.InventoryGridCtrl.width * this.InventoryGridCtrl.height;
        for (let j = 0; j < gridLength; j++) {
            let x = j % this.InventoryGridCtrl.width;
            let y = Math.floor(j / this.InventoryGridCtrl.width);
            if (this.InventoryGridCtrl.grid[y][x] == 0) {
                if (SJZ_InventoryGrid.CanPlaceItem(this.InventoryGridCtrl, x, y, data.Size.width, data.Size.height)) {
                    SJZ_InventoryGrid.PlaceItem(this.InventoryGridCtrl, x, y, data.Size.width, data.Size.height);
                    data.Point.x = x;
                    data.Point.y = y;
                    console.log(`仓库添加:`, data);
                    this.InventoryItemData.push(data);
                    EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_INVENTORY_ITEMS);
                    SJZ_DataManager.SaveData();
                    return true;
                }
            }
        }

        return false;
    }

    /**从仓库移除物品 */
    RemoveItemFromInventory(data: SJZ_ItemData) {
        if (this.InventoryItemData.indexOf(data) != -1) {
            this.InventoryItemData.splice(this.InventoryItemData.indexOf(data), 1);
            SJZ_DataManager.SaveData();
            SJZ_InventoryGrid.RemoveItem(this.InventoryGridCtrl, data.Point.x, data.Point.y, data.Size.width, data.Size.height);
            console.log(`仓库移除:`, data);
            EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_INVENTORY_ITEMS);
            return true;
        }
        return false;
    }

    /**仓库物品的数量 */
    GetInventoryItemCount(id: number): number {
        let count = 0;

        let data = this.InventoryItemData.filter(e => e.ID == id);
        if (data) count = data.length;

        return count;
    }

    /**从展览处添加物品 */
    AddItemToShowcase(data: SJZ_ItemData) {
        this.ShowcaseData.push(data);
    }

    /**从展览处移除物品 */
    RemoveItemFromShowcase(data: SJZ_ItemData) {
        if (this.ShowcaseData.indexOf(data) != -1) {
            this.ShowcaseData.splice(this.ShowcaseData.indexOf(data), 1);
        }
    }

    RemoveItemFromBackpack(data: SJZ_ItemData) {
        //口袋
        for (let i = 0; i < this.PocketData.length; i++) {
            const pocket = this.PocketData[i];
            if (pocket.findIndex(e => e == data) !== -1) {
                pocket.splice(pocket.indexOf(data), 1);
                SJZ_InventoryGrid.RemoveItem(this.SingleGrids[i], data.Point.x, data.Point.y, data.Size.width, data.Size.height);
            }
        }

        //胸挂
        if (this.ChestRigData) {
            if (this.ChestRigData.EquipData.ItemData.findIndex(e => e == data) !== -1) {
                this.ChestRigData.EquipData.ItemData.splice(this.ChestRigData.EquipData.ItemData.indexOf(data), 1);
                SJZ_InventoryGrid.RemoveItem(this.ChestRigGrid, data.Point.x, data.Point.y, data.Size.width, data.Size.height);
            }
        }

        //背包
        if (this.BackpackData) {
            if (this.BackpackData.EquipData.ItemData.findIndex(e => e == data) !== -1) {
                this.BackpackData.EquipData.ItemData.splice(this.BackpackData.EquipData.ItemData.indexOf(data), 1);
                SJZ_InventoryGrid.RemoveItem(this.ChestRigGrid, data.Point.x, data.Point.y, data.Size.width, data.Size.height);
            }
        }

        //保险箱
        if (this.SafeBox) {
            if (this.SafeBox.ItemData.findIndex(e => e == data) !== -1) {
                this.SafeBox.ItemData.splice(this.SafeBox.ItemData.indexOf(data), 1);
                SJZ_InventoryGrid.RemoveItem(this.SafeBoxGrid, data.Point.x, data.Point.y, data.Size.width, data.Size.height);
            }
        }

        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_BACKPACK_ITEMS);
    }

    ClearBackpack() {
        this.Weapon_Primary = null;
        this.Weapon_Secondary = null;
        this.Weapon_Pistol = null;
        this.Weapon_Helmet = null;
        this.Weapon_BodyArmor = null;

        this.ChestRigData = null;
        this.BackpackData = null;

        //口袋
        for (let i = 0; i < this.PocketData.length; i++) {
            const pocket = this.PocketData[i];
            pocket.forEach(e => {
                SJZ_InventoryGrid.RemoveItem(this.SingleGrids[i], e.Point.x, e.Point.y, e.Size.width, e.Size.height);
            });
            pocket.length = 0;
        }

        SJZ_DataManager.SaveData();
    }

    /**获得身上所有的子弹 */
    GetBackpackAllItemByType(type: SJZ_ItemType) {
        let allData: SJZ_ItemData[] = [];

        //口袋
        for (let i = 0; i < this.PocketData.length; i++) {
            const pocket = this.PocketData[i];
            const filterData = pocket.filter(e => e.Type == type);
            allData.push(...filterData);
        }

        //胸挂
        if (this.ChestRigData) {
            const filterData = this.ChestRigData.EquipData.ItemData.filter(e => e.Type == type);
            allData.push(...filterData);
        }

        //背包
        if (this.BackpackData) {
            const filterData = this.BackpackData.EquipData.ItemData.filter(e => e.Type == type);
            allData.push(...filterData);
        }

        //保险箱
        if (this.SafeBox) {
            const filterData = this.SafeBox.ItemData.filter(e => e.Type == type);
            allData.push(...filterData);
        }

        return allData;
    }

    /**获得身上物品 */
    GetBackpackItem(name: string) {
        let result: SJZ_ItemData = null;

        //口袋
        for (let i = 0; i < this.PocketData.length; i++) {
            const pocket = this.PocketData[i];
            result = pocket.find(e => e.Name == name);
            if (result) return result;
        }

        //胸挂
        if (this.ChestRigData) {
            result = this.ChestRigData.EquipData.ItemData.find(e => e.Name == name);
            if (result) return result;
        }

        //背包
        if (this.BackpackData) {
            result = this.BackpackData.EquipData.ItemData.find(e => e.Name == name);
            if (result) return result;
        }

        //保险箱
        if (this.SafeBox) {
            result = this.SafeBox.ItemData.find(e => e.Name == name);
            if (result) return result;
        }

        return result;
    }

    /**获得身上所有的子弹 */
    GetAmmoByType(ammoType: number, needCount: number) {
        //口袋
        for (let i = 0; i < this.PocketData.length; i++) {
            const pocket = this.PocketData[i];
            const data = pocket.find(e => e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType);
            if (data) {
                if (needCount >= data.Count) {
                    Tools.RemoveItemFromArray(pocket, data);
                }
                return data;
            }
        }

        //胸挂
        if (this.ChestRigData) {
            const data = this.ChestRigData.EquipData.ItemData.find(e => e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType);
            if (data) {
                if (needCount >= data.Count) {
                    Tools.RemoveItemFromArray(this.ChestRigData.EquipData.ItemData, data);
                }
                return data;
            }
        }

        //背包
        if (this.BackpackData) {
            const data = this.BackpackData.EquipData.ItemData.find(e => e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType);
            if (data) {
                if (needCount >= data.Count) Tools.RemoveItemFromArray(this.BackpackData.EquipData.ItemData, data);
                return data;
            }
        }

        //保险箱
        if (this.SafeBox) {
            const data = this.SafeBox.ItemData.find(e => e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType);
            if (data) {
                if (needCount >= data.Count) Tools.RemoveItemFromArray(this.SafeBox.ItemData, data);
                return data;
            }
        }

        return null;
    }

    /**获得身上所有的子弹的数量 */
    GetAmmoCountByType(ammoType: number) {
        let count = 0;

        //口袋
        for (let i = 0; i < this.PocketData.length; i++) {
            for (let j = 0; j < this.PocketData[i].length; j++) {
                let e = this.PocketData[i][j];
                if (e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType) count += e.Count;
            }
        }

        //胸挂
        if (this.ChestRigData) {
            for (let i = 0; i < this.ChestRigData.EquipData.ItemData.length; i++) {
                let e = this.ChestRigData.EquipData.ItemData[i];
                if (e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType) count += e.Count;
            }
        }

        //背包
        if (this.BackpackData) {
            for (let i = 0; i < this.BackpackData.EquipData.ItemData.length; i++) {
                let e = this.BackpackData.EquipData.ItemData[i];
                if (e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType) count += e.Count;
            }
        }

        //保险箱
        if (this.SafeBox) {
            for (let i = 0; i < this.SafeBox.ItemData.length; i++) {
                let e = this.SafeBox.ItemData[i];
                if (e.Type == SJZ_ItemType.Ammo && e.AmmoData.Type == ammoType) count += e.Count;
            }
        }

        return count;
    }

    /**获得仓库里所有该类型的物品 */
    GetInventoryItemByType(type: SJZ_ItemType) {
        return this.InventoryItemData.filter(e => e.Type == type);
    }

    GetTotalValue() {
        let totalValue = 0;
        //装备
        if (this.Weapon_Primary) totalValue += this.Weapon_Primary.Price;
        if (this.Weapon_Secondary) totalValue += this.Weapon_Secondary.Price;
        if (this.Weapon_Pistol) totalValue += this.Weapon_Pistol.Price;
        if (this.Weapon_Helmet) totalValue += this.Weapon_Helmet.Price;
        if (this.Weapon_BodyArmor) totalValue += this.Weapon_BodyArmor.Price;

        //口袋
        if (this.PocketData) {
            for (let i = 0; i < this.PocketData.length; i++) {
                const element = this.PocketData[i];
                if (element[0]) totalValue += element[0].Price;
            }
        }

        //胸挂
        if (this.ChestRigData) {
            totalValue += this.ChestRigData.Price;
            for (let i = 0; i < this.ChestRigData.EquipData.ItemData.length; i++) {
                let data = this.ChestRigData.EquipData.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        //背包
        if (this.BackpackData) {
            totalValue += this.BackpackData.Price;
            for (let i = 0; i < this.BackpackData.EquipData.ItemData.length; i++) {
                let data = this.BackpackData.EquipData.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        //安全箱
        if (this.SafeBox) {
            for (let i = 0; i < this.SafeBox.ItemData.length; i++) {
                let data = this.SafeBox.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        return Math.floor(totalValue);
    }

    //#endregion

}


