import { _decorator, director } from 'cc';
export class MyEvent {
    public static MOVEMENT: string = 'MyEvent.MOVEMENT';
    public static MOVEMENT_STOP: string = 'MyEvent.MOVEMENT_STOP';
    public static SET_ATTACK_DIR: string = 'MyEvent.SET_ATTACK_DIR';
    public static Start_Fire: string = 'MyEvent.Start_Fire';
    public static Stop_Fire: string = 'MyEvent.Stop_Fire';
    public static TreasureBoxDestroy:string ='MyEvent.TreasureBoxDestroy';
}

export class EventManager {
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