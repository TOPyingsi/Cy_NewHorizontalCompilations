import { _decorator, Component, Node, Label, Button } from 'cc';
import { XCT_JP_DataManager } from '../../Manager/XCT_JP_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_JP_DialogManager')
export class XCT_JP_DialogManager extends Component {
    @property({ type: Node })
    hostNode: Node = null;
    // 三种对话框
    @property({ type: Node })
    narratorDialog: Node = null!; // 旁白（无人物）
    @property({ type: Node })
    hostDialog: Node = null!;     // 店长（id=0）
    @property({ type: Node })
    customerDialog: Node = null!; // 顾客（id>=1）

    // 对话框文本
    @property({ type: Label })
    narratorLabel: Label = null!;
    @property({ type: Label })
    hostLabel: Label = null!;
    @property({ type: Label })
    customerLabel: Label = null!;

    @property({ type: Button })
    nextBtn: Button = null!;

    private currentDialogIndex: number = 0;
    private onDialogEnd: Function = () => { };

    init() {
        this.nextBtn.node.on(Button.EventType.CLICK, this.showNextDialog, this);
        this.hideAllDialogs();
    }

    // 显示开场对话
    showOpeningDialog(onEnd: Function) {
        this.onDialogEnd = onEnd;
        this.currentDialogIndex = 0;
        this.showCurrentOpeningDialog();
    }

    // 显示当前开场对话
    private showCurrentOpeningDialog() {
        const dialogs = XCT_JP_DataManager.Instance.dialogConfig.opening;
        if (this.currentDialogIndex >= dialogs.length) {
            //ooooooooooooooooooooo顺序对不对？
            this.onDialogEnd();
            this.hideAllDialogs();
            return;
        }

        const dialog = dialogs[this.currentDialogIndex];
        this.showDialog(dialog.content, dialog.personId, false);
    }

    // 显示普通对话
    showDialog(content: string, personId: number, isEnd: boolean) {
        this.hideAllDialogs();
        this.nextBtn.node.active = !isEnd;

        switch (personId) {
            case -1: // 旁白
                this.narratorDialog.active = true;
                this.narratorLabel.string = content;
                break;
            case 0: // 店长
                this.hostNode.active = true;
                this.hostDialog.active = true;
                this.hostLabel.string = content;
                break;
            default: // 顾客
                this.customerDialog.active = true;
                this.customerLabel.string = content;
                break;
        }
    }

    // 显示下一段对话
    showNextDialog() {
         XCT_AudioManager.getInstance().playSound("点击");
        const dialogs = XCT_JP_DataManager.Instance.dialogConfig.opening;
        const current = dialogs[this.currentDialogIndex];
        if (current.next === -1) {
            this.onDialogEnd();
            this.hideAllDialogs();
            return;
        }
        this.currentDialogIndex = current.next - 1; // 索引校正
        this.showCurrentOpeningDialog();
    }

    // 隐藏所有对话框
    hideAllDialogs() {
        // this.hostNode.active = false;
        this.narratorDialog.active = false;
        this.hostDialog.active = false;
        this.customerDialog.active = false;
        this.nextBtn.node.active = false;
    }
}