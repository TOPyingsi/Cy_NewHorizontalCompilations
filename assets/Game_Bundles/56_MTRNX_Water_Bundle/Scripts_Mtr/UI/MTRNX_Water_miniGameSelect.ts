import { _decorator, Component, director, Event, EventTouch, find, instantiate, Label, labelAssembler, Layout, Node, Prefab, ScrollView, UITransform, v2, Vec2, Vec3 } from 'cc';
import { MTRNX_Water_EventManager, MTRNX_Water_MyEvent } from '../MTRNX_Water_EventManager';
import { MTRNX_Water_GameDate } from '../MTRNX_Water_GameDate';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';
import { MTRNX_Water_Constant, MTRNX_Water_GameMode } from '../Data/MTRNX_Water_Constant';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_miniGameSelect')
export class MTRNX_Water_miniGameSelect extends Component {
    scrollView: ScrollView = null;
    content: Node = null;
    keyLabel: Label = null;



    protected onLoad(): void {
        this.scrollView = find("ScrollView", this.node).getComponent(ScrollView);
        this.content = find("ScrollView/view/content", this.node);
        this.keyLabel = find("KeyButton/Label", this.node).getComponent(Label);
    }

    protected onDisable(): void {
        MTRNX_Water_EventManager.off(MTRNX_Water_MyEvent.KeysChanged, this.RefreshKey, this);
    }



    Show() {
        this.onDisable();
        MTRNX_Water_EventManager.on(MTRNX_Water_MyEvent.KeysChanged, this.RefreshKey, this);
        this.RefreshKey();
        this.content.children.forEach((cd, index) => {
            if (MTRNX_Water_GameDate.Instance.MiniGameUnLook[index]) {
                cd.getChildByPath(index + "/开始").active = true;
                cd.getChildByPath(index + "/UnlockLabel").active = false;
            }
        })
    }

    RefreshKey() {
        this.keyLabel.string = `${MTRNX_Water_GameManager.Key}`;
    }

    OnReturnButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.miniGameSelect);
    }

    //按钮事件
    OnButtonClick(btn: EventTouch) {
        if (MTRNX_Water_GameDate.Instance.MiniGameUnLook[Number(btn.target.name)] == false) {
            if (MTRNX_Water_GameManager.Key <= 0) {
                MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.TipPanel, [MTRNX_Water_Constant.Tip.MiNiKeyLow]);
            } else {
                MTRNX_Water_GameManager.Key -= 1;
                MTRNX_Water_GameDate.Instance.MiniGameUnLook[Number(btn.target.name)] = true;
                MTRNX_Water_GameDate.DateSave();
                btn.target.getChildByName("开始").active = true;
                btn.target.getChildByName("UnlockLabel").active = false;
            }
            return;
        }
        switch (btn.target.name) {
            case "0": this.GoSandbox(); break;//沙盒模式
            case "1": this.GoBeiHouNengYuan(); break;//背后能源
        }

    }

    //前往沙盒模式
    GoSandbox() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_GameManager.GameMode = MTRNX_Water_GameMode.Sandbox;
        director.loadScene("Game_Water_Mtr");
    }
    //前往背后能源
    GoBeiHouNengYuan() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_GameManager.GameMode = MTRNX_Water_GameMode.背后能源;
        director.loadScene("Game_Water_Mtr");
    }
}