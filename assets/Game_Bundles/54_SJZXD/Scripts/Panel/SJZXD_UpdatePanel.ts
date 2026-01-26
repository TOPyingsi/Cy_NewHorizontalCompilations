import { _decorator, Component, Label, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_UpdatePanel')
export class SJZXD_UpdatePanel extends PanelBase {
    private index: number = 0;//当前页数
    private Maxindex: number = 0;//总页数
    public static IsOnceShow: boolean = false;
    private UpdateData: { Title: string, Content: string }[] = [
        { Title: "1月24日更新公告", Content: "1.收藏室上线！珍惜物品等你来收集\n2.新增黑市神话武器特效\n3.新增大红[坦克模型][唱片机][黄金怀表]\n4.地图外景全面翻新！" }
    ]


    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.ShowPanel();
    }
    onLoad() {
        this.Maxindex = this.UpdateData.length;
    }
    //刷新界面
    ShowPanel() {
        this.node.getChildByPath("框/标题").getComponent(Label).string = this.UpdateData[this.index].Title;
        this.node.getChildByPath("框/内容").getComponent(Label).string = this.UpdateData[this.index].Content;
        if (this.index == this.Maxindex - 1) {
            this.node.getChildByPath("框/下一页").active = false;
        } else {
            this.node.getChildByPath("框/下一页").active = true;
        }
        if (this.index == 0) {
            this.node.getChildByPath("框/上一页").active = false;
        } else {
            this.node.getChildByPath("框/上一页").active = true;
        }
    }
    OnNextClick() {
        this.index++;
        if (this.index >= this.Maxindex) this.index = 0;
        this.ShowPanel();
    }
    OnLastClick() {
        this.index--;
        if (this.index < 0) this.index = this.Maxindex - 1;
        this.ShowPanel();
    }
    OnExitClick() {
        SJZXD_UpdatePanel.IsOnceShow = true;
        SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.UpdatePanel);
    }
}


