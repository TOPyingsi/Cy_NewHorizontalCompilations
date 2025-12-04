import { _decorator, Component, Node } from 'cc';
import { PKP_Opponent } from './PKP_Opponent';
const { ccclass, property } = _decorator;

@ccclass('PKP_Profile')
export class PKP_Profile extends Component {
    @property(Node)
    private profile: Node[] = [];
    private index: number = 0;

    protected onLoad(): void {
        this.index = PKP_Opponent.instance.chooseIndex;
    }
    start() {
        this.initProfile();
    }

    // 初始化Profile
    private initProfile() {
        for (let i = 0; i < this.profile.length; i++) {
            if (i == this.index) {
                this.profile[i].active = true;
            } else {
                this.profile[i].active = false;
            }
        }
    }
}


