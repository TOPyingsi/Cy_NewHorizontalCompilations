import { _decorator, director, Node, Scene } from 'cc';

export class JJHZ_MyEvent {
    public static RemoveMusic: string = 'MyEvent.RemoveMusic'; //下滑几号音乐
    public static 开启音效: string = 'MyEvent.开启音效'; //开启音效
    public static 关闭音效: string = 'MyEvent.关闭音效'; //关闭音效
    public static 播放: string = 'MyEvent.播放'; //立即播放音效
}

export class JJHZ_EventManager {
    public static get Scene(): Scene {
        return director.getScene();
    }

    public static on(type: string, callback: Function, target?: any) {
        director.getScene().on(type, callback, target);
    }

    public static off(type: string, callback?: Function, target?: any) {
        director.getScene()?.off(type, callback, target);
    }

    public static onNode(node: Node, type: string, callback: Function, target: any) {
        node.on(type, callback, target);
    }

    public static offNode(node: Node, type: string, callback?: Function, target?: any) {
        node?.off(type, callback, target);
    }
}