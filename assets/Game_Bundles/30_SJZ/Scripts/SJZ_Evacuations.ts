import { _decorator, Component } from 'cc';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
const { ccclass, property } = _decorator;


@ccclass('SJZ_Evacuations')
export default class SJZ_Evacuations extends Component {
    onLoad() {
        if (this.node.children.length > 2) {
            let indexs = [];
            indexs.push(Tools.GetRandomInt(0, this.node.children.length));
            indexs.push(Tools.GetRandomInt(0, this.node.children.length));
            for (let i = 0; i < this.node.children.length; i++) {
                this.node.children[i].active = indexs.indexOf(i) != -1;
            }
        }
    }

}