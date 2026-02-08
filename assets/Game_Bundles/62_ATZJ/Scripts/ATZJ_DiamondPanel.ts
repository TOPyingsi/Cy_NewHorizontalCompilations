import { _decorator, Component, director, Label, Node } from 'cc';
import { ATZJ_EasyControllerEvent } from './ATZJ_EasyController';
import { ATZJ_GameData } from './ATZJ_GameData';
import Banner from '../../../Scripts/Banner';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_DiamondPanel')
export class ATZJ_DiamondPanel extends Component {
    start() {
        this.ShowData();
        director.getScene().on(ATZJ_EasyControllerEvent.ChanggeMoney, this.ShowData, this);
    }

    //刷新显示
    ShowData() {
        this.node.getChildByName("数量").getComponent(Label).string = ATZJ_GameData.Instance.Money.toString();
    }

    OnAddClick() {
        Banner.Instance.ShowVideoAd(() => {
            ATZJ_GameData.Instance.Money += 100;
            UIManager.ShowTip("获得钻石*100！");
        })
    }
}


