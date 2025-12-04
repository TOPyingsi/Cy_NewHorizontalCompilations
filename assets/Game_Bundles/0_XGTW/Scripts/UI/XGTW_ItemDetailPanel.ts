import { _decorator, Component, Label, Sprite, Node, Event, v3, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_ValueBar from "./XGTW_ValueBar";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_ItemDetailPanel')
export default class XGTW_ItemDetailPanel extends Component {
    TitleLabel: Label | null = null;
    DescLabel: Label | null = null;
    PriceLabel: Label | null = null;
    Icon: Sprite | null = null;
    ValuesContent: Node | null = null;
    valueBars: Node[] = [];
    protected onLoad(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, Label);
        this.PriceLabel = NodeUtil.GetComponent("PriceLabel", this.node, Label);
        this.ValuesContent = NodeUtil.GetNode("ValuesContent", this.node);
    }
    Show(data: XGTW_ItemData) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.TitleLabel.string = `${data.Name}`;
        this.PriceLabel.string = `参考单价：${data.Price}`;
        this.DescLabel.string = data.hasOwnProperty("Desc") ? `${(data as any).Desc}` : ``;

        let scale = 2;
        if (data.Type == XGTW_ItemType[XGTW_ItemType.头盔]) {
            scale = 1.6;
            this.DescLabel.string = `防护等级：${(data as any).Lv}`;
        }
        if (data.Type == XGTW_ItemType[XGTW_ItemType.防弹衣]) {
            scale = 1.8;
            this.DescLabel.string = `防护等级：${(data as any).Lv}`;
        }
        if (data.Type == XGTW_ItemType[XGTW_ItemType.子弹]) {
            scale = 1.6;
            this.DescLabel.string = `${(data as any).Name}`;
        }

        this.Icon.node.setScale(v3(scale, scale));

        this.RefreshValues(data);

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });

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

        this.Icon.node.setPosition(hasValues ? -200 : 0, 0);
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "Mask":
            case "CloseButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.ItemDetailPanel);
                break;
        }
    }
}
