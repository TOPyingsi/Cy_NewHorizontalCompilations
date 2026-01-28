import { _decorator, Component, Node, Label, NodeEventType, EventTouch, Color, tween, v3, Tween } from 'cc';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import { CDXX2_UIController } from './CDXX2_UIController';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
const { ccclass, property } = _decorator;

/**
 * 签到系统
 * 根据在线时长领取奖励
 */
@ccclass('CDXX2_QianDao')
export class CDXX2_QianDao extends Component {

    @property(Node)
    QianDaoPopup: Node = null;  // 签到弹窗节点

    @property(Node)
    CloseBtn: Node = null;  // 退出按钮

    @property(Label)
    OnlineTimeLabel: Label = null;  // 在线时长Label

    @property([Node])
    RewardBtns: Node[] = [];  // 6个奖励按钮

    // 奖励时间要求（分钟）
    private _rewardTimes: number[] = [5, 10, 20, 30, 40, 60];
    
    // 在线时长（秒）
    private _onlineSeconds: number = 0;

    // Tips节点（用于呼吸动画提示）
    private _tips: Node = null;

    protected onLoad(): void {
        // 点击签到按钮打开弹窗
        this.node.on(NodeEventType.TOUCH_END, this.openPopup, this);

        // 获取Tips节点
        this._tips = this.node.getChildByName("Tips");
        
        // 监听显示Tips的事件
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_TIPS_SHOW, this.ShowTips, this);

        // 绑定退出按钮事件
        if (this.CloseBtn) {
            this.CloseBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.closePopup();
            }, this);
        }

        // 绑定奖励按钮事件
        this.RewardBtns.forEach((btn, index) => {
            if (btn) {
                btn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                    event.propagationStopped = true;
                    this.onRewardBtnClick(index);
                }, this);
            }
        });
    }

    protected start(): void {
        // 延迟加载数据，确保CDXX2_GameData已经读取完存档
        this.scheduleOnce(() => {
            // 读取保存的在线时长和领取状态
            this.loadData();
            
            // 开始计时
            this.schedule(this.updateOnlineTime, 1);
        }, 0.2);
    }

    protected onDestroy(): void {
        this.unschedule(this.updateOnlineTime);
    }

    // 读取数据
    loadData(): void {
        // 检查是否需要重置（新的一天）
        this.checkDailyReset();
        
        // 读取保存的在线时长（同一天内累计）
        this._onlineSeconds = Number(CDXX2_GameData.Instance.userData["在线时长"]) || 0;
        console.log(`签到系统：读取在线时长 = ${this._onlineSeconds}秒`);
    }

    // 检查每日重置
    checkDailyReset(): void {
        // 获取今天的日期数字（年月日组合，如20240115）
        const now = new Date();
        const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        const lastLoginDate = CDXX2_GameData.Instance.userData["上次登录日期"] || 0;

        console.log(`签到系统：今天=${today}, 上次登录=${lastLoginDate}`);

        // 如果是第一次登录（lastLoginDate为0），只设置日期，不重置
        if (lastLoginDate === 0) {
            CDXX2_GameData.Instance.userData["上次登录日期"] = today;
            CDXX2_GameData.DateSave();
            console.log("签到系统：首次登录，设置登录日期");
            return;
        }

        // 如果是新的一天，重置奖励领取状态和在线时长
        if (lastLoginDate !== today) {
            CDXX2_GameData.Instance.userData["在线时长"] = 0;
            CDXX2_GameData.Instance.userData["签到奖励1已领取"] = 0;
            CDXX2_GameData.Instance.userData["签到奖励2已领取"] = 0;
            CDXX2_GameData.Instance.userData["签到奖励3已领取"] = 0;
            CDXX2_GameData.Instance.userData["签到奖励4已领取"] = 0;
            CDXX2_GameData.Instance.userData["签到奖励5已领取"] = 0;
            CDXX2_GameData.Instance.userData["签到奖励6已领取"] = 0;
            CDXX2_GameData.Instance.userData["上次登录日期"] = today;
            CDXX2_GameData.DateSave();
            
            console.log("签到系统：签到奖励已重置（新的一天）");
        } else {
            console.log("签到系统：同一天，保留在线时长");
        }
    }

    // 保存数据
    saveData(): void {
        CDXX2_GameData.Instance.userData["在线时长"] = this._onlineSeconds;
        CDXX2_GameData.DateSave();
    }

    // 更新在线时长
    updateOnlineTime(): void {
        this._onlineSeconds++;
        
        // 每60秒保存一次
        if (this._onlineSeconds % 60 === 0) {
            this.saveData();
        }

        // 更新显示
        this.updateOnlineTimeLabel();
        this.updateRewardBtnsState();
    }

    // 更新在线时长显示
    updateOnlineTimeLabel(): void {
        if (this.OnlineTimeLabel) {
            const minutes = Math.floor(this._onlineSeconds / 60);
            const seconds = this._onlineSeconds % 60;
            this.OnlineTimeLabel.string = `在线:${minutes}分${seconds}秒`;
        }
    }

    // 显示Tips呼吸动画
    ShowTips(): void {
        if (!this._tips) return;
        
        this._tips.active = true;
        tween(this._tips)
            .by(0.5, { scale: v3(-0.3, -0.3, -0.3) }, { easing: `sineIn` })
            .by(0.5, { scale: v3(0.3, 0.3, 0.3) }, { easing: `sineIn` })
            .delay(1)
            .union()
            .repeatForever()
            .start();
    }

    // 更新奖励按钮状态
    updateRewardBtnsState(): void {
        const onlineMinutes = this._onlineSeconds / 60;
        
        this.RewardBtns.forEach((btn, index) => {
            if (!btn) return;
            
            const requiredMinutes = this._rewardTimes[index];
            const claimed = this.isRewardClaimed(index);
            
            // 获取按钮的Label组件来改变颜色提示
            const label = btn.getComponentInChildren(Label);
            
            if (claimed) {
                // 已领取 - 灰色
                if (label) label.color = new Color(128, 128, 128, 255);
            } else if (onlineMinutes >= requiredMinutes) {
                // 可领取 - 绿色
                if (label) label.color = new Color(0, 255, 0, 255);
            } else {
                // 未达到时间 - 白色
                if (label) label.color = new Color(255, 255, 255, 255);
            }
        });
    }

    // 检查奖励是否已领取
    isRewardClaimed(index: number): boolean {
        const claimedKey = `签到奖励${index + 1}已领取`;
        return CDXX2_GameData.Instance.userData[claimedKey] === 1;
    }

    // 设置奖励已领取
    setRewardClaimed(index: number): void {
        const claimedKey = `签到奖励${index + 1}已领取`;
        CDXX2_GameData.Instance.userData[claimedKey] = 1;
        CDXX2_GameData.DateSave();
    }

    // 点击奖励按钮
    onRewardBtnClick(index: number): void {
        if (index < 0 || index >= this._rewardTimes.length) return;

        const requiredMinutes = this._rewardTimes[index];
        const onlineMinutes = this._onlineSeconds / 60;

        // 检查是否已领取
        if (this.isRewardClaimed(index)) {
            CDXX2_UIController.Instance.TipsPanel.show("已领取过该奖励！");
            return;
        }

        // 检查时间是否足够
        if (onlineMinutes < requiredMinutes) {
            CDXX2_UIController.Instance.TipsPanel.show(`需要在线${requiredMinutes}分钟才能领取！`);
            return;
        }

        // 发放奖励 - 哈基米南北绿豆
        CDXX2_Equipment.Instance.addElixir("哈基米南北绿豆", 1);
        
        // 标记已领取
        this.setRewardClaimed(index);

        // 更新按钮状态
        this.updateRewardBtnsState();

        CDXX2_UIController.Instance.TipsPanel.show("领取成功！获得哈基米南北绿豆x1");
    }

    openPopup(): void {
        // 点击打开弹窗时，隐藏Tips
        if (this._tips && this._tips.active) {
            this._tips.active = false;
        }
        
        if (this.QianDaoPopup) {
            this.QianDaoPopup.active = true;
            this.updateOnlineTimeLabel();
            this.updateRewardBtnsState();
        }
    }

    closePopup(): void {
        if (this.QianDaoPopup) {
            this.QianDaoPopup.active = false;
        }
    }
}
