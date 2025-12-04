import { _decorator, director, Scene } from 'cc';

export class TLWLSJ_MyEvent {
    static TLWLSJ_MOVE = "TLWLSJ_MOVE";
    static TLWLSJ_MOVEMENT = "TLWLSJ_MOVEMENT";
    static TLWLSJ_MOVEMENT_STOP = "TLWLSJ_MOVEMENT_STOP";
    static TLWLSJ_Fire = "TLWLSJ_Fire";
    static TLWLSJ_SET_ATTACK_DIR = "TLWLSJ_SET_ATTACK_DIR";
    static TLWLSJ_WEAPON_UNCHECKED = "TLWLSJ_WEAPON_UNCHECKED";
    static TLWLSJ_MAGAZINE_UNCHECKED = "TLWLSJ_MAGAZINE_UNCHECKED";
    static TLWLSJ_BULLET_UNCHECKED = "TLWLSJ_BULLET_UNCHECKED";
    static TLWLSJ_SHOPITEM = "TLWLSJ_SHOPITEM";
    static TLWLSJ_ATTACKSTART = "TLWLSJ_ATTACKSTART";
    static TLWLSJ_ATTACKEND = "TLWLSJ_ATTACKEND";
    static TLWLSJ_RELOAD = "TLWLSJ_RELOAD";
    static TLWLSJ_UPDATESLD = "TLWLSJ_UPDATESLD";
    static TLWLSJ_FL = "TLWLSJ_FL";
}

export class TLWLSJ_EventManager {
    public static get Scene(): Scene {
        return director.getScene();
    }

    public static on(type: string, callback: Function, target?: any) {
        director.getScene().on(type, callback, target);
    }

    public static off(type: string, callback?: Function, target?: any) {
        director.getScene()?.off(type, callback, target);
    }
}