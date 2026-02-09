import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_EventManager')
export class SJZGMMT_EventManager {
    static MOVEMENT: string = "SJZXD.MOVEMENT";//移动
    static MOVEMENT_STOP: string = "SJZXD.MOVEMENT_STOP";//移动停止
    static FIRE_START: string = "SJZXD.FIRE_START";//攻击按下,第一个参数是自定义方向，第二个参数可空是指方向
    static FIRE_STOP: string = "SJZXD.FIRE_STOP";//攻击抬起

    static 货币变动: string = "SJZXD.货币变动";//货币变动

    static 仓库物品变动: string = "SJZXD.仓库物品变动";//仓库物品变动
    static 装备切换: string = "SJZXD.装备切换";//装备切换

    static 通用摇杆移动: string = "SJZXD.通用摇杆移动";//移动，参数0是唯一标识符1是移动方向
    static 通用摇杆移动未归一化: string = "SJZXD.通用摇杆移动未归一化";//移动，参数0是唯一标识符1是移动方向
    static 通用摇杆停止: string = "SJZXD.通用摇杆停止";//停止，参数0是唯一标识符

    static 收藏馆物品变动: string = "SJZXD.收藏馆物品变动";//收藏馆物品变动。参数0为名字

    static 换弹键按下: string = "SJZXD.换弹键按下";//换弹键按下
    static 主角换弹: string = "SJZXD.主角换弹";//主角换弹。参数0为换弹时间
    static 主角滑铲: string = "SJZXD.主角滑铲";//主角滑铲
    static 释放摸金罗盘: string = "SJZXD.释放摸金罗盘";//释放摸金罗盘

    static 背包添加物品: string = "SJZXD.背包添加物品";//背包添加物品,参数为物品
    static 背包删除物品: string = "SJZXD.背包删除物品";//背包删除物品,参数为物品
    static 背包删除所有物品: string = "SJZXD.背包删除所有物品";//背包删除物品,参数为物品
    static 背包物品选中: string = "SJZXD.背包物品选中";//背包物品选中,参数为物品
    static 进入容器范围: string = "SJZXD.进入容器范围";//玩家移动进入容器范围,参数是容器Node
    static 离开容器范围: string = "SJZXD.离开容器范围";//玩家移动进入容器范围,参数是容器Node
    static 进入撤离点: string = "SJZXD.进入撤离点";//玩家移动进入撤离点
    static 离开撤离点: string = "SJZXD.离开撤离点";//玩家移动离开撤离点
    static 撤离点时间耗尽: string = "SJZXD.撤离点时间耗尽";//玩家已经在撤离点呆了足够时间
    static 进入青铜门范围: string = "SJZXD.进入青铜门范围";//进入青铜门范围
    static 离开青铜门范围: string = "SJZXD.离开青铜门范围";//离开青铜门范围
    static 点击打开按钮: string = "SJZXD.点击打开按钮";//点击打开按钮
    static 背包扩容: string = "SJZXD.背包扩容";//背包扩容

    static 主角使用血包: string = "SJZXD.主角使用血包";//主角使用血包，参数表示使用的血包ID(0小1中2大)

    static 道具搜索完毕: string = "SJZXD.道具搜索完毕";//单个道具搜索完
    static 搜索框移除小框: string = "SJZXD.搜索框移除小框";//搜索栏移除小框，参数是propdata

    static 攻击模式切换: string = "SJZXD.攻击模式切换";//参数为攻击模式(0锁定1自由)

    static 龙骨_主角刷新: string = "SJZXD.龙骨_主角刷新";//龙骨将按照存档数据进行刷新

    static 主页_场景切换: string = "SJZXD.主页_场景切换";//主页_场景切换，参数是场景名

    static 单位死亡: string = "SJZXD.单位死亡";//单位死亡，参数是单位节点
    static AI单位死亡: string = "SJZXD.AI单位死亡";//AI单位死亡，参数是单位节点

    static 找回遗失: string = "SJZXD.找回遗失";//找回遗失

    static 主角准备就绪: string = "SJZXD.主角准备就绪";//准备就绪(包括直升机动画结束)
    static 主角复活: string = "SJZXD.主角复活";//主角复活

    static 技能无CD: string = "SJZXD.技能无CD";//无CD

    static 开启强制显示皮肤: string = "SJZXD.开启强制显示皮肤";//开启强制显示皮肤

    static 使用增强针: string = "SJZXD.使用增强针";//使用增强针，参数0为针名

    static 重置滑铲CD: string = "SJZXD.重置滑铲CD";//重置滑铲CD,参数0为增加的CD量

    static 表情包展示: string = "SJZXD.表情包展示";//表情包展示,参数0为展示的图名
    static 一键出售杂物: string = "SJZXD.一键出售杂物";//一键出售杂物
    static 黑市切换栏位: string = "SJZXD.黑市切换栏位";//黑市切换栏位，参数0为名字
    static 黑市购买点击: string = "SJZXD.黑市购买点击";//黑市购买点击
    static 主页点击开始游戏: string = "SJZXD.主页点击开始游戏";//主页点击开始游戏
    static 获得框点击装备: string = "SJZXD.获得框点击装备";//主页点击开始游戏
}


