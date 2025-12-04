import { _decorator, Component, director, Event, EventTouch, find, instantiate, Label, labelAssembler, Layout, Node, Prefab, ScrollView, UITransform, v2, Vec2, Vec3 } from 'cc';
import { MTRNX_EventManager, MTRNX_MyEvent } from '../MTRNX_EventManager';
import { MTRNX_GameDate } from '../MTRNX_GameDate';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
import { MTRNX_Constant, MTRNX_GameMode } from '../Data/MTRNX_Constant';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_miniGameSelect')
export class MTRNX_miniGameSelect extends Component {
    scrollView: ScrollView = null;
    content: Node = null;
    keyLabel: Label = null;



    protected onLoad(): void {
        this.scrollView = find("ScrollView", this.node).getComponent(ScrollView);
        this.content = find("ScrollView/view/content", this.node);
        this.keyLabel = find("KeyButton/Label", this.node).getComponent(Label);
    }

    protected onDisable(): void {
        MTRNX_EventManager.off(MTRNX_MyEvent.KeysChanged, this.RefreshKey, this);
    }



    Show() {
        this.onDisable();
        MTRNX_EventManager.on(MTRNX_MyEvent.KeysChanged, this.RefreshKey, this);
        this.RefreshKey();
        this.content.children.forEach((cd, index) => {
            if (MTRNX_GameDate.Instance.MiniGameUnLook[index]) {
                cd.getChildByPath(index + "/开始").active = true;
                cd.getChildByPath(index + "/UnlockLabel").active = false;
            }
        })
    }

    RefreshKey() {
        this.keyLabel.string = `${MTRNX_GameManager.Key}`;
    }

    OnReturnButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.miniGameSelect);
    }

    //按钮事件
    OnButtonClick(btn: EventTouch) {
        if (MTRNX_GameDate.Instance.MiniGameUnLook[Number(btn.target.name)] == false) {
            if (MTRNX_GameManager.Key <= 0) {
                MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.TipPanel, [MTRNX_Constant.Tip.MiNiKeyLow]);
            } else {
                MTRNX_GameManager.Key -= 1;
                MTRNX_GameDate.Instance.MiniGameUnLook[Number(btn.target.name)] = true;
                MTRNX_GameDate.DateSave();
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
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_GameManager.GameMode = MTRNX_GameMode.Sandbox;
        director.loadScene("Game_Mtr");
    }
    //前往背后能源
    GoBeiHouNengYuan() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_GameManager.GameMode = MTRNX_GameMode.背后能源;
        director.loadScene("Game_Mtr");
    }
}