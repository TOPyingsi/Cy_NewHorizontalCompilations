import { _decorator, Component, Label, Sprite, Node, Event, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_ValueBar from "./XGTW_ValueBar";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';

@ccclass('XGTW_BuyPanel')
export default class XGTW_BuyPanel extends Component {
    TitleLabel: Label | null = null;
    BuyBarLabel: Label | null = null;
    BuyButtonLabel: Label | null = null;
    Icon: Sprite | null = null;
    ValuesContent: Node | null = null;
    count: number = 0;
    data: XGTW_ItemData = null;
    valueBars: Node[] = [];
    protected onLoad(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
        this.BuyBarLabel = NodeUtil.GetComponent("BuyBarLabel", this.node, Label);
        this.BuyButtonLabel = NodeUtil.GetComponent("BuyButtonLabel", this.node, Label);
        this.ValuesContent = NodeUtil.GetNode("ValuesContent", this.node);
    }
    Show(data: XGTW_ItemData) {
        this.data = data;
        this.count = 1;
        this.TitleLabel.string = `${data.Name}`;

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });

        this.RefreshValues(data);

        this.Refresh();
    }
    RefreshValues(data) {
        let hasValues = false;
        this.valueBars.forEach(e => PoolManager.PutNode(e));
        let type = XGTW_ItemType[`${data.Type}`];
        if (XGTW_ItemData.IsGun(type)) {
            hasValues = true;
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                node.getComponent(XGTW_ValueBar).Init(data.Damage / 90, `伤害`);
                this.valueBars.push(node);
            });
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                node.getComponent(XGTW_ValueBar).Init((1.5 - data.FireRate) / 1.5, `射速`);
                this.valueBars.push(node);
            });
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                node.getComponent(XGTW_ValueBar).Init(data.Recoil / 0.5, `后坐力`);
                this.valueBars.push(node);
            });
        }

        if (XGTW_ItemData.IsEquip(type)) {
            hasValues = true;

            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                node.getComponent(XGTW_ValueBar).Init(data.Lv / 5, `防护等级`);
                this.valueBars.push(node);
            });
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                node.getComponent(XGTW_ValueBar).Init(data.Durability / 100, `耐久度`);
                this.valueBars.push(node);
            });
        }

        if (XGTW_ItemData.IsMedicine(type)) {
            hasValues = true;

            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                node.getComponent(XGTW_ValueBar).Init(data.HP / 500, `血量`);
                this.valueBars.push(node);
            });
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                node.getComponent(XGTW_ValueBar).Init((6 - data.Time) / 6, `速度`);
                this.valueBars.push(node);
            });
        }


        this.Icon.node.setPosition(-200, hasValues ? 40 : -30);

    }
    Refresh() {
        this.BuyBarLabel.string = `${this.count}`;
        this.BuyButtonLabel.string = `${this.count * this.data.Price}`;
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        let maxCount = this.data.Type == XGTW_ItemType[XGTW_ItemType.子弹] ? 30 : 5;

        switch (event.target.name) {
            case "Mask":
            case "CloseButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.BuyPanel);
                break;
            case "BuyButton":
                if (XGTW_DataManager.Money >= this.count * this.data.Price) {
                    XGTW_DataManager.Money -= this.count * this.data.Price;

                    for (let i = 0; i < this.count; i++) {
                        XGTW_DataManager.AddPlayerItem(this.data, true);
                    }

                    UIManager.ShowTip("购买成功");
                    EventManager.Scene.emit(XGTW_Event.REFRESH_ITEMS);
                } else {
                    UIManager.ShowTip("金钱不足");
                }
                break;
            case "AddButton":
                this.count++;
                this.count = Tools.Clamp(this.count, 1, maxCount)
                this.Refresh();
                break;
            case "ReduceButton":
                this.count--;
                this.count = Tools.Clamp(this.count, 1, maxCount)
                this.Refresh();
                break;

        }
    }
}