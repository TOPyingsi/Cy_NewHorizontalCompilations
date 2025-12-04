import { _decorator, Component, Enum, Node, Vec2, v2, view } from 'cc';
const { ccclass, property } = _decorator;

export enum Direction {
    Left,
    Right,
    Up,
    Down
}

@ccclass('XGTW_BGTransform')
export default class XGTW_BGTransform extends Component {
    @property
    speed: number = 10;
    @property({ type: Enum(Direction) })
    direction: Direction = Direction.Left;
    main: Node | null = null;
    sub: Node | null = null;
    private screen: Vec2 = v2();
    private x = 0;
    private y = 0;
    private x_2 = 0;
    private y_2 = 0;
    onLoad() {
        this.screen.set(v2(view.getVisibleSize().width, view.getVisibleSize().height));
        this.main = this.node.children[0];
        if (this.node.children.length > 1) {
            this.sub = this.node.children[1];
        }
    }
    update(dt: number): void {
        this.x = this.main.position.x;
        this.y = this.main.position.y;

        switch (this.direction) {
            case Direction.Left:
                this.x -= dt * this.speed;
                if (this.x <= -this.screen.x) this.x = 0;
                this.x_2 = this.x + this.screen.x;
                break;
            case Direction.Right:
                this.x += dt * this.speed;
                if (this.x >= this.screen.x) this.x = 0;
                this.x_2 = this.x - this.screen.x;
                break;
            case Direction.Up:
                this.y += dt * this.speed;
                if (this.y >= this.screen.y) this.y = 0;
                this.y_2 = this.y - this.screen.y;
                break;
            case Direction.Down:
                this.y -= dt * this.speed;
                if (this.y <= -this.screen.y) this.y = 0;
                this.y_2 = this.y + this.screen.y;
                break;
        }

        this.main.setPosition(this.x, this.y);
        this.sub.setPosition(this.x_2, this.y_2);

    }
}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// const { ccclass, property } = cc._decorator;
//
// export enum Direction {
//     Left,
//     Right,
//     Up,
//     Down
// }
//
// @ccclass
// export default class BGTransform extends cc.Component {
//     @property
//     speed: number = 10;
//
//     @property({ type: cc.Enum(Direction) })
//     direction: Direction = Direction.Left;
//
//     main: cc.Node = null;
//     sub: cc.Node = null;
//
//     private screen: cc.Vec2 = cc.v2();
//
//     private x = 0;
//     private y = 0;
//     private x_2 = 0;
//     private y_2 = 0;
//
//     onLoad() {
//         this.screen.set(cc.v2(cc.view.getVisibleSize().width, cc.view.getVisibleSize().height));
//         this.main = this.node.children[0];
//         if (this.node.children.length > 1) {
//             this.sub = this.node.children[1];
//         }
//     }
//
//     update(dt: number): void {
//         this.x = this.main.position.x;
//         this.y = this.main.position.y;
//
//         switch (this.direction) {
//             case Direction.Left:
//                 this.x -= dt * this.speed;
//                 if (this.x <= -this.screen.x) this.x = 0;
//                 this.x_2 = this.x + this.screen.x;
//                 break;
//             case Direction.Right:
//                 this.x += dt * this.speed;
//                 if (this.x >= this.screen.x) this.x = 0;
//                 this.x_2 = this.x - this.screen.x;
//                 break;
//             case Direction.Up:
//                 this.y += dt * this.speed;
//                 if (this.y >= this.screen.y) this.y = 0;
//                 this.y_2 = this.y - this.screen.y;
//                 break;
//             case Direction.Down:
//                 this.y -= dt * this.speed;
//                 if (this.y <= -this.screen.y) this.y = 0;
//                 this.y_2 = this.y + this.screen.y;
//                 break;
//         }
//
//         this.main.setPosition(this.x, this.y);
//         this.sub.setPosition(this.x_2, this.y_2);
//
//     }
// }
