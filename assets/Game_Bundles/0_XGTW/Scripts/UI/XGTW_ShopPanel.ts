import { _decorator, Component, Label, Node, Event } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Item from "./XGTW_Item";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import Banner from '../../../../Scripts/Banner';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { XGTW_头盔, XGTW_防弹衣, XGTW_手枪, XGTW_突击步枪, XGTW_冲锋枪, XGTW_射手步枪, XGTW_栓动步枪, XGTW_轻机枪, XGTW_霰弹枪, XGTW_投掷物, XGTW_子弹, XGTW_药品 } from '../Datas/XGTW_Data';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_ShopPanel')
export default class XGTW_ShopPanel extends Component {
    MoneyLabel: Label | null = null;
    Buttons: Node | null = null;
    ItemContent: Node | null = null;
    type: XGTW_ItemType;
    items: Node[] = [];
    protected onLoad(): void {
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
    }
    Show(type: XGTW_ItemType = XGTW_ItemType.头盔) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.RefreshMoney();
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        this.type = type;
        this.RefreshButtons();
        this.RefreshItems();
    }
    RefreshItems() {
        this.items.forEach(e => PoolManager.PutNode(e));

        let datas = XGTW_DataManager.ItemDatas.get(this.type);
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            const type = this.type;
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/Item", this.ItemContent).then(e => {
                let item = e.getComponent(XGTW_Item);
                this.items.push(e);
                switch (type) {
                    case XGTW_ItemType.头盔: item.头盔(data as XGTW_头盔); break;
                    case XGTW_ItemType.防弹衣: item.防弹衣(data as XGTW_防弹衣); break;
                    case XGTW_ItemType.手枪: item.手枪(data as XGTW_手枪); break;
                    case XGTW_ItemType.突击步枪: item.突击步枪(data as XGTW_突击步枪); break;
                    case XGTW_ItemType.冲锋枪: item.冲锋枪(data as XGTW_冲锋枪); break;
                    case XGTW_ItemType.射手步枪: item.射手步枪(data as XGTW_射手步枪); break;
                    case XGTW_ItemType.栓动步枪: item.栓动步枪(data as XGTW_栓动步枪); break;
                    case XGTW_ItemType.轻机枪: item.轻机枪(data as XGTW_轻机枪); break;
                    case XGTW_ItemType.霰弹枪: item.霰弹枪(data as XGTW_霰弹枪); break;
                    case XGTW_ItemType.投掷物: item.投掷物(data as XGTW_投掷物); break;
                    case XGTW_ItemType.子弹: item.子弹(data as XGTW_子弹); break;
                    case XGTW_ItemType.药品: item.药品(data as XGTW_药品); break;
                }
            })
        }
    }
    RefreshButtons() {
        this.Buttons.children.forEach(e => {
            let selected = e.name == XGTW_ItemType[this.type];
            e.getChildByName("Selected").active = selected;
        })
    }
    RefreshMoney() {
        this.MoneyLabel.string = `${XGTW_DataManager.Money}`;
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        this.type = XGTW_ItemType[`${event.target.name}`];
        this.RefreshButtons();
        this.RefreshItems();
    }
    OnAddMoneyButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        Banner.Instance.ShowVideoAd(() => {
            XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.GetMoney);
            XGTW_DataManager.Money += 20000;
        });
    }
    OnReturnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.ShopPanel);
    }
    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshMoney, this.RefreshMoney, this)
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshMoney, this.RefreshMoney, this)
    }
}