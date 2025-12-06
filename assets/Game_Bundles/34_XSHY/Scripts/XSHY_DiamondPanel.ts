import { _decorator, Component, director, Label, Node } from 'cc';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_GameData } from './XSHY_GameData';
import Banner from '../../../Scripts/Banner';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_DiamondPanel')
export class XSHY_DiamondPanel extends Component {
    start() {
        this.ShowData();
        director.getScene().on(XSHY_EasyControllerEvent.ChanggeMoney, this.ShowData, this);
    }

    //刷新显示
    ShowData() {
        this.node.getChildByName("数量").getComponent(Label).string = XSHY_GameData.Instance.Money.toString();
    }

    OnAddClick() {
        Banner.Instance.ShowVideoAd(() => {
            XSHY_GameData.Instance.Money += 100;
            UIManager.ShowTip("获得钻石*100！");
        })
    }
}


