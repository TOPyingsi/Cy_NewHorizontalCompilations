import { _decorator, Component, director, errorID, Node, tween } from 'cc';
import { WBSRL_Joystick } from './WBSRL_Joystick';
import { WBSRL_PlayerController } from './WBSRL_PlayerController';
import { WBSRL_GameManager } from './WBSRL_GameManager';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_Curtain')
export class WBSRL_Curtain extends Component {

    @property
    IsLeft: boolean = false;

    OpenWindow() {
        const moveZ: number = this.IsLeft ? -0.6 : 0.6;
        director.getScene().emit("WBSRL_OpenWindow_2");
        tween(this.node)
            .by(1, { z: moveZ }, { easing: `smooth` })
            .start();
    }

    CloseWindow() {
        const moveZ: number = !this.IsLeft ? -0.6 : 0.6;
        tween(this.node)
            .by(1, { z: moveZ }, { easing: `smooth` })
            .call(() => {
                WBSRL_Joystick.Instance.ShowInteractButton(true);
                WBSRL_PlayerController.Instance.removeCameraTargetTexture();
                WBSRL_GameManager.Instance.CloseWindowPanel();
                director.getScene().emit("WBSRL_CloseWindow_2");
            })
            .start();
    }



    protected onEnable(): void {
        director.getScene().on("WBSRL_OpenCurtain", this.OpenWindow, this);
        director.getScene().on("WBSRL_CloseCurtain", this.CloseWindow, this);
    }

    protected onDisable(): void {
        director.getScene().off("WBSRL_OpenCurtain", this.OpenWindow, this);
        director.getScene().off("WBSRL_CloseCurtain", this.CloseWindow, this);
    }

}


