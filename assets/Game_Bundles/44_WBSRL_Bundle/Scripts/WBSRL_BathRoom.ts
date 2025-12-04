import { _decorator, Component, Node } from 'cc';
import { WBSRL_Room } from './WBSRL_Room';
import { WBSRL_GameManager } from './WBSRL_GameManager';
const { ccclass, } = _decorator;

@ccclass('WBSRL_BathRoom')
export class WBSRL_BathRoom extends WBSRL_Room {

    OpenRoom(): void {
        super.OpenRoom();
        WBSRL_GameManager.Instance.HouseMain.children.forEach(e => {
            e.active = e.name == "门2";
        })
    }

    CloseRoom(): void {
        super.CloseRoom();
        WBSRL_GameManager.Instance.HouseMain.children.forEach(e => {
            e.active = e.name != "窗户木板" && e.name != "毯子2";
        })
    }
}


