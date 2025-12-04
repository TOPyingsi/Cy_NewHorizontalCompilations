import { _decorator, Component, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_NewCourse')
export class HJMSJ_NewCourse extends Component {
    public Index: number = 0;
    private MaxIndex: number = 0;
    start() {
        this.MaxIndex = this.node.getChildByName("Content").children.length;
        this.Show();
    }


    onBtnClick(event: EventTouch) {
        switch (event.target.name) {
            case "左翻页":
                this.Index = (this.Index - 1) < 0 ? this.MaxIndex - 1 : this.Index - 1;
                this.Show();
                break;
            case "右翻页":
                this.Index = (this.Index + 1) >= this.MaxIndex ? 0 : this.Index + 1;
                this.Show();
                break;
            case "关闭":
                this.node.active = false;
                break;
        }
    }
    Show() {
        this.node.getChildByName("Content").children.forEach((element, index) => {
            element.active = this.Index == index;
        });

    }
}


