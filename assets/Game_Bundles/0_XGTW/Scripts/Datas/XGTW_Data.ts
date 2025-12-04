import { v2, v3, Vec2, Vec3 } from "cc";
import { XGTW_ItemType, XGTW_Quality, XGTW_SuppliesType } from "../Framework/Const/XGTW_Constant";
import PrefsManager from "../../../../Scripts/Framework/Managers/PrefsManager";
import { Tools } from "db://assets/Scripts/Framework/Utils/Tools";
import { XGTW_DataManager } from "../Framework/Managers/XGTW_DataManager";

export class XGTW_PlayerData {
    static MaxBackpackItems: number = 10;
    constructor(Helmet: XGTW_ItemData = null, Bulletproof: XGTW_ItemData = null, Weapon_0: XGTW_ItemData = null, Weapon_1: XGTW_ItemData = null, Pistol: XGTW_ItemData = null, MeleeWeapon: XGTW_ItemData = null, BackpackItems: XGTW_ItemData[] = []) {
        this.Helmet = Helmet;
        this.Bulletproof = Bulletproof;
        this.Weapon_0 = Weapon_0;
        this.Weapon_1 = Weapon_1;
        this.Pistol = Pistol;
        this.MeleeWeapon = MeleeWeapon;
        this.BackpackItems = BackpackItems;
    }
    Name: string = ``;
    Skin_Helmet: XGTW_ItemData = null;
    Skin_Bulletproof: XGTW_ItemData = null;
    Helmet: XGTW_ItemData = null;
    Bulletproof: XGTW_ItemData = null;
    Weapon_0: XGTW_ItemData = null;
    Weapon_1: XGTW_ItemData = null;
    Pistol: XGTW_ItemData = null;
    MeleeWeapon: XGTW_ItemData = null;
    Backpack: XGTW_ItemData = null;
    BackpackItems: XGTW_ItemData[] = [];
    LockboxItems: XGTW_ItemData[] = [];
    EquipGunSkins: XGTW_ItemData[] = [];
    //    // _MeleeWeapon: ItemData = null;
    //    // public get MeleeWeapon(): ItemData {
    //    //     if (this._MeleeWeapon == null) {
    //    //         if (XGTW_DataManager.ItemDatas) {
    //    //             this._MeleeWeapon = ZTool.DeepCopy(XGTW_DataManager.ItemDatas.get(ItemType.近战).find(e => e.Name == "M9军刀"));
    //    //         }
    //    //     }
    //    //     return this._MeleeWeapon;
    //    // }
    //    // public set MeleeWeapon(value: ItemData) {
    //    //     this._MeleeWeapon = value;
    //    // }
    Clear() {
        this.Helmet = null;
        this.Bulletproof = null;
        this.Weapon_0 = null;
        this.Weapon_1 = null;
        this.Pistol = null;
        this.MeleeWeapon = null;
        this.BackpackItems = [];
    }
    ItemToArray() {
        let items = [];
        this.Helmet && (items.push(this.Helmet));
        this.Bulletproof && (items.push(this.Bulletproof));
        this.Weapon_0 && (items.push(this.Weapon_0));
        this.Weapon_1 && (items.push(this.Weapon_1));
        this.Pistol && (items.push(this.Pistol));
        this.BackpackItems && (items.push(...this.BackpackItems));
        return items;
    }
}

export class XGTW_ItemData {
    constructor(public Name: string, public Type: string, public price: number, public Quality: XGTW_Quality, count: number = -1) {
        if (count == -1 && Type == "子弹") {
            this.Count = 60;
        }

        this.Price = Number(price);
    }
    Price: number = 0;
    Count: number = 1;
    Durable: number = 0;//耐久

    MaxDurable: number = -1;//耐久

    Weight: number = 0;//重量

    static GetFullName(data: XGTW_ItemData): string {
        let name = data.Name;
        if (XGTW_ItemData.IsMainGun(XGTW_ItemType[`${data.Type}`])) {
            if (data.Quality == 0) name += "(破损)";
            if (data.Quality == 1) name += "(修复)";
            if (data.Quality == 2) name += "(完好)";
            if (data.Quality == 3) name += "(改进)";
            if (data.Quality == 4) name += "(精制)";
        }
        return name;
    }

    //    //所有主武器的种类
    static MainGunTypes = [XGTW_ItemType.冲锋枪, XGTW_ItemType.射手步枪, XGTW_ItemType.栓动步枪, XGTW_ItemType.突击步枪, XGTW_ItemType.轻机枪, XGTW_ItemType.霰弹枪, XGTW_ItemType.近战];
    //    //配件
    static PeiJianTypes = [XGTW_ItemType.瞄具, XGTW_ItemType.枪口, XGTW_ItemType.握把, XGTW_ItemType.弹匣, XGTW_ItemType.枪托];
    //    //防具
    static FangJuTypes = [XGTW_ItemType.头盔, XGTW_ItemType.防弹衣];
    //    //所有枪的种类
    static GunTypes = [XGTW_ItemType.冲锋枪, XGTW_ItemType.射手步枪, XGTW_ItemType.栓动步枪, XGTW_ItemType.突击步枪, XGTW_ItemType.轻机枪, XGTW_ItemType.霰弹枪, XGTW_ItemType.手枪, XGTW_ItemType.近战];
    //    //所有的枪
    static IsGun(type: XGTW_ItemType) {
        return type == XGTW_ItemType.冲锋枪 || type == XGTW_ItemType.射手步枪 || type == XGTW_ItemType.手枪 || type == XGTW_ItemType.栓动步枪 || type == XGTW_ItemType.突击步枪 || type == XGTW_ItemType.轻机枪 || type == XGTW_ItemType.霰弹枪;
    }
    //    //所有的枪
    static IsMeleeWeapon(type: XGTW_ItemType) {
        return type == XGTW_ItemType.近战;
    }
    static IsEquip(type: XGTW_ItemType) {
        return type == XGTW_ItemType.头盔 || type == XGTW_ItemType.防弹衣 || type == XGTW_ItemType.背包;
    }
    static CanEquip(type: XGTW_ItemType) {
        return this.IsEquip(type) || this.IsGun(type) || this.IsMeleeWeapon(type) || this.IsAssories(type);
    }
    static IsSniper(type: XGTW_ItemType) {
        return type == XGTW_ItemType.射手步枪 || type == XGTW_ItemType.栓动步枪;
    }
    static Consumables = [XGTW_ItemType.子弹, XGTW_ItemType.投掷物, XGTW_ItemType.药品];
    //是否是消耗品
    static IsConsumables(type: XGTW_ItemType) {
        return XGTW_ItemData.Consumables.findIndex(e => e == type) != -1;
    }

    static IsAssories(type: XGTW_ItemType) {
        return type == XGTW_ItemType.枪口 || type == XGTW_ItemType.握把 || type == XGTW_ItemType.弹匣 || type == XGTW_ItemType.枪托 || type == XGTW_ItemType.瞄具;
    }

    static GetAssories(type: XGTW_ItemType) {
        let accessories = [];
        if (type == XGTW_ItemType.冲锋枪) accessories.push(...["枪口", "握把", "弹匣", "瞄具"]);
        if (type == XGTW_ItemType.手枪) accessories.push(...["枪口", "握把", "弹匣", "瞄具"]);
        if (type == XGTW_ItemType.突击步枪) accessories.push(...["枪口", "握把", "弹匣", "枪托", "瞄具"]);
        if (type == XGTW_ItemType.轻机枪) accessories.push(...["弹匣", "瞄具"]);
        if (type == XGTW_ItemType.霰弹枪) accessories.push(...["枪口", "弹匣", "瞄具"]);
        if (type == XGTW_ItemType.弓弩) accessories.push(...["握把", "瞄具"]);
        if (type == XGTW_ItemType.栓动步枪) accessories.push(...["枪口", "弹匣", "枪托", "瞄具"]);
        return accessories;
    }
    static GetItemType(type: string) {
        return XGTW_ItemType[`${type}`];
    }
    //    //是否是药品
    static IsMedicine(type: XGTW_ItemType) {
        return type == XGTW_ItemType.药品;
    }
    static IsAX50(name: string) {
        return name == "AX50" || name == "AX50-龙影";
    }
    //    //所有的枪不包含手枪
    static IsMainGun(type: XGTW_ItemType) {
        return type == XGTW_ItemType.冲锋枪 || type == XGTW_ItemType.射手步枪 || type == XGTW_ItemType.栓动步枪 || type == XGTW_ItemType.突击步枪 || type == XGTW_ItemType.轻机枪 || type == XGTW_ItemType.霰弹枪;
    }
    static GetScale(type: string) {
        let scale: Vec3 = Vec3.ONE;
        if (type == XGTW_ItemType[XGTW_ItemType.头盔]) scale = v3(0.6, 0.6);
        if (type == XGTW_ItemType[XGTW_ItemType.防弹衣]) scale = v3(0.6, 0.6);
        if (type == XGTW_ItemType[XGTW_ItemType.手枪]) scale = v3(0.8, 0.8);
        if (type == XGTW_ItemType[XGTW_ItemType.突击步枪]) scale = v3(0.8, 0.8);
        if (type == XGTW_ItemType[XGTW_ItemType.冲锋枪]) scale = v3(0.8, 0.8);
        if (type == XGTW_ItemType[XGTW_ItemType.射手步枪]) scale = v3(0.8, 0.8);
        if (type == XGTW_ItemType[XGTW_ItemType.栓动步枪]) scale = v3(0.8, 0.8);
        if (type == XGTW_ItemType[XGTW_ItemType.轻机枪]) scale = v3(0.8, 0.8);
        if (type == XGTW_ItemType[XGTW_ItemType.霰弹枪]) scale = v3(0.8, 0.8);
        if (type == XGTW_ItemType[XGTW_ItemType.子弹]) scale = v3(0.6, 0.6);
        if (type == XGTW_ItemType[XGTW_ItemType.战利品]) scale = v3(0.6, 0.6);
        if (type == XGTW_ItemType[XGTW_ItemType.药品]) scale = v3(0.6, 0.6);

        return scale;
    }
}

export class XGTW_头盔 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight) {
        if (name == "头盔") {
            name = `头盔(${Number(quality) + 1}级)`
        }

        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
    }
    Position: Vec2 = v2();
}

export class XGTW_防弹衣 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight) {
        name = `防弹衣(${Number(quality) + 1}级)`
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
    }
}

export class XGTW_背包 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight) {
        name = `背包(${Number(quality) + 1}级)`
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
    }
}

export class XGTW_手枪 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, position) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Desc = desc;
        this.Recoil = recoil;
        this.FirePosition.set(v2(Number(position.split(`,`)[0]), Number(position.split(`,`)[1])));
    }
    MaxMagazineBulletCount: number = 12;
    MagazineBulletCount: number = 12;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_突击步枪 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, position) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Recoil = recoil;
        this.Desc = desc;
        this.FirePosition.set(v2(Number(position.split(`,`)[0]), Number(position.split(`,`)[1])));
    }
    MaxMagazineBulletCount: number = 30;
    MagazineBulletCount: number = 30;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_冲锋枪 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, FirePosition) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Recoil = recoil;
        this.Desc = desc;

        this.FirePosition.set(v2(Number(FirePosition.split(`,`)[0]), Number(FirePosition.split(`,`)[1])));
    }
    MaxMagazineBulletCount: number = 45;
    MagazineBulletCount: number = 45;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_射手步枪 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, position) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Recoil = recoil;
        this.Desc = desc;
        if (typeof position == "string") {
            this.FirePosition.set(v2(Number(position.split(`,`)[0]), Number(position.split(`,`)[1])));
        } else {
            this.FirePosition.set(position);
        }
    }
    MaxMagazineBulletCount: number = 20;
    MagazineBulletCount: number = 20;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_栓动步枪 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, position) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Recoil = recoil;
        this.Desc = desc;
        if (typeof position == "string") {
            this.FirePosition.set(v2(Number(position.split(`,`)[0]), Number(position.split(`,`)[1])));
        } else {
            this.FirePosition.set(position);
        }
    }
    MaxMagazineBulletCount: number = 10;
    MagazineBulletCount: number = 10;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_轻机枪 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, position) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Recoil = recoil;
        this.Desc = desc;
        if (typeof position == "string") {
            this.FirePosition.set(v2(Number(position.split(`,`)[0]), Number(position.split(`,`)[1])));
        } else {
            this.FirePosition.set(position);
        }
    }
    MaxMagazineBulletCount: number = 100;
    MagazineBulletCount: number = 100;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_霰弹枪 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, position) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Recoil = recoil;
        this.Desc = desc;
        if (typeof position == "string") {
            this.FirePosition.set(v2(Number(position.split(`,`)[0]), Number(position.split(`,`)[1])));
        } else {
            this.FirePosition.set(position);
        }
    }
    MaxMagazineBulletCount: number = 10;
    MagazineBulletCount: number = 10;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_弓弩 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number, recoil: number, desc: string, position) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
        this.Recoil = recoil;
        this.Desc = desc;
        if (typeof position == "string") {
            this.FirePosition.set(v2(Number(position.split(`,`)[0]), Number(position.split(`,`)[1])));
        } else {
            this.FirePosition.set(position);
        }
    }
    MaxMagazineBulletCount: number = 10;
    MagazineBulletCount: number = 10;//弹夹子弹
    BulletCount: number = 0;//总子弹
    Damage: number = 0;
    FireRate: number = 0;
    Recoil: number = 0;
    Desc: string = "";
    FirePosition: Vec2 = v2();
    Assories: XGTW_ItemData[] = [];
}

export class XGTW_近战武器 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, durable, weight, damage: number, fireRate: number) {
        super(name, type, price, quality);
        this.Durable = durable;
        this.MaxDurable = durable;
        this.Weight = weight;
        this.Damage = damage;
        this.FireRate = fireRate;
    }
    Damage: number = 0;
    FireRate: number = 0;
}

export class XGTW_子弹 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_瞄具 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_枪口 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_弹匣 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_握把 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_枪托 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_药品 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, time: number, hp: number, quality, weight) {
        super(name, type, price, quality);
        this.HP = hp;
        this.Time = time;
        this.Weight = weight;
    }
    HP: number = 0;
    Time: number = 2;
}

export class XGTW_投掷物 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_战利品 extends XGTW_ItemData {
    constructor(name: string, type: string, price: number, quality, weight) {
        super(name, type, price, quality);
        this.Weight = weight;
    }
}

export class XGTW_神秘商店 extends XGTW_ItemData {
    constructor(public Name: string, public Type: string, public Price: number, public OriginType: string, public Quality: number) {
        super(Name, Type, Price, Quality);
    }
    GetItemData() {
        let itemData = XGTW_DataManager.ItemDatas.get(XGTW_ItemType[`${this.OriginType}`]).find(e => e.Name == this.Name && e.Quality == this.Quality)
        return itemData;
    }
}

export class XGTW_热卖新品 extends XGTW_ItemData {
    constructor(public Name: string, public Type: string, public Price: number, public Quality: number, public Desc: string) {
        super(Name, Type, Price, Quality);
    }
}

export class XGTW_抽奖礼包 extends XGTW_ItemData {
    constructor(public Name: string, public Price: number, public Type: string, public GetType: string, public Quality: number, public Qualitys: string, public Desc: string) {
        super(Name, Type, Price, Quality);
    }
    GetItemData() {
        let itemDatas = null;
        let qualitys = [];
        this.Qualitys.split(`,`).forEach(e => qualitys.push(Number(e)));
        if (this.GetType == "防具") {
            let type = XGTW_ItemData.FangJuTypes[Tools.GetRandomInt(0, XGTW_ItemData.FangJuTypes.length)];
            itemDatas = XGTW_DataManager.ItemDatas.get(type).filter(e => qualitys.findIndex(d => d == (e as any).Quality) !== -1);
        } else if (this.GetType == "礼包") {
            let type = XGTW_ItemData.MainGunTypes[Tools.GetRandomInt(0, XGTW_ItemData.MainGunTypes.length)];
            itemDatas = XGTW_DataManager.ItemDatas.get(type).filter(e => qualitys.findIndex(d => d == (e as any).Quality) !== -1);
        } else {
            itemDatas = XGTW_DataManager.ItemDatas.get(XGTW_ItemType[`${this.GetType}`]).filter(e => qualitys.findIndex(d => d == (e as any).Quality) !== -1);

        }

        return itemDatas[Tools.GetRandomInt(0, itemDatas.length)];
    }
}

export class XGTW_快捷装备 extends XGTW_ItemData {
    constructor(public Name: string, public Type: string, public OriginType: string, public Quality: number) {
        let data = XGTW_DataManager.ItemDatas.get(XGTW_ItemType[`${OriginType}`]).find(e => e.Name == Name && e.Quality == Quality);
        if (data == null) console.error(Type, OriginType, Name);
        let price = data.Price;
        super(Name, Type, price, Quality);
    }
    GetItemData() {
        let itemData = XGTW_DataManager.ItemDatas.get(XGTW_ItemType[`${this.OriginType}`]).find(e => e.Name == this.Name && e.Quality == this.Quality)
        return itemData;
    }
}

export class XGTW_个性化枪械 extends XGTW_ItemData {
    constructor(public Name: string, public Type: string, public OriginType: string, public Origin, public Quality: number, public HasBroadcast: boolean, public HasBox: boolean) {
        super(Name, Type, 0, Quality);
    }
    get IsUnlock() { return PrefsManager.GetBool(`${this.Name}`, false) };
    set IsUnlock(value: boolean) { PrefsManager.SetBool(`${this.Name}`, value) };
}

export class XGTW_个性化装扮 extends XGTW_ItemData {
    constructor(name: string, type: string, quality: number) {
        super(name, type, 0, quality);
    }
    get IsUnlock() { return PrefsManager.GetBool(`${this.Name}`, false) };
    set IsUnlock(value: boolean) { PrefsManager.SetBool(`${this.Name}`, value) };
}

export class XGTW_碎片装扮 extends XGTW_ItemData {
    constructor(name: string, type: string, quality: number, Price: number) {
        super(name, type, Price, quality);
    }
    get IsUnlock() { return PrefsManager.GetBool(`${this.Name}`, false) };
    set IsUnlock(value: boolean) { PrefsManager.SetBool(`${this.Name}`, value) };
}

export class XGTW_特殊道具 extends XGTW_ItemData {
    constructor(name: string, type: string, quality: number, Price: number) {
        super(name, type, Price, quality);
    }
    get IsUnlock() { return PrefsManager.GetBool(`${this.Name}`, false) };
    set IsUnlock(value: boolean) { PrefsManager.SetBool(`${this.Name}`, value) };
}

// export class Money extends ItemData {
////     constructor(name: string, type: string) {
////         super(name, type, 1);
////     }
//// }
////补给
export class XGTW_SuppliesData {
    //    //"USP风扇","便携电脑","刨冰机","勘测仪","医用剪刀","医用海绵","千斤顶","喷油器","小霸王","录音带","打字机","打火机","摄像头","收音机",
    //    //"机油","水壶","洗发水","热成像仪","照相机","狮银币","电影胶卷","眼镜","破碎的屏幕","示波器","胶带","邮票","金杯","金色手机","镜头","隔音棉","音乐盒","颜料",
    static Out: string[][] = [
        //        //None
        [],
        //        //保险柜,
        ["金杯", "金色手机", "狮银币", "邮票", "便携电脑", "照相机", "镜头", "隔音棉", "音乐盒", "照相机"],
        //        //储物盒
        ["USP风扇", "便携电脑", "刨冰机", "勘测仪", "医用剪刀", "镜头", "眼镜", "电影胶卷", "音乐盒", "示波器", "颜料", "胶带", "医用海绵", "隔音棉", "千斤顶", "喷油器", "小霸王", "录音带", "打字机", "打火机", "摄像头", "收音机", "机油", "水壶", "洗发水", "热成像仪", "照相机"],
        //        //医疗用品
        [],
        //        //弹药箱
        [],
        //        //武器箱
        [],
        //        //电脑
        ["USP风扇", "摄像头", "破碎的屏幕", "示波器"]
    ];
    constructor(name: string, type: XGTW_SuppliesType, time: number, count: number, needKey: boolean, hasOpenState: boolean) {
        this.Name = name;
        this.Type = type;
        this.Time = time;
        this.Count = count;
        this.NeedKey = needKey;
        this.HasOpenState = hasOpenState;
        this.Taken = false;
        this.PlayerName = '';
    }
    Name: string;
    PlayerName: string = '';
    Type: XGTW_SuppliesType;
    Time: number;
    Count: number;
    NeedKey: boolean;
    Taken: boolean = false;
    HasOpenState: boolean;
}
////赛季奖励
export class XGTW_SeasonData {
    constructor(Name_1: string, Name_2: string, Type: string, Count_1: number, Count_2: number, IsJunXu: boolean) {
        this.Count_1 = Count_1;
        this.Count_2 = Count_2;

        if (XGTW_DataManager.ItemDatas.has(XGTW_ItemType[`${Type}`])) {
            this.ItemData_1 = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType[`${Type}`]).find(e => e.Name == Name_1));
            if (this.ItemData_1) this.ItemData_1.Count = Count_1;
        }

        if (IsJunXu) {
            this.ItemData_2 = Tools.Clone(XGTW_DataManager.JunXuItems.find(e => e.Name == Name_2));
            if (this.ItemData_2) this.ItemData_2.Count = Count_2;
        } else {
            if (XGTW_DataManager.ItemDatas.has(XGTW_ItemType[`${Type}`])) {
                this.ItemData_2 = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType[`${Type}`]).find(e => e.Name == Name_2));
                if (this.ItemData_2) this.ItemData_2.Count = Count_2;
            }
        }

    }
    Count_1: number = 1;
    Count_2: number = 1;
    ItemData_1: XGTW_ItemData = null;
    ItemData_2: XGTW_ItemData = null;
}