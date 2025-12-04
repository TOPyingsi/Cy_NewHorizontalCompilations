import { _decorator, Component, Label, Node, size, Sprite, SpriteFrame, UITransform, Vec2 } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { GridCellState } from './SJZ_GridCell';
import { SJZ_ItemData, SJZ_ItemType, SJZ_WeaponData } from '../SJZ_Data';
import SJZ_Item from './SJZ_Item';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
const { ccclass, property } = _decorator;

export enum SJZ_WeaponContentType {
    Primary,
    Secondary,
    Pistol,
    Melee,
    Helmet,
    BodyArmor,
}

@ccclass('SJZ_WeaponContent')
export class SJZ_WeaponContent extends Component {
    ndTrans: UITransform = null;
    PutTip: Sprite = null;
    Icon: Sprite = null;
    Name_Lb: Label = null;
    Desc_Lb: Label = null;

    inBox: boolean = false;
    type: SJZ_WeaponContentType = null;

    protected onLoad(): void {
        this.ndTrans = this.node.getComponent(UITransform);
        this.PutTip = NodeUtil.GetComponent("PutTip", this.node, Sprite);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name_Lb = NodeUtil.GetComponent("Name_Lb", this.node, Label);
        this.Desc_Lb = NodeUtil.GetComponent("Desc_Lb", this.node, Label);
    }

    Init(type: SJZ_WeaponContentType) {
        this.type = type;
        this.RefreshWeaponContent();
    }

    CanEquip(data: SJZ_ItemData, position: Vec2) {
        let inBox = this.ndTrans.getBoundingBoxToWorld().contains(position);

        if (inBox) {
            this.inBox = true;

            //TODO满足条件为背包且当前背包内没有物品以及替换逻辑
            let canPut = false;

            if (data.Type == SJZ_ItemType.Weapon || data.Type == SJZ_ItemType.Helmet || data.Type == SJZ_ItemType.BodyArmor) {
                switch (this.type) {
                    case SJZ_WeaponContentType.Primary:
                        if (data.WeaponData)
                            canPut = SJZ_WeaponData.IsMain(data.WeaponData.Type) && SJZ_DataManager.PlayerData.Weapon_Primary == null;
                        break;
                    case SJZ_WeaponContentType.Secondary:
                        if (data.WeaponData)
                            canPut = SJZ_WeaponData.IsMain(data.WeaponData.Type) && SJZ_DataManager.PlayerData.Weapon_Secondary == null;
                        break;
                    case SJZ_WeaponContentType.Pistol:
                        if (data.WeaponData)
                            canPut = SJZ_WeaponData.IsPistol(data.WeaponData.Type) && SJZ_DataManager.PlayerData.Weapon_Pistol == null;
                        break;
                    case SJZ_WeaponContentType.Helmet:
                        canPut = data.Type == SJZ_ItemType.Helmet && SJZ_DataManager.PlayerData.Weapon_Helmet == null;
                        break;
                    case SJZ_WeaponContentType.BodyArmor:
                        canPut = data.Type == SJZ_ItemType.BodyArmor && SJZ_DataManager.PlayerData.Weapon_BodyArmor == null;
                        break;
                    default:
                        break;
                }
            }

            this.SetPutTipState(canPut ? GridCellState.CanPut : GridCellState.CanntPut);

            return canPut;
        } else {
            if (this.inBox) {
                this.ClearPutTipState();
                this.inBox = false;
            }

            return false;
        }
    }

    OnDragStart(item: SJZ_Item) {
    }

    OnDragging(item: SJZ_Item, position: Vec2) {
        this.CanEquip(item.data, position);
    }

    OnDragEnd(item: SJZ_Item, position: Vec2) {
        if (this.CanEquip(item.data, position)) {
            this.ClearPutTipState();
            let data = item.data;
            SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.Equip);

            switch (this.type) {
                case SJZ_WeaponContentType.Primary:
                    SJZ_DataManager.PlayerData.Weapon_Primary = data;
                    break;
                case SJZ_WeaponContentType.Secondary:
                    SJZ_DataManager.PlayerData.Weapon_Secondary = data;
                    break;
                case SJZ_WeaponContentType.Pistol:
                    SJZ_DataManager.PlayerData.Weapon_Pistol = data;
                    break;
                case SJZ_WeaponContentType.Helmet:
                    SJZ_DataManager.PlayerData.Weapon_Helmet = data;
                    break;
                case SJZ_WeaponContentType.BodyArmor:
                    SJZ_DataManager.PlayerData.Weapon_BodyArmor = data;
                    break;
                default:
                    break;
            }

            this.RefreshWeaponContent();
            this.RefreshContentLabel();
            item.RemoveItemFromAndResetLastInventory();
        }
    }

    RefreshWeaponContent() {
        let data: SJZ_ItemData = null;
        let contentSize = size();
        this.Icon.spriteFrame = null;

        switch (this.type) {
            case SJZ_WeaponContentType.Primary:
                data = SJZ_DataManager.PlayerData.Weapon_Primary;
                contentSize = size(450, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "主武器";
                }
                break;
            case SJZ_WeaponContentType.Secondary:
                data = SJZ_DataManager.PlayerData.Weapon_Secondary;
                contentSize = size(450, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "副武器";
                }
                break;
            case SJZ_WeaponContentType.Pistol:
                data = SJZ_DataManager.PlayerData.Weapon_Pistol;
                contentSize = size(150, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "手枪";
                }
                break;
            case SJZ_WeaponContentType.Helmet:
                data = SJZ_DataManager.PlayerData.Weapon_Helmet;
                contentSize = size(300, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "头盔";
                }
                break;
            case SJZ_WeaponContentType.BodyArmor:
                data = SJZ_DataManager.PlayerData.Weapon_BodyArmor;
                contentSize = size(300, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "防弹衣";
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

        this.RefreshContentLabel();
    }

    RefreshContentLabel() {
        let data: SJZ_ItemData = null;
        switch (this.type) {
            case SJZ_WeaponContentType.Primary:
                data = SJZ_DataManager.PlayerData.Weapon_Primary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Desc_Lb.string = `${count}/${SJZ_DataManager.PlayerData.GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case SJZ_WeaponContentType.Secondary:
                data = SJZ_DataManager.PlayerData.Weapon_Secondary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Desc_Lb.string = `${count}/${SJZ_DataManager.PlayerData.GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case SJZ_WeaponContentType.Pistol:
                data = SJZ_DataManager.PlayerData.Weapon_Pistol;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Desc_Lb.string = `${count}/${SJZ_DataManager.PlayerData.GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case SJZ_WeaponContentType.Helmet:
                data = SJZ_DataManager.PlayerData.Weapon_Helmet;
                if (data) {
                    this.Desc_Lb.string = `${data.EquipData.Durability}/${data.EquipData.MaxDurability}`;
                }
                break;
            case SJZ_WeaponContentType.BodyArmor:
                data = SJZ_DataManager.PlayerData.Weapon_BodyArmor;
                if (data) {
                    this.Desc_Lb.string = `${data.EquipData.Durability}/${data.EquipData.MaxDurability}`;
                }
                break;
            default:
                break;
        }
    }

    SetPutTipState(state: GridCellState) {
        this.PutTip.color = Tools.GetColorFromHex(state);
    }

    ClearPutTipState() {
        this.PutTip.color = Tools.GetColorFromHex(GridCellState.None);
    }

    protected onEnable(): void {
    }

    protected onDisable(): void {
        EventManager.Scene.off(SJZ_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshContentLabel, this);
    }
}