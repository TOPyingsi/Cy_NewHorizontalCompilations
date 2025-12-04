import { _decorator } from 'cc';

export class TLWLSJ_Magazine {

    Capacity: number; // 最大容量
    Bullets: string[] = []; // 存储的子弹

    constructor(capacity: number, bulletName: string = "") {
        this.Capacity = capacity;
        if (bulletName !== "") {
            for (let i = 0; i < capacity; i++) {
                this.Bullets.push(bulletName);
            }
        }
    }
}


