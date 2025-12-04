import { _decorator, Component, EventTouch, Label, Node, Sprite, SpriteFrame, UITransform } from 'cc';
import { KKDKF_GameData } from '../KKDKF_GameData';
import { KKDKF_Incident } from '../KKDKF_Incident';
import { KKDKF_GameManager } from './KKDKF_GameManager';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { KKDKF_AudioManager } from '../KKDKF_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_commodity')
export class KKDKF_commodity extends Component {
    @property()
    public Id: number = 0;//ID

    public state: number = -1;//0:墙纸id，1.灯，2.高脚凳id，3.椅子4.收银台id
    protected start(): void {
        if (this.Id >= 0 && this.Id < 4) this.state = 0;
        if (this.Id >= 4 && this.Id < 8) this.state = 1;
        if (this.Id >= 8 && this.Id < 12) this.state = 2;
        if (this.Id >= 12 && this.Id < 14) this.state = 3;
        if (this.Id >= 14 && this.Id < 16) this.state = 4;
        this.Init();
        this.Show();
    }

    Init() {    //初始化
        this.node.getChildByPath("购买/数额").getComponent(Label).string = KKDKF_GameData.Instance.UnLookPrice[this.Id] + ``;

    }

    //根据解锁状态显示当前状态
    Show() {
        if (KKDKF_GameData.Instance.UnLook[this.Id] == 0) {//未解锁
            this.node.getChildByName("购买").active = true;
            this.node.getChildByName("选择").active = false;
        } else {//解锁
            if (KKDKF_GameData.Instance.BGState[this.state] == this.Id) {//已装备
                this.node.getChildByName("购买").active = false;
                this.node.getChildByName("选择").active = false;
                this.node.getChildByName("选中").active = true;
            } else {
                this.node.getChildByName("购买").active = false;
                this.node.getChildByName("选择").active = true;
                this.node.getChildByName("选中").active = false;
            }
        }
    }

    OnClick(target: EventTouch) {
        switch (target.target.name) {
            case "购买":
                KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
                if (KKDKF_GameData.Instance.Money >= KKDKF_GameData.Instance.UnLookPrice[this.Id]) {
                    KKDKF_GameManager.Instance.ChanggeMoney(-KKDKF_GameData.Instance.UnLookPrice[this.Id]);
                    KKDKF_GameData.Instance.UnLook[this.Id] = 1;
                    this.Show();
                    UIManager.ShowTip("购买成功！");
                } else {
                    UIManager.ShowTip("金钱不足，无法购买！");
                }
                break;
            case "选择":
                KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
                KKDKF_GameData.Instance.BGState[this.state] = this.Id;
                UIManager.ShowTip("已切换改外观");
                this.node.parent.children.forEach((cd) => { cd.getComponent(KKDKF_commodity)?.Show(); })
                KKDKF_GameManager.Instance.Show_Decorate();
                break;
        }
    }
}


