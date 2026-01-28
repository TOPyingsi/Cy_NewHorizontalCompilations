import { _decorator, Component, Node, NodeEventType, EventTouch, find, Label } from 'cc';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_GameData } from './CDXX2_GameData';
import Banner from 'db://assets/Scripts/Banner';
import { CDXX2_UIController } from './CDXX2_UIController';
const { ccclass, property } = _decorator;

/**
 * 换皮肤系统
 * 点击皮肤按钮打开弹窗，选择不同皮肤切换角色外观
 */
@ccclass('CDXX2_HuanPiFu')
export class CDXX2_HuanPiFu extends Component {

    @property(Node)
    PiFuPopup: Node = null;  // 皮肤弹窗节点

    @property(Node)
    CloseBtn: Node = null;  // 退出按钮

    @property([Node])
    SkinBtns: Node[] = [];  // 8个皮肤按钮

    // 皮肤名称列表（对应Spine的skin名称）
    private _skinNames: string[] = ["pifu1", "pifu2", "pifu3", "pifu4", "pifu5", "pifu6", "pifu7", "pifu8"];

    protected onLoad(): void {
        // 点击皮肤按钮打开弹窗
        this.node.on(NodeEventType.TOUCH_END, this.openPopup, this);

        // 绑定退出按钮事件
        if (this.CloseBtn) {
            this.CloseBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.closePopup();
            }, this);
        }

        // 绑定皮肤按钮事件
        this.SkinBtns.forEach((btn, index) => {
            if (btn) {
                btn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                    event.propagationStopped = true;
                    this.onSkinBtnClick(index);
                }, this);
            }
        });
    }

    protected start(): void {
        // 更新所有按钮的显示状态
        this.updateAllButtonsState();
    }

    // 更新所有按钮的显示状态
    updateAllButtonsState(): void {
        this.SkinBtns.forEach((btn, index) => {
            if (btn) {
                this.updateButtonState(btn, index);
            }
        });
    }

    // 更新单个按钮的显示状态
    updateButtonState(btn: Node, index: number): void {
        const videoNode = btn.getChildByName("Video");
        const label2Node = btn.getChildByName("Label2");
        const isUnlocked = this.isSkinUnlocked(index);

        if (videoNode) videoNode.active = !isUnlocked;
        if (label2Node) label2Node.active = isUnlocked;
    }

    // 检查皮肤是否已解锁
    isSkinUnlocked(index: number): boolean {
        const unlockKey = `皮肤${index + 1}已解锁`;
        return CDXX2_GameData.Instance.userData[unlockKey] === 1;
    }

    // 解锁皮肤
    unlockSkin(index: number): void {
        const unlockKey = `皮肤${index + 1}已解锁`;
        CDXX2_GameData.Instance.userData[unlockKey] = 1;
        CDXX2_GameData.DateSave();
    }

    openPopup(): void {
        if (this.PiFuPopup) {
            this.PiFuPopup.active = true;
            // 打开弹窗时更新所有按钮状态
            this.updateAllButtonsState();
        }
    }

    closePopup(): void {
        if (this.PiFuPopup) {
            this.PiFuPopup.active = false;
        }
    }

    // 点击皮肤按钮
    onSkinBtnClick(index: number): void {
        if (index < 0 || index >= this._skinNames.length) {
            console.warn(`无效的皮肤索引: ${index}`);
            return;
        }

        // 检查皮肤是否已解锁
        if (!this.isSkinUnlocked(index)) {
            // 未解锁，播放视频广告解锁
            Banner.Instance.ShowVideoAd(() => {
                // 视频播放完成，解锁皮肤
                this.unlockSkin(index);
                
                // 更新按钮状态
                const btn = this.SkinBtns[index];
                if (btn) {
                    this.updateButtonState(btn, index);
                }
                
                // 切换到该皮肤
                const skinName = this._skinNames[index];
                this.changeSkin(skinName);
                
                // 保存当前皮肤选择
                CDXX2_GameData.Instance.userData["当前皮肤"] = index;
                CDXX2_GameData.DateSave();
                
                // 提示解锁成功
                CDXX2_UIController.Instance.TipsPanel.show(`解锁皮肤成功`);
                
                // 关闭弹窗
                this.closePopup();
            });
        } else {
            // 已解锁，直接切换皮肤
            const skinName = this._skinNames[index];
            this.changeSkin(skinName);
            
            // 保存当前皮肤选择
            CDXX2_GameData.Instance.userData["当前皮肤"] = index;
            CDXX2_GameData.DateSave();

            // 关闭弹窗
            this.closePopup();
        }
    }

    // 切换皮肤
    changeSkin(skinName: string): void {
        if (CDXX2_PlayerController.Instance && CDXX2_PlayerController.Instance.Skeleton) {
            CDXX2_PlayerController.Instance.Skeleton.setSkin(skinName);
            console.log(`切换皮肤: ${skinName}`);
        } else {
            console.warn("玩家控制器或Skeleton未初始化");
        }
    }

    // 加载保存的皮肤（在游戏开始时调用）
    loadSavedSkin(): void {
        const savedIndex = CDXX2_GameData.Instance.userData["当前皮肤"];
        if (savedIndex !== undefined && savedIndex >= 0 && savedIndex < this._skinNames.length) {
            const skinName = this._skinNames[savedIndex];
            this.changeSkin(skinName);
        }
    }
}
