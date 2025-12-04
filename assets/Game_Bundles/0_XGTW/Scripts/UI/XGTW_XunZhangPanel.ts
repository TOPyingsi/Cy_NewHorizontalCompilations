import { _decorator, Component, Node, Event } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_AchievementManager, XGTW_AchievementData } from '../Framework/Managers/XGTW_AchievementManager';
import XGTW_AchievementItem from './XGTW_AchievementItem';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_XunZhangPanel')
export default class XGTW_XunZhangPanel extends Component {
    ItemContent: Node | null = null;
    items: XGTW_AchievementItem[] = [];
    protected onLoad(): void {
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.RefreshItems();
    }

    RefreshItems() {
        if (!this.items || this.items.length == 0) {
            XGTW_AchievementManager.AchievementMap.forEach((data: XGTW_AchievementData, key: string) => {
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/AchievementItem", this.ItemContent).then((node: Node) => {
                    let item = node.getComponent(XGTW_AchievementItem);
                    item.Init(data);
                    this.items.push(item);
                });
            });
        } else {
            this.items.forEach(e => e.Refresh());
        }
    }

    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.XunZhangPanel);
                break;
        }
    }
}