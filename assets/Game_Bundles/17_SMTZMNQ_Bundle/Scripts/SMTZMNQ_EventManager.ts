import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

export class SMTZMNQ_MyEvent {
    public static SMTZMNQ_HIDEBODY: string = "SMTZMNQ_HIDEBODY";
    public static SMTZMNQ_HIDEITEMMN: string = "SMTZMNQ_HIDEITEMMN";
    public static SMTZMNQ_HIDEITEMMNNL_LEFT: string = "SMTZMNQ_HIDEITEMMNNL_LEFT";
    public static SMTZMNQ_HIDEITEMMNNL_RIGHT: string = "SMTZMNQ_HIDEITEMMNNL_RIGHT";
}

export class SMTZMNQ_EventManager {
    public static get Scene() {
        return director.getScene();
    }
    public static on(type: string, callback: Function, target?: any) {
        director.getScene().on(type, callback, target);
    }
    public static off(type: string, callback?: Function, target?: any) {
        director.getScene()?.off(type, callback, target);
    }
}

