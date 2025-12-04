import { misc, Prefab, size, Size, v2, v3, Vec2, Vec3 } from "cc";
import { SJZ_Quality } from "./SJZ_Constant";
import { SJZ_DataManager } from "./SJZ_DataManager";
import { SJZ_InventoryGrid } from "./SJZ_InventoryGrid";
import { Tools } from "db://assets/Scripts/Framework/Utils/Tools";

export enum SJZ_ItemType {
    None,
    /**头盔 */
    Helmet = 1,
    /**防弹衣 */
    BodyArmor = 2,
    /**武器 */
    Weapon = 3,
    /**枪械配件 */
    Accessory = 4,
    /**弹药 */
    Ammo = 5,
    /**胸挂 */
    ChestRig = 6,
    /**背包 */
    Backpack = 7,
    /**护甲道具 */
    ArmorItem = 8,
    /**医疗道具 */
    MedicalItem = 9,
    /**电子物品收集品 */
    Electronic = 10,
    /**医疗道具收集品 */
    Medical = 11,
    /**工具材料收集品 */
    ToolMaterial = 12,
    /**家具材料收集品 */
    FurnitureItem = 13,
    /**工艺藏品收集品 */
    CraftCollectible = 14,
    /**资料情报收集品 */
    IntelDocument = 15,
    /**能源燃料收集品 */
    EnergyFuel = 16,
}

export enum SJZ_WeaponType {
    /**近战 */
    MeleeWeapon = 0,
    /**手枪 */
    Pistol = 1,
    /**突击步枪 */
    AssaultRifle = 2,
    /**冲锋枪 */
    SubmachineGun = 3,
    /**射手步枪 */
    MarksmanRifle = 4,
    /**栓动步枪 */
    BoltActionRifle = 5,
    /**轻机枪 */
    LightMachineGun = 6,
    /**霰弹枪 */
    Shotgun = 7,
}

/**收集品 */
export enum SJZ_CollectibleType {
    /**电子物品 */
    Electronic = "电子物品",
    /**医疗道具 */
    Medical = "医疗道具",
    /**工具材料 */
    ToolMaterial = "工具材料",
    /**家具物品 */
    FurnitureItem = "家具物品",
    /**工艺藏品 */
    CraftCollectible = "工艺藏品",
    /**资料情报 */
    IntelDocument = "资料情报",
    /**能源燃料 */
    EnergyFuel = "能源燃料",
}

/**可搜索的容器种类 */
export enum SJZ_ContainerType {
    /** 航空箱*/
    AviationCrate,
    /** 快递盒 */
    DeliveryBox,
    /** 鸟窝 */
    BirdNest,
    /** 保险箱 */
    SafeBox,
    /** 机箱 */
    ComputerCase,
    /** 武器箱 */
    WeaponCase,
    /** 死亡箱 */
    CharactorCase,
}

/**可搜索的容器种类 */
export enum SJZ_WorkbenchType {
    /** 武器*/
    Weapon = 1,
    /** 护甲*/
    Armor = 2,
    /** 子弹*/
    Ammo = 3,
    /** 药品*/
    Medical = 4,
}

export class SJZ_ItemData {
    constructor(public ID: number, private type, public Name: string, public Price: number, public Quality: SJZ_Quality, private size: string,
        public Weight: number, public ImageId: string, public Desc: string, public NotShow: boolean) {
        this.Type = type;
        this.Size = { width: Number(size.split("_")[0]), height: Number(size.split("_")[1]) };

        if (type == SJZ_ItemType.Ammo) this.Count = 60;
    }

    /** 类型 */
    Type: SJZ_ItemType = SJZ_ItemType.None;

    Count: number = 1;

    /** 所在背包二维数组的位置 */
    Point: { x, y } = { x: 0, y: 0 };

    /** 格子大小 */
    Size: { width, height } = { width: 0, height: 0 };

    WeaponData: SJZ_WeaponData = null;

    EquipData: SJZ_EquipData = null;

    AmmoData: SJZ_AmmoData = null;

    ConsumableData: SJZ_ConsumableData = null;

    AccessoryData: SJZ_AccessoryData = null;

    Searched: boolean = true;

    public static IsGun(type: SJZ_ItemType) {
        return type == SJZ_ItemType.Weapon;
    }

    public static IsEquip(type: SJZ_ItemType) {
        return type == SJZ_ItemType.Helmet || type == SJZ_ItemType.BodyArmor || type == SJZ_ItemType.ChestRig || type == SJZ_ItemType.Backpack;
    }

    public static IsConsumable(type: SJZ_ItemType) {
        return type == SJZ_ItemType.MedicalItem || type == SJZ_ItemType.ArmorItem;
    }

    /**收藏品 */
    public static IsCollection(type: SJZ_ItemType) {
        return type == SJZ_ItemType.Electronic || type == SJZ_ItemType.Medical || type == SJZ_ItemType.ToolMaterial || type == SJZ_ItemType.FurnitureItem || type == SJZ_ItemType.CraftCollectible || type == SJZ_ItemType.IntelDocument || type == SJZ_ItemType.EnergyFuel;

    }
}

/*** 武器*/
export class SJZ_WeaponData {
    constructor(public ID: number, public Type: SJZ_WeaponType, public Quality: number, public Name: string, public AmmoType: number, public PriceFluctuation: number, public Damage: number, public Precision: number, public Recoil: number,
        public Clip: number, public FiringRate: number, public ReloadDuration: number, private required: string, private quantity: string, public Duration: number) {

        if (!Tools.IsEmptyStr(required)) this.Required = required.trim().split(',').map(num => Number(num));
        if (!Tools.IsEmptyStr(quantity)) this.Quantity = quantity.trim().split(',').map(num => Number(num));
    }

    /**制造所需 */
    Required: number[] = [];
    /**制造数量 */
    Quantity: number[] = [];
    /**弹匣子弹 */
    Ammo: SJZ_ItemData = null;

    Accessory_0: SJZ_ItemData = null;
    Accessory_1: SJZ_ItemData = null;
    Accessory_2: SJZ_ItemData = null;

    get Data(): SJZ_ItemData {
        return SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Weapon).find(e => e.Name == this.Name);
    }

    /**是否可以装备到主武器上 */
    public static IsMain(type: SJZ_WeaponType): boolean {
        return type == SJZ_WeaponType.AssaultRifle || type == SJZ_WeaponType.SubmachineGun || type == SJZ_WeaponType.MarksmanRifle || type == SJZ_WeaponType.BoltActionRifle || type == SJZ_WeaponType.LightMachineGun || type == SJZ_WeaponType.Shotgun;
    }

    /**是否是手枪 */
    public static IsPistol(type: SJZ_WeaponType): boolean {
        return type == SJZ_WeaponType.Pistol;
    }

    /**是否为近战武器 */
    public static IsMelee(type: SJZ_WeaponType): boolean {
        return type == SJZ_WeaponType.MeleeWeapon;
    }
}

/*** 子弹*/
export class SJZ_AmmoData {
    constructor(public ID: number, public Type: number, public Name: string, public Lv1Damage: number, public Lv2Damage: number, public Lv3Damage: number, public Lv4Damage: number, public Lv5Damage: number, public Lv6Damage: number,
        private required: string, private quantity: string, public Duration: number
    ) {
        if (!Tools.IsEmptyStr(required)) this.Required = required.toString().trim().split(',').map(num => Number(num));
        if (!Tools.IsEmptyStr(required)) this.Quantity = quantity.toString().trim().split(',').map(num => Number(num));
    }

    /**制造所需 */
    Required: number[] = [];
    /**制造数量 */
    Quantity: number[] = [];

    public static GetDamage(ammo: SJZ_AmmoData, lv: number): number {
        switch (lv) {
            case 1:
                return ammo.Lv1Damage;
            case 2:
                return ammo.Lv2Damage;
            case 3:
                return ammo.Lv3Damage;
            case 4:
                return ammo.Lv4Damage;
            case 5:
                return ammo.Lv5Damage;
        }
    }
}


/*** 装备*/
export class SJZ_EquipData {
    constructor(public ID: number, public Name: string, public Durability: number, public HpMaxLoss: number, carryingSpace: string,
        private required: string, private quantity: string, public Duration: number
    ) {
        this.CarryingSpace = { width: Number(carryingSpace.split("_")[0]), height: Number(carryingSpace.split("_")[1]) };

        this.MaxDurability = this.Durability;

        if (!Tools.IsEmptyStr(required)) this.Required = required.toString().trim().split(',').map(num => Number(num));
        if (!Tools.IsEmptyStr(required)) this.Quantity = quantity.toString().trim().split(',').map(num => Number(num));
    }

    /**制造所需 */
    Required: number[] = [];
    /**制造数量 */
    Quantity: number[] = [];

    /** 最大耐久 */
    MaxDurability: number = 0;

    /** 装备空间大小 */
    CarryingSpace: { width, height } = { width: 0, height: 0 };

    Grid: SJZ_InventoryGrid = null;

    ItemData: SJZ_ItemData[] = [];
}


/*** 消耗品数据*/
export class SJZ_ConsumableData {
    constructor(public ID: number, public Name: string, public ReplySpeed: number, public Durability: number, public ReplyCoefficient: number,
        public CostTime: number, private required: string, private quantity: string, public Duration: number) {
        if (!Tools.IsEmptyStr(required)) this.Required = required.toString().trim().split(',').map(num => Number(num));
        if (!Tools.IsEmptyStr(required)) this.Quantity = quantity.toString().trim().split(',').map(num => Number(num));
    }

    /**制造所需 */
    Required: number[] = [];
    /**制造数量 */
    Quantity: number[] = [];
}

/*** 配件数据*/
export class SJZ_AccessoryData {
    constructor(public ID: number, public SubID: number, public Name: string, public AccessoryType: number, public RecoilUp: number,
        public RecoilDown: number, public ReloadingSpeedUp: number, public ReloadingSpeedDown: number, public Magnificationlens: number) {
    }
}

/*** 安全箱*/
export class SJZ_SafeBoxData {
    constructor(size: string) {
        this.CarryingSpace = { width: Number(size.split("_")[0]), height: Number(size.split("_")[1]) };
    }

    /** 装备空间大小 */
    CarryingSpace: { width, height } = { width: 0, height: 0 };

    ItemData: SJZ_ItemData[] = [];
}

/*** 收集品容器*/
export class SJZ_ContainerData {
    constructor(public Type: SJZ_ContainerType, public Name: string, size: string) {
        this.Size = { width: Number(size.split("_")[0]), height: Number(size.split("_")[1]) };
    }

    /** 装备空间大小 */
    Size: { width, height } = { width: 0, height: 0 };

    ItemData: SJZ_ItemData[] = [];
}

/*** 收集品容器*/
export class SJZ_ContainerLootData {
    constructor(public ID: number, public Type: number, public Name: string, public Probability: number) {
    }
}

/*** 工作台*/
export class SJZ_WorkbenchData {
    constructor(public Type: number, public Lv: number, public Cost: number, public CostTime: number, private requirements: string, private quantityDemanded: string, private making: string) {
        if (!Tools.IsEmptyStr(requirements)) this.Requirements = requirements.toString().split(",").map(e => Number(e));
        if (!Tools.IsEmptyStr(quantityDemanded)) this.QuantityDemanded = quantityDemanded.toString().split(",").map(e => Number(e));
        if (!Tools.IsEmptyStr(making)) this.Making = making.toString().split(",").map(e => Number(e));
    }

    /**制造所需 */
    Requirements: number[] = [];
    /**制造所需数量 */
    QuantityDemanded: number[] = [];
    Making: number[] = [];
}

/*** 对局数据*/
export class SJZ_MatchData {
    constructor(public MapName: string, public EvacuationSite: string, public Time: number, public Reward: number, public KilledPE: number, public KilledPC: number) {
    }
}

/*** 奖池数据*/
export class SJZ_PrizePoolData {
    constructor(public ID: number, public Name: string, public Probability: number, public AwardType) {
    }
}

/*** 皮肤数据*/
export class SJZ_SkinData {
    constructor(public ID: number, public Name: string, public GunName: number) {
    }
}