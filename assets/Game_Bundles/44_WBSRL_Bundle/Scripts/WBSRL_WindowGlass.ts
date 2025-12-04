import { _decorator, Component, director, Material, MeshRenderer, Node } from 'cc';
import { WBSRL_GameManager } from './WBSRL_GameManager';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_WindowGlass')
export class WBSRL_WindowGlass extends Component {
    Mesh: MeshRenderer = null;

    protected onLoad(): void {
        this.Mesh = this.getComponent(MeshRenderer);
    }

    ChangeTransparent() {
        this.Mesh.material = WBSRL_GameManager.Instance.TransparentMaterial;
    }

    ChangeNoTransparent() {
        this.Mesh.material = WBSRL_GameManager.Instance.WindowGlassMaterial;
    }

    protected onEnable(): void {
        director.getScene().on("WBSRL_OpenWindow_2", this.ChangeTransparent, this);
        director.getScene().on("WBSRL_CloseWindow_2", this.ChangeNoTransparent, this);
    }

    protected onDisable(): void {
        director.getScene().off("WBSRL_OpenWindow_2", this.ChangeTransparent, this);
        director.getScene().off("WBSRL_CloseWindow_2", this.ChangeNoTransparent, this);
    }
}


