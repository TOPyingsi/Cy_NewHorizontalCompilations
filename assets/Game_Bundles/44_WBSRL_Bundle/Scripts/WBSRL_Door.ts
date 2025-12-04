import { _decorator, Component, director, Node, tween, v3 } from 'cc';
import { WBSRL_Joystick } from './WBSRL_Joystick';
import { WBSRL_PlayerController } from './WBSRL_PlayerController';
import { WBSRL_GameManager } from './WBSRL_GameManager';
const { ccclass, property } = _decorator;

@ccclass('WBSHRL_Door')
export class WBSHRL_Door extends Component {

    OpenDoor() {
        tween(this.node)
            .by(1, { eulerAngles: v3(0, 80, 0) }, { easing: `smooth` })
            .start();
    }

    CloseDoor() {
        tween(this.node)
            .by(1, { eulerAngles: v3(0, -80, 0) }, { easing: `smooth` })
            .call(() => {
                WBSRL_Joystick.Instance.ShowInteractButton(true);
                WBSRL_PlayerController.Instance.removeCameraTargetTexture();
                WBSRL_GameManager.Instance.CloseRoom();
            })
            .start();
    }

    protected onEnable(): void {
        director.getScene().on("WBSRL_OpenDoor", this.OpenDoor, this);
        director.getScene().on("WBSRL_CloseDoor", this.CloseDoor, this);
    }

    protected onDisable(): void {
        director.getScene().off("WBSRL_OpenDoor", this.OpenDoor, this);
        director.getScene().off("WBSRL_CloseDoor", this.CloseDoor, this);
    }
}


