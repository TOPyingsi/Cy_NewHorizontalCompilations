import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';

@ccclass('ZWDZJS_TuXing')
export default class ZWDZJS_TuXing extends ZWDZJS_ZhiWu {

    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;
    protected onLoad(): void {
        this.Hp = 1200;
        this.Speed = 9999;
        this.Id = 3;
    }
    start() {
        super.start();
    }
}


