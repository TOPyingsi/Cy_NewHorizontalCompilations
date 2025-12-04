import { _decorator, Component, director, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { XGTS_UIManager } from './XGTS_UIManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_DataManager } from '../XGTS_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_ExitPanel')
export class XGTS_ExitPanel extends PanelBase {


    OnYesClick() {
        XGTS_DataManager.PlayerDatas[0]?.ClearBackpack();
        XGTS_DataManager.PlayerDatas[1]?.ClearBackpack();
        XGTS_DataManager.PlayerDatas[2]?.ClearBackpack();
        director.loadScene("XGTS_Start");
    }
    OnNoClick() {

        XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.ExitPanel);
    }
}


