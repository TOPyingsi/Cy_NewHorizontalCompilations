import { _decorator, Collider2D, Component, Contact2DType, EventTouch, find, IPhysics2DContact, Node, tween, UIOpacity } from 'cc';
import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import { TLWLSJ_MapController } from './TLWLSJ_MapController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_TipsController } from './TLWLSJ_TipsController';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Door')
export class TLWLSJ_Door extends Component {
    @property
    IsPass: boolean = false;

    @property
    IsLast: boolean = false;

    @property({ displayName: "新手提示" })
    IsTips: boolean = false;

    Collider2D: Collider2D = null;
    UIOpacity: UIOpacity = null;
    Door: Node = null;
    Tips: Node = null;

    IsOpen: boolean = false;

    protected onLoad(): void {
        this.Collider2D = this.getComponent(Collider2D);
        this.UIOpacity = this.getComponent(UIOpacity);
        this.Door = find("开门", this.node);
        this.Tips = find("Tips", this.node);

        if (this.Collider2D) {
            this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.Collider2D.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    Open(event: EventTouch) {
        if (this.IsOpen) return;
        //新手关卡
        if (this.IsTips && TLWLSJ_TipsController.Instance.IsPack) {
            this.Tips.active = true;
            this.Door.active = false;
            return;
        }
        if (!TLWLSJ_MapController.Instance.IsFinish || (!TLWLSJ_MapController.Instance.IsFinishAll && this.IsLast)) {
            this.Tips.active = true;
            this.Door.active = false;
            return;
        }
        TLWLSJ_AudioManager.PlaySound(Audios.OpenDoor);
        this.IsOpen = true;

        tween(this.UIOpacity)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                if (this.IsPass) {
                    //通关
                    TLWLSJ_GameManager.Instance.nextMap();
                    ProjectEventManager.emit(ProjectEvent.游戏结束, "逃离物理试卷");
                }
                this.node.destroy();
            })
            .start();
    }


    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            this.Door.active = true;
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            this.Door.active = false;
            this.Tips.active = false;
        }
    }
}


