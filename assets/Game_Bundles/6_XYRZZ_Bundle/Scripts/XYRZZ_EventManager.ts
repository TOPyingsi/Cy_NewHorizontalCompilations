import { _decorator, director, Node, Scene } from 'cc';

export class XYRZZ_MyEvent {
    public static ChanggeMoney = "XYRZZ_MyEvent.ChanggeMoney"
    public static 钓法升级 = "XYRZZ_MyEvent.钓法升级"
    public static 改变战力 = "XYRZZ_MyEvent.改变战力"
    public static 改变单次收益 = "XYRZZ_MyEvent.改变单次收益"
    public static 角色升级 = "XYRZZ_MyEvent.角色升级"
    public static 道具数量修改 = "XYRZZ_MyEvent.道具数量修改"
    public static 场景变化 = "XYRZZ_MyEvent.场景变化"



    //教程
    public static 点击主页玩家 = "XYRZZ_MyEvent.点击主页玩家"
    public static 点击甩杆按钮 = "XYRZZ_MyEvent.点击甩杆按钮"
    public static 鱼上钩 = "XYRZZ_MyEvent.鱼上钩"
    public static 点击搓招 = "XYRZZ_MyEvent.点击搓招"
    public static 点击放 = "XYRZZ_MyEvent.点击放"
    //接受消息还包括了各个Panel的Show_Panel和Hide_Panel
}

export class XYRZZ_EventManager {
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