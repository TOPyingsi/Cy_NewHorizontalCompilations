import { _decorator, Component, Node, Sprite, Label, v3, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { InventoryType } from "./XGTW_InventoryPanel";
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';

@ccclass('XGTW_GameItemUI')
export default class XGTW_GameItemUI extends Component {
    Selected: Node | null = null;
    Icon: Sprite | null = null;
    Name_Lb: Label | null = null;
    Bullet_Lb: Label | null = null;
    type: InventoryType = InventoryType.None;
    onLoad(): void {
        this.Selected = NodeUtil.GetNode("Selected", this.node);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name_Lb = NodeUtil.GetComponent("Name_Lb", this.node, Label);
        this.Bullet_Lb = NodeUtil.GetComponent("Bullet_Lb", this.node, Label);
    }
    Set(type: InventoryType) {
        this.type = type;
    }
    Reset() {
        this.Bullet_Lb.string = ``;
    }
    Refresh() {
        this.Reset();

        let data = null;
        let scale = 1;
        switch (this.type) {
            case InventoryType.Weapon_0:
                scale = 1;
                data = XGTW_DataManager.PlayerData.Weapon_0;
                if (data) {
                    this.Bullet_Lb.string = `${data.BulletCount}`;
                }
                break;
            case InventoryType.Weapon_1:
                scale = 1;
                data = XGTW_DataManager.PlayerData.Weapon_1;
                if (data) {
                    this.Bullet_Lb.string = `${data.BulletCount}`;
                }
                break;
            case InventoryType.Pistol:
                data = XGTW_DataManager.PlayerData.Pistol;
                scale = 0.4;
                if (data) {
                    this.Bullet_Lb.string = `${data.BulletCount}`;
                }
                break;
            case InventoryType.MeleeWeapon:
                scale = 0.5;
                data = XGTW_DataManager.PlayerData.MeleeWeapon;
                break;
        }

        this.Name_Lb.string = data ? `${data.Name}` : `${this.type}`;
        this.Icon.node.active = data != null;

        if (data != null) {
            this.Icon.node.setScale(v3(scale, scale));
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            });
        }
    }
    RefreshBulletCount() {
        switch (this.type) {
            case InventoryType.Weapon_0:
                if (XGTW_DataManager.PlayerData.Weapon_0) {
                    this.Bullet_Lb.string = `${(XGTW_DataManager.PlayerData.Weapon_0 as any).BulletCount}`;
                }
                break;
            case InventoryType.Weapon_1:
                if (XGTW_DataManager.PlayerData.Weapon_1) {
                    this.Bullet_Lb.string = `${(XGTW_DataManager.PlayerData.Weapon_1 as any).BulletCount}`;
                }
                break;
            case InventoryType.Pistol:
                if (XGTW_DataManager.PlayerData.Pistol) {
                    this.Bullet_Lb.string = `${(XGTW_DataManager.PlayerData.Pistol as any).BulletCount}`;
                }
                break;
        }
    }
    RefreshSelected(type: InventoryType) {
        this.Selected.active = this.type == type;
    }
}