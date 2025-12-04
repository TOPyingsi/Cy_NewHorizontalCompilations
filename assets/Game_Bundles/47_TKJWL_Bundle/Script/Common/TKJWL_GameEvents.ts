import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export const TKJWL_GameEvents  =  {
    GAME_OVER: "GAME_OVER",          // 游戏结束事件

    // CAMERA_ROTATE: "CAMERA_ROTATE",          // 相机旋转事件
    MOVEMENT: "MOVEMENT",          // 移动事件
    MOVEMENT_STOP: "MOVEMENT_STOP",          // 移动停止事件

    INTERACT: "INTERACT",          // 交互事件

    CAMERA_ROTATION: "CAMERA_ROTATION",          // 相机旋转事件
    HIDE_PLAYER_CAMERA: "HIDE_PLAYER_CAMERA",          // 隐藏玩家相机事件
    SHOW_PLAYER_CAMERA: "SHOW_PLAYER_CAMERA",          // 显示玩家相机事件

    //任务相关
    UPDATE_TASK_Tip:"UPDATE_TASK_Tip",          // 更新任务事件
    SHOW_TASK_TIP: "SHOW_TASK_TIP",          // 显示任务提示事件
    HIDE_TASK_TIP: "HIDE_TASK_TIP",          // 隐藏任务提示事件
    
    UPDATE_LOOKAT_ITEM: "UPDATE_LOOKAT_ITEM",          // 更新看向的物品事件

    ITEM_INTERACT: "ITEM_INTERACT",          // 物品交互事件
    ITEM_HOLE_ON: "ITEM_HOLE_ON",          // 物品拾取事件
    ITEM_RELEASE: "ITEM_RELEASE",          // 物品释放事件
    CreateItem:"CreateItem",
    ITEM_OPEN_FIRE: "ITEM_OPEN_FIRE",          // 物品打开火事件
    ITEM_CLOSE_FIRE: "ITEM_CLOSE_FIRE",          // 物品关闭火事件
    ITEM_EAT: "ITEM_EAT",          // 物品食用事件
    ITEM_STAND_UP: "ITEM_STAND_UP",          // 物品站起事件
    ITEM_SIT_DOWN: "ITEM_SIT_DOWN",          // 物品坐下事件

    SHOW_HOLD_ON_ITEM: "SHOW_HOLD_ON_ITEM",          // 显示持有物品事件
    HIDE_HOLD_ON_ITEM: "HIDE_HOLD_ON_ITEM",          // 隐藏持有物品事件

    SET_TELESCOPE_PROGRESS: "SET_TELESCOPE_PROGRESS",          // 设置望远镜进度事件
    SHOW_TELESCOPE_TUTORIAL: "SHOW_TELESCOPE_TUTORIAL",          // 显示望远镜提示事件
    TELESCOPE_PROGRESS_CHANGED: "TELESCOPE_PROGRESS_CHANGED",          // 望远镜进度变化事件

    SHOW_BOIL_SMOKE: "SHOW_BOIL_SMOKE",          // 显示煮水烟雾事件
    HIDE_BOIL_SMOKE: "HIDE_BOIL_SMOKE",          // 隐藏煮水烟雾事件

    HIDE_DUMPLINGS: "HIDE_DUMPLINGS",          // 隐藏水饺事件
    SHOW_DUMPLINGS: "SHOW_DUMPLINGS",          // 显示水饺事件

    SHOW_item_Garbage_1: "SHOW_item_Garbage_1",          // 显示垃圾桶1事件
    SHOW_item_Garbage_2: "SHOW_item_Garbage_2",          // 显示垃圾桶2事件
    SHOW_item_All_Garbage: "SHOW_item_All_Garbage",          // 显示所有垃圾桶事件
    Hide__Garbage_Can: "HIDE__Garbage_Can",          // 隐藏垃圾桶2事件

    SHOW_UI_ITEM: "SHOW_UI_ITEM",          // 显示UI事件
    SHOW_UI_ITEM_HOLD_ON :"SHOW_UI_ITEM_HOLD_ON",
    SHOW_UI_ITEM_RELEASE :"SHOW_UI_ITEM_RELEASE",


    //剧情相关
    OPEN_AREA:"OPEN_AREA",          // 开始剧情区域
    CLOSE_AREA:"CLOSE_AREA",          // 关闭剧情区域

    OPEN_LIGHT:"OPEN_LIGHT",          // 打开灯事件
    CLOSE_LIGHT:"CLOSE_LIGHT",          // 关闭灯事件

    OPEN_ROOM:"OPEN_ROOM",  //打开房间
    CLOSE_ROOM:"CLOSE_ROOM", //关闭房间

    CLOSE_DOOR:"CLOSE_DOOR",          // 关闭门事件
    OPEN_DOOR:"OPEN_DOOR",          // 打开门事件


    HIDE_MONSTER_POLT:"HIDE_MONSTER_POLT",//隐藏怪物
    SET_MONSTER_POLT:"SET_MONSTER_POLT", //怪物剧情事件








    START_NEW_ROUND: "START_NEW_ROUND",          // 开始新的债务事件
    PASS_GAME: "PASS_GAME",          // 开始新的债务事件
    END_GAME:"END_GAME",
    SHOW_NEW_ROUND: "SHOW_NEW_ROUND",          // 开始新的债务事件

    UPDATE_COIN_ADD: "UPDATE_COIN_ADD",          // 更新金币事件
    UPDATE_COIN: "UPDATE_COIN",          // 更新金币事件
    UPDATE_MONEY: "UPDATE_MONEY",        // 更新钞票事件
    UPDATE_MONEY_ADD: "UPDATE_MONEY_ADD",        // 更新钞票事件
    UPDATE_REMAINING: "UPDATE_REMAINING",        // 更新剩余次数事件

    UPDATE_ITEMS:"UPDATE_ITEMS",

    UPDATE_ROUND:"UPDATE_ROUND",        // 更新剩余轮数事件
    UPDATE_SCORE:"UPDATE_SCORE",        // 更新分数事件
    UPDATE_SPECIAL_COINS:"UPDATE_SPECIAL_COINS",        // 更新特殊金币事件
    UPDATE_CURRENT_ITEM_CONTAINER_COUNT:"UPDATE_CURRENT_ITEM_CONTAINER_COUNT",        // 更新当前物品容器数量事件
    UPDATE_TARGET_SCORE:"UPDATE_TARGET_SCORE",        // 更新目标分数事件
    UPDATE_COIN_REMAIN:"UPDATE_COIN_REMAIN",        // 更新金币剩余事件
    UPDATE_SCORE_MIX:"UPDATE_SCORE_MIX",        // 更新分数混合事件
    UPDATE_ROUND_REMAIN:"UPDATE_ROUND_REMAIN",        // 更新回合剩余事件
    UPDATE_MONEY_MIX:"UPDATE_MONEY_MIX",        // 更新金币混合事件
    UPDATE_COIN_MIX:"UPDATE_COIN_MIX",        // 更新金币混合事件
    NEW_HIGH_SCORE:"NEW_HIGH_SCORE",        // 新的最高分事件
    UPDATE_ATTACK:"UPDATE_ATTACK",        // 更新攻击事件
    UPDATE_ADD_MIX:"UPDATE_ADD_MIX",        // 更新增加混合事件

    UPDATE_SAVE:"UPDATE_SAVE",

    UPDATE_CONTAINER_PRICE:"UPDATE_CONTAINER_PRICE",        // 更新容器价格事件
    UPDATE_ITEM_PRICE:"UPDATE_ITEM_PRICE",        // 更新物品价格事件

    UI_HIDE_ALL_SCREENS: "UI_HIDE_ALL_SCREENS",        // 隐藏所有屏幕事件

    START_RAIN:"START_RAIN",        // 开始下雨事件

    UI_SHOW_END_PANEL: "UI_SHOW_END_PANEL",        // 显示结束面板事件
    UI_HIDE_END_PANEL: "UI_HIDE_END_PANEL",        // 隐藏结束面板事件
    UI_SHOW_TIP_PANEL: "UI_SHOW_TIP_PANEL",        // 显示提示面板事件
    UI_HIDE_TIP_PANEL: "UI_HIDE_TIP_PANEL",        // 隐藏提示面板事件
    UI_SHOW_GAMEUI: "UI_SHOW_GAMEUI",        // 显示游戏UI事件
    UI_HIDE_GAMEUI: "UI_HIDE_GAMEUI",        // 隐藏游戏UI事件
    UI_SHOW_SUCCESS_TIP_PANEL: "UI_SHOW_SUCCESS_TIP_PANEL",        // 显示成功提示面板事件
    UI_HIDE_SUCCESS_TIP_PANEL: "UI_HIDE_SUCCESS_TIP_PANEL",        // 隐藏成功提示面板事件

}



