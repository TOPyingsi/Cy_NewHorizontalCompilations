import { _decorator, Component, Node, Event } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Item from "./XGTW_Item";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_RewardPanel')
export default class XGTW_RewardPanel extends Component {
    Panel: Node | null = null;
    Content: Node | null = null;
    Item: Node | null = null;
    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Content = NodeUtil.GetNode("Content", this.node);
    }
    Show(data: XGTW_ItemData) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        if (this.Item) PoolManager.PutNode(this.Item);
        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/Item", this.Content).then((node) => {
            this.Item = node;
            let goods = node.getComponent(XGTW_Item);
            goods.InitSimple(data);
        });
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "Mask":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.RewardPanel);
                break;
        }
    }
}