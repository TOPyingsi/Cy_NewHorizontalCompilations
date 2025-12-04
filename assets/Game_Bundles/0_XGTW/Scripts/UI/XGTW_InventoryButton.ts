import { _decorator, Component, Node, Sprite, Label, color, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { InventoryType } from "./XGTW_InventoryPanel";
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../XGTW_GameManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';

@ccclass('XGTW_InventoryButton')
export default class XGTW_InventoryButton extends Component {
    Selected: Node | null = null;
    Icon: Sprite | null = null;
    Name_Lb: Label | null = null;
    Desc_Lb: Label | null = null;
    Bullet_Lb: Label | null = null;
    QualityBar: Node | null = null;
    type: InventoryType = InventoryType.None;
    protected onLoad(): void {
        this.Selected = NodeUtil.GetNode("Selected", this.node);
        this.QualityBar = NodeUtil.GetNode("QualityBar", this.node);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name_Lb = NodeUtil.GetComponent("Name_Lb", this.node, Label);
        this.Desc_Lb = NodeUtil.GetComponent("Desc_Lb", this.node, Label);
        this.Bullet_Lb = NodeUtil.GetComponent("Bullet_Lb", this.node, Label);
    }
    Set(type: InventoryType) {
        this.type = type;
    }
    Reset() {
        this.Desc_Lb.string = ``;
        this.Bullet_Lb && (this.Bullet_Lb.string = ``);
    }
    Refresh() {
        this.Reset();

        let data = null;
        this.Icon.color = color(255, 255, 255, 255);
        this.Icon.node.setScale(1, 1);
        switch (this.type) {
            case InventoryType.Helmet:
                data = XGTW_DataManager.PlayerData.Helmet;
                this.QualityBar.active = data != null;
                if (data) {
                    this.Icon.color = color(255, 255 * (data.Durable / data.MaxDurable), 255 * (data.Durable / data.MaxDurable), 255);
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
                }
                break;
            case InventoryType.Bulletproof:
                data = XGTW_DataManager.PlayerData.Bulletproof;
                this.QualityBar.active = data != null;
                if (data) {
                    this.Icon.color = color(255, 255 * (data.Durable / data.MaxDurable), 255 * (data.Durable / data.MaxDurable), 255);
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
                }
                break;
            case InventoryType.Weapon_0:
                data = XGTW_DataManager.PlayerData.Weapon_0;
                this.QualityBar.active = data != null;
                if (data) {
                    this.Bullet_Lb.string = `${data.Desc}`;
                    this.Desc_Lb.string = `${data.MagazineBulletCount}/${data.BulletCount}`;
                    this.Icon.color = color(255, 255 * (data.Durable / data.MaxDurable), 255 * (data.Durable / data.MaxDurable), 255);
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
                }
                break;
            case InventoryType.Weapon_1:
                data = XGTW_DataManager.PlayerData.Weapon_1;
                this.QualityBar.active = data != null;
                if (data) {
                    this.Bullet_Lb.string = `${data.Desc}`;
                    this.Desc_Lb.string = `${data.MagazineBulletCount}/${data.BulletCount}`;
                    this.Icon.color = color(255, 255 * (data.Durable / data.MaxDurable), 255 * (data.Durable / data.MaxDurable), 255);
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
                }
                break;
            case InventoryType.Pistol:
                data = XGTW_DataManager.PlayerData.Pistol;
                this.QualityBar.active = data != null;
                if (data) {
                    this.Bullet_Lb.string = `${data.Desc}`;
                    this.Desc_Lb.string = `${data.MagazineBulletCount}/${data.BulletCount}`;
                    this.Icon.color = color(255, 255 * (data.Durable / data.MaxDurable), 255 * (data.Durable / data.MaxDurable), 255);
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
                    this.Icon.node.setScale(2, 2);
                }
                break;
            case InventoryType.MeleeWeapon:
                data = XGTW_DataManager.PlayerData.MeleeWeapon;
                this.QualityBar.active = data != null;
                if (data) {
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
                }
                break;
            case InventoryType.Backpack:
                data = XGTW_DataManager.PlayerData.Backpack;
                this.QualityBar.active = data != null;
                if (data) {
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);
                    this.node.getChildByName("Icon_Default").active = false;
                } else {
                    this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(0);
                    this.node.getChildByName("Icon_Default").active = true;
                }
                break;
        }

        this.Name_Lb.string = data ? `${data.Name}` : `${this.type}`;
        this.Icon.node.active = data != null;

        if (data != null) {
            // this.Icon.node.setScale(scale);
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name.replace(/^\./, '')}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            });
        }
    }
    RefreshSelected(type: InventoryType) {
        this.Selected.active = this.type == type;
    }
}