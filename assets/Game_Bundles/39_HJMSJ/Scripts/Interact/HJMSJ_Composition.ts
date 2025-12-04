import { _decorator, Component, Node } from 'cc';
import { HJMSJ_Constant } from '../HJMSJ_Constant';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Composition')
export class HJMSJ_Composition extends Component {
    @property()
    public compositionType: boolean = false;

    public resProp: string = "";
    public resNum: number = 1;

    public propNames: string[] = []
    public creatMethod: Map<string, any[]> = new Map();

    private posIndex: number = 0;
    start() {
        if (this.compositionType) {
            let method = HJMSJ_Constant.getMethodByName(this.node.name);
            this.resProp = method.Name;
            for (let i = 0; i < method.type.length / 2; i++) {
                let propName = method.type[i * 2];
                let propNum = method.type[i * 2 + 1];
                let pos: number[] = [];
                for (let j = 0; j < propNum; j++, this.posIndex++) {
                    pos.push(method.pos[this.posIndex]);
                }

                let data = [propName, propNum, pos];
                this.propNames.push(propName);
                this.creatMethod.set(propName, data)
            }

            console.log(this.creatMethod);

            this.resNum = method.resNum;
        }
    }

}


