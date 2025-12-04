import { _decorator, Component, Node } from 'cc';
import { XYMJDWY_SellBox } from '../XYMJDWY_SellBox';
import { XYMJDWY_Constant } from '../XYMJDWY_Constant';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_SellPanel')
export class XYMJDWY_SellPanel extends Component {
    start() {
        this.node.getChildByPath("ScrollView/view/content").children.forEach((nd: Node, index: number) => {
            nd.getComponent(XYMJDWY_SellBox).Name = XYMJDWY_Constant.PropData[index].Name;
            nd.getComponent(XYMJDWY_SellBox).Init();
        })
    }

    OnExit() {
        this.node.active = false;
    }
}


