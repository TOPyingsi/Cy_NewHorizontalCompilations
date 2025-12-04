import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export const EMLHJ_GameEvents  =  {
    START_NEW_DEBT: "START_NEW_DEBT",          // 开始新的债务事件
    PASS_GAME: "PASS_GAME",          // 开始新的债务事件
    END_GAME:"END_GAME",
    SHOW_NEW_DEBT: "SHOW_NEW_DEBT",          // 开始新的债务事件

    UPDATE_COIN_ADD: "UPDATE_COIN_ADD",          // 更新金币事件
    UPDATE_COIN: "UPDATE_COIN",          // 更新金币事件
    UPDATE_MONEY: "UPDATE_MONEY",        // 更新钞票事件
    UPDATE_MONEY_ADD: "UPDATE_MONEY_ADD",        // 更新钞票事件
    UPDATE_REMAINING: "UPDATE_REMAINING",        // 更新剩余次数事件
    UPDATE_ICON_PROBABILITY: "UPDATE_ICON_PROBABILITY",        // 更新图标概率事件
    START_SPIN: "START_SPIN",            // 开始旋转事件
    SPIN_FINISHED: "SPIN_FINISHED",      // 旋转结束事件
    All_SPIN_FINISHED: "All_SPIN_FINISHED",       // 旋转结束事件

    UPDATE_ITEMS:"UPDATE_ITEMS",

    UPDATE_ROUND:"UPDATE_ROUND",        // 更新剩余轮数事件

    UPDATE_INTEREST:"UPDATE_INTEREST",
    UPDATE_SAVE:"UPDATE_SAVE",

    UI_HIDE_ALL_SCREENS: "UI_HIDE_ALL_SCREENS",        // 隐藏所有屏幕事件
    UI_SHOW_ICON_PANEL: "UI_SHOW_ICON_PANEL",        // 显示图标面板事件
    UI_HIDE_ICON_PANEL: "UI_HIDE_ICON_PANEL",        // 隐藏图标面板事件
    UI_SHOW_REWARD_PANEL: "UI_SHOW_REWARD_PANEL",        // 显示奖励面板事件
    UI_HIDE_REWARD_PANEL: "UI_HIDE_REWARD_PANEL",        // 隐藏奖励面板事件
    UI_SHOW_ATM_PANEL: "UI_SHOW_ATM_PANEL",        // 显示ATM面板事件
    UI_HIDE_ATM_PANEL: "UI_HIDE_ATM_PANEL",        // 隐藏ATM面板事件
    UI_SHOW_SHOP_PANEL: "UI_SHOW_SHOP_PANEL",        // 显示商店面板事件
    UI_HIDE_SHOP_PANEL: "UI_HIDE_SHOP_PANEL",        // 隐藏商店面板事件
    UI_SHOW_END_PANEL: "UI_SHOW_END_PANEL",        // 显示结束面板事件
    UI_HIDE_END_PANEL: "UI_HIDE_END_PANEL",        // 隐藏结束面板事件
    UI_SHOW_GAMEUI: "UI_SHOW_GAMEUI",        // 显示游戏UI事件
    UI_HIDE_GAMEUI: "UI_HIDE_GAMEUI",        // 隐藏游戏UI事件
    UI_SHOW_PHONE_PANEL: "UI_SHOW_PHONE_PANEL",        // 显示电话面板事件
    UI_HIDE_PHONE_PANEL: "UI_HIDE_PHONE_PANEL",        // 隐藏电话面板事件
    UI_SHOW_TUTORIAL_PANEL: "UI_SHOW_TUTORIAL_PANEL",        // 显示教程面板事件
    UI_HIDE_TUTORIAL_PANEL: "UI_HIDE_TUTORIAL_PANEL",        // 隐藏教程面板事件
    UI_SHOW_TIP_PANEL: "UI_SHOW_TIP_PANEL",        // 显示提示面板事件
    UI_HIDE_TIP_PANEL: "UI_HIDE_TIP_PANEL",        // 隐藏提示面板事件

    UI_SHOW_SELECT_COUNT: "UI_SHOW_SELECT_COUNT",        // 显示选择次数事件
    UI_HIDE_SELECT_COUNT: "UI_HIDE_SELECT_COUNT",        // 隐藏选择次数事件

    SHOW_SELECT_ANIM: "SHOW_SELECT_ANIM",        // 显示选择动画事件


}


