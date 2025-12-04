import { JsonAsset, math } from 'cc';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_AccessoryData, SJZ_AmmoData, SJZ_ConsumableData, SJZ_ContainerData, SJZ_ContainerLootData, SJZ_ContainerType, SJZ_EquipData, SJZ_ItemData, SJZ_ItemType, SJZ_PrizePoolData, SJZ_SkinData, SJZ_WeaponData, SJZ_WorkbenchData, SJZ_WorkbenchType } from './SJZ_Data';
import { SJZ_Constant } from './SJZ_Constant';
import { SJZ_PlayerData } from './SJZ_PlayerData';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_InventoryGrid } from './SJZ_InventoryGrid';

export class SJZ_DataManager {
    static Names: string[] = [];

    static ItemDataMap: Map<SJZ_ItemType, SJZ_ItemData[]>;
    static ContainerLootMap: Map<SJZ_ContainerType, SJZ_ContainerLootData[]>;
    static EquipData: SJZ_EquipData[];
    static WeaponData: SJZ_WeaponData[];
    static ConsumableData: SJZ_ConsumableData[];
    static AccessoryData: SJZ_AccessoryData[];
    static AmmoData: SJZ_AmmoData[];
    static ContainerData: SJZ_ContainerData[];
    static PlayerData: SJZ_PlayerData;
    /**大红展示台数据 */
    static ShowcaseData: SJZ_ItemData[] = [];
    /**大红展示台数据 */
    static WorkbenchData: Map<SJZ_WorkbenchType, SJZ_WorkbenchData[]>;

    static SkinData: SJZ_SkinData[];
    static PrizePoolData: SJZ_PrizePoolData[];

    public static LoadData() {
        SJZ_DataManager.ItemDataMap = new Map();
        SJZ_DataManager.ContainerLootMap = new Map();
        SJZ_DataManager.WeaponData = [];
        SJZ_DataManager.AmmoData = [];
        SJZ_DataManager.EquipData = [];
        SJZ_DataManager.ConsumableData = [];
        SJZ_DataManager.AccessoryData = [];
        SJZ_DataManager.ContainerData = [];
        SJZ_DataManager.WorkbenchData = new Map();
        SJZ_DataManager.SkinData = [];
        SJZ_DataManager.PrizePoolData = [];

        //玩家装备数据
        if (PrefsManager.GetItem(SJZ_Constant.Key.PlayerData)) {
            let data = JSON.parse(PrefsManager.GetItem(SJZ_Constant.Key.PlayerData));

            this.PlayerData = new SJZ_PlayerData(data.Money, data.InventoryItemData, data.Weapon_Primary, data.Weapon_Secondary, data.Weapon_Pistol, data.Weapon_Melee
                , data.Weapon_Helmet, data.Weapon_BodyArmor, data.PocketData, data.ChestRigData, data.BackpackData, data.SafeBox, data.ShowcaseData);
        } else {
            this.PlayerData = new SJZ_PlayerData();
        }

        console.log(`[玩家数据]:`, this.PlayerData);

        return new Promise((resolve, reject) => {
            Promise.all([
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "ContainerLoot") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Weapons") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Ammo") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Equips") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Consumable") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "GunEquipment") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Containers") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Workbench") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "skin") as Promise<JsonAsset>,
                BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "PrizePool") as Promise<JsonAsset>
            ]).then(([containerLootJson, weaponsJson, ammoJson, equipsJson, consumableJson, accessoriesJson, containersJson, workbenchJson, skinJson, prizePoolJson]) => {
                //容器产出数据
                let containerLootData = containerLootJson.json as any;

                SJZ_DataManager.ContainerLootMap.set(SJZ_ContainerType.AviationCrate, []);
                SJZ_DataManager.ContainerLootMap.set(SJZ_ContainerType.DeliveryBox, []);
                SJZ_DataManager.ContainerLootMap.set(SJZ_ContainerType.BirdNest, []);
                SJZ_DataManager.ContainerLootMap.set(SJZ_ContainerType.SafeBox, []);
                SJZ_DataManager.ContainerLootMap.set(SJZ_ContainerType.ComputerCase, []);
                SJZ_DataManager.ContainerLootMap.set(SJZ_ContainerType.WeaponCase, []);

                for (let i = 0; i < containerLootData.武器箱.length; i++) {
                    const e = containerLootData.武器箱[i];
                    SJZ_DataManager.ContainerLootMap.get(SJZ_ContainerType.WeaponCase).push(new SJZ_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.机箱.length; i++) {
                    const e = containerLootData.机箱[i];
                    SJZ_DataManager.ContainerLootMap.get(SJZ_ContainerType.ComputerCase).push(new SJZ_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.保险箱.length; i++) {
                    const e = containerLootData.保险箱[i];
                    SJZ_DataManager.ContainerLootMap.get(SJZ_ContainerType.SafeBox).push(new SJZ_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.鸟窝.length; i++) {
                    const e = containerLootData.鸟窝[i];
                    SJZ_DataManager.ContainerLootMap.get(SJZ_ContainerType.BirdNest).push(new SJZ_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.快递盒.length; i++) {
                    const e = containerLootData.快递盒[i];
                    SJZ_DataManager.ContainerLootMap.get(SJZ_ContainerType.DeliveryBox).push(new SJZ_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.航空箱.length; i++) {
                    const e = containerLootData.航空箱[i];
                    SJZ_DataManager.ContainerLootMap.get(SJZ_ContainerType.AviationCrate).push(new SJZ_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                console.log("ContainerLootMap", SJZ_DataManager.ContainerLootMap);

                //武器数据
                let weaponsData = weaponsJson.json as any;
                for (let i = 0; i < weaponsData.length; i++) {
                    const e = weaponsData[i];
                    SJZ_DataManager.WeaponData.push(new SJZ_WeaponData(e.ID, e.Type, e.Quality, e.Name, e.AmmoType, e.PriceFluctuation, e.Damage, e.Precision, e.Recoil, e.Clip, e.FiringRate, e.ReloadDuration, e.Required, e.quantity, e.Duration));
                }
                console.log("WeaponData", SJZ_DataManager.WeaponData);

                //子弹数据
                let ammoData = ammoJson.json as any;
                for (let i = 0; i < ammoData.length; i++) {
                    const e = ammoData[i];
                    SJZ_DataManager.AmmoData.push(new SJZ_AmmoData(e.ID, e.Type, e.Name, e.Lv1Damage, e.Lv2Damage, e.Lv3Damage, e.Lv4Damage, e.Lv5Damage, e.Lv6Damage, e.Required, e.quantity, e.Duration));
                }
                console.log("AmmoData", SJZ_DataManager.AmmoData);

                //装备数据
                let equipsData = equipsJson.json as any;
                for (let i = 0; i < equipsData.length; i++) {
                    const e = equipsData[i];
                    SJZ_DataManager.EquipData.push(new SJZ_EquipData(e.ID, e.Name, e.Durability, e.HpMaxLoss, e.CarryingSpace, e.Required, e.quantity, e.Duration));
                }
                console.log("EquipData", SJZ_DataManager.EquipData);

                //消耗品数据
                let consumableData = consumableJson.json as any;
                for (let i = 0; i < consumableData.length; i++) {
                    const e = consumableData[i];
                    SJZ_DataManager.ConsumableData.push(new SJZ_ConsumableData(e.ID, e.name, e.replySpeed, e.Durability, e.replyCoefficient, e.costTime, e.Required, e.quantity, e.Duration));
                }
                console.log("ConsumableData", SJZ_DataManager.ConsumableData);

                //配件数据
                let accessoryData = accessoriesJson.json as any;
                for (let i = 0; i < accessoryData.length; i++) {
                    const e = accessoryData[i];
                    SJZ_DataManager.AccessoryData.push(new SJZ_AccessoryData(e.ID, e.SubID, e.Name, e.AccessoryType, e.RecoilUp, e.RecoilDown, e.ReloadingSpeedUp, e.ReloadingSpeedDown, e.Magnificationlens));
                }
                console.log("AccessoryData", SJZ_DataManager.AccessoryData);

                //收集品容器数据
                let containersData = containersJson.json as any;
                for (let i = 0; i < containersData.length; i++) {
                    const e = containersData[i];
                    SJZ_DataManager.ContainerData.push(new SJZ_ContainerData(e.Type, e.Name, e.Size));
                }
                console.log("ContainerData", SJZ_DataManager.ContainerData);

                //工作台数据
                let workbenchData = workbenchJson.json as any;
                for (let i = 0; i < workbenchData.length; i++) {
                    const e = workbenchData[i];
                    if (!SJZ_DataManager.WorkbenchData.has(e.Type)) SJZ_DataManager.WorkbenchData.set(e.Type, []);
                    SJZ_DataManager.WorkbenchData.get(e.Type).push(new SJZ_WorkbenchData(e.Type, e.Lv, e.Cost, e.CostTime, e.Requirements, e.QuantityDemanded, e.Making));
                }
                console.log("WorkbenchData", SJZ_DataManager.WorkbenchData);

                //皮肤数据
                let skinData = skinJson.json as any;
                for (let i = 0; i < skinData.length; i++) {
                    const e = skinData[i];
                    SJZ_DataManager.SkinData.push(new SJZ_SkinData(e.ID, e.Name, e.GunName));
                }
                console.log("SkinData", SJZ_DataManager.SkinData);

                //奖池数据
                let prizePoolData = prizePoolJson.json as any;
                for (let i = 0; i < prizePoolData.length; i++) {
                    const e = prizePoolData[i];
                    SJZ_DataManager.PrizePoolData.push(new SJZ_PrizePoolData(e.ID, e.Name, e.Probability, e.AwardType));
                }
                console.log("PrizePoolData", SJZ_DataManager.PrizePoolData);

                // Weapons 和 Guns 加载完，继续加载 Items
                return BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Items");
            }).then((itemsJson: JsonAsset) => {
                // 处理 Items 数据
                let itemsData = itemsJson.json as any;
                for (let i = 0; i < itemsData.length; i++) {
                    const e = itemsData[i];
                    if (!SJZ_DataManager.ItemDataMap.has(e.Type)) SJZ_DataManager.ItemDataMap.set(e.Type, []);

                    let data = new SJZ_ItemData(e.ID, e.Type, e.Name, e.Price, e.Quality, e.Size, e.Weight, e.ImageId, e.Desc, e.NotShow);
                    if (data.Type == SJZ_ItemType.Weapon) {
                        data.WeaponData = Tools.Clone(SJZ_DataManager.WeaponData.find(e => e.ID == data.ID));
                    }

                    if (data.Type == SJZ_ItemType.Accessory) {
                        data.AccessoryData = Tools.Clone(SJZ_DataManager.AccessoryData.find(e => e.ID == data.ID));
                    }

                    if (data.Type == SJZ_ItemType.Ammo) {
                        data.AmmoData = Tools.Clone(SJZ_DataManager.AmmoData.find(e => e.ID == data.ID));
                    }

                    if (SJZ_ItemData.IsEquip(data.Type)) {
                        data.EquipData = Tools.Clone(SJZ_DataManager.EquipData.find(e => e.ID == data.ID));
                    }

                    if (SJZ_ItemData.IsConsumable(data.Type)) {
                        data.ConsumableData = Tools.Clone(SJZ_DataManager.ConsumableData.find(e => e.ID == data.ID));
                    }

                    if (SJZ_Constant.Showcases.findIndex(e => e == data.Name) !== -1) {
                        SJZ_DataManager.ShowcaseData.push(data);
                    }

                    SJZ_DataManager.ItemDataMap.get(e.Type).push(data);
                }

                console.log("ShowcaseData", SJZ_DataManager.ShowcaseData);
                console.log("ItemData", SJZ_DataManager.ItemDataMap);

                // this.CheckTable();
                resolve([]);
            }).catch((err) => {
                console.error("加载数据出错", err);
                reject(err);
            });
        });

    }

    public static GetItemDataByType(type: SJZ_ItemType, id: number, clone: boolean = true): SJZ_ItemData {
        if (!this.ItemDataMap.has(type)) {
            console.error(`Item 表中没有该物品 Type：${type}`);
            return null;
        }

        let result = SJZ_DataManager.ItemDataMap.get(type).find(e => e.ID == id);

        if (!result) {
            console.error(`Item 表中没有该物品 ID：${id}`)
        };
        if (clone) return Tools.Clone(result);
        else return result;
    }

    public static GetItemDataByTypeName(type: SJZ_ItemType, name: string, clone: boolean = true): SJZ_ItemData {
        if (!this.ItemDataMap.has(type)) {
            console.error(`Item 表中没有该物品 Type：${type}`);
            return null;
        }

        let result = SJZ_DataManager.ItemDataMap.get(type).find(e => e.Name == name);

        if (!result) {
            console.error(`Item 表中没有该物品 Name：${name}`)
        };
        if (clone) return Tools.Clone(result);
        else return result;
    }

    public static GetItemDataByName(name: string, clone: boolean = true): SJZ_ItemData {
        let result = null;
        for (const [key, value] of SJZ_DataManager.ItemDataMap) {
            result = value.find(e => e.Name == name)
            if (result) {
                if (clone) result = Tools.Clone(result);
                return result;
            }
        }

        if (!result) {
            console.error(`Item 表中没有该物品 Name：${name}`)
        };

        return null;
    }

    public static GetItemDataByID(id: number): SJZ_ItemData {
        let result = null;
        for (const [key, value] of SJZ_DataManager.ItemDataMap) {
            result = value.find(e => e.ID == id)
            if (result) return result;
        }

        if (!result) {
            console.error(`Item 表中没有该物品 ID：${id}`)
        };

        return null;
    }

    public static CheckTable() {
        for (const key of this.ContainerLootMap.keys()) {
            this.ContainerLootMap.get(key).forEach(e => {
                if (!SJZ_DataManager.ItemDataMap.get(e.Type).find(e => e.ID == e.ID)) {
                    console.error("Item表中无法找到ContainerLoot表中的：", e.Name);
                }
            });
        }
    }

    public static CloneItemData(data: SJZ_ItemData) {
        let cloneData = Tools.Clone(data);
        return cloneData;
    }

    /**根据子弹类型随机获取子弹 */
    public static GetRandomAmmoByType(type: number) {
        let ammos = SJZ_DataManager.AmmoData.filter(e => e.Type == type);
        let ammo = SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Ammo).find(e => e.ID == ammos[Math.floor(Math.random() * ammos.length)].ID)
        return SJZ_DataManager.CloneItemData(ammo);
    }

    public static SetDefaultEquip(playerData: SJZ_PlayerData) {
        playerData.Weapon_Helmet = this.GetItemDataByTypeName(SJZ_ItemType.Helmet, "老式钢盔");
        playerData.Weapon_BodyArmor = this.GetItemDataByTypeName(SJZ_ItemType.BodyArmor, "轻型防弹衣");
        playerData.EquipChestRig(this.GetItemDataByTypeName(SJZ_ItemType.ChestRig, "G01战术弹挂"));
        playerData.EquipBackpack(this.GetItemDataByTypeName(SJZ_ItemType.Backpack, "雨林猎手背包"));
        playerData.Weapon_Primary = this.GetItemDataByTypeName(SJZ_ItemType.Weapon, "M4A1");
        playerData.Weapon_Primary.WeaponData.Ammo = this.GetItemDataByType(SJZ_ItemType.Ammo, 50833);

        let ammos = [];
        for (let i = 0; i < 5; i++) {
            ammos.push(this.GetItemDataByType(SJZ_ItemType.Ammo, 50833));
        }

        let med = this.GetItemDataByTypeName(SJZ_ItemType.MedicalItem, "户外医疗箱");

        this.FillContainer(playerData.ChestRigGrid, ammos, playerData.ChestRigData.EquipData.ItemData);
        this.FillContainer(playerData.BackpackGrid, [med], playerData.BackpackData.EquipData.ItemData);
    }

    /**放入容器 */
    public static FillContainer(gridCtrl: SJZ_InventoryGrid, data: SJZ_ItemData[], targetData: SJZ_ItemData[]) {
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

        targetData.push(...finalData);
    }

    public static GetGunUseSkin(name: string, defaultValue: string = "") {
        return PrefsManager.GetString(`Gun_Skin_Use_${name}`, defaultValue);
    }

    public static SetGunUseSkin(name: string, skinName: string) {
        return PrefsManager.SetString(`Gun_Skin_Use_${name}`, skinName);
    }

    public static GetGunSkinUnlock(skinName: string) {
        return PrefsManager.GetBool(`Gun_Skin_Unlock_${skinName}`);
    }

    public static SetGunSkinUnlock(name: string, unlock: boolean = true) {
        return PrefsManager.SetBool(`Gun_Skin_Unlock_${name}`, unlock);
    }

    public static GetSafeBoxUnlock(type: string): boolean {
        switch (type) {
            case "SafeBox_1": return PrefsManager.GetNumber(`SafeBox_AdTimes_${type}`, 0) >= 3;
            case "SafeBox_2": return PrefsManager.GetNumber(`SafeBox_AdTimes_${type}`, 0) >= 6;
            case "SafeBox_3": return PrefsManager.GetNumber(`SafeBox_AdTimes_${type}`, 0) >= 9;
        }
        return true;
    }

    public static GetSafeBoxAdTimes(type: string) {
        return PrefsManager.GetNumber(`SafeBox_AdTimes_${type}`, 0);
    }

    public static SetSafeBoxAdTimes(type: string, count: number) {
        return PrefsManager.SetNumber(`SafeBox_AdTimes_${type}`, count);
    }

    public static SaveData() {
        console.log(`存储数据`, SJZ_Constant.Key.PlayerData);
        PrefsManager.SetItem(SJZ_Constant.Key.PlayerData, JSON.stringify(this.PlayerData));
    }
}