import { _decorator, Component, Node, Sprite, Label, v3, SpriteFrame, size, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTS_WeaponContentType } from './XGTS_WeaponContent';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';

@ccclass('XGTS_GameItemUI')
export default class XGTS_GameItemUI extends Component {
    Selected: Node | null = null;
    Icon: Sprite | null = null;
    Name_Lb: Label | null = null;
    Bullet_Lb: Label | null = null;

    @property({ type: Enum(XGTS_WeaponContentType) })
    type: XGTS_WeaponContentType = XGTS_WeaponContentType.Primary;

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
            case XGTS_WeaponContentType.Primary:
                data = XGTS_DataManager.PlayerDatas[0].Weapon_Primary;
                contentSize = size(300, 125);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "主武器";
                }
                break;
            case XGTS_WeaponContentType.Secondary:
                data = XGTS_DataManager.PlayerDatas[0].Weapon_Secondary;
                contentSize = size(300, 125);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "副武器";
                }
                break;
            case XGTS_WeaponContentType.Pistol:
                data = XGTS_DataManager.PlayerDatas[0].Weapon_Pistol;
                contentSize = size(150, 60);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "手枪";
                }
                break;

            case XGTS_WeaponContentType.Melee:
                data = XGTS_DataManager.PlayerDatas[0].Weapon_Melee;
                contentSize = size(150, 60);

                BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/刀`).then((sf: SpriteFrame) => {
                    this.Icon.spriteFrame = sf;
                    XGTS_GameManager.SetImagePreferScale(this.Icon, contentSize.width, contentSize.height, 15);
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

            if (!Tools.IsEmptyStr(XGTS_DataManager.GetGunUseSkin(data.Name))) {
                path = `${XGTS_DataManager.GetGunUseSkin(data.Name)}`;
            }

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${path}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(this.Icon, contentSize.width, contentSize.height, 15);
            });
        }

        this.RefreshAmmoCount();
    }

    RefreshAmmoCount() {
        this.Bullet_Lb.string = "";

        let data = null;

        switch (this.type) {
            case XGTS_WeaponContentType.Primary:
                data = XGTS_DataManager.PlayerDatas[0].Weapon_Primary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Bullet_Lb.string = `${count}/${XGTS_DataManager.PlayerDatas[0].GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case XGTS_WeaponContentType.Secondary:
                data = XGTS_DataManager.PlayerDatas[0].Weapon_Secondary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Bullet_Lb.string = `${count}/${XGTS_DataManager.PlayerDatas[0].GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case XGTS_WeaponContentType.Pistol:
                data = XGTS_DataManager.PlayerDatas[0].Weapon_Pistol;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Bullet_Lb.string = `${count}/${XGTS_DataManager.PlayerDatas[0].GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case XGTS_WeaponContentType.Melee:
                this.Bullet_Lb.string = ``;
                break;

        }
    }

    RefreshSelected(type: XGTS_WeaponContentType) {
        this.Selected.active = this.type == type;
    }
}