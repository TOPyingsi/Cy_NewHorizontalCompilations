import { _decorator, Component, director, Material, MeshRenderer, Node, Tween, tween, Vec3 } from 'cc';
import { WBSRL_GameManager } from './WBSRL_GameManager';
import { WBSRL_Joystick } from './WBSRL_Joystick';
import { WBSRL_PlayerController } from './WBSRL_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_Window')
export class WBSRL_Window extends Component {

    Mesh: MeshRenderer = null;

    protected onLoad(): void {
        this.Mesh = this.getComponent(MeshRenderer);
    }

    OpenWindow() {
        director.getScene().emit("WBSRL_OpenWindow_2");
        tween(this.node)
            .by(1, { eulerAngles: new Vec3(70, 0, 0) }, { easing: `sineOut` })
            .call(() => {
                this.Mesh.material = WBSRL_GameManager.Instance.TransparentMaterial;
            })
            .start();
    }

    CloseWindow() {
        Tween.stopAllByTarget(this.node);
        this.Mesh.material = WBSRL_GameManager.Instance.WindowMaterial;
        tween(this.node)
            .by(1, { eulerAngles: new Vec3(-70, 0, 0) }, { easing: `sineOut` })
            .call(() => {
                WBSRL_Joystick.Instance.ShowInteractButton(true);
                WBSRL_PlayerController.Instance.removeCameraTargetTexture();
                WBSRL_GameManager.Instance.CloseWindowPanel();
                // WBSRL_GameManager.Instance.CloseShowerRoom();
                director.getScene().emit("WBSRL_CloseWindow_2");
            })
            .start();
    }



    protected onEnable(): void {
        director.getScene().on("WBSRL_OpenWindow", this.OpenWindow, this);
        director.getScene().on("WBSRL_CloseWindow", this.CloseWindow, this);
    }

    protected onDisable(): void {
        director.getScene().off("WBSRL_OpenWindow", this.OpenWindow, this);
        director.getScene().off("WBSRL_CloseWindow", this.CloseWindow, this);
    }
}


