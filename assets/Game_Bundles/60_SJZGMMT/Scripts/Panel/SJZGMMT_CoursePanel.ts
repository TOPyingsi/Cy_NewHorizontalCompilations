import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import Banner from '../../../../Scripts/Banner';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';

const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_CoursePanel')
export class SJZGMMT_CoursePanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.CoursePanel);
                break;


        }
    }
}


