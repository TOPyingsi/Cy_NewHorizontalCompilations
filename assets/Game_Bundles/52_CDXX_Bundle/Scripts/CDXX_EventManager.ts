import { _decorator, director } from 'cc';
export class CDXX_MyEvent {
    public static CDXX_MOVEMENT: string = 'CDXX_MOVEMENT';
    public static CDXX_JUMP: string = 'CDXX_JUMP';
    public static CDXX_ATTACK_START: string = 'CDXX_ATTACK_START';
    public static CDXX_ATTACK_END: string = 'CDXX_ATTACK_END';
    public static CDXX_HIDEBORDER: string = 'CDXX_HIDEBORDER';
    public static CDXX_SHOW_EQUIPMENT_BORDER: string = 'CDXX_SHOW_EQUIPMENT_BORDER';
    public static CDXX_HIDE_BACKPACK_BORDER: string = 'CDXX_HIDE_BACKPACK_BORDER';
    public static CDXX_BG_SHOW: string = 'CDXX_BG_SHOW';
    public static CDXX_CS_BUTTON_SHOW: string = 'CDXX_CS_BUTTON_SHOW';
    public static CDXX_PAUSE: string = 'CDXX_PAUSE';
    public static CDXX_RESUME: string = 'CDXX_RESUME';
    public static CDXX_ENEMY_REMOVE: string = 'CDXX_ENEMY_REMOVE';
    public static CDXX_STATE_SHOW: string = 'CDXX_STATE_SHOW';
    public static CDXX_TIPS_SHOW: string = 'CDXX_TIPS_SHOW';
}

export class CDXX_EventManager {
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