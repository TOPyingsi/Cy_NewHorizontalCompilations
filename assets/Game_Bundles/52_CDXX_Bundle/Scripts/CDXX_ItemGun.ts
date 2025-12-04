import { _decorator, Component, Enum, find, Node } from 'cc';
import { CDXX_PICKAXE } from './CDXX_Constant';
import { CDXX_Tool } from './CDXX_Tool';
import { CDXX_GameData } from './CDXX_GameData';
import Banner from 'db://assets/Scripts/Banner';
import { CDXX_Equipment } from './CDXX_Equipment';
const { ccclass, property } = _decorator;

@ccclass('CDXX_ItemGun')
export class CDXX_ItemGun extends Component {

    @property({ type: Enum(CDXX_PICKAXE) })
    Type: CDXX_PICKAXE = CDXX_PICKAXE.丛林魅影;

    Mask: Node = null;
    Name: string = "";

    private _isHave: boolean = false;

    protected onLoad(): void {
        this.Mask = find("Mask", this.node);
        this.Name = CDXX_Tool.GetEnumKeyByValue(CDXX_PICKAXE, this.Type);
        this.node.on(Node.EventType.TOUCH_END, this.Click, this);
    }

    protected start(): void {
        this.Show();
    }

    Show() {
        this._isHave = CDXX_GameData.Instance.Pickaxe.hasOwnProperty(this.Name);
        this.Mask.active = !this._isHave;
    }

    Click() {
        if (!this._isHave) {
            Banner.Instance.ShowVideoAd(() => {
                CDXX_Equipment.Instance.addPickaxe(this.Name);
                this.Mask.active = false;
                this._isHave = true;
            })
        }

    }
}


