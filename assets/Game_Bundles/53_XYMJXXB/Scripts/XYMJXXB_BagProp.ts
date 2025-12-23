import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_BagProp')
export class XYMJXXB_BagProp extends Component {
    public propName: string = "";
    start() {
        director.getScene().on("校园摸金_添加道具", this.refresh, this)

    }
    Init() {
        this.refresh(this.propName);

    }
    protected onEnable(): void {

    }

    refresh(propName: string) {

        if (propName == this.propName) {
            // let prop1 = this.scrollMap.get(propName).getChildByName("Num");
            let prop = this.node.getChildByName("propNum");
            let propLabel = prop.getComponent(Label);
            let propNum = XYMJXXB_GameData.Instance.GetPropNum(propName);

            if (propNum <= 0) {
                this.node.destroy();
                return;
            }

            propLabel.string = XYMJXXB_GameData.Instance.GetPropNum(propName).toString();

            // director.getScene().emit("校园摸金_更新战获");

        }
    }
}


