import { _decorator, Component, Node, Label, Sprite, Toggle, Event, Color, SpriteFrame, v2, color } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_ZaHuoItem from './XGTW_ZaHuoItem';
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_KanChaShopPanel')
export default class XGTW_KanChaShopPanel extends Component {
    ItemContent: Node | null = null;
    ZhuangBanButton: Node | null = null;
    TeShuButton: Node | null = null;
    MoneyLabel: Label = null;
    SkinPieceLabel: Label = null;
    HuiZhangPieceLabel: Label = null;
    KCQBLabel: Label = null;

    items: Node[] = [];
    selectItemData: any = null;

    protected onLoad(): void {
        this.ZhuangBanButton = NodeUtil.GetNode("ZhuangBanButton", this.node);
        this.TeShuButton = NodeUtil.GetNode("TeShuButton", this.node);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.SkinPieceLabel = NodeUtil.GetComponent("SkinPieceLabel", this.node, Label);
        this.HuiZhangPieceLabel = NodeUtil.GetComponent("HuiZhangPieceLabel", this.node, Label);
        this.KCQBLabel = NodeUtil.GetComponent("KCQBLabel", this.node, Label);
    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.碎片装扮));
        this.RefreshButtonState("ZhuangBanButton");
        this.RefreshMoney();
        this.RefreshSkinPiece();
        this.RefreshHuiZhangPiece();
        this.RefreshKCQB();
    }

    RefreshItems(items: XGTW_ItemData[]) {
        this.items.forEach(e => PoolManager.PutNode(e));

        for (let i = 0; i < items.length; i++) {
            const data = items[i];
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ZaHuoItem", this.ItemContent).then(e => {
                let item = e.getComponent(XGTW_ZaHuoItem);
                item.Init(data, this.OnItemCallback.bind(this));
                this.items.push(e);
            })
        }
    }

    OnItemCallback(data: any) {
        this.selectItemData = data;

        if (XGTW_ItemData.GetItemType(data.Type) == XGTW_ItemType.碎片装扮) {
            if (PrefsManager.GetBool(`${data.Type}${data.Name}`)) {
                UIManager.ShowTip("装扮成功");
                XGTW_DataManager.PlayerData.Skin_Bulletproof = XGTW_DataManager.GetPieceSkinData(data.Name);
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
            } else {
                if (XGTW_DataManager.SkinPiece >= data.Price) {
                    PrefsManager.SetBool(`${data.Type}${data.Name}`, true);
                    XGTW_DataManager.SkinPiece -= data.Price;
                } else {
                    UIManager.ShowTip("碎片不足");
                }
            }
        }

        if (data.Name == "能源电池") {
            if (XGTW_DataManager.HuiZhangPiece >= data.Price) {
                XGTW_DataManager.EnergyBattery++;
                XGTW_DataManager.HuiZhangPiece -= data.Price;
                UIManager.ShowTip("兑换成功");
            } else {
                UIManager.ShowTip("徽章不足");
            }
        }

        if (data.Name == "勘察情报") {
            if (XGTW_DataManager.Money >= data.Price) {
                XGTW_DataManager.KCQB++;
                XGTW_DataManager.Money -= data.Price;
                UIManager.ShowTip("兑换成功");
            } else {
                UIManager.ShowTip("金钱不足");
            }
        }

        this.items.forEach(e => e.getComponent(XGTW_ZaHuoItem).Refresh());
    }

    RefreshButtonState(state: string) {
        this.ZhuangBanButton.getChildByName("Select").active = state == "ZhuangBanButton";
        this.TeShuButton.getChildByName("Select").active = state == "TeShuButton";
        this.ZhuangBanButton.getChildByName("Label").getComponent(Label).color = state == "ZhuangBanButton" ? color().fromHEX("#FFAA00") : Color.WHITE;
        this.TeShuButton.getChildByName("Label").getComponent(Label).color = state == "TeShuButton" ? color().fromHEX("#FFAA00") : Color.WHITE;
    }

    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        switch (event.target.name) {
            case "ZhuangBanButton":
                this.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.碎片装扮));
                this.RefreshButtonState(event.target.name);
                break;

            case "TeShuButton":
                this.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.特殊道具));
                this.RefreshButtonState(event.target.name);
                break;

            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.KanChaShopPanel);
                break;

        }
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${XGTW_DataManager.Money}`;
    }
    RefreshSkinPiece() {
        this.SkinPieceLabel.string = `${XGTW_DataManager.SkinPiece}`;
    }
    RefreshHuiZhangPiece() {
        this.HuiZhangPieceLabel.string = `${XGTW_DataManager.HuiZhangPiece}`;
    }
    RefreshKCQB() {
        this.KCQBLabel.string = `${XGTW_DataManager.KCQB}`;
    }

    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.on(XGTW_Event.RefreshSkinPiece, this.RefreshSkinPiece, this);
        EventManager.on(XGTW_Event.RefreshHuiZhangPiece, this.RefreshHuiZhangPiece, this);
        EventManager.on(XGTW_Event.RefreshKCQB, this.RefreshKCQB, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.off(XGTW_Event.RefreshSkinPiece, this.RefreshSkinPiece, this);
        EventManager.off(XGTW_Event.RefreshHuiZhangPiece, this.RefreshHuiZhangPiece, this);
        EventManager.off(XGTW_Event.RefreshKCQB, this.RefreshKCQB, this);
    }
}