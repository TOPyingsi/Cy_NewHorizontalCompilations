import { _decorator, Component, Enum, Node, Prefab } from 'cc';
import { WBSRL_ROOM } from './WBSRL_Constant';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_Pot')
export class WBSRL_Pot extends Component {

    @property({ type: String })
    String: String[] = [];

    @property({ type: String })
    Select: String[][] = [];

    @property
    ComeIn: boolean = false;

    @property({ type: Enum(WBSRL_ROOM) })
    Room: WBSRL_ROOM = WBSRL_ROOM.储物间;

    @property(Prefab)
    PrefabInRoom: Prefab = null;

    @property
    NPC: boolean = false;

    @property
    BedNPC: boolean = false;

    GetNext(): string[] {
        if (this.String.length <= 0) {
            return ["", "", ""]
        }
        const str: string = this.String.shift().toString();
        if (str[0] == "_") {
            return ["", this.Select[Number(str[1])].toString(), this.Select[Number(str[3])].toString()]
            // return ["", this.Select[1].toString(), this.Select[3].toString()];
        }
        return [str, "", ""];
    }

}


