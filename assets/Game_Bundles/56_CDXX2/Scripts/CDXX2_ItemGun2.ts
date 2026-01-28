import { _decorator, Component, Enum, find, Node } from 'cc';
import { CDXX2_PICKAXE } from './CDXX2_Constant';
import { CDXX2_Tool } from './CDXX2_Tool';
import { CDXX2_GameData } from './CDXX2_GameData';
import Banner from 'db://assets/Scripts/Banner';
import { CDXX2_Equipment } from './CDXX2_Equipment';
const { ccclass, property } = _decorator;

@ccclass('CDXX2_ItemGun')
export class CDXX2_ItemGun extends Component {

    @property({ type: Enum(CDXX2_PICKAXE) })
    Type: CDXX2_PICKAXE = CDXX2_PICKAXE.宝品剑;

    Mask: Node = null;
    Name: string = "";
    Lab:Node =  null;

    private _isHave: boolean = false;

    protected onLoad(): void {
        this.Mask = find("Mask", this.node);
        this.Lab = find("Lab", this.node);
        this.Name = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PICKAXE, this.Type);
        this.node.on(Node.EventType.TOUCH_END, this.Click, this);
    }

    protected start(): void {
        this.Show();
    }

    Show() {
        this._isHave = CDXX2_GameData.Instance.Pickaxe.hasOwnProperty(this.Name);
        this.Mask.active = !this._isHave;
    }

    Click() {
        if (!this._isHave) {
            Banner.Instance.ShowVideoAd(() => {
                CDXX2_Equipment.Instance.addPickaxe(this.Name);
                this.Mask.active = false;
                this._isHave = true;
                this.Lab.active = true;
            })
        }

    }
}


