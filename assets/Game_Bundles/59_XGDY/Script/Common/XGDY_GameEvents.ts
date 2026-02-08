export const XGDY_GameEvents = {

    Loading_Show_Completed:"Loading_Show_Completed",//加载完成事件

    XGDY_UpdateFishRodPanel :"XGDY_UpdateFishRodPanel",//更新竿子面板事件
    

    Enter_Map_End:"Enter_Map_End",//进入地图结束事件

    Enter_Home_End:"Enter_Home_End",//进入主界面结束事件
        
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
    Fish_Die:"Fish_Die",
    Clear_Lines:"Clear_Lines",

    Clear_Skill_DownCound : "Clear_Skill_DownCound",

    Hide_Kill_Btn:"Hide_Kill_Btn",

    Destory_Fish_Stole:"Destory_Fish_Stole",//销毁被送出的鱼事件



    //特殊鱼（阴鱼）
    Checkout_Next_FishId:"Checkout_Next_FishId",//阴鱼切换下一条




    //特殊地图相关
    SpecialNPC_Update_Label:"SpecialNPC_Update_Label",//更新特殊npc标签事件
    SpecialNPC_Init:"SpecialNPC_Init",//初始化特殊npc事件
    SpecialNpc_MAP103_Challenge_1_Init_String:"Pass_MAP103_Challenge_1",//钓鱼大赛第一关地图默认字符串
    SpecialNpc_MAP103_Challenge_2_Init_String:"Pass_MAP103_Challenge_2",//钓鱼大赛第二关地图默认字符串
    SpecialNPC_Show_Challenge2_String:"SpecialNPC_Show_Challenge2_String",//显示钓鱼大赛第二关字符串事件
    SpecialNpc_MAP103_Challenge_3_Init_String:"Pass_MAP103_Challenge_3",//钓鱼大赛第三关地图默认字符串
    SpecialNPC_Show_Challenge3_String:"SpecialNPC_Show_Challenge3_String",//显示钓鱼大赛第三关字符串事件

    //钓鱼大赛-预赛
    Reset_Fish:"Reset_Fish",//重置鱼事件


    //道具相关
    Show_Special_Item_Tip:"Show_Special_Item_Tip",//显示特殊道具提示事件
    Update_Special_Item_Tip:"Update_Special_Item_Tip",//更新特殊道具提示事件
    Hide_Special_Item_Tip:"Hide_Special_Item_Tip",//隐藏特殊道具提示事件
    Update_Special_Fish_line:"Update_Special_Fish_line",//更新特殊鱼线事件


    //鱼技能相关
    //切线技能
    Show_Danger_Sign:"Show_Danger_Sign",//显示危险标志事件
    Show_Dodge_Sign:"Show_Dodge_Sign",//显示闪避标志事件
    Show_Defense_Sign:"Show_Defense_Sign",//显示防御标志事件
    FishKillLine:"FishKillLine",//鱼被击杀事件
    UI_Delete_Angler_Skill_Item:"UI_Delete_Angler_Skill_Item",//删除技能项事件

    //恐惧（钓法禁用）
    Show_Fear_Sign:"Show_Fear_Sign",//显示恐惧标志事件
    Start_Ban_Skill:"Start_Ban_Skill",//开始禁用技能事件
    Ban_Skill:"Ban_Skill",
    End_Ban_Skill:"End_Ban_Skill",//停止禁用技能事件
    UI_Ban_Angler_Skill_Item:"UI_Ban_Angler_Skill_Item",//禁用技能项事件






    Show_CastRod_Btn:"Show_CastRod_Btn",//显示抛杆按钮
    UI_Update_Line_length:"UI_Update_Line_length",//更新线长
    Fish_Bleeding:"Fish_Bleeding",//鱼流血事件
    Destory_Fish:"Destory_Fish",//销毁鱼事件
    UI_Update_Hp:"UI_Update_Hp",//更新血量
    UI_Update_Fish_Data:"UI_Update_Fish_Data",//更新鱼名

    UI_Show_UIItem_Fishing:"UI_Show_UIItem_Fishing",//显示钓鱼相关UI事件
    UI_Hide_UIItem_Fishing:"UI_Hide_UIItem_Fishing",//隐藏钓鱼相关UI事件

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
    UI_Update_Money:"UI_Update_Money",//更新金币事件
    UI_Update_CelebrationCoin_Money:"UI_Update_CelebrationCoin_Money",//更新庆典币事件
    UI_Update_SpecialItemPanel:"UI_Update_SpecialItemPanel",//更新特殊道具面板事件
    UI_Update_Income:"UI_Update_Income",//更新收益事件

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
    UI_SHOW_SELECT_FISH_LEVEL_PANEL: "UI_SHOW_SELECT_FISH_LEVEL_PANEL",        // 显示选择鱼等级面板事件
    UI_HIDE_SELECT_FISH_LEVEL_PANEL: "UI_HIDE_SELECT_FISH_LEVEL_PANEL",        // 隐藏选择鱼等级面板事件
    UI_SHOW_CELEBRATION_PANEL:"UI_SHOW_CELEBRATION_PANEL",
    UI_HIDE_CELEBRATION_PANEL:"UI_HIDE_CELEBRATION_PANEL",
    UI_SHOW_FISHING_COMPTITION_PANEL:"UI_SHOW_FISHING_COMPTITION_PANEL",
    UI_HIDE_FISHING_COMPTITION_PANEL:"UI_HIDE_FISHING_COMPTITION_PANEL",
    UI_SHOW_ITEM_DIALOUGE_PANEL:"UI_SHOW_ITEM_DIALOUGE_PANEL",//显示道具介绍面板事件
    UI_HIDE_ITEM_DIALOUGE_PANEL:"UI_HIDE_ITEM_DIALOUGE_PANEL",//隐藏道具介绍面板事件

    UI_SHOW_SEAT_PANEL:"UI_SHOW_SEAT_PANEL",//显示座位面板事件
    UI_HIDE_SEAT_PANEL:"UI_HIDE_SEAT_PANEL",//隐藏座位面板事件
    UI_SHOW_ANIMATION_PANEL2:"UI_SHOW_ANIMATION_PANEL2",//显示动画面板2事件
    UI_HIDE_ANIMATION_PANEL2:"UI_HIDE_ANIMATION_PANEL2",//隐藏动画面板2事件
    UI_Update_CarType:"UI_Update_CarType",


    UI_SHOW_DEFAULT_BLACK_PANEL:"UI_SHOW_DEFAULT_BLACK_PANEL",
    UI_HIDE_DEFAULT_BLACK_PANEL:"UI_HIDE_DEFAULT_BLACK_PANEL",
    UI_SHOW_LOADING_PANEL_BLACK:"UI_SHOW_LOADING_PANEL_BLACK",
    UI_HIDE_LOADING_PANEL_BLACK:"UI_HIDE_LOADING_PANEL_BLACK",
    UI_SHOW_ADD_MONEY_PANEL:"UI_SHOW_ADD_MONEY_PANEL",//显示添加金币面板事件
    UI_HIDE_ADD_MONEY_PANEL:"UI_HIDE_ADD_MONEY_PANEL",//隐藏添加金币面板事件

    UI_SHOW_POOL_PANEL:"UI_SHOW_POOL_PANEL",//显示水池面板事件
    UI_HIDE_POOL_PANEL:"UI_HIDE_POOL_PANEL",//隐藏水池面板事件

    UI_SHOW_SIGN_PANEL:"UI_SHOW_SIGN_PANEL",//显示签到面板事件
    UI_HIDE_SIGN_PANEL:"UI_HIDE_SIGN_PANEL",//隐藏签到面板事件



    UI_SHOW_TIP_PANEL: "UI_SHOW_TIP_PANEL",        // 显示提示面板事件
    UI_HIDE_TIP_PANEL: "UI_HIDE_TIP_PANEL",        // 隐藏提示面板事件
    UI_SHOW_END_PANEL: "UI_SHOW_END_PANEL",        // 显示结束面板事件
    UI_HIDE_END_PANEL: "UI_HIDE_END_PANEL",        // 隐藏结束面板事件
    UI_SHOW_SUCCESS_TIP_PANEL: "UI_SHOW_SUCCESS_TIP_PANEL",        // 显示成功提示面板事件
    UI_HIDE_SUCCESS_TIP_PANEL: "UI_HIDE_SUCCESS_TIP_PANEL",        // 隐藏成功提示面板事件

    Show_Tip:"Show_Tip",        // 显示提示事件
    Hide_Tip:"Hide_Tip",        // 隐藏提示事件
    Show_FishSkill_Tip:"Show_FishSkill_Tip",        // 显示鱼技能提示事件
    Hide_FishSkill_Tip:"Hide_FishSkill_Tip",        // 隐藏鱼技能提示事件


}


