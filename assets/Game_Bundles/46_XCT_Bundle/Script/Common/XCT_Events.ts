
export enum XCT_Events {

    onBtnBackClick = "onBtnBackClick",
    //Common
    showTableItem = "showTableItem",
    hideTableItem = "hideTableItem",
    showTip = "showTip",
    HandAnimation_Start = "HandAnimation_Start",
    HandAnimation_End = "HandAnimation_End",
    Hide_TutorialPanel = "Hide_TutorialPanel",
    Show_TutorialPanel = "Show_TutorialPanel",
    Dish_Drag_End = "Dish_Drag_End",

    Game_Pause = "Game_Pause",
    Game_Resume = "Game_Resume",

    JBT_Update_Ingredient = "JBT_Update_Ingredient",

    JBT_Start_NewDay_Dialog = "JBT_Start_NewDay_Dialog",
    JBT_Show_End_Dialog_Sp = "JBT_Show_End_Dialog_Sp",
    JBT_Continue_Customer_EndDialog = "JBT_Continue_Customer_EndDialog",
    JBT_Show_Takeout_End_Dialog = "JBT_Show_Takeout_End_Dialog",

    JBT_Cancel_All_Ingredients = "JBT_Cancel_All_Ingredients",
    JBT_Disable_CancelMask = "JBT_Disable_CancelMask",

    JBT_Pack_Ingredients = "JBT_Pack_Ingredients",
    JBT_All_Packed = "JBT_All_Packed",
    JBT_Show_Add_Tip = "JBT_Show_Add_Tip",
    JBT_Update_Money = "JBT_Update_Money",
    JBT_Update_Time = "JBT_Update_Time",
    JBT_Update_Smile = "JBT_Update_Smile",
    JBT_Hide_smile = "JBT_Hide_smile",
    JBT_Show_smile = "JBT_Show_smile",

    JBT_ORDER_DATA_UPDATED = "JBT_ORDER_DATA_UPDATED",
    JBT_New_Takeout_Order = "JBT_New_Takeout_Order",
    JBT_Hide_New_Takeout_Order = "JBT_Hide_New_Takeout_Order",
    // JBT_Show_Pancake_Stick = "JBT_Show_Pancake_Stick",

    // JBT_Show_Dish = "JBT_Show_Dish",
    JBT_Take_Dish = "JBT_Take_Dish",
    JBT_Show_Dish_Node = "JBT_Show_Dish_Node",

    JBT_ShowTip_Back = "JBT_ShowTip_Back",
    JBT_ShowTip_NoMoney = "JBT_ShowTip_NoMoney",
    JBT_ShowTip_OpenTakeout = "JBT_ShowTip_OpenTakeout",
    JBT_ShowTip_Evaluation = "JBT_ShowTip_Evaluation",

    JBT_Takeout_Open = "JBT_Takeout_Open",


    HJM_Update_Ingredient = "HJM_Update_Ingredient",

    HJM_Start_NewDay_Dialog = "HJM_Start_NewDay_Dialog",
    HJM_Show_End_Dialog_Sp = "HJM_Show_End_Dialog_Sp",
    HJM_Show_Bowl = "HJM_Show_Bowl",
    HJM_Continue_Customer_EndDialog = "HJM_Continue_Customer_EndDialog",
    HJM_Show_Takeout_End_Dialog = "HJM_Show_Takeout_End_Dialog",

    HJM_Cancel_All_Ingredients = "HJM_Cancel_All_Ingredients",
    HJM_Change_CookArea = "HJM_Change_CookArea",
    HJM_Completed = "HJM_Completed",
    HJM_Pack_Ingredients = "HJM_Pack_Ingredients",
    HJM_All_Packed = "HJM_All_Packed",
    HJM_Show_Add_Tip = "HJM_Show_Add_Tip",
    HJM_Update_Money = "HJM_Update_Money",
    HJM_Update_Time = "HJM_Update_Time",
    HJM_Update_Smile = "HJM_Update_Smile",
    HJM_Hide_smile = "HJM_Hide_smile",
    HJM_Show_smile = "HJM_Show_smile",
    HJM_Hide_New_Takeout_Order = "HJM_Hide_New_Takeout_Order",

    HJM_ORDER_DATA_UPDATED = "HJM_ORDER_DATA_UPDATED",
    HJM_New_Takeout_Order = "HJM_New_Takeout_Order",
    // HJM_Show_Pancake_Stick = "HJM_Show_Pancake_Stick",

    // HJM_Show_Dish = "HJM_Show_Dish",
    HJM_Take_Dish = "HJM_Take_Dish",
    HJM_Show_Dish_Node = "HJM_Show_Dish_Node",
    

    HJM_ShowTip_Back = "HJM_ShowTip_Back",
    HJM_ShowTip_NoMoney = "HJM_ShowTip_NoMoney",

    HJM_ShowTip_OpenTakeout = "HJM_ShowTip_OpenTakeout",

    HJM_Takeout_Open = "HJM_Takeout_Open",


    LSF_Update_Ingredient = "LSF_Update_Ingredient",

    LSF_Start_NewDay_Dialog = "LSF_Start_NewDay_Dialog",
        LSF_Show_End_Dialog_Sp = "LSF_Show_End_Dialog_Sp",
    LSF_Show_Bowl = "LSF_Show_Bowl",
    LSF_Continue_Customer_EndDialog = "LSF_Continue_Customer_EndDialog",
    LSF_Show_Takeout_End_Dialog = "LSF_Show_Takeout_End_Dialog",

    LSF_Cancel_All_Ingredients = "LSF_Cancel_All_Ingredients",
    LSF_Change_CookArea = "LSF_Change_CookArea",
    LSF_Completed = "LSF_Completed",
    LSF_Pack_Ingredients = "LSF_Pack_Ingredients",
    LSF_All_Packed = "LSF_All_Packed",
    LSF_Show_Add_Tip = "LSF_Show_Add_Tip",
    LSF_Update_Money = "LSF_Update_Money",
    LSF_Update_Time = "LSF_Update_Time",
    LSF_Update_Smile = "LSF_Update_Smile",
    LSF_Hide_smile = "LSF_Hide_smile",
    LSF_Show_smile = "LSF_Show_smile",

    LSF_ORDER_DATA_UPDATED = "LSF_ORDER_DATA_UPDATED",
    LSF_New_Takeout_Order = "LSF_New_Takeout_Order",
    LSF_Hide_New_Takeout_Order = "LSF_Hide_New_Takeout_Order",
    // LSF_Show_Pancake_Stick = "LSF_Show_Pancake_Stick",

    // LSF_Show_Dish = "LSF_Show_Dish",
    LSF_Take_Dish = "LSF_Take_Dish",
    LSF_Show_Dish_Node = "LSFShow_Dish_Node",

    LSF_ShowTip_Back = "LSF_ShowTip_Back",
    LSF_ShowTip_NoMoney = "LSF_ShowTip_NoMoney",
    LSF_ShowTip_OpenTakeout = "LSF_ShowTip_OpenTakeout",

    LSF_Takeout_Open = "LSF_Takeout_Open",


    KLM_Update_Ingredient = "KLM_Update_Ingredient",

    KLM_Start_NewDay_Dialog = "KLM_Start_NewDay_Dialog",
    KLM_Show_End_Dialog_Sp = "KLM_Show_End_Dialog_Sp",
    KLM_Continue_Customer_EndDialog = "KLM_Continue_Customer_EndDialog",
    KLM_Show_Takeout_End_Dialog = "KLM_Show_Takeout_End_Dialog",

    KLM_Cancel_All_Ingredients = "KLM_Cancel_All_Ingredients",
    KLM_Pack_Ingredients = "KLM_Pack_Ingredients",
    KLM_All_Packed = "KLM_All_Packed",
    KLM_Completed = "KLM_Completed",
    KLM_Show_Add_Tip = "KLM_Show_Add_Tip",
    KLM_Update_Money = "KLM_Update_Money",
    KLM_Update_Time = "KLM_Update_Time",
    KLM_Update_Smile = "KLM_Update_Smile",
    KLM_Hide_smile = "KLM_Hide_smile",
    KLM_Show_smile = "KLM_Show_smile",

    KLM_ORDER_DATA_UPDATED = "KLM_ORDER_DATA_UPDATED",
    KLM_New_Takeout_Order = "KLM_New_Takeout_Order",
    KLM_Hide_New_Takeout_Order = "KLM_Hide_New_Takeout_Order",
    // JBT_Show_Pancake_Stick = "JBT_Show_Pancake_Stick",

    KLM_Show_Dish = "KLM_Show_Dish",
    KLM_Take_Dish = "KLM_Take_Dish",

    KLM_Show_Dish_Node = "KLM_Show_Dish_Node",
    

    KLM_ShowTip_Back = "KLM_ShowTip_Back",
    KLM_ShowTip_NoMoney = "KLM_ShowTip_NoMoney",

    KLM_ShowTip_OpenTakeout = "KLM_ShowTip_OpenTakeout",

    KLM_Takeout_Open = "KLM_Takeout_Open",



    JP_Show_PackBag = "JP_Show_PackBag",
    JP_Hide_PackBag = "JP_Hide_PackBag",

    JP_Show_EndPanel = "JP_Show_EndPanel",
    JP_Hide_EndPanel = "JP_Hide_EndPanel",
    JP_Show_Money = "JP_Show_money",
    JP_Hide_Money = "JP_Hide_money",

    JP_ShowTutorial = "JP_ShowTutorial",
    JP_HideTutorial = "JP_HideTutorial",

    JP_Remove_All_Customers = "JP_Remove_All_Customers",
}


