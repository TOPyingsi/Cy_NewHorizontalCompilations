import { _decorator, director } from 'cc';
export class SJNDGZ_MyEvent {
    public static SJNDGZ_MOVEMENT: string = 'SJNDGZ_MOVEMENT';
    public static SJNDGZ_JUMP: string = 'SJNDGZ_JUMP';
    public static SJNDGZ_ATTACK_START: string = 'SJNDGZ_ATTACK_START';
    public static SJNDGZ_ATTACK_END: string = 'SJNDGZ_ATTACK_END';
    public static SJNDGZ_HIDEBORDER: string = 'SJNDGZ_HIDEBORDER';
}

export class SJNDGZ_EventManager {
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