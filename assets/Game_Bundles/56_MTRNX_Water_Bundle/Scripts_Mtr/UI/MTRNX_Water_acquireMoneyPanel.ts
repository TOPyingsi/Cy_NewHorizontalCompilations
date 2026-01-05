import { _decorator, Component, Node } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { MTRNX_Water_Include } from '../MTRNX_Water_Include';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_acquireMoneyPanel')
export class MTRNX_Water_acquireMoneyPanel extends Component {
    Show() {

    }

    OnLook() {
        Banner.Instance.ShowVideoAd(() => {
            MTRNX_Water_Include.AddPoint(1000, true);
            MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.acquireMoneyPanel);
        })
    }
    OnExit() {
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.acquireMoneyPanel);
    }
}


