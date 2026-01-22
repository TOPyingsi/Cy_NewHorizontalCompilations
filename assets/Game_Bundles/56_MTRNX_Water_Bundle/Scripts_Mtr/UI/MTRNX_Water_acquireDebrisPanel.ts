import { _decorator, Component, Node } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { MTRNX_Water_Include } from '../MTRNX_Water_Include';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_acquireDebrisPanel')
export class MTRNX_Water_acquireDebrisPanel extends Component {
    Show() {

    }

    OnLook() {
        Banner.Instance.ShowVideoAd(() => {
            MTRNX_Water_Include.AddDebris(100, true);
            MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.acquireDebrisPanel);
        })
    }
    OnExit() {
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.acquireDebrisPanel);
    }
}


