import { _decorator, Component, Label, Node } from 'cc';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_GameManager } from './Game/XYRZZ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_TaskPanel')
export class XYRZZ_TaskPanel extends Component {
    public TaskID: number = 0;
    public static Taskdescribe: string[] = [
        "钓鱼仙人：\n听说荒废水库中有一种红鳞鱼，肉质鲜美，你给我钓一只来，我便将我的珍宝给你。",
        "钓鱼仙人：\n我的橘猫想吃牛头青了，你能帮我钓一只来吗？",
        "钓鱼仙人：\n作为钓鱼佬，怎么能没有自己的帐篷呢？帮我弄一只青皮鱼来我就给你一个帐篷。",
        "钓鱼仙人：\n高级钓鱼佬就应该要有一个好的装备箱，你帮我钓一只长条鲨我就送你一个。",
        "钓鱼仙人：\n我这儿有一艘渔船，只有真正的强者才配得上，如果你达到1000级，我就赠送给你。",
    ]
    public static Taskdescribe2: string[] = [
        "在荒废水库中钓到过红鳞鱼",
        "在海峡大坝中钓到过牛头青",
        "在东海水域中钓到过青皮鱼",
        "在无极西湖中钓到过长条鲨",
        "游戏等级达到1000级",
    ]



    Show() {
        this.TaskID = XYRZZ_GameData.Instance.GameData[5];
        this.ShowUI();
    }


    //界面UI
    ShowUI() {
        if (this.TaskID >= XYRZZ_TaskPanel.Taskdescribe.length) {
            this.node.getChildByPath("框/任务描述").getComponent(Label).string = "钓鱼仙人：\n你已经完成我的所有任务了，钓鱼界的未来靠你了！"
            this.node.getChildByPath("框/完成描述").getComponent(Label).string = "努力成为新一代的钓鱼仙人吧！";
            this.node.getChildByPath("框/提交").active = false;
            return;
        }
        this.node.getChildByPath("框/任务描述").getComponent(Label).string = XYRZZ_TaskPanel.Taskdescribe[this.TaskID];
        this.node.getChildByPath("框/完成描述").getComponent(Label).string = "完成条件\n" + XYRZZ_TaskPanel.Taskdescribe2[this.TaskID];
    }

    //提交任务
    OnSubmitClick() {
        let IsOver: boolean = false;//任务是否完成
        switch (this.TaskID) {
            case 0: if (XYRZZ_GameData.Instance.FishRecord[0] > 0) IsOver = true; break;
            case 1: if (XYRZZ_GameData.Instance.FishRecord[3] > 0) IsOver = true; break;
            case 2: if (XYRZZ_GameData.Instance.FishRecord[6] > 0) IsOver = true; break;
            case 3: if (XYRZZ_GameData.Instance.FishRecord[9] > 0) IsOver = true; break;
            case 4: if (XYRZZ_GameData.Instance.GameData[2] >= 1000) IsOver = true; break;
        }
        if (IsOver) {
            this.GetAward();
            XYRZZ_GameData.Instance.GameData[5]++;
            this.TaskID++;
            this.ShowUI();
        } else {
            XYRZZ_UIManager.HopHint("任务还没有达成哦！");
        }
    }

    //获得奖励
    GetAward() {
        switch (this.TaskID) {
            case 0:
                XYRZZ_GameManager.Instance.ADD_Prop(0, 1);
                XYRZZ_UIManager.HopHint("获得装备：珍珠贝壳");
                break;
            case 1:
                XYRZZ_GameManager.Instance.ADD_Prop(1, 1);
                XYRZZ_UIManager.HopHint("获得装备：招财橘猫");
                break;
            case 2:
                XYRZZ_GameManager.Instance.ADD_Prop(2, 1);
                XYRZZ_UIManager.HopHint("获得装备：帐篷");
                break;
            case 3:
                XYRZZ_GameManager.Instance.ADD_Prop(3, 1);
                XYRZZ_UIManager.HopHint("获得装备：钓具箱");
                break;
            case 4:
                XYRZZ_GameManager.Instance.ADD_Prop(4, 1);
                XYRZZ_UIManager.HopHint("获得装备：渔船");
                break;
        }
    }

    //退出
    OnExitClick() {
        XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_TaskPanel);
    }
}


