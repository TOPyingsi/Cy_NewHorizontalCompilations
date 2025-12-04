import { _decorator, Component, Label, Node, size, Sprite, SpriteFrame, UITransform, Vec2 } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { GridCellState } from './XGTS_GridCell';
import { XGTS_ItemData, XGTS_ItemType, XGTS_WeaponData } from '../XGTS_Data';
import XGTS_Item from './XGTS_Item';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
const { ccclass, property } = _decorator;

export enum XGTS_WeaponContentType {
    Primary,
    Secondary,
    Pistol,
    Melee,
    Helmet,
    BodyArmor,
}

@ccclass('XGTS_WeaponContent')
export class XGTS_WeaponContent extends Component {
    ndTrans: UITransform = null;
    PutTip: Sprite = null;
    Icon: Sprite = null;
    Name_Lb: Label = null;
    Desc_Lb: Label = null;

    inBox: boolean = false;
    type: XGTS_WeaponContentType = null;
    playerNum: number = 0;

    protected onLoad(): void {
        this.ndTrans = this.node.getComponent(UITransform);
        this.PutTip = NodeUtil.GetComponent("PutTip", this.node, Sprite);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name_Lb = NodeUtil.GetComponent("Name_Lb", this.node, Label);
        this.Desc_Lb = NodeUtil.GetComponent("Desc_Lb", this.node, Label);
    }

    InitPlayerNum(PlayerNum:number){
        this.playerNum = PlayerNum;
    }

    Init(type: XGTS_WeaponContentType) {
        this.type = type;
        this.RefreshWeaponContent();
    }

    CanEquip(data: XGTS_ItemData, position: Vec2) {
        let inBox = this.ndTrans.getBoundingBoxToWorld().contains(position);

        if (inBox) {
            this.inBox = true;

            //TODO满足条件为背包且当前背包内没有物品以及替换逻辑
            let canPut = false;

            if (data.Type == XGTS_ItemType.Weapon || data.Type == XGTS_ItemType.Helmet || data.Type == XGTS_ItemType.BodyArmor) {
                switch (this.type) {
                    case XGTS_WeaponContentType.Primary:
                        if (data.WeaponData)
                            canPut = XGTS_WeaponData.IsMain(data.WeaponData.Type) && XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary == null;
                        break;
                    case XGTS_WeaponContentType.Secondary:
                        if (data.WeaponData)
                            canPut = XGTS_WeaponData.IsMain(data.WeaponData.Type) && XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary == null;
                        break;
                    case XGTS_WeaponContentType.Pistol:
                        if (data.WeaponData)
                            canPut = XGTS_WeaponData.IsPistol(data.WeaponData.Type) && XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol == null;
                        break;
                    case XGTS_WeaponContentType.Helmet:
                        canPut = data.Type == XGTS_ItemType.Helmet && XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet == null;
                        break;
                    case XGTS_WeaponContentType.BodyArmor:
                        canPut = data.Type == XGTS_ItemType.BodyArmor && XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor == null;
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

    OnDragStart(item: XGTS_Item) {
    }

    OnDragging(item: XGTS_Item, position: Vec2) {
        this.CanEquip(item.data, position);
    }

    OnDragEnd(item: XGTS_Item, position: Vec2) {
        if (this.CanEquip(item.data, position)) {
            this.ClearPutTipState();
            let data = item.data;
            XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.Equip);

            switch (this.type) {
                case XGTS_WeaponContentType.Primary:
                    XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary = data;
                    break;
                case XGTS_WeaponContentType.Secondary:
                    XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary = data;
                    break;
                case XGTS_WeaponContentType.Pistol:
                    XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol = data;
                    break;
                case XGTS_WeaponContentType.Helmet:
                    XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet = data;
                    break;
                case XGTS_WeaponContentType.BodyArmor:
                    XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor = data;
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
        let data: XGTS_ItemData = null;
        let contentSize = size();
        this.Icon.spriteFrame = null;

        switch (this.type) {
            case XGTS_WeaponContentType.Primary:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary;
                contentSize = size(450, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "主武器";
                }
                break;
            case XGTS_WeaponContentType.Secondary:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary;
                contentSize = size(450, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "副武器";
                }
                break;
            case XGTS_WeaponContentType.Pistol:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol;
                contentSize = size(150, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "手枪";
                }
                break;
            case XGTS_WeaponContentType.Helmet:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet;
                contentSize = size(300, 150);
                if (data) {
                    this.Name_Lb.string = data.Name;
                } else {
                    this.Name_Lb.string = "头盔";
                }
                break;
            case XGTS_WeaponContentType.BodyArmor:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor;
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

            if (!Tools.IsEmptyStr(XGTS_DataManager.GetGunUseSkin(data.Name))) {
                path = `${XGTS_DataManager.GetGunUseSkin(data.Name)}`;
            }

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${path}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(this.Icon, contentSize.width, contentSize.height, 15);
            });
        }

        this.RefreshContentLabel();
    }

    RefreshContentLabel() {
        let data: XGTS_ItemData = null;
        switch (this.type) {
            case XGTS_WeaponContentType.Primary:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Desc_Lb.string = `${count}/${XGTS_DataManager.PlayerDatas[this.playerNum].GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case XGTS_WeaponContentType.Secondary:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Desc_Lb.string = `${count}/${XGTS_DataManager.PlayerDatas[this.playerNum].GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case XGTS_WeaponContentType.Pistol:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol;
                if (data) {
                    let count = 0;
                    if (data.WeaponData.Ammo) count = data.WeaponData.Ammo.Count;
                    this.Desc_Lb.string = `${count}/${XGTS_DataManager.PlayerDatas[this.playerNum].GetAmmoCountByType(data.WeaponData.AmmoType)}`;
                }
                break;
            case XGTS_WeaponContentType.Helmet:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet;
                if (data) {
                    this.Desc_Lb.string = `${data.EquipData.Durability}/${data.EquipData.MaxDurability}`;
                }
                break;
            case XGTS_WeaponContentType.BodyArmor:
                data = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor;
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
        EventManager.Scene.off(XGTS_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshContentLabel, this);
    }
}