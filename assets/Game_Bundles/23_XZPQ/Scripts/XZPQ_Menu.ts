import { _decorator, Component, Node } from 'cc';
import { XZPQ_NeedHelp } from './XZPQ_NeedHelp';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_Menu')
export class XZPQ_Menu extends Component {

    @property(XZPQ_NeedHelp)
    help: XZPQ_NeedHelp = null;
    start() {

    }

    update(deltaTime: number) {
    
    }

    newGame(){
        this.help.node.active = true;
    }

    continueGame(){
        this.help.node.active = true;
    }
    
}


