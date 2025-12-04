import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Shop')
export class MTRNX_Shop extends Component {
    @property()
    id: number = 0;
    @property()
    Point_price: number = 0;
    @property()
    Debris_price: number = 0;
    @property()
    condition: number = 0;//解锁条件
}


