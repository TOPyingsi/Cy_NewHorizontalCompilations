import { JsonAsset, math, sys } from 'cc';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_AccessoryData, XGTS_AmmoData, XGTS_ConsumableData, XGTS_ContainerData, XGTS_ContainerLootData, XGTS_ContainerType, XGTS_EquipData, XGTS_ItemData, XGTS_ItemType, XGTS_PrizePoolData, XGTS_SkinData, XGTS_WeaponData, XGTS_WorkbenchData, XGTS_WorkbenchType } from './XGTS_Data';
import { XGTS_Constant } from './XGTS_Constant';
import { XGTS_PlayerData } from './XGTS_PlayerData';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_InventoryGrid } from './XGTS_InventoryGrid';

export class XGTS_DataManager {
    static Names: string[] = [];

    static ItemDataMap: Map<XGTS_ItemType, XGTS_ItemData[]>;
    static ContainerLootMap: Map<XGTS_ContainerType, XGTS_ContainerLootData[]>;
    static EquipData: XGTS_EquipData[];
    static WeaponData: XGTS_WeaponData[];
    static ConsumableData: XGTS_ConsumableData[];
    static AccessoryData: XGTS_AccessoryData[];
    static AmmoData: XGTS_AmmoData[];
    static ContainerData: XGTS_ContainerData[];
    static PlayerData: XGTS_PlayerData;
    static PlayerDatas: XGTS_PlayerData[];
    /**大红展示台数据 */
    static ShowcaseData: XGTS_ItemData[] = [];
    /**大红展示台数据 */
    static WorkbenchData: Map<XGTS_WorkbenchType, XGTS_WorkbenchData[]>;

    static SkinData: XGTS_SkinData[];
    static PrizePoolData: XGTS_PrizePoolData[];

    public static LoadData() {
        XGTS_DataManager.ItemDataMap = new Map();
        XGTS_DataManager.ContainerLootMap = new Map();
        XGTS_DataManager.WeaponData = [];
        XGTS_DataManager.AmmoData = [];
        XGTS_DataManager.EquipData = [];
        XGTS_DataManager.ConsumableData = [];
        XGTS_DataManager.AccessoryData = [];
        XGTS_DataManager.ContainerData = [];
        XGTS_DataManager.WorkbenchData = new Map();
        XGTS_DataManager.SkinData = [];
        XGTS_DataManager.PrizePoolData = [];

        //玩家装备数据
        if (PrefsManager.GetItem(XGTS_Constant.Key.PlayerDatas)) {
            let data = JSON.parse(PrefsManager.GetItem(XGTS_Constant.Key.PlayerDatas));
            this.PlayerDatas = [];
            // debugger;
            for (let i = 0; i < data.length; i++) {
                this.PlayerDatas[i] = new XGTS_PlayerData(data[i].Money, data[i].InventoryItemData, data[i].Weapon_Primary, data[i].Weapon_Secondary, data[i].Weapon_Pistol, data[i].Weapon_Melee
                    , data[i].Weapon_Helmet, data[i].Weapon_BodyArmor, data[i].PocketData, data[i].ChestRigData, data[i].BackpackData, data[i].SafeBox, data[i].ShowcaseData);
            }

            // this.PlayerDatas[] = new XGTS_PlayerData(data.Money, data.InventoryItemData, data.Weapon_Primary, data.Weapon_Secondary, data.Weapon_Pistol, data.Weapon_Melee
            //     , data.Weapon_Helmet, data.Weapon_BodyArmor, data.PocketData, data.ChestRigData, data.BackpackData, data.SafeBox, data.ShowcaseData);
        } else {
            this.PlayerDatas = [];
            this.PlayerDatas[0] = new XGTS_PlayerData();
            this.PlayerDatas[1] = new XGTS_PlayerData();
            this.PlayerDatas[2] = new XGTS_PlayerData();
        }

        console.log(`[玩家数据]:`, this.PlayerDatas);

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

                XGTS_DataManager.ContainerLootMap.set(XGTS_ContainerType.AviationCrate, []);
                XGTS_DataManager.ContainerLootMap.set(XGTS_ContainerType.DeliveryBox, []);
                XGTS_DataManager.ContainerLootMap.set(XGTS_ContainerType.BirdNest, []);
                XGTS_DataManager.ContainerLootMap.set(XGTS_ContainerType.SafeBox, []);
                XGTS_DataManager.ContainerLootMap.set(XGTS_ContainerType.ComputerCase, []);
                XGTS_DataManager.ContainerLootMap.set(XGTS_ContainerType.WeaponCase, []);

                for (let i = 0; i < containerLootData.武器箱.length; i++) {
                    const e = containerLootData.武器箱[i];
                    XGTS_DataManager.ContainerLootMap.get(XGTS_ContainerType.WeaponCase).push(new XGTS_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.机箱.length; i++) {
                    const e = containerLootData.机箱[i];
                    XGTS_DataManager.ContainerLootMap.get(XGTS_ContainerType.ComputerCase).push(new XGTS_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.保险箱.length; i++) {
                    const e = containerLootData.保险箱[i];
                    XGTS_DataManager.ContainerLootMap.get(XGTS_ContainerType.SafeBox).push(new XGTS_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.鸟窝.length; i++) {
                    const e = containerLootData.鸟窝[i];
                    XGTS_DataManager.ContainerLootMap.get(XGTS_ContainerType.BirdNest).push(new XGTS_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.快递盒.length; i++) {
                    const e = containerLootData.快递盒[i];
                    XGTS_DataManager.ContainerLootMap.get(XGTS_ContainerType.DeliveryBox).push(new XGTS_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                for (let i = 0; i < containerLootData.航空箱.length; i++) {
                    const e = containerLootData.航空箱[i];
                    XGTS_DataManager.ContainerLootMap.get(XGTS_ContainerType.AviationCrate).push(new XGTS_ContainerLootData(e.ID, e.Type, e.Name, e.Probability));
                }

                console.log("ContainerLootMap", XGTS_DataManager.ContainerLootMap);

                //武器数据
                let weaponsData = weaponsJson.json as any;
                for (let i = 0; i < weaponsData.length; i++) {
                    const e = weaponsData[i];
                    XGTS_DataManager.WeaponData.push(new XGTS_WeaponData(e.ID, e.Type, e.Quality, e.Name, e.AmmoType, e.PriceFluctuation, e.Damage, e.Precision, e.Recoil, e.Clip, e.FiringRate, e.ReloadDuration, e.Required, e.quantity, e.Duration));
                }
                console.log("WeaponData", XGTS_DataManager.WeaponData);

                //子弹数据
                let ammoData = ammoJson.json as any;
                for (let i = 0; i < ammoData.length; i++) {
                    const e = ammoData[i];
                    XGTS_DataManager.AmmoData.push(new XGTS_AmmoData(e.ID, e.Type, e.Name, e.Lv1Damage, e.Lv2Damage, e.Lv3Damage, e.Lv4Damage, e.Lv5Damage, e.Lv6Damage, e.Required, e.quantity, e.Duration));
                }
                console.log("AmmoData", XGTS_DataManager.AmmoData);

                //装备数据
                let equipsData = equipsJson.json as any;
                for (let i = 0; i < equipsData.length; i++) {
                    const e = equipsData[i];
                    XGTS_DataManager.EquipData.push(new XGTS_EquipData(e.ID, e.Name, e.Durability, e.HpMaxLoss, e.CarryingSpace, e.Required, e.quantity, e.Duration));
                }
                console.log("EquipData", XGTS_DataManager.EquipData);

                //消耗品数据
                let consumableData = consumableJson.json as any;
                for (let i = 0; i < consumableData.length; i++) {
                    const e = consumableData[i];
                    XGTS_DataManager.ConsumableData.push(new XGTS_ConsumableData(e.ID, e.name, e.replySpeed, e.Durability, e.replyCoefficient, e.costTime, e.Required, e.quantity, e.Duration));
                }
                console.log("ConsumableData", XGTS_DataManager.ConsumableData);

                //配件数据
                let accessoryData = accessoriesJson.json as any;
                for (let i = 0; i < accessoryData.length; i++) {
                    const e = accessoryData[i];
                    XGTS_DataManager.AccessoryData.push(new XGTS_AccessoryData(e.ID, e.SubID, e.Name, e.AccessoryType, e.RecoilUp, e.RecoilDown, e.ReloadingSpeedUp, e.ReloadingSpeedDown, e.Magnificationlens));
                }
                console.log("AccessoryData", XGTS_DataManager.AccessoryData);

                //收集品容器数据
                let containersData = containersJson.json as any;
                for (let i = 0; i < containersData.length; i++) {
                    const e = containersData[i];
                    XGTS_DataManager.ContainerData.push(new XGTS_ContainerData(e.Type, e.Name, e.Size));
                }
                console.log("ContainerData", XGTS_DataManager.ContainerData);

                //工作台数据
                let workbenchData = workbenchJson.json as any;
                for (let i = 0; i < workbenchData.length; i++) {
                    const e = workbenchData[i];
                    if (!XGTS_DataManager.WorkbenchData.has(e.Type)) XGTS_DataManager.WorkbenchData.set(e.Type, []);
                    XGTS_DataManager.WorkbenchData.get(e.Type).push(new XGTS_WorkbenchData(e.Type, e.Lv, e.Cost, e.CostTime, e.Requirements, e.QuantityDemanded, e.Making));
                }
                console.log("WorkbenchData", XGTS_DataManager.WorkbenchData);

                //皮肤数据
                let skinData = skinJson.json as any;
                for (let i = 0; i < skinData.length; i++) {
                    const e = skinData[i];
                    XGTS_DataManager.SkinData.push(new XGTS_SkinData(e.ID, e.Name, e.GunName));
                }
                console.log("SkinData", XGTS_DataManager.SkinData);

                //奖池数据
                let prizePoolData = prizePoolJson.json as any;
                for (let i = 0; i < prizePoolData.length; i++) {
                    const e = prizePoolData[i];
                    XGTS_DataManager.PrizePoolData.push(new XGTS_PrizePoolData(e.ID, e.Name, e.Probability, e.AwardType));
                }
                console.log("PrizePoolData", XGTS_DataManager.PrizePoolData);

                // Weapons 和 Guns 加载完，继续加载 Items
                return BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Items");
            }).then((itemsJson: JsonAsset) => {
                // 处理 Items 数据
                let itemsData = itemsJson.json as any;
                for (let i = 0; i < itemsData.length; i++) {
                    const e = itemsData[i];
                    if (!XGTS_DataManager.ItemDataMap.has(e.Type)) XGTS_DataManager.ItemDataMap.set(e.Type, []);

                    let data = new XGTS_ItemData(e.ID, e.Type, e.Name, e.Price, e.Quality, e.Size, e.Weight, e.ImageId, e.Desc, e.NotShow);
                    if (data.Type == XGTS_ItemType.Weapon) {
                        data.WeaponData = Tools.Clone(XGTS_DataManager.WeaponData.find(e => e.ID == data.ID));
                    }

                    if (data.Type == XGTS_ItemType.Accessory) {
                        data.AccessoryData = Tools.Clone(XGTS_DataManager.AccessoryData.find(e => e.ID == data.ID));
                    }

                    if (data.Type == XGTS_ItemType.Ammo) {
                        data.AmmoData = Tools.Clone(XGTS_DataManager.AmmoData.find(e => e.ID == data.ID));
                    }

                    if (XGTS_ItemData.IsEquip(data.Type)) {
                        data.EquipData = Tools.Clone(XGTS_DataManager.EquipData.find(e => e.ID == data.ID));
                    }

                    if (XGTS_ItemData.IsConsumable(data.Type)) {
                        data.ConsumableData = Tools.Clone(XGTS_DataManager.ConsumableData.find(e => e.ID == data.ID));
                    }

                    if (XGTS_Constant.Showcases.findIndex(e => e == data.Name) !== -1) {
                        XGTS_DataManager.ShowcaseData.push(data);
                    }

                    XGTS_DataManager.ItemDataMap.get(e.Type).push(data);
                }

                console.log("ShowcaseData", XGTS_DataManager.ShowcaseData);
                console.log("ItemData", XGTS_DataManager.ItemDataMap);

                // this.CheckTable();
                resolve([]);
            }).catch((err) => {
                console.error("加载数据出错", err);
                reject(err);
            });
        });

    }

    public static GetItemDataByType(type: XGTS_ItemType, id: number, clone: boolean = true): XGTS_ItemData {
        if (!this.ItemDataMap.has(type)) {
            console.error(`Item 表中没有该物品 Type：${type}`);
            return null;
        }

        let result = XGTS_DataManager.ItemDataMap.get(type).find(e => e.ID == id);

        if (!result) {
            console.error(`Item 表中没有该物品 ID：${id}`)
        };
        if (clone) return Tools.Clone(result);
        else return result;
    }

    public static GetItemDataByTypeName(type: XGTS_ItemType, name: string, clone: boolean = true): XGTS_ItemData {
        if (!this.ItemDataMap.has(type)) {
            console.error(`Item 表中没有该物品 Type：${type}`);
            return null;
        }

        let result = XGTS_DataManager.ItemDataMap.get(type).find(e => e.Name == name);

        if (!result) {
            console.error(`Item 表中没有该物品 Name：${name}`)
        };
        if (clone) return Tools.Clone(result);
        else return result;
    }

    public static GetItemDataByName(name: string, clone: boolean = true): XGTS_ItemData {
        let result = null;
        for (const [key, value] of XGTS_DataManager.ItemDataMap) {
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

    public static GetItemDataByID(id: number): XGTS_ItemData {
        let result = null;
        for (const [key, value] of XGTS_DataManager.ItemDataMap) {
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
                if (!XGTS_DataManager.ItemDataMap.get(e.Type).find(e => e.ID == e.ID)) {
                    console.error("Item表中无法找到ContainerLoot表中的：", e.Name);
                }
            });
        }
    }

    public static CloneItemData(data: XGTS_ItemData) {
        let cloneData = Tools.Clone(data);
        return cloneData;
    }

    /**根据子弹类型随机获取子弹 */
    public static GetRandomAmmoByType(type: number) {
        let ammos = XGTS_DataManager.AmmoData.filter(e => e.Type == type);
        let ammo = XGTS_DataManager.ItemDataMap.get(XGTS_ItemType.Ammo).find(e => e.ID == ammos[Math.floor(Math.random() * ammos.length)].ID)
        return XGTS_DataManager.CloneItemData(ammo);
    }

    public static SetDefaultEquip(playerData: XGTS_PlayerData) {
        playerData.Weapon_Helmet = this.GetItemDataByTypeName(XGTS_ItemType.Helmet, "老式钢盔");
        playerData.Weapon_BodyArmor = this.GetItemDataByTypeName(XGTS_ItemType.BodyArmor, "轻型防弹衣");
        playerData.EquipChestRig(this.GetItemDataByTypeName(XGTS_ItemType.ChestRig, "G01战术弹挂"));
        playerData.EquipBackpack(this.GetItemDataByTypeName(XGTS_ItemType.Backpack, "雨林猎手背包"));
        playerData.Weapon_Primary = this.GetItemDataByTypeName(XGTS_ItemType.Weapon, "M4A1");
        playerData.Weapon_Primary.WeaponData.Ammo = this.GetItemDataByType(XGTS_ItemType.Ammo, 50833);

        let ammos = [];
        for (let i = 0; i < 5; i++) {
            ammos.push(this.GetItemDataByType(XGTS_ItemType.Ammo, 50833));
        }

        let med = this.GetItemDataByTypeName(XGTS_ItemType.MedicalItem, "户外医疗箱");
        
        this.FillContainer(playerData.ChestRigGrid, ammos, playerData.ChestRigData.EquipData.ItemData);
        this.FillContainer(playerData.BackpackGrid, [med], playerData.BackpackData.EquipData.ItemData);
        console.error(Tools.Clone(playerData.BackpackGrid))
    }

    /**放入容器 */
    public static FillContainer(gridCtrl: XGTS_InventoryGrid, data: XGTS_ItemData[], targetData: XGTS_ItemData[]) {
        let gridLength = gridCtrl.width * gridCtrl.height;
        let finalData: XGTS_ItemData[] = [];
        console.error(1, Tools.Clone(gridCtrl))
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
        console.error(2, Tools.Clone(gridCtrl))

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
        console.log(`存储数据`, XGTS_Constant.Key.PlayerDatas);
        PrefsManager.SetItem(XGTS_Constant.Key.PlayerDatas, JSON.stringify(this.PlayerDatas));
    }
}