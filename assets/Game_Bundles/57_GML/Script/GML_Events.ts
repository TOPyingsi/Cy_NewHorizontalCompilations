import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum GML_Events {
    MOVEMENT = "MOVEMENT",
    MOVEMENT_STOP = "MOVEMENT_STOP",
    CAMERA_ROTATE = "CAMERA_ROTATE",

    APPLY_FORCE = "APPLY_FORCE",
    STOP_APPLY_FORCE = "STOP_APPLY_FORCE",

    Keep_Jump = "Keep_Jump",
    Stop_Jump = "Stop_Jump",

    Keep_Jump_BACK = "Keep_Jump_BACK",
    Stop_Jump_BACK = "Stop_Jump_BACK",

    FIXED_CAMERA = "FIXED_CAMERA",
    PLAYER_DIE = "PLAYER_DIE",
    PLAYER_LOG_RESUERGENCE_POS = "PLAYER_LOG_RESUERGENCE_POS",

    RESET_PLAYER = "RESET_PLAYER",

    UI_SHOW_BTN_ReStart = "UI_SHOW_BTN_ReStart",
    UI_HIDE_BTN_ReStart = "UI_HIDE_BTN_ReStart",
    UI_HIDE_BTN_Video = "UI_HIDE_BTN_Video",
    UI_HIDE_BTN_CTRL = "UI_HIDE_BTN_CTRL",
    UI_SHOW_BTN_CTRL = "UI_SHOW_BTN_CTRL",
    UI_UPDATE_RESTART_COUNT = "UI_UPDATE_RESTART_COUNT",
    UI_Reset_Progress = "UI_Reset_Progress",
    UI_Update_Progress = "UI_Update_Progress",
}


