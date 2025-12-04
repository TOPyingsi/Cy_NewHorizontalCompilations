import { _decorator, director, Node, Scene } from 'cc';

export class QSSZG_MyEvent {
    //修改金钱
    public static ChanggeMoney: string = 'MyEvent.ChanggeMoney';
    //鱼苗销毁
    public static DeleteFish: string = 'MyEvent.DeleteFish';
}

export class QSSZG_EventManager {
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