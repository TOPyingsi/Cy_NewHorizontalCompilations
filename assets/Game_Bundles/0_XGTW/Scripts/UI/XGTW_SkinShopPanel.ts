import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_SkinItem from "./XGTW_SkinItem";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_头盔, XGTW_防弹衣, XGTW_手枪, XGTW_突击步枪, XGTW_冲锋枪, XGTW_射手步枪, XGTW_栓动步枪, XGTW_轻机枪, XGTW_霰弹枪, XGTW_投掷物, XGTW_子弹, XGTW_药品 } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_SkinShopPanel')
export default class XGTW_SkinShopPanel extends Component {
    ItemContent: Node | null = null;
    items: Node[] = [];
    protected onLoad(): void {
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
    }
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        this.RefreshItems();
    }
    RefreshItems() {
        this.items.forEach(e => PoolManager.PutNode(e));

        for (let i = 0; i < XGTW_DataManager.JunXuItems.length; i++) {
            const data = XGTW_DataManager.JunXuItems[i];
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/SkinItem", this.ItemContent).then(e => {
                let item = e.getComponent(XGTW_SkinItem);
                this.items.push(e);
                switch (XGTW_ItemType[`${data.Type}`]) {
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
    OnReturnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.SkinShopPanel);
    }
}