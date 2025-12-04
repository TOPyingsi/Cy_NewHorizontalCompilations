import { _decorator, Component, director, Event, Label, Node, tween, UIOpacity, v3, Vec3 } from 'cc';
import { QLTZ_AudioManager } from './QLTZ_AudioManager';
import { QLTZ_UIManager } from './QLTZ_UIManager';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('QLTZ_FinishPanel')
export class QLTZ_FinishPanel extends Component {

    title: string = null;

    protected onLoad(): void {
        QLTZ_UIManager.Instance.IsFinish = true;
        this.node.getChildByName("Title").scale = v3(5, 5, 5);
        this.node.getChildByName("Title").getComponent(UIOpacity).opacity = 0;
        this.node.getChildByName("Title").getComponent(Label).string = this.title;
        this.node.getChildByName("Title").active = true;
        tween(this.node.getChildByName("Title"))
            .to(1, { scale: Vec3.ONE }, { easing: "circOut" })
            .start()
        tween(this.node.getChildByName("Title").getComponent(UIOpacity))
            .to(1, { opacity: 255 })
            .call(() => {
                ProjectEventManager.emit(ProjectEvent.游戏结束, "抢铃挑战")
            })
            .start()
    }

    start() {

    }

    update(deltaTime: number) {

    }

    ButtonClick(event: Event) {
        QLTZ_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "ReStartBtn":
                {
                    director.loadScene("QLTZ_Game");
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


