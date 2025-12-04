import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XYMJ_Constant } from '../XYMJ_Constant';
import { XYMJ_AudioManager } from '../XYMJ_AudioManager';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_Incident } from '../XYMJ_Incident';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_SelectPanel')
export class XYMJ_SelectPanel extends Component {
    start() {

    }
    protected onEnable(): void {
        XYMJ_Constant.level = 1;
        this.ShowState();
    }
    OnExit() {
        XYMJ_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }
    private MinMoney: number[] = [0, 5000000, 50000000, 300000000, 2000000000];
    //验资
    Verificationassets(id: number) {
        if (XYMJ_GameData.Instance.Money >= this.MinMoney[id]) {
            XYMJ_Constant.level = id + 1;
            this.ShowState();
        } else {
            UIManager.ShowTip(`此难度需要现金资产达到${XYMJ_Incident.GetMaxNum(this.MinMoney[id])}才能进入！`);
        }
    }

    OnClick(Btn: EventTouch) {
        XYMJ_AudioManager.globalAudioPlay("点击");
        switch (Btn.target.name) {
            case "小学部":
            case "初中部":
            case "高中部":
            case "天文台":
            case "休闲区":
            case "实验楼":
            case "体育馆":
            case "食堂":
            case "商场":
                XYMJ_Constant.mapID = Btn.target.name;
                director.loadScene("XYMJ_Game");
                break;
            case "新手": this.Verificationassets(0); break;
            case "简单": this.Verificationassets(1); break;
            case "普通": this.Verificationassets(2); break;
            case "困难": this.Verificationassets(3); break;
            case "地狱": this.Verificationassets(4); break;
        }


    }

    ShowState() {
        let nd = this.node.getChildByPath("难度选择/选中框");
        nd.y = 320 - ((XYMJ_Constant.level - 1) * 160);
    }
}


