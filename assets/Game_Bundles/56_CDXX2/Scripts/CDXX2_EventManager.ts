import { _decorator, director } from 'cc';
export class CDXX2_MyEvent {
    public static CDXX2_MOVEMENT: string = 'CDXX2_MOVEMENT';
    public static CDXX2_JUMP: string = 'CDXX2_JUMP';
    public static CDXX2_ATTACK_START: string = 'CDXX2_ATTACK_START';
    public static CDXX2_ATTACK_END: string = 'CDXX2_ATTACK_END';
    public static CDXX2_HIDEBORDER: string = 'CDXX2_HIDEBORDER';
    public static CDXX2_SHOW_EQUIPMENT_BORDER: string = 'CDXX2_SHOW_EQUIPMENT_BORDER';
    public static CDXX2_HIDE_BACKPACK_BORDER: string = 'CDXX2_HIDE_BACKPACK_BORDER';
    public static CDXX2_BG_SHOW: string = 'CDXX2_BG_SHOW';
    public static CDXX2_CS_BUTTON_SHOW: string = 'CDXX2_CS_BUTTON_SHOW';
    public static CDXX2_PAUSE: string = 'CDXX2_PAUSE';
    public static CDXX2_RESUME: string = 'CDXX2_RESUME';
    public static CDXX2_ENEMY_REMOVE: string = 'CDXX2_ENEMY_REMOVE';
    public static CDXX2_STATE_SHOW: string = 'CDXX2_STATE_SHOW';
    public static CDXX2_TIPS_SHOW: string = 'CDXX2_TIPS_SHOW';
}

/*对 Cocos Creator 场景事件系统的极简封装：
把 director.getScene() 当成全局事件总线，提供静态方法 on / off / emit，让任意脚本都能用同一套字符串 key 收发事件，实现模块间解耦*/
export class CDXX2_EventManager {
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