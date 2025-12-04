import { _decorator, Component, Event, Node, PageView } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_TutorialsPanel')
export class XZPQ_TutorialsPanel extends PanelBase {
    PageView: PageView = null;
    Content: Node = null;

    
    protected onLoad(): void {
        this.PageView = NodeUtil.GetComponent("PageView", this.node, PageView);
        this.Content = NodeUtil.GetNode("Content", this.node);
        this.Show();
    }

    Show() {
        super.Show(this.PageView);
        this.PageView.removeAllPages();
        for (let i = 0; i < this.Content.children.length; i++) {
            this.PageView.addPage(this.Content.children[i]);
        }
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "LastButton":
                if (this.PageView.getCurrentPageIndex() > 0) {
                    this.PageView.scrollToPage(this.PageView.getCurrentPageIndex() - 1, 0.15);
                }
                break;
            case "NextButton":
                if (this.PageView.getCurrentPageIndex() < this.PageView.getPages().length - 1) {
                    this.PageView.scrollToPage(this.PageView.getCurrentPageIndex() + 1, 0.15);
                }
                break;
            case "KnowButton":
                this.Hide();
                break;
        }
    }


}


