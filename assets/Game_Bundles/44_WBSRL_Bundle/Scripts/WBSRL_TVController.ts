import { _decorator, Component, instantiate, Node, Prefab, Sprite } from 'cc';
import { WBSRL_Monologue } from './WBSRL_Monologue';
import { WBSRL_TV } from './WBSRL_TV';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_TVController')
export class WBSRL_TVController extends Component {

    @property(Prefab)
    TVs: Prefab[] = [];

    @property(Sprite)
    Icon: Sprite = null;

    @property(WBSRL_Monologue)
    Monologue: WBSRL_Monologue = null;

    CurTV: WBSRL_TV = null;

    ShowTV() {
        if (this.TVs.length <= 0) return;
        this.node.active = true;
        const node: Node = instantiate(this.TVs.shift());
        this.CurTV = node.getComponent(WBSRL_TV);
        this.Icon.spriteFrame = this.CurTV.SF;
        this.Click();
    }

    Click() {
        if (this.Monologue.IsPlaying) return;
        if (this.CurTV.string.length <= 0) {
            this.node.active = false;
            return;
        }
        this.Monologue.playText(this.CurTV.string.shift().toString());
    }

}


