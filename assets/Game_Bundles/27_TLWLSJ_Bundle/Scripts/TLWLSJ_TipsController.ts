import { _decorator, Component, easing, find, Node, tween, Tween, v3 } from 'cc';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_Backpack } from './TLWLSJ_Backpack';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_TipsController')
export class TLWLSJ_TipsController extends Component {
    public static Instance: TLWLSJ_TipsController = null;

    @property(Node)
    Target2D: Node[] = [];

    Targets: Node[] = [];
    Tips: Node = null;
    Tips2D: Node = null;

    NeedTips: number = 0;
    IsPack: boolean = false;
    IsPackStart: boolean = false;

    IsClick: boolean[] = [false, false, false, false, false];

    protected onLoad(): void {
        TLWLSJ_TipsController.Instance = this;
        this.Tips = find("提示", this.node);
        this.Tips2D = find("提示UI-2D", this.node);
    }

    addTarget(target: Node) {
        const index: number = this.Targets.findIndex(e => e == target);
        if (index != -1) return;
        this.Targets.push(target);
        this.ShowTips();
    }

    removeTarget(target: Node) {
        const index = this.Targets.findIndex(e => e == target);
        if (index != -1) this.Targets.splice(index, 1);
        if (this.Targets.length <= 0) {
            this.closeTips();
            return;
        }
        this.ShowTips();
    }

    check() {
        if (this.NeedTips <= 0 && this.IsPack) {
            TLWLSJ_GameManager.Instance.PackButton.active = true;
            this.IsPackStart = true;
            this.ShowUI2D();
        }
    }

    ShowTips() {
        if (this.Targets.length <= 0) return;
        this.Tips.active = true;
        this.Tips.setWorldPosition(this.Targets[0].getWorldPosition());
        Tween.stopAllByTarget(this.Tips);
        tween(this.Tips)
            .to(0.5, { scale: v3(0.5, 0.5, 0.5) }, { easing: `sineOut` })
            .delay(0.1)
            .to(0.5, { scale: v3(0.7, 0.7, 0.7) }, { easing: `sineOut` })
            .delay(1)
            .union()
            .repeatForever()
            .start();

    }

    closeTips() {
        Tween.stopAllByTarget(this.Tips);
        this.Tips.active = false;
    }

    ShowUI2D() {
        if (this.Target2D.length <= 0) {
            this.IsPack = false
            return;
        }
        this.Tips2D = this.Target2D.shift();
        if (this.Target2D.length <= 0) TLWLSJ_Backpack.Instance.BackButton.active = true;
        this.Tips2D.active = true;
        Tween.stopAllByTarget(this.Tips2D);
        tween(this.Tips2D)
            .to(0.5, { scale: v3(0.5, 0.5, 0.5) }, { easing: `sineOut` })
            .delay(0.1)
            .to(0.5, { scale: v3(0.7, 0.7, 0.7) }, { easing: `sineOut` })
            .delay(1)
            .union()
            .repeatForever()
            .start();
    }

    nextTips2D(index: number) {
        if (this.IsClick[index]) return;
        this.IsClick[index] = true;
        Tween.stopAllByTarget(this.Tips2D);
        if (this.Tips2D) this.Tips2D.active = false;
        this.ShowUI2D();
    }

}


