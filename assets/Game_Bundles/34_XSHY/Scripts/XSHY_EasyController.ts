import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

export class XSHY_EasyControllerEvent {
    public static CAMERA_ROTATE: string = 'EasyControllerEvent.CAMERA_ROTATE';
    public static CAMERA_ZOOM: string = 'EasyControllerEvent.CAMERA_ZOOM';
    public static MOVEMENT: string = 'EasyControllerEvent.MOVEMENT';
    public static MOVEMENT_STOP: string = 'EasyControllerEvent.MOVEMENT_STOP';
    public static JUMP: string = 'EasyControllerEvent.JUMP';

    public static ATTACK: string = 'EasyControllerEvent.ATTACK';
    public static SKILL: string = 'EasyControllerEvent.SKILL';//参数是技能N
    public static TongLing: string = 'EasyControllerEvent.TongLing';//点击通灵按钮播放此消息

    public static PlayerOnLoad: string = `EasyControllerEvent.PlayerOnLoad`;//玩家创造完毕，参数是玩家Node
    public static EnemyOnLoad: string = `EasyControllerEvent.EnemyOnLoad`;//敌人创造完毕，参数是敌人Node

    public static BeatBack: string = `EasyControllerEvent.BeatBack`;//有单位收到伤害，0参数为受击单位,1参数是伤害
    public static ChanggeMoney: string = `EasyControllerEvent.ChanggeMoney`;//货币被修改，参数是修改后的值

    public static 选中角色: string = `EasyControllerEvent.选中角色`;//选中角色，参数为选中的名字
    public static 角色选择框选中: string = `EasyControllerEvent.角色选择框选中`;//选中角色选择框，参数为ID

    public static 选中通灵: string = `EasyControllerEvent.选中通灵`;//选中通灵，参数为选中的名字
    public static 通灵选择框选中: string = `EasyControllerEvent.通灵选择框选中`;//选中通灵选择框，参数为ID
    public static 主程序就绪: string = `EasyControllerEvent.主程序就绪`;//Gamemanager分配完成

    public static 选择界面切换页面: string = `EasyControllerEvent.选择界面切换页面`;//参数为string，"忍者和"通灵"

    public static 角色死亡: string = `EasyControllerEvent.角色死亡`;//角色死亡，参数true为地方死亡，false为己方死亡
    public static 弹出结算窗口: string = `EasyControllerEvent.弹出结算窗口`;//弹出结算窗口，参数为是否胜利
    public static 受击: string = `EasyControllerEvent.受击`;//受击次数，参数为次数
    public static 释放技能: string = `EasyControllerEvent.释放技能`;//
    public static 普通攻击命中: string = `EasyControllerEvent.普通攻击命中`;//
    public static 消耗技能豆: string = `EasyControllerEvent.消耗技能豆`;//
    public static 弹出下一场: string = `EasyControllerEvent.弹出下一场`;//UI界面弹出下一场倒计时

    public static 隐藏加载界面: string = `EasyControllerEvent.隐藏加载界面`;//UI界面隐藏加载界面
}

export class XSHY_EasyController {

    public static on(type: string, callback: Function, target?: any) {
        director.getScene().on(type, callback, target);
    }

    public static off(type: string, callback?: Function, target?: any) {
        director.getScene()?.off(type, callback, target);
    }
}