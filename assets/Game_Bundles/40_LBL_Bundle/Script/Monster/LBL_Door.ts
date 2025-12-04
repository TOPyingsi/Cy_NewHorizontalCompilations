import { _decorator, Component, Node, Quat, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LBL_Door')
export class LBL_Door extends Component {
    @property
    openAngle = 90; // 开门角度（度）
    
    @property
    openSpeed = 2; // 开门速度
    
    @property
    isOpen = false; // 是否打开
    
    private closedRotation = Quat.IDENTITY.clone();
    private openRotation = Quat.IDENTITY.clone();
    private isOpening = false;
    private isClosing = false;
    
    get IsOpen(): boolean {
        return this.isOpen;
    }
    
    start() {
        // 保存初始旋转作为关闭状态
        this.closedRotation = this.node.rotation.clone();
        
        // 计算打开状态的旋转
        const euler = this.node.eulerAngles.clone();
        euler.y += this.openAngle;
        Quat.fromEuler(this.openRotation, euler.x, euler.y, euler.z);
        
        // 如果初始状态是打开的，设置旋转
        if (this.isOpen) {
            this.node.rotation = this.openRotation.clone();
        }
    }
    
    // 开门
    openDoor() {
        if (this.isOpen || this.isOpening) return;
        
        this.isOpening = true;
        this.isClosing = false;
        
        // 使用Tween实现平滑旋转
        tween(this.node)
            .to(1 / this.openSpeed, { rotation: this.openRotation })
            .call(() => {
                this.isOpen = true;
                this.isOpening = false;
            })
            .start();
    }
    
    // 关门
    closeDoor() {
        if (!this.isOpen || this.isClosing) return;
        
        this.isClosing = true;
        this.isOpening = false;
        
        // 使用Tween实现平滑旋转
        tween(this.node)
            .to(1 / this.openSpeed, { rotation: this.closedRotation })
            .call(() => {
                this.isOpen = false;
                this.isClosing = false;
            })
            .start();
    }
    
    // 切换门状态
    toggleDoor() {
        if (this.isOpen) {
            this.closeDoor();
        } else {
            this.openDoor();
        }
    }
}
    