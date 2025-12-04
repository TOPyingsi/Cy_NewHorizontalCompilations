import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_SItem from "./UI/XGTW_SItem";
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_SuppliesType } from './Framework/Const/XGTW_Constant';
import { GameManager } from '../../../Scripts/GameManager';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { EventManager } from '../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from './Framework/Managers/XGTW_Event';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_SuppliesData, XGTW_ItemData, XGTW_战利品 } from './Datas/XGTW_Data';
import { XGTW_DataManager } from './Framework/Managers/XGTW_DataManager';

@ccclass('XGTW_Supplies')
export default class XGTW_Supplies extends Component {
    @property
    generateBox: boolean = false;
    Icon: Sprite | null = null;
    collider: BoxCollider2D | null = null;
    data: XGTW_SuppliesData = null;
    taken: boolean = false;//已经被拿过
    Items: Node | null = null;
    itemDatas = [];
    onLoad() {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.collider = this.node.getComponent(BoxCollider2D);
        this.Items = NodeUtil.GetNode("Items", this.node);
    }
    start() {
        if (this.generateBox) {
            this.Init();
        }
    }
    //自然生成的箱子
    Init() {
        let keys = Object.keys(XGTW_SuppliesType).map(key => XGTW_SuppliesType[key]).filter(value => typeof value === 'number');
        let type = keys[Tools.GetRandomInt(0, keys.length)];

        if (type == XGTW_SuppliesType.None) {
            this.collider.enabled = false;
            this.Icon.spriteFrame = null;
            return;
        }

        this.itemDatas = [];
        let datas = XGTW_DataManager.SuppliesDatas.get(type);
        this.data = Tools.Clone(datas[Tools.GetRandomInt(0, datas.length)]);

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Supplies/${this.data.Type}_${this.data.Name}_0`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });

        let outGoods = XGTW_SuppliesData.Out[type];

        let data: XGTW_战利品;
        let count: number = 0;

        switch (type) {
            case XGTW_SuppliesType.医疗用品:
                count = Tools.GetRandomInt(3, 10);
                for (let i = 0; i < count; i++) {
                    data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.药品)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.药品).length)]);
                    data && (this.itemDatas.push(data));
                }
                break;

            case XGTW_SuppliesType.弹药箱:
                count = Tools.GetRandomInt(3, 10);
                for (let i = 0; i < count; i++) {
                    data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹).length)]);
                    data && (this.itemDatas.push(data));
                }
                break;

            case XGTW_SuppliesType.武器箱:
                //枪
                let index = Tools.GetRandomInt(0, 7);
                if (index == 0) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.冲锋枪)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.冲锋枪).length)]);
                if (index == 2) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.射手步枪)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.射手步枪).length)]);
                if (index == 3) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.手枪)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.手枪).length)]);
                if (index == 4) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.栓动步枪)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.栓动步枪).length)]);
                if (index == 5) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.突击步枪)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.突击步枪).length)]);
                if (index == 6) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.轻机枪)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.轻机枪).length)]);
                data && (this.itemDatas.push(data));
                //头盔
                index = Tools.GetRandomInt(0, 2);
                if (index == 0) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.头盔)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.头盔).length)]);
                if (index == 1) data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.防弹衣)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.防弹衣).length)]);
                data && (this.itemDatas.push(data));
                //子弹
                count = Tools.GetRandomInt(1, 5);
                for (let i = 0; i < count; i++) {
                    data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹)[Tools.GetRandomInt(0, XGTW_DataManager.ItemDatas.get(XGTW_ItemType.子弹).length)]);
                    data && (this.itemDatas.push(data));
                }
                break;
            case XGTW_SuppliesType.保险柜:
                for (let i = 0; i < this.data.Count; i++) {
                    let goodName = outGoods[Tools.GetRandomInt(0, outGoods.length)];
                    data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.战利品).find(e => e.Name == goodName));
                    data && (this.itemDatas.push(data));
                }
                break;

            case XGTW_SuppliesType.储物盒:
                for (let i = 0; i < this.data.Count; i++) {
                    let goodName = outGoods[Tools.GetRandomInt(0, outGoods.length)];
                    data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.战利品).find(e => e.Name == goodName));
                    data && (this.itemDatas.push(data));
                }
                break;

            case XGTW_SuppliesType.电脑:
                for (let i = 0; i < this.data.Count; i++) {
                    let goodName = outGoods[Tools.GetRandomInt(0, outGoods.length)];
                    data = Tools.Clone(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.战利品).find(e => e.Name == goodName));
                    data && (this.itemDatas.push(data));
                }
                break;
        }
    }
    //    //敌人的死亡箱
    InitDieBox(name: string, killedGun, itemDatas) {
        this.itemDatas = [];
        this.itemDatas = itemDatas;
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);

        let path = "Common_Box"
        if (killedGun && XGTW_ItemData.IsMainGun(XGTW_ItemData.GetItemType(killedGun.Type))) {
            let skin: any = XGTW_DataManager.GetEquipGunSkin(killedGun);
            if (skin && skin.HasBox) {
                path = `${skin.Name}_Box`
            }
        }

        this.data = Tools.Clone(XGTW_DataManager.SuppliesDatas.get(XGTW_SuppliesType.武器箱).find(e => e.Name == "小军火箱"));
        this.data.PlayerName = name;
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化枪械/${path}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }
    Take() {
        if (this.data && !this.data.Taken && this.data.HasOpenState) {
            this.data.Taken = true;
            // ResourceUtil.LoadSpriteFrame(`Supplies/${this.data.Type}_${this.data.Name}_1`).then((sf: cc.SpriteFrame) => {
            //     this.Icon.spriteFrame = sf;
            // });
        }
    }
    suppliesItems: XGTW_SItem[] = [];
    ShowSuppliesItems(active: boolean) {
        this.Items.active = active;
        if (this.itemDatas.length <= 0) {
            UIManager.ShowTip("空空如也");
        }

        if (active) {
            this.suppliesItems.forEach(e => PoolManager.PutNode(e.node));
            this.Items.setWorldPosition(view.getVisibleSize().width / 2, view.getVisibleSize().height / 2 + 100, 0)
            for (let i = 0; i < this.itemDatas.length; i++) {
                const data = this.itemDatas[i];
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/SItem", this.Items).then(e => {
                    let item = e.getComponent(XGTW_SItem);
                    item.Init(data, this.ItemCallback.bind(this))
                    this.suppliesItems.push(item);
                })
            }
        }
    }
    ItemCallback(data) {
        let type = XGTW_ItemData.GetItemType(data.Type);

        const sb = () => {
            EventManager.Scene.emit(XGTW_Event.RefreshInventoryButtons);
            EventManager.Scene.emit(XGTW_Event.RefreshEquip);
            this.itemDatas = this.itemDatas.filter(e => e != data);
            this.ShowSuppliesItems(true);
        }

        if (XGTW_ItemData.IsMainGun(type) && XGTW_DataManager.PlayerData.Weapon_0 == null) {
            XGTW_DataManager.PlayerData.Weapon_0 = data;
            sb();
            return;
        }

        if (XGTW_ItemData.IsMainGun(type) && XGTW_DataManager.PlayerData.Weapon_1 == null) {
            XGTW_DataManager.PlayerData.Weapon_1 = data;
            sb();
            return;
        }

        if (type == XGTW_ItemType.手枪 && XGTW_DataManager.PlayerData.Pistol == null) {
            XGTW_DataManager.PlayerData.Pistol = data;
            sb();
            return;
        }

        if (type == XGTW_ItemType.近战 && XGTW_DataManager.PlayerData.MeleeWeapon == null) {
            XGTW_DataManager.PlayerData.MeleeWeapon = data;
            sb();
            return;
        }

        if (type == XGTW_ItemType.头盔 && XGTW_DataManager.PlayerData.Helmet == null) {
            XGTW_DataManager.PlayerData.Helmet = data;
            sb();
            return;
        }

        if (type == XGTW_ItemType.防弹衣 && XGTW_DataManager.PlayerData.Bulletproof == null) {
            XGTW_DataManager.PlayerData.Bulletproof = data;
            sb();
            return;
        }

        if (type == XGTW_ItemType.背包 && XGTW_DataManager.PlayerData.Backpack == null) {
            XGTW_DataManager.PlayerData.Backpack = data;
            sb();
            return;
        }

        XGTW_DataManager.AddItemToBackpack(data);
        this.itemDatas = this.itemDatas.filter(e => e != data);
        this.ShowSuppliesItems(true);
    }
}