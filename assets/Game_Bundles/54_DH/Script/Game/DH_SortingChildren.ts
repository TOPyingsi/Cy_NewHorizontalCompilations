import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DH_SortingChildren')
export class DH_SortingChildren extends Component {

    update(deltaTime: number) {
        this.node.children.sort((a, b) => b.position.y - a.position.y);
    }
}


