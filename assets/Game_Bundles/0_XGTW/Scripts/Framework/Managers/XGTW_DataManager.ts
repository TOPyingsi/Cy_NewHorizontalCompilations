import { JsonAsset, math } from 'cc';
import { InventoryType } from '../../UI/XGTW_InventoryPanel';
import { XGTW_Constant, XGTW_ItemType, XGTW_Quality, XGTW_SuppliesType } from '../Const/XGTW_Constant';
import PrefsManager from '../../../../../Scripts/Framework/Managers/PrefsManager';
import { BundleManager } from '../../../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../../../Scripts/GameManager';
import XGTW_GameManager from '../../XGTW_GameManager';
import { EventManager } from '../../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from './XGTW_Event';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_AchievementData, XGTW_AchievementManager, XGTW_AchievementType } from './XGTW_AchievementManager';
import { XGTW_ItemData, XGTW_PlayerData, XGTW_SeasonData, XGTW_SuppliesData, XGTW_个性化枪械, XGTW_个性化装扮, XGTW_冲锋枪, XGTW_头盔, XGTW_子弹, XGTW_射手步枪, XGTW_弓弩, XGTW_弹匣, XGTW_快捷装备, XGTW_战利品, XGTW_手枪, XGTW_投掷物, XGTW_抽奖礼包, XGTW_握把, XGTW_枪口, XGTW_枪托, XGTW_栓动步枪, XGTW_热卖新品, XGTW_特殊道具, XGTW_瞄具, XGTW_碎片装扮, XGTW_神秘商店, XGTW_突击步枪, XGTW_背包, XGTW_药品, XGTW_轻机枪, XGTW_近战武器, XGTW_防弹衣, XGTW_霰弹枪 } from '../../Datas/XGTW_Data';

export class XGTW_DataManager {
    static ItemDatas: Map<XGTW_ItemType, XGTW_ItemData[]>;
    static SuppliesDatas: Map<XGTW_SuppliesType, XGTW_SuppliesData[]>;
    static JunXuItems: XGTW_ItemData[];//军需
    static PlayerItems: XGTW_ItemData[];
    static SeasonDatas: XGTW_SeasonData[];
    static PlayerData: XGTW_PlayerData;
    static Names: string[] = [];
    public static get Money(): number {
        return PrefsManager.GetNumber(XGTW_Constant.Key.Money, 1000000);
    }
    public static set Money(value: number) {
        value = Math.floor(value);
        PrefsManager.SetNumber(XGTW_Constant.Key.Money, value);
        XGTW_AchievementManager.CheckAchievement("小试牛刀");
        XGTW_AchievementManager.CheckAchievement("根本花不完");
        EventManager.Scene.emit(XGTW_Event.RefreshMoney);
    }

    //能源电池
    public static get EnergyBattery(): number {
        return PrefsManager.GetNumber(XGTW_Constant.Key.EnergyBattery, 0);
    }
    public static set EnergyBattery(value: number) {
        PrefsManager.SetNumber(XGTW_Constant.Key.EnergyBattery, value);
        EventManager.Scene.emit(XGTW_Event.RefreshEnergyBattery);
    }

    //勘察情报
    public static get KCQB(): number {
        return PrefsManager.GetNumber(XGTW_Constant.Key.KCQB, 0);
    }
    public static set KCQB(value: number) {
        PrefsManager.SetNumber(XGTW_Constant.Key.KCQB, value);
        EventManager.Scene.emit(XGTW_Event.RefreshKCQB);
    }

    //皮肤碎片
    public static get SkinPiece(): number {
        return PrefsManager.GetNumber(XGTW_Constant.Key.SkinPiece, 0);
    }
    public static set SkinPiece(value: number) {
        PrefsManager.SetNumber(XGTW_Constant.Key.SkinPiece, value);
        EventManager.Scene.emit(XGTW_Event.RefreshSkinPiece);
    }

    //徽章
    public static get HuiZhangPiece(): number {
        return PrefsManager.GetNumber(XGTW_Constant.Key.HuiZhangPiece, 0);
    }
    public static set HuiZhangPiece(value: number) {
        PrefsManager.SetNumber(XGTW_Constant.Key.HuiZhangPiece, value);
        EventManager.Scene.emit(XGTW_Event.RefreshHuiZhangPiece);
    }

    public static get SeasonLv(): number {
        return Tools.Clamp(Math.floor(XGTW_DataManager.EXP / 1000), 0, 80);
    }
    public static get EXP(): number {
        return PrefsManager.GetNumber(XGTW_Constant.Key.EXP, 0);
    }
    public static set EXP(value: number) {
        value = Math.floor(value);
        PrefsManager.SetNumber(XGTW_Constant.Key.EXP, value)
    }
    public static get RankPoint(): number {
        return PrefsManager.GetNumber(XGTW_Constant.Key.RankPoint, 0);
    }
    public static set RankPoint(value: number) {
        value = Math.floor(value);
        PrefsManager.SetNumber(XGTW_Constant.Key.RankPoint, value)
    }
    public static async LoadData() {
        XGTW_DataManager.ItemDatas = new Map();
        XGTW_DataManager.SuppliesDatas = new Map();
        XGTW_DataManager.JunXuItems = [];
        XGTW_DataManager.PlayerItems = [];
        XGTW_DataManager.SeasonDatas = [];

        XGTW_GameManager.JJMode = false;

        return new Promise((resolve, reject) => {
            //玩家装备数据
            if (PrefsManager.GetItem(XGTW_Constant.Key.PlayerData)) {
                let data = JSON.parse(PrefsManager.GetItem(XGTW_Constant.Key.PlayerData));
                this.PlayerData = new XGTW_PlayerData(data.Helmet, data.Bulletproof, data.Weapon_0, data.Weapon_1, data.Pistol, data.MeleeWeapon, data.BackpackItems);
            } else {
                this.PlayerData = new XGTW_PlayerData();
            }
            console.log(`[玩家装备数据]:`, this.PlayerData);

            //玩家仓库数据
            if (PrefsManager.GetItem(XGTW_Constant.Key.Items)) {
                let data = JSON.parse(PrefsManager.GetItem(XGTW_Constant.Key.Items));
                for (let i = 0; i < data.length; i++) {
                    this.PlayerItems.push(data[i]);
                }
            }
            console.log(`[玩家仓库数据]:`, this.PlayerItems);
            BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Name").then((ja: JsonAsset) => {
                let data = ja.json as any;
                this.Names = data.Names;
            });

            //所有物品数据
            BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Data").then((ja: JsonAsset) => {
                let data = ja.json as any;
                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.金钱, []);
                // XGTW_DataManager.ItemDatas.get(ItemType.金钱).push(new Money("金钱", "金钱"));

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.头盔, []);
                for (let i = 0; i < data.头盔.length; i++) {
                    let e = data.头盔[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.头盔).push(new XGTW_头盔(e.Name, e.Type, e.Prices, e.Qualitys, e.Durables, e.Weight));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.防弹衣, []);
                for (let i = 0; i < data.防弹衣.length; i++) {
                    let e = data.防弹衣[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.防弹衣).push(new XGTW_防弹衣(e.Name, e.Type, e.Prices, e.Qualitys, e.Durables, e.Weight));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.背包, []);
                for (let i = 0; i < data.背包.length; i++) {
                    let e = data.背包[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.背包).push(new XGTW_背包(e.Name, e.Type, e.Prices, e.Qualitys, e.Durables, e.Weight));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.手枪, []);
                for (let i = 0; i < data.手枪.length; i++) {
                    let e = data.手枪[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.手枪).push(new XGTW_手枪(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.突击步枪, []);
                for (let i = 0; i < data.突击步枪.length; i++) {
                    let e = data.突击步枪[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.突击步枪).push(new XGTW_突击步枪(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.冲锋枪, []);
                for (let i = 0; i < data.冲锋枪.length; i++) {
                    let e = data.冲锋枪[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.冲锋枪).push(new XGTW_冲锋枪(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.射手步枪, []);
                for (let i = 0; i < data.射手步枪.length; i++) {
                    let e = data.射手步枪[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.射手步枪).push(new XGTW_射手步枪(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.栓动步枪, []);
                for (let i = 0; i < data.栓动步枪.length; i++) {
                    let e = data.栓动步枪[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.栓动步枪).push(new XGTW_栓动步枪(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.轻机枪, []);
                for (let i = 0; i < data.轻机枪.length; i++) {
                    let e = data.轻机枪[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.轻机枪).push(new XGTW_轻机枪(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.霰弹枪, []);
                for (let i = 0; i < data.霰弹枪.length; i++) {
                    let e = data.霰弹枪[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.霰弹枪).push(new XGTW_霰弹枪(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.弓弩, []);
                for (let i = 0; i < data.弓弩.length; i++) {
                    let e = data.弓弩[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.弓弩).push(new XGTW_弓弩(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate, e.Recoil, e.Desc, e.FirePosition));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.近战, []);
                for (let i = 0; i < data.近战.length; i++) {
                    let e = data.近战[i];
                    let prices = e.Prices.split(`,`);
                    let durables = e.Durables.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < durables.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.近战).push(new XGTW_近战武器(e.Name, e.Type, prices[j], qualitys[j], durables[j], e.Weight, e.Damage, e.FireRate));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.子弹, []);
                for (let i = 0; i < data.子弹.length; i++) {
                    let e = data.子弹[i];
                    let prices = e.Prices.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < prices.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹).push(new XGTW_子弹(e.Name, e.Type, prices[j], qualitys[j], e.Weight));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.瞄具, []);
                for (let i = 0; i < data.瞄具.length; i++) {
                    let e = data.瞄具[i];
                    let prices = e.Prices.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < prices.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.瞄具).push(new XGTW_瞄具(e.Name, e.Type, prices[j], qualitys[j], e.Weight));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.枪口, []);
                for (let i = 0; i < data.枪口.length; i++) {
                    let e = data.枪口[i];
                    let prices = e.Prices.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < prices.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.枪口).push(new XGTW_枪口(e.Name, e.Type, prices[j], qualitys[j], e.Weight));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.弹匣, []);
                for (let i = 0; i < data.弹匣.length; i++) {
                    let e = data.弹匣[i];
                    let prices = e.Prices.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < prices.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.弹匣).push(new XGTW_弹匣(e.Name, e.Type, prices[j], qualitys[j], e.Weight));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.握把, []);
                for (let i = 0; i < data.握把.length; i++) {
                    let e = data.握把[i];
                    let prices = e.Prices.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < prices.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.握把).push(new XGTW_握把(e.Name, e.Type, prices[j], qualitys[j], e.Weight));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.枪托, []);
                for (let i = 0; i < data.枪托.length; i++) {
                    let e = data.枪托[i];
                    let prices = e.Prices.split(`,`);
                    let qualitys = e.Qualitys.split(`,`);
                    for (let j = 0; j < prices.length; j++) {
                        XGTW_DataManager.ItemDatas.get(XGTW_ItemType.枪托).push(new XGTW_枪托(e.Name, e.Type, prices[j], qualitys[j], e.Weight));
                    }
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.药品, []);
                for (let i = 0; i < data.药品.length; i++) {
                    let e = data.药品[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.药品).push(new XGTW_药品(e.Name, e.Type, e.Price, e.Time, e.HP, e.Qualitys, e.Weight));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.投掷物, []);
                for (let i = 0; i < data.投掷物.length; i++) {
                    let e = data.投掷物[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.投掷物).push(new XGTW_投掷物(e.Name, e.Type, e.Price, e.Qualitys, e.Weight));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.神秘商店, []);
                for (let i = 0; i < data.神秘商店.length; i++) {
                    let e = data.神秘商店[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.神秘商店).push(new XGTW_神秘商店(e.Name, e.Type, e.Price, e.OriginType, e.Quality));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.热卖新品, []);
                for (let i = 0; i < data.热卖新品.length; i++) {
                    let e = data.热卖新品[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.热卖新品).push(new XGTW_热卖新品(e.Name, e.Type, e.Price, e.Quality, e.Desc));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.抽奖礼包, []);
                for (let i = 0; i < data.抽奖礼包.length; i++) {
                    let e = data.抽奖礼包[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.抽奖礼包).push(new XGTW_抽奖礼包(e.Name, e.Price, e.Type, e.GetType, e.Quality, e.Qualitys, e.Desc));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.快捷装备, []);
                for (let i = 0; i < data.快捷装备.length; i++) {
                    let e = data.快捷装备[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.快捷装备).push(new XGTW_快捷装备(e.Name, e.Type, e.OriginType, e.Quality));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.个性化枪械, []);
                for (let i = 0; i < data.个性化枪械.length; i++) {
                    let e = data.个性化枪械[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.个性化枪械).push(new XGTW_个性化枪械(e.Name, e.Type, e.OriginType, e.Origin, e.Quality, e.HasBroadcast, e.HasBox));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.个性化装扮, []);
                for (let i = 0; i < data.个性化装扮.length; i++) {
                    let e = data.个性化装扮[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.个性化装扮).push(new XGTW_个性化装扮(e.Name, e.Type, e.Quality));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.碎片装扮, []);
                for (let i = 0; i < data.碎片装扮.length; i++) {
                    let e = data.碎片装扮[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.碎片装扮).push(new XGTW_碎片装扮(e.Name, e.Type, e.Quality, e.Price));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.特殊道具, []);
                for (let i = 0; i < data.特殊道具.length; i++) {
                    let e = data.特殊道具[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.特殊道具).push(new XGTW_特殊道具(e.Name, e.Type, e.Quality, e.Price));
                }

                XGTW_DataManager.ItemDatas.set(XGTW_ItemType.战利品, []);
                for (let i = 0; i < data.战利品.length; i++) {
                    let e = data.战利品[i];
                    XGTW_DataManager.ItemDatas.get(XGTW_ItemType.战利品).push(new XGTW_战利品(e.Name, e.Type, e.Value, e.Quality, e.Weight));
                }

                for (let i = 0; i < data.物资.length; i++) {
                    let e = data.物资[i];
                    let type: XGTW_SuppliesType = XGTW_SuppliesType[`${e.Type}`];

                    if (!this.SuppliesDatas.has(type)) {
                        this.SuppliesDatas.set(type, []);
                    }

                    this.SuppliesDatas.get(type).push(new XGTW_SuppliesData(e.Name, e.Type, e.Time, e.Count, e.NeedKey, e.HasOpenState));
                }

                // for (let i = 0; i < data.d.length; i++) {
                //     let e = data.军需[i];
                //     let type = ItemType[`${e.Type}`];
                //     let originData;

                //     if (XGTW_DataManager.ItemDatas.has(type)) {
                //         if (XGTW_DataManager.ItemDatas.get(type).find(a => a.Name == e.Origin)) {
                //             originData = XGTW_DataManager.ItemDatas.get(type).find(a => a.Name == e.Origin);
                //             switch (type) {
                //                 case ItemType.冲锋枪:
                //                     XGTW_DataManager.JunXuItems.push(new 冲锋枪(e.Name, e.Type, originData.Price, originData.Damage, originData.FireRate, originData.Recoil, originData.Desc, originData.FirePosition));
                //                     break;
                //                 case ItemType.突击步枪:
                //                     XGTW_DataManager.JunXuItems.push(new 突击步枪(e.Name, e.Type, originData.Price, originData.Damage, originData.FireRate, originData.Recoil, originData.Desc, originData.FirePosition));
                //                     break;
                //                 case ItemType.栓动步枪:
                //                     XGTW_DataManager.JunXuItems.push(new 栓动步枪(e.Name, e.Type, originData.Price, originData.Damage, originData.FireRate, originData.Recoil, originData.Desc, originData.FirePosition));
                //                     break;
                //                 case ItemType.手枪:
                //                     XGTW_DataManager.JunXuItems.push(new 手枪(e.Name, e.Type, originData.Price, originData.Damage, originData.FireRate, originData.Recoil, originData.Desc, originData.FirePosition));
                //                     break;
                //                 case ItemType.射手步枪:
                //                     XGTW_DataManager.JunXuItems.push(new 射手步枪(e.Name, e.Type, originData.Price, originData.Damage, originData.FireRate, originData.Recoil, originData.Desc, originData.FirePosition));
                //                     break;
                //                 case ItemType.轻机枪:
                //                     XGTW_DataManager.JunXuItems.push(new 轻机枪(e.Name, e.Type, originData.Price, originData.Damage, originData.FireRate, originData.Recoil, originData.Desc, originData.FirePosition));
                //                     break;
                //                 case ItemType.霰弹枪:
                //                     XGTW_DataManager.JunXuItems.push(new 霰弹枪(e.Name, e.Type, originData.Price, originData.Damage, originData.FireRate, originData.Recoil, originData.Desc, originData.FirePosition));
                //                     break;
                //             }
                //         }
                //     }
                // }

                for (let i = 0; i < data.赛季.length; i++) {
                    let e = data.赛季[i];
                    let newData = new XGTW_SeasonData(e.Name_1, e.Name_2, e.Type, e.Count_1, e.Count_2, e.IsJunXu);
                    this.SeasonDatas.push(newData);
                }

                for (let i = 0; i < data.成就.length; i++) {
                    let e = data.成就[i];
                    let newData = new XGTW_AchievementData(e.Name, e.Desc, XGTW_AchievementType[`${e.Type}`]);
                    XGTW_AchievementManager.AchievementMap.set(e.Name, newData)
                }

                console.log(`[所有物品数据]:`, XGTW_DataManager.ItemDatas);
                console.log(`[所有军需数据]:`, XGTW_DataManager.JunXuItems);
                console.log(`[所有补给数据]:`, XGTW_DataManager.SuppliesDatas);
                console.log(`[所有赛季数据]:`, XGTW_DataManager.SeasonDatas);
                console.log(`[所有成就数据]:`, XGTW_AchievementManager.AchievementMap);

                resolve([]);
            });

        });
    }
    public static GetItemData(type: XGTW_ItemType, name: string) {
        return XGTW_DataManager.ItemDatas.get(type).find(e => e.Name == name);
    }
    //添加玩家的道具
    public static AddPlayerItem(data: XGTW_ItemData, fromShop: boolean = false) {
        let type = XGTW_ItemType[data.Type];
        if (fromShop) {
            if (XGTW_DataManager.ItemDatas.get(type).find(e => e.Name == data.Name)) {
                let json = JSON.stringify(data);
                data = Object.assign(new XGTW_ItemData(data.Name, data.Type, data.Price, data.Quality), JSON.parse(json));
            }
        }

        if (data) {
            console.log(`向仓库添加:`, data);
            this.PlayerItems.push(data);
            this.SaveData();
            EventManager.Scene.emit(XGTW_Event.RefreshInventoryItems);
        }
    }
    //移除玩家的道具
    public static RemovePlayerItem(data: XGTW_ItemData) {
        if (this.PlayerItems.indexOf(data) != -1) {
            this.PlayerItems.splice(this.PlayerItems.indexOf(data), 1);
            this.SaveData();
            EventManager.Scene.emit(XGTW_Event.RefreshInventoryItems);
            return true;
        }

        return false;
    }
    public static SaveData() {
        PrefsManager.SetItem(XGTW_Constant.Key.Items, JSON.stringify(this.PlayerItems));
        PrefsManager.SetItem(XGTW_Constant.Key.PlayerData, JSON.stringify(this.PlayerData));
    }
    //装备物品
    public static AddEquippedItem(type: InventoryType, data: XGTW_ItemData) {
        switch (type) {
            case InventoryType.Helmet:
                if (this.PlayerData.Helmet != null) this.RemovePlayerEquippedItem(this.PlayerData.Helmet);
                this.PlayerData.Helmet = data;
                break;
            case InventoryType.Bulletproof:
                if (this.PlayerData.Bulletproof != null) this.RemovePlayerEquippedItem(this.PlayerData.Bulletproof);
                this.PlayerData.Bulletproof = data;
                break;
            case InventoryType.Weapon_0:
                if (this.PlayerData.Weapon_0 != null) this.RemovePlayerEquippedItem(this.PlayerData.Weapon_0);
                this.PlayerData.Weapon_0 = data;
                break;
            case InventoryType.Weapon_1:
                if (this.PlayerData.Weapon_1 != null) this.RemovePlayerEquippedItem(this.PlayerData.Weapon_1);
                this.PlayerData.Weapon_1 = data;
                break;
            case InventoryType.Pistol:
                if (this.PlayerData.Pistol != null) this.RemovePlayerEquippedItem(this.PlayerData.Pistol);
                this.PlayerData.Pistol = data;
                break;
            case InventoryType.MeleeWeapon:
                if (this.PlayerData.MeleeWeapon != null) this.RemovePlayerEquippedItem(this.PlayerData.MeleeWeapon);
                this.PlayerData.MeleeWeapon = data;
                break;
            case InventoryType.Backpack:
                if (this.PlayerData.Backpack != null) this.RemovePlayerEquippedItem(this.PlayerData.Backpack);
                this.PlayerData.Backpack = data;
                break;
        }
        this.RemovePlayerItem(data);
        this.SaveData();
        return true;
    }
    //移除玩家已经装备的道具
    public static RemovePlayerEquippedItem(data: XGTW_ItemData) {
        for (const key in this.PlayerData) {
            if (this.PlayerData.hasOwnProperty(key) && this.PlayerData[key] == data) {
                this.PlayerData[key] = null;
                console.log(`移除已经装备 ${key}：`, data);
                this.SaveData();
                return true;
            }
        }

        return false;
    }
    //向装备的枪里添加子弹
    public static AddBulletToEquippedItem(data: XGTW_ItemData) {
        if (this.PlayerData.Weapon_0 != null) {
            let equippedData = this.PlayerData.Weapon_0 as any;
            if (equippedData.Desc == data.Name && equippedData.BulletCount != 60) {
                equippedData.BulletCount = 60;
                this.RemovePlayerItem(data);
                this.SaveData();
                return true;
            }
        }

        if (this.PlayerData.Weapon_1 != null) {
            let equippedData = this.PlayerData.Weapon_1 as any;
            if (equippedData.Desc == data.Name && equippedData.BulletCount != 60) {
                equippedData.BulletCount = 60;
                this.RemovePlayerItem(data);
                this.SaveData();
                return true;
            }
        }

        if (this.PlayerData.Pistol != null) {
            let equippedData = this.PlayerData.Pistol as any;
            if (equippedData.Desc == data.Name && equippedData.BulletCount != 60) {
                equippedData.BulletCount = 60;
                this.RemovePlayerItem(data);
                this.SaveData();
                return true;
            }
        }

        return false;
    }
    //向背包添加物品
    public static AddItemToBackpack(data: XGTW_ItemData) {
        // if (XGTW_DataManager.XGTW_PlayerData.BackpackItems.length >= XGTW_PlayerData.MaxBackpackItems) return false;
        XGTW_DataManager.PlayerData.BackpackItems.push(data);
        this.SaveData();
        EventManager.Scene.emit(XGTW_Event.RefreshBackpackGoodsItem);
        console.log(`向背包添加:`, data);
        return true;
    }
    //向背包移除物品
    public static RemoveItemFromBackpack(data: XGTW_ItemData) {
        if (this.PlayerData.BackpackItems.indexOf(data) != -1) {
            this.PlayerData.BackpackItems.splice(this.PlayerData.BackpackItems.indexOf(data), 1);
            this.SaveData();
            console.log(`向背包移除:`, data);
            return true;
        }
        return false;
    }

    //向密码箱添加物品
    public static LockboxHasItem(data: XGTW_ItemData) {
        return Boolean(XGTW_DataManager.PlayerData.LockboxItems.find(e => e == data));
    }
    //向密码箱添加物品
    public static AddItemToLockbox(data: XGTW_ItemData) {
        if (XGTW_DataManager.PlayerData.LockboxItems.length >= XGTW_PlayerData.MaxBackpackItems) return false;
        XGTW_DataManager.PlayerData.LockboxItems.push(data);
        this.SaveData();
        EventManager.Scene.emit(XGTW_Event.RefreshBackpackGoodsItem);
        console.log(`向密码箱添加:`, data);
        return true;
    }
    //向密码箱移除物品
    public static RemoveItemFromLockbox(data: XGTW_ItemData) {
        if (this.PlayerData.LockboxItems.indexOf(data) != -1) {
            this.PlayerData.LockboxItems.splice(this.PlayerData.LockboxItems.indexOf(data), 1);
            this.SaveData();
            console.log(`向密码箱移除:`, data);
            return true;
        }
        return false;
    }
    //装备配件
    public static EquipAccessorie(gunData: XGTW_ItemData, assoriesData: XGTW_ItemData) {
        let equipped = (gunData as any).Assories.find(e => e.Type == assoriesData.Type);

        if (equipped) {
            (gunData as any).Assories = (gunData as any).Assories.filter(e => e !== equipped);
        }

        (gunData as any).Assories.push(assoriesData);

        console.log("配件", (gunData as any).Assories);
        this.SaveData();
        return equipped;
    }
    //    //去除配件
    public static UnequipAssorie(gunData: XGTW_ItemData, type: string) {
        let equipped = (gunData as any).Assories.find(e => e.Type == type);
        if (equipped) (gunData as any).Assories = (gunData as any).Assories.filter(e => e !== equipped);
        this.SaveData();

        console.log("配件", (gunData as any).Assories);
        return equipped;
    }
    //装备皮肤
    public static EquipGunSkin(data: XGTW_ItemData) {
        if (XGTW_DataManager.PlayerData.EquipGunSkins.find(e => e.Name == data.Name)) return false;

        if (XGTW_DataManager.PlayerData.EquipGunSkins.find(e => (e as any).Origin == (data as any).Origin)) {
            XGTW_DataManager.PlayerData.EquipGunSkins = XGTW_DataManager.PlayerData.EquipGunSkins.filter(e => (e as any).Origin != (data as any).Origin);
        }

        XGTW_DataManager.PlayerData.EquipGunSkins.push(data);
        this.SaveData();

        return true;
    }
    //卸下皮肤
    public static UnequipGunSkin(data: XGTW_ItemData) {
        if (XGTW_DataManager.PlayerData.EquipGunSkins.find(e => e.Name == data.Name)) {
            XGTW_DataManager.PlayerData.EquipGunSkins = XGTW_DataManager.PlayerData.EquipGunSkins.filter(e => (e as any).Origin != (data as any).Origin);
            this.SaveData();
        }
    }
    //装备皮肤
    public static GetEquipGunSkin(data: XGTW_ItemData) {
        let skin = XGTW_DataManager.PlayerData.EquipGunSkins.find(e => (e as any).Origin == data.Name);
        return skin;
    }
    //装备狗皮肤
    public static EquipDogSkin(data: XGTW_ItemData) {
        XGTW_DataManager.PlayerData.Skin_Bulletproof = data;
        this.SaveData();
    }
    //卸下狗皮肤
    public static UnequipDogSkin(data: XGTW_ItemData) {
        XGTW_DataManager.PlayerData.Skin_Bulletproof = null;
        this.SaveData();
    }
    //随机生成玩家数据
    public static GeneratePlayerData(): XGTW_PlayerData {
        let data = new XGTW_PlayerData();

        //名字
        data.Name = this.Names[Tools.GetRandomInt(0, this.Names.length)];
        //头盔
        data.Helmet = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.头盔)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.头盔).length)] as any;
        //防弹衣
        data.Bulletproof = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.防弹衣)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.防弹衣).length)] as any;
        //枪
        let isPistol = Math.random() > 0.8 ? true : false;
        if (isPistol) {
            data.Pistol = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.手枪)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.手枪).length)] as any;
            (data.Pistol as any).BulletCount = Tools.GetRandomInt(0, 80);
        } else {
            let gunType = XGTW_ItemData.GunTypes[Tools.GetRandomInt(0, XGTW_ItemData.MainGunTypes.length)];
            data.Weapon_0 = XGTW_DataManager.ItemDatas.get(gunType)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(gunType).length)] as any;
            (data.Weapon_0 as any).BulletCount = Tools.GetRandomInt(0, 80);
        }

        //物品
        for (let i = 0; i < Tools.GetRandomInt(0, 3); i++) {
            data.BackpackItems.push(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹).length)] as any);
        }

        for (let i = 0; i < Tools.GetRandomInt(0, 3); i++) {
            // data.BackpackItems.push(XGTW_DataManager.ItemDatas.get(ItemType.战利品)[ZTool.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(ItemType.战利品).length)] as any);
        }

        return data;
    }
    public static SetSeasonItemGot(index: number, goodsIndex: number) {
        PrefsManager.SetBool(`${XGTW_Constant.Key.UnlockSeason}_${index}_${goodsIndex}`, true)
    }
    public static GetSeasonItemGot(index: number, goodsIndex: number): boolean {
        return PrefsManager.GetBool(`${XGTW_Constant.Key.UnlockSeason}_${index}_${goodsIndex}`);
    }

    //机甲
    public static GetJiJiaGun() {
        let oriData = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.轻机枪).find(e => e.Name == "M134重机枪");
        let data: XGTW_轻机枪 = Tools.Clone(oriData);
        data.FireRate = 0.05;
        data.BulletCount = 999999999999999;
        return data;
    }

    public static GetPieceSkinData(name: string) {
        let oriData = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.碎片装扮).find(e => e.Name == name);
        let data = null;
        if (oriData) data = Tools.Clone(oriData);
        return data;
    }

    public static IsPieceSkin(name: string) {
        return Boolean(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.碎片装扮).find(e => e.Name == name));
    }

}