import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJDWY_GameData } from './XYMJDWY_GameData';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_BagProp')
export class XYMJDWY_BagProp extends Component {
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
            let propNum = XYMJDWY_GameData.Instance.GetPropNum(propName);

            if (propNum <= 0) {
                this.node.destroy();
                return;
            }

            propLabel.string = XYMJDWY_GameData.Instance.GetPropNum(propName).toString();

            // director.getScene().emit("校园摸金_更新战获");

        }
    }
}


