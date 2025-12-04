import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_TV')
export class WBSRL_TV extends Component {

    @property(String)
    string: String[] = [];

    @property(SpriteFrame)
    SF: SpriteFrame = null;
}


