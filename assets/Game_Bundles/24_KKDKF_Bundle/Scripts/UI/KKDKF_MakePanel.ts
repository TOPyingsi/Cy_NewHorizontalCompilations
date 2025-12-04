import { _decorator, Component, Event, EventTouch, Label, Node } from 'cc';
import { KKDKF_AudioManager } from '../KKDKF_AudioManager';
import { KKDKF_GameData } from '../KKDKF_GameData';
import { KKDKF_Constant } from '../Data/KKDKF_Constant';
import { KKDKF_UIManager } from '../KKDKF_UIManager';
import { KKDKF_GameManager } from '../Game/KKDKF_GameManager';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';

const { ccclass, property } = _decorator;

@ccclass('KKDKF_MakePanel')
export class KKDKF_MakePanel extends Component {

    public LookIndex: number = 0;//查看的饮料



    OnSelectButton(target: EventTouch) {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        this.Open_LC(Number(target.target.name));

    }

    OnExit() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        this.node.active = false;
    }
    OnLCExit() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        this.node.getChildByName("制作流程页面").active = false;
    }

    //打开制作流程
    Open_LC(num: number) {
        this.LookIndex = num;
        this.node.getChildByPath("制作流程页面/流程").children.forEach((cd: Node, index: number) => {
            if (index == num) cd.active = true;
            else cd.active = false;
        })
        this.node.getChildByName("制作流程页面").active = true;
        this.ShowUI();
    }




    //刷新流程页面数据
    ShowUI() {
        let pre = this.node.getChildByPath("制作流程页面");
        let Level = KKDKF_GameData.Instance.CoffeeLevel[this.LookIndex];
        let Price = Math.ceil(KKDKF_Constant.Drink[this.LookIndex].Price * (1 + Level * 0.1));
        pre.getChildByName("等级").getComponent(Label).string = "LV:" + Level;
        pre.getChildByName("属性描述").getComponent(Label).string = "单价:" + Price + "元\n升级：" + (Price * 20) + "元";
    }

    //点击升级按钮

    OnUpLevelClick() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        let Level = KKDKF_GameData.Instance.CoffeeLevel[this.LookIndex];
        let Price = Math.ceil(KKDKF_Constant.Drink[this.LookIndex].Price * (1 + Level * 0.1));
        let LevelUpPrice = Price * 20;
        if (Level >= KKDKF_GameData.Instance.GameData[0]) {
            UIManager.ShowTip("饮料等级无法超过玩家等级！");
            return;
        }
        if (KKDKF_GameData.Instance.Money >= LevelUpPrice) {
            KKDKF_GameManager.Instance.ChanggeMoney(-LevelUpPrice);
            KKDKF_GameData.Instance.CoffeeLevel[this.LookIndex]++;
            KKDKF_GameData.DateSave();
            this.ShowUI();
        } else {
            UIManager.ShowTip("金钱不足，无法升级！");
        }
    }
}


