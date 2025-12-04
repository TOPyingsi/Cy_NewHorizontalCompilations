import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export const HXTJB_GameEvents  =  {
    START_NEW_ROUND: "START_NEW_ROUND",          // 开始新的债务事件
    RESTART_GAME: "RESTART_GAME",          // 重新开始游戏事件
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

    UI_SHOW_CLICK_TIP: "UI_SHOW_CLICK_TIP",        // 显示点击提示事件
    UI_HIDE_CLICK_TIP: "UI_HIDE_CLICK_TIP",        // 隐藏点击提示事件

    UPDATE_SAVE:"UPDATE_SAVE",

    UPDATE_CONTAINER_PRICE:"UPDATE_CONTAINER_PRICE",        // 更新容器价格事件
    UPDATE_ITEM_PRICE:"UPDATE_ITEM_PRICE",        // 更新物品价格事件

    UI_HIDE_ALL_SCREENS: "UI_HIDE_ALL_SCREENS",        // 隐藏所有屏幕事件

    START_RAIN:"START_RAIN",        // 开始下雨事件

    UI_SHOW_SHOP_PANEL: "UI_SHOW_SHOP_PANEL",        // 显示商店面板事件
    UI_HIDE_SHOP_PANEL: "UI_HIDE_SHOP_PANEL",        // 隐藏商店面板事件
    UI_SHOW_END_PANEL: "UI_SHOW_END_PANEL",        // 显示结束面板事件
    UI_HIDE_END_PANEL: "UI_HIDE_END_PANEL",        // 隐藏结束面板事件
    UI_SHOW_TIP_PANEL: "UI_SHOW_TIP_PANEL",        // 显示提示面板事件
    UI_HIDE_TIP_PANEL: "UI_HIDE_TIP_PANEL",        // 隐藏提示面板事件
    UI_SHOW_GAMEUI: "UI_SHOW_GAMEUI",        // 显示游戏UI事件
    UI_HIDE_GAMEUI: "UI_HIDE_GAMEUI",        // 隐藏游戏UI事件
    UI_SHOW_TUTORIAL_PANEL: "UI_SHOW_TUTORIAL_PANEL",        // 显示教程面板事件
    UI_HIDE_TUTORIAL_PANEL: "UI_HIDE_TUTORIAL_PANEL",        // 隐藏教程面板事件

    SHOW_BTN_SHOP: "SHOW_BTN_SHOP",        // 显示商店按钮事件
    HIDE_BTN_SHOP: "HIDE_BTN_SHOP",        // 隐藏商店按钮事件
}



