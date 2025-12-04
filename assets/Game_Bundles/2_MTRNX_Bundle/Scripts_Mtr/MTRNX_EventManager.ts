import { _decorator, director, Node, Scene } from 'cc';

export class MTRNX_MyEvent {
    //科技点改变
    public static PointChanged: string = 'MyEvent.PointChanged';
    //分数改变
    public static ScoreChanged: string = 'MyEvent.ScoreChanged';
    //增加奖励进度条
    public static StartAddRewardTimer: string = 'MyEvent.AddRewardTimer';
    //停止奖励进度条
    public static StopAddRewardTimer: string = 'MyEvent.StopAddRewardTimer';
    //钥匙改变
    public static KeysChanged: string = 'MyEvent.KeysChanged';
    //开始增加科技点
    public static StartAddPoint: string = 'MyEvent.StartAddPoint';
    //停止增加科技点
    public static StopAddPoint: string = 'MyEvent.StopAddPoint';
    //刷新我方血条
    public static RefrshRedHp: string = 'MyEvent.RefrshRedHp';
    //刷新敌方血条
    public static RefrshBlueHp: string = 'MyEvent.RefrshBlueHp';
    //显示对话
    public static ShowWarning: string = 'MyEvent.ShowDialog';
    //金钱改变
    public static ChanggeMoney: string = 'MyEvent.ChanggeMoney';
    //碎片改变
    public static ChanggeDebris: string = 'MyEvent.ChanggeDebris';

}

export class MTRNX_EventManager {
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