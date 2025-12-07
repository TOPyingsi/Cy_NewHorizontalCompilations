import { _decorator, Component, Node } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { MTRNX_Include } from '../MTRNX_Include';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_acquireDebrisPanel')
export class MTRNX_acquireDebrisPanel extends Component {
    Show() {

    }

    OnLook() {
        Banner.Instance.ShowVideoAd(() => {
            MTRNX_Include.AddDebris(100, true);
            MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.acquireDebrisPanel);
        })
    }
    OnExit() {
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.acquireDebrisPanel);
    }
}


