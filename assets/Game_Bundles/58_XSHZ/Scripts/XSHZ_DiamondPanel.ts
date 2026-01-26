import { _decorator, Component, director, Label, Node } from 'cc';
import { XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_GameData } from './XSHZ_GameData';
import Banner from '../../../Scripts/Banner';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_DiamondPanel')
export class XSHZ_DiamondPanel extends Component {
    start() {
        this.ShowData();
        director.getScene().on(XSHZ_EasyControllerEvent.ChanggeMoney, this.ShowData, this);
    }

    //刷新显示
    ShowData() {
        this.node.getChildByName("数量").getComponent(Label).string = XSHZ_GameData.Instance.Money.toString();
    }

    OnAddClick() {
        Banner.Instance.ShowVideoAd(() => {
            XSHZ_GameData.Instance.Money += 100;
            UIManager.ShowTip("获得钻石*100！");
        })
    }
}


