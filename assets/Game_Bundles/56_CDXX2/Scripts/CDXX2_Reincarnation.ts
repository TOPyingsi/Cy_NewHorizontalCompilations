import { _decorator, Component, Node, Label, find } from 'cc';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_REALM } from './CDXX2_Constant';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import CDXX2_PlayerController from './CDXX2_PlayerController';
const { ccclass, property } = _decorator;

// 10京 = 10 * 10^16 = 100000000000000000
const REINCARNATION_REQUIRED_POWER = 100000000000000000;

//"轮回系统"管理轮回弹窗的显示与轮回逻辑
// 战力达到10京后可轮回，轮回后数据重置但获得永久加成

@ccclass('CDXX2_Reincarnation')
export class CDXX2_Reincarnation extends Component {

    @property(Node)
    ReincarnationPanel: Node = null;  // 轮回弹窗节点

    @property(Node)
    ReincarnationButton: Node = null;  // 轮回按钮（点击打开弹窗）

    @property(Node)
    ExitButton: Node = null;  // 退出按钮

    @property(Node)
    ConfirmButton: Node = null;  // 开启轮回按钮

    @property(Label)
    ReincarnationCountLabel: Label = null;  // 当前最高轮回次数Label

    protected onLoad(): void {
        // 绑定轮回按钮点击事件（打开弹窗）
        if (this.ReincarnationButton) {
            this.ReincarnationButton.on(Node.EventType.TOUCH_END, this.openPanel, this);
        }

        // 绑定退出按钮
        if (this.ExitButton) {
            this.ExitButton.on(Node.EventType.TOUCH_END, this.closePanel, this);
        }

        // 绑定开启轮回按钮
        if (this.ConfirmButton) {
            this.ConfirmButton.on(Node.EventType.TOUCH_END, this.onReincarnate, this);
        }
    }

    protected start(): void {
        // 初始隐藏弹窗
        if (this.ReincarnationPanel) {
            this.ReincarnationPanel.active = false;
        }
        this.updateUI();
    }

    // 打开轮回弹窗
    openPanel() {
        if (this.ReincarnationPanel) {
            this.ReincarnationPanel.active = true;
            this.updateUI();
        }
    }

    // 关闭轮回弹窗
    closePanel() {
        if (this.ReincarnationPanel) {
            this.ReincarnationPanel.active = false;
        }
    }

    // 更新UI显示
    updateUI() {
        if (this.ReincarnationCountLabel) {
            this.ReincarnationCountLabel.string = `当前最高轮回${CDXX2_GameData.Instance.ReincarnationCount}次`;
        }
    }

    // 检查是否满足轮回条件
    canReincarnate(): boolean {
        return CDXX2_GameData.Instance.ZL >= REINCARNATION_REQUIRED_POWER;
    }

    // 执行轮回
    onReincarnate() {
        // 检查战力是否足够
        if (!this.canReincarnate()) {
            // 战力不足，不做任何反应
            console.log(`战力不足，需要10京，当前：${CDXX2_GameData.Instance.ZL}`);
            return;
        }

        // 增加轮回次数
        CDXX2_GameData.Instance.ReincarnationCount++;

        // 增加永久加成
        CDXX2_GameData.Instance.ElixirBonus++;    // 吃丹收益+1
        CDXX2_GameData.Instance.HPBonus++;        // 生命加成+100%
        CDXX2_GameData.Instance.HarmBonus++;      // 伤害加成+100%

        // 重置数据到新手状态
        this.resetToNewbie();

        // 保存数据
        CDXX2_GameData.DateSave();

        // 更新UI
        this.updateUI();

        // 刷新状态显示
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);

        // 显示提示
        CDXX2_Equipment.Instance.ShowTips(`轮回成功！当前轮回${CDXX2_GameData.Instance.ReincarnationCount}次`);

        // 关闭弹窗
        this.closePanel();
    }

    // 重置数据到新手状态
    resetToNewbie() {
        // 重置生命值和伤害（应用轮回加成）
        const baseHP = 100;
        const baseHarm = 100;
        CDXX2_GameData.Instance.HP = baseHP * CDXX2_GameData.Instance.HPBonus;
        CDXX2_GameData.Instance.Harm = baseHarm * CDXX2_GameData.Instance.HarmBonus;

        // 重置境界
        CDXX2_GameData.Instance.Realm = CDXX2_REALM.筑基初期;
        CDXX2_GameData.Instance.CurExp = 0;

        // 重置地图
        CDXX2_GameData.Instance.CurMap = 0;
        CDXX2_GameData.Instance.CurEnemy = 0;

        // 清空武器（保留凡品光辉）
        CDXX2_GameData.Instance.Pickaxe = {};
        CDXX2_GameData.Instance.CurHold = "";

        // 清空丹药
        CDXX2_GameData.Instance.Elixir = {};

        // 重置货币（保留碎片、灵石、仙石）
        // 这些货币不重置，作为轮回保留

        // 刷新背包显示
        CDXX2_Equipment.Instance.showAllProp();

        // 给新手武器
        CDXX2_Equipment.Instance.addPickaxe("凡品光辉");

        // 刷新玩家境界显示
        if (CDXX2_PlayerController.Instance) {
            CDXX2_PlayerController.Instance.ShowRealm();
            CDXX2_PlayerController.Instance.Injured = 0;
        }
    }
}
