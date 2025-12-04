import { _decorator, Component, Sprite, Label, Node, Event, color, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../XGTW_GameManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { GameManager } from '../../../../Scripts/GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { XGTW_AudioManager } from '../XGTW_AudioManager';

@ccclass('XGTW_BackpackWeaponButton')
export default class XGTW_BackpackWeaponButton extends Component {
    Icon: Sprite | null = null;
    Name_Lb: Label | null = null;
    Desc_Lb: Label | null = null;
    Bullet_Lb: Label | null = null;
    QualityBar: Node | null = null;
    Accessories: Node | null = null;
    data: XGTW_ItemData = null;
    defaultName: string = ``;
    protected onLoad(): void {
        this.QualityBar = NodeUtil.GetNode("QualityBar", this.node);
        this.Accessories = NodeUtil.GetNode("Accessories", this.node);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name_Lb = NodeUtil.GetComponent("Name_Lb", this.node, Label);
        this.Desc_Lb = NodeUtil.GetComponent("Desc_Lb", this.node, Label);
        this.Bullet_Lb = NodeUtil.GetComponent("Bullet_Lb", this.node, Label);

        this.defaultName = this.Name_Lb.string;
    }
    Refresh(data) {
        this.data = data;

        this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(0);
        this.Icon.spriteFrame = null;
        this.Name_Lb.string = this.defaultName;
        this.Desc_Lb.string = ``;
        this.Bullet_Lb.string = ``;

        if (this.Accessories) this.Accessories.active = data != null;


        if (data) {
            this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
            this.Icon.node.getComponent(Sprite).color = color(255, 255 * (data.Durable / data.MaxDurable), 255 * (data.Durable / data.MaxDurable), 255);
            this.Name_Lb.string = `${data.Name}`;

            let skin = XGTW_DataManager.GetEquipGunSkin(data);
            if (skin) {
                //加载枪的皮肤
                BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${skin.Type}/${skin.Name}`).then((sf: SpriteFrame) => {
                    this.Icon.spriteFrame = sf;
                });
            } else {
                //加载枪
                BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
                    this.Icon.spriteFrame = sf;
                });
            }

            if (this.Accessories) this.RefreshAssories();
        }

    }
    //    //展示枪支配件
    RefreshAssories() {
        let as = XGTW_ItemData.GetAssories(XGTW_ItemData.GetItemType(this.data.Type));
        for (let i = 0; i < this.Accessories.children.length; i++) {
            const node = this.Accessories.children[i];
            node.active = as.find(f => f == node.name)
            if (node.active) {
                node.getChildByName("Icon").getComponent(Sprite).spriteFrame = null;
                let a = (this.data as any).Assories.find(f => f.Type == node.name);
                if (a) {
                    BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${a.Type}/${a.Name}`).then((sf: SpriteFrame) => {
                        node.getChildByName("Icon").getComponent(Sprite).spriteFrame = sf;
                    });
                }
            }
        }
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        const sb = () => {
            EventManager.Scene.emit(XGTW_Event.RefreshBackpackGoodsItem);
            EventManager.Scene.emit(XGTW_Event.RefreshInventoryButtons);
            EventManager.Scene.emit(XGTW_Event.RefreshEquip);
        }

        switch (event.target.name) {
            case "Weapon_0":
                if (XGTW_DataManager.PlayerData.Weapon_0) {
                    XGTW_DataManager.AddItemToBackpack(XGTW_DataManager.PlayerData.Weapon_0);
                    XGTW_DataManager.RemovePlayerEquippedItem(XGTW_DataManager.PlayerData.Weapon_0);
                    sb();
                }
                break;
            case "Weapon_1":
                if (XGTW_DataManager.PlayerData.Weapon_1) {
                    XGTW_DataManager.AddItemToBackpack(XGTW_DataManager.PlayerData.Weapon_1);
                    XGTW_DataManager.RemovePlayerEquippedItem(XGTW_DataManager.PlayerData.Weapon_1);
                    sb();
                }
                break;
            case "MeleeWeapon":
                if (XGTW_DataManager.PlayerData.MeleeWeapon) {
                    XGTW_DataManager.AddItemToBackpack(XGTW_DataManager.PlayerData.MeleeWeapon);
                    XGTW_DataManager.RemovePlayerEquippedItem(XGTW_DataManager.PlayerData.MeleeWeapon);
                    sb();
                }
                break;
            case "Pistol":
                if (XGTW_DataManager.PlayerData.Pistol) {
                    XGTW_DataManager.AddItemToBackpack(XGTW_DataManager.PlayerData.Pistol);
                    XGTW_DataManager.RemovePlayerEquippedItem(XGTW_DataManager.PlayerData.Pistol);
                    sb();
                }
                break;
            case "Helmet":
                if (XGTW_DataManager.PlayerData.Helmet) {
                    XGTW_DataManager.AddItemToBackpack(XGTW_DataManager.PlayerData.Helmet);
                    XGTW_DataManager.RemovePlayerEquippedItem(XGTW_DataManager.PlayerData.Helmet);
                    sb();
                }
                break;
            case "Bulletproof":
                if (XGTW_DataManager.PlayerData.Bulletproof) {
                    XGTW_DataManager.AddItemToBackpack(XGTW_DataManager.PlayerData.Bulletproof);
                    XGTW_DataManager.RemovePlayerEquippedItem(XGTW_DataManager.PlayerData.Bulletproof);
                    sb();
                }
                break;
            case "Backpack":
                if (XGTW_DataManager.PlayerData.Backpack) {
                    XGTW_DataManager.AddItemToBackpack(XGTW_DataManager.PlayerData.Backpack);
                    XGTW_DataManager.RemovePlayerEquippedItem(XGTW_DataManager.PlayerData.Backpack);
                    sb();
                }
                break;
        }
    }
}