import { _decorator, Component, director, Event, find, instantiate, Label, labelAssembler, Layout, Node, Prefab, ScrollView, UITransform, v2, Vec2, Vec3 } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { MTRNX_LvItem } from './MTRNX_LvItem';
import { MTRNX_EventManager, MTRNX_MyEvent } from '../MTRNX_EventManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
import { MTRNX_Constant, MTRNX_GameMode } from '../Data/MTRNX_Constant';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_SelectLvPanel')
export class MTRNX_SelectLvPanel extends Component {
    scrollView: ScrollView = null;
    content: Node = null;
    keyLabel: Label = null;

    lvItems: MTRNX_LvItem[] = [];

    protected onLoad(): void {
        this.scrollView = find("ScrollView", this.node).getComponent(ScrollView);
        this.content = find("ScrollView/view/content", this.node);
        this.keyLabel = find("KeyButton/Label", this.node).getComponent(Label);
    }

    protected onDisable(): void {
        MTRNX_EventManager.off(MTRNX_MyEvent.KeysChanged, this.RefreshKey, this);
    }

    //返回 0-14
    OnLvItemButtonCallBack(index: number) {
        MTRNX_GameManager.Lv = index + 1;
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.LoadingPanel, ["Game_Mtr"]);
    }

    Show() {
        this.onDisable();
        MTRNX_EventManager.on(MTRNX_MyEvent.KeysChanged, this.RefreshKey, this);

        this.lvItems.forEach(element => element.node.destroy());
        this.lvItems = [];

        let data = MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal ? MTRNX_Constant.LvDatas : MTRNX_Constant.EndlessLvDatas;
        for (let i = 0; i < data.length; i++) {
            MTRNX_ResourceUtil.LoadPrefab("UI/LvItem").then((prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.content);
                let item = node.getComponent(MTRNX_LvItem);
                item.Init(i, data[i], this.OnLvItemButtonCallBack);
                this.lvItems.push(item);
            });
        }

        this.RefreshKey();
    }

    RefreshKey() {
        this.keyLabel.string = `${MTRNX_GameManager.Key}`;
    }

    OnReturnButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.SelectLvPanel);
    }

    OnAddKeyButtonClick() {
        return;
        Banner.Instance.ShowVideoAd(() => {
            MTRNX_GameManager.Key += 1;
        });
    }
}