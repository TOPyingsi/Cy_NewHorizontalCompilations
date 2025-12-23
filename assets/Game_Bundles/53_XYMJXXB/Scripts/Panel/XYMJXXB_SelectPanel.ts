import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XYMJXXB_Constant } from '../XYMJXXB_Constant';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_Incident } from '../XYMJXXB_Incident';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_SelectPanel')
export class XYMJXXB_SelectPanel extends Component {
    start() {

    }
    protected onEnable(): void {
        XYMJXXB_Constant.level = 1;
        this.ShowState();
    }
    OnExit() {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }
    private MinMoney: number[] = [0, 5000000, 50000000, 300000000, 2000000000];
    //验资
    Verificationassets(id: number) {
        if (XYMJXXB_GameData.Instance.Money >= this.MinMoney[id]) {
            XYMJXXB_Constant.level = id + 1;
            this.ShowState();
        } else {
            UIManager.ShowTip(`此难度需要现金资产达到${XYMJXXB_Incident.GetMaxNum(this.MinMoney[id])}才能进入！`);
        }
    }

    OnClick(Btn: EventTouch) {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
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
            case "天宫":
                XYMJXXB_Constant.mapID = Btn.target.name;
                director.loadScene("XYMJXXB_Game");
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
        nd.y = 320 - ((XYMJXXB_Constant.level - 1) * 160);
    }
}


