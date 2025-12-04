import { _decorator, Component, director, Event, Label, Node, size, Sprite, SpriteFrame, tween, UITransform, v2 } from 'cc';
import { CCWSS_Constant } from './CCWSS_Constant';
import { CCWSS_AudioManager } from './CCWSS_AudioManager';
import { CCWSS_UIManager } from './CCWSS_UIManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_FinishPanel')
export class CCWSS_FinishPanel extends Component {

    Show(iswin: boolean) {
        if (iswin) {
            this.node.getChildByPath("Panel/Title").getComponent(Label).string = "恭喜你猜对了！";
            this.node.getChildByPath("Panel/胜利").active = true;
            tween(this.node.getChildByPath("Panel/胜利/飘带").getComponent(UITransform))
                .to(100, { contentSize: size(this.node.getChildByPath("Panel/胜利/飘带").getComponent(UITransform).width, 50000) })
                .start();
        }
        else {
            this.node.getChildByPath("Panel/Title").getComponent(Label).string = "你输了！";
            this.node.getChildByPath("Panel/失败").active = true;
        }
        BundleManager.GetBundle("7_CCWSS_Bundle").load("UI/人物/" + (CCWSS_Constant.MeSelectIndex + 1) + "/spriteFrame", SpriteFrame, (err, spf) => {
            if (err) console.log(err);
            this.node.getChildByPath("Panel/Me/PeopleSelect").getComponentInChildren(Sprite).spriteFrame = spf;
        })
        BundleManager.GetBundle("7_CCWSS_Bundle").load("UI/人物/" + (CCWSS_Constant.AISelectIndex + 1) + "/spriteFrame", SpriteFrame, (err, spf) => {
            if (err) console.log(err);
            this.node.getChildByPath("Panel/AI/PeopleSelect").getComponentInChildren(Sprite).spriteFrame = spf;
        })
        this.node.getChildByPath("Panel/Me/PeopleSelect").getComponentInChildren(Label).string = CCWSS_Constant.PeopleNames[CCWSS_Constant.MeSelectIndex];
        this.node.getChildByPath("Panel/AI/PeopleSelect").getComponentInChildren(Label).string = CCWSS_Constant.PeopleNames[CCWSS_Constant.AISelectIndex];
        CCWSS_UIManager.Instance.ShowPanel(this.node);
        ProjectEventManager.emit(ProjectEvent.游戏结束, "猜猜我是谁");
    }

    ButtonClick(event: Event) {
        CCWSS_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "ReStartBtn":
                {
                    CCWSS_Constant.InitData();
                    director.loadScene("CCWSS_Game");
                }
                break;
            case "BackBtn":
                {
                    director.loadScene(GameManager.StartScene);
                }
                break;
        }
    }
}


