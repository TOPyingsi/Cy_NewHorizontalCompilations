import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XGDY_SortingChildren')
export class XGDY_SortingChildren extends Component {

    update(deltaTime: number) {
        this.node.children.sort((a, b) => b.position.y - a.position.y);
    }
}


