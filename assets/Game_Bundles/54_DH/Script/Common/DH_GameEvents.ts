export const DH_GameEvents = {

    

    Enter_Map_End:"Enter_Map_End",//进入地图结束事件
        
    Update_Anglers:"Update_Anglers",//更新angler节点事件
    Update_Rods:"Update_Rods",//更新竿子节点事件

    Show_NPC_Default_Dialouge:"Show_NPC_Default_Dialouge",//显示NPC默认对话事件
    Hide_Npc:"Hide_Npc",

    Player_Move: "Player_Move",        // 玩家移动事件
    Player_Stop: "Player_Stop",        // 玩家停止事件

    Update_Camera_Tartget:"Update_Camera_Tartget",//设置相机目标事件

    Move_To_Fishing_Pos:"Move_To_Fishing_Pos",//移动到钓位
    // 事件
    抛竿:"抛竿",
    收杆:"收杆",
    断线:"断线",
    Kill:"Kill",
    Clear_Skill:"Clear_Skill",//清除技能事件

    ChangeSkin: "ChangeSkin",        // 切换皮肤事件

    Sole_Fish:"Sole_Fish",

    FishHooking:"FishHooking",

    Use_Skill:"Use_Skill",//使用技能事件
    Change_Rod:"Change_Rod",

    Play_ReelIn_Animation:"Play_ReelIn_Animation",//鱼被钓起
    Clear_Lines:"Clear_Lines",

    Clear_Skill_DownCound : "Clear_Skill_DownCound",

    Hide_Kill_Btn:"Hide_Kill_Btn",

    Destory_Fish_Stole:"Destory_Fish_Stole",//销毁被送出的鱼事件


    Show_CastRod_Btn:"Show_CastRod_Btn",//显示抛杆按钮
    UI_Update_Line_length:"UI_Update_Line_length",//更新线长
    Fish_Bleeding:"Fish_Bleeding",//鱼流血事件
    Destory_Fish:"Destory_Fish",//销毁鱼事件
    UI_Update_Hp:"UI_Update_Hp",//更新血量
    UI_Update_Fish_Data:"UI_Update_Fish_Data",//更新鱼名

    UI_Show_Btn_Interact:"UI_Show_Btn_Interact",//显示交互按钮事件
    UI_Hide_Btn_Interact:"UI_Hide_Btn_Interact",//隐藏交互按钮事件
    UI_Set_Reward_SP:"Set_Reward_SP",//设置奖励事件
    UI_Update_Value:"UI_Update_Value",
    UI_Hide_SettingBtn:"UI_Hide_SettingBtn",
    UI_Show_SettingBtn:"UI_Show_SettingBtn",
    UI_Hide_MoveBtn:"UI_Hide_MoveBtn",
    UI_Show_MoveBtn:"UI_Show_MoveBtn",
    UI_Update_Expression:"UI_Update_Expression",//更新表情事件
    UI_Update_Weight:"UI_Update_Weight",
    UI_Update_Health:"UI_Update_Health",
    UI_Update_Money:"UI_Update_Money",

    StopPullLine:"StopPullLine",//停止抛竿事件

    UI_INIT_UI:"UI_INIT_UI",//初始化UI事件
    UI_ENTER_GAME:"UI_ENTER_GAME",//进入游戏事件
    UI_EXIT_GAME:"UI_EXIT_GAME",//退出游戏事件
    UI_SHOW_ANIMATION_PANEL:"UI_SHOW_ANIMATION_PANEL",//隐藏主面板事件
    UI_HIDE_ANIMATION_PANEL:"UI_HIDE_ANIMATION_PANEL",//隐藏主面板事件
    UI_HIDE_ALL_SCREENS: "UI_HIDE_ALL_SCREENS",
    UI_SHOW_HOME_PANEL: "UI_SHOW_HOME_PANEL",        // 显示主面板事件
    UI_HIDE_HOME_PANEL: "UI_HIDE_HOME_PANEL",        // 隐藏主面板事件
    UI_SHOW_GAMEUI: "UI_SHOW_GAMEUI",        // 显示游戏UI事件
    UI_HIDE_GAMEUI: "UI_HIDE_GAMEUI",        // 隐藏游戏UI事件
    UI_SHOW_GAME_SETTING_PANEL: "UI_SHOW_GAME_SETTING_PANEL",        // 显示游戏设置面板事件
    UI_HIDE_GAME_SETTING_PANEL: "UI_HIDE_GAME_SETTING_PANEL",        // 隐藏游戏设置面板事件
    UI_SHOW_ANGLER_PANEL: "UI_SHOW_ANGLER_PANEL",        // 显示 angler 面板事件
    UI_HIDE_ANGLER_PANEL: "UI_HIDE_ANGLER_PANEL",        // 隐藏 angler 面板事件
    UI_SHOW_LOADING_PANEL: "UI_SHOW_LOADING_PANEL",        // 显示加载面板事件
    UI_HIDE_LOADING_PANEL: "UI_HIDE_LOADING_PANEL",        // 隐藏加载面板事件
    UI_HIDE_MAP_PANEL: "UI_HIDE_MAP_PANEL",        // 隐藏地图面板事件
    UI_SHOW_MAP_PANEL: "UI_SHOW_MAP_PANEL",        // 显示地图面板事件
    UI_HIDE_DIALOUGE_PANEL: "UI_HIDE_DIALOUGE_PANEL",        // 隐藏对话面板事件
    UI_SHOW_DIALOUGE_PANEL: "UI_SHOW_DIALOUGE_PANEL",        // 显示对话面板事件
    UI_SHOW_REWARD_PANEL: "UI_SHOW_REWARD_PANEL",        // 显示奖励面板事件
    UI_HIDE_REWARD_PANEL: "UI_HIDE_REWARD_PANEL",        // 隐藏奖励面板事件
    UI_SHOW_FISH_PANEL: "UI_SHOW_FISH_PANEL",        // 显示鱼面板事件
    UI_HIDE_FISH_PANEL: "UI_HIDE_FISH_PANEL",        // 隐藏鱼面板事件
    UI_SHOW_SKILL_PANEL: "UI_SHOW_SKILL_PANEL",        // 显示技能面板事件
    UI_HIDE_SKILL_PANEL: "UI_HIDE_SKILL_PANEL",        // 隐藏技能面板事件
    UI_SHOW_FISH_ROD_PANEL: "UI_SHOW_FISH_ROD_PANEL",        // 显示鱼杆面板事件
    UI_HIDE_FISH_ROD_PANEL: "UI_HIDE_FISH_ROD_PANEL",        // 隐藏鱼杆面板事件



    UI_SHOW_TIP_PANEL: "UI_SHOW_TIP_PANEL",        // 显示提示面板事件
    UI_HIDE_TIP_PANEL: "UI_HIDE_TIP_PANEL",        // 隐藏提示面板事件
    UI_SHOW_END_PANEL: "UI_SHOW_END_PANEL",        // 显示结束面板事件
    UI_HIDE_END_PANEL: "UI_HIDE_END_PANEL",        // 隐藏结束面板事件
    UI_SHOW_SUCCESS_TIP_PANEL: "UI_SHOW_SUCCESS_TIP_PANEL",        // 显示成功提示面板事件
    UI_HIDE_SUCCESS_TIP_PANEL: "UI_HIDE_SUCCESS_TIP_PANEL",        // 隐藏成功提示面板事件

    Show_Tip:"Show_Tip",        // 显示提示事件
    Hide_Tip:"Hide_Tip",        // 隐藏提示事件


}


