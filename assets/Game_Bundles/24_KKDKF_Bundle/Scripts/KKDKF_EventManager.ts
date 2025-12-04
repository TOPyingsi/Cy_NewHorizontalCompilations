import { _decorator, director, Node, Scene } from 'cc';

export class KKDKF_MyEvent {
    public static ChanggeMoney: string = 'MyEvent.ChanggeMoney'; //修改金钱
    public static Move: string = 'MyEvent.Move'; //移动位置(参数1：移动到的位置)
    public static 生产杯子: string = '生产杯子';
    public static 生产大杯子: string = '生产大杯子';
    public static 拖动咖啡勺到机器下: string = '拖动咖啡勺到机器下';
    public static 拖动碾压器到咖啡勺子: string = '拖动碾压器到咖啡勺子';
    public static 点击咖啡机按钮: string = '点击咖啡机按钮';
    public static 杯子放到桌面: string = '杯子放到桌面';
    public static 大杯加咖啡: string = '大杯加咖啡';
    public static 大杯加冰水: string = '大杯加冰水';
    public static 大杯加冰块: string = '大杯加冰块';
    public static 上菜: string = '上菜';
    public static 饮料给客人: string = '饮料给客人';
}

export class KKDKF_EventManager {
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