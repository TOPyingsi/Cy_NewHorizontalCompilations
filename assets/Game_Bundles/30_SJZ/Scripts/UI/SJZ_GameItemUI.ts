import { _decorator, Component, Node, Sprite, Label, v3, SpriteFrame, size, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from '../../../../Scripts/GameManager';
import { SJZ_WeaponContentType } from './SJZ_WeaponContent';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';

@ccclass('SJZ_GameItemUI')
export default class SJZ_GameItemUI extends Component {
    Selected: Node | null = null;
    Icon: Sprite | null = null;
    Name_Lb: Label | null = null;
    Bullet_Lb: Label | null = null;

    @property({ type: Enum(SJZ_WeaponContentType) })
    type: SJZ_WeaponContentType = SJZ_WeaponContentType.Primary;

    onLoad(): void {
        this.Selected = NodeUtil.GetNode("Selected", this.node);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name_Lb = NodeUtil.GetComponent("Name_Lb", this.node, Label);
        this.Bullet_Lb = NodeUtil.GetComponent("Bullet_Lb", this.node, Label);
    }

    Refresh() {
        let data = null;
        let contentSize = size();
        this.Icon.spriteFrame = null;

        switch (this.type) {
            case SJZ_WeaponContentType.Primary:
                data = SJZ_DataManager.PlayerData.Weapon_Primary;
                contentSize = size(300, 125);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "主武器";
                }
                break;
            case SJZ_WeaponContentType.Secondary:
                data = SJZ_DataManager.PlayerData.Weapon_Secondary;
                contentSize = size(300, 125);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "副武器";
                }
                break;
            case SJZ_WeaponContentType.Pistol:
                data = SJZ_DataManager.PlayerData.Weapon_Pistol;
                contentSize = size(150, 60);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "手枪";
                }
                break;

            case SJZ_WeaponContentType.Melee:
                data = SJZ_DataManager.PlayerData.Weapon_Melee;
                contentSize = size(150, 60);

                BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/刀`).then((sf: SpriteFrame) => {
                    this.Icon.spriteFrame = sf;
                    SJZ_GameManager.SetImagePreferScale(this.Icon, contentSize.width, contentSize.height, 15);
                });

                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "刀具";
                }
                break;
            default:
                break;
        }

        if (data) {
            let path = data.ImageId;

            if (!Tools.IsEmptyStr(SJZ_DataManager.GetGunUseSkin(data.Name))) {
                path = `${SJZ_DataManager.GetGunUseSkin(data.Name)}`;
            }

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${path}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
                SJZ_GameManager.SetImagePreferScale(this.Icon, contentSize.width, contentSize.height, 15);
            });
        }

        this.RefreshAmmoCount();
    }

    RefreshAmmoCount() {
        this.Bullet_Lb.string = "";

        let data = null;

        switch (this.type) {
            case SJZ_WeaponContentType.Primary:
                data = SJZ_DataManager.PlayerData.Weapon_Primary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Bullet_Lb.string = `${count}/${SJZ_DataManager.PlayerData.GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case SJZ_WeaponContentType.Secondary:
                data = SJZ_DataManager.PlayerData.Weapon_Secondary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Bullet_Lb.string = `${count}/${SJZ_DataManager.PlayerData.GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case SJZ_WeaponContentType.Pistol:
                data = SJZ_DataManager.PlayerData.Weapon_Pistol;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Bullet_Lb.string = `${count}/${SJZ_DataManager.PlayerData.GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case SJZ_WeaponContentType.Melee:
                this.Bullet_Lb.string = ``;
                break;

        }
    }

    RefreshSelected(type: SJZ_WeaponContentType) {
        this.Selected.active = this.type == type;
    }
}