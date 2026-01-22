import { _decorator, Component, director, Event, find, instantiate, Label, labelAssembler, Layout, Node, Prefab, ScrollView, UITransform, v2, Vec2, Vec3 } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { MTRNX_Water_LvItem } from './MTRNX_Water_LvItem';
import { MTRNX_Water_EventManager, MTRNX_Water_MyEvent } from '../MTRNX_Water_EventManager';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';
import { MTRNX_Water_Constant, MTRNX_Water_GameMode } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_ResourceUtil } from '../Utils/MTRNX_Water_ResourceUtil';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_SelectLvPanel')
export class MTRNX_Water_SelectLvPanel extends Component {
    scrollView: ScrollView = null;
    content: Node = null;
    keyLabel: Label = null;

    lvItems: MTRNX_Water_LvItem[] = [];

    protected onLoad(): void {
        this.scrollView = find("ScrollView", this.node).getComponent(ScrollView);
        this.content = find("ScrollView/view/content", this.node);
        this.keyLabel = find("KeyButton/Label", this.node).getComponent(Label);
    }

    protected onDisable(): void {
        MTRNX_Water_EventManager.off(MTRNX_Water_MyEvent.KeysChanged, this.RefreshKey, this);
    }

    //返回 0-14
    OnLvItemButtonCallBack(index: number) {
        MTRNX_Water_GameManager.Lv = index + 1;
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.LoadingPanel, ["Game_Water_Mtr"]);
    }

    Show() {
        this.onDisable();
        MTRNX_Water_EventManager.on(MTRNX_Water_MyEvent.KeysChanged, this.RefreshKey, this);

        this.lvItems.forEach(element => element.node.destroy());
        this.lvItems = [];

        let data = MTRNX_Water_GameManager.GameMode == MTRNX_Water_GameMode.Normal ? MTRNX_Water_Constant.LvDatas : MTRNX_Water_Constant.EndlessLvDatas;
        for (let i = 0; i < data.length; i++) {
            MTRNX_Water_ResourceUtil.LoadPrefab("UI/LvItem").then((prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.content);
                let item = node.getComponent(MTRNX_Water_LvItem);
                item.Init(i, data[i], this.OnLvItemButtonCallBack);
                this.lvItems.push(item);
            });
        }

        this.RefreshKey();
    }

    RefreshKey() {
        this.keyLabel.string = `${MTRNX_Water_GameManager.Key}`;
    }

    OnReturnButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.SelectLvPanel);
    }

    OnAddKeyButtonClick() {
        return;
        Banner.Instance.ShowVideoAd(() => {
            MTRNX_Water_GameManager.Key += 1;
        });
    }
}