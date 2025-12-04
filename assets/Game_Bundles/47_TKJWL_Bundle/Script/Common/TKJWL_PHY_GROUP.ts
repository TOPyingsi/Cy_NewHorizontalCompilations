// 定义碰撞分组
export enum TKJWL_Physics_Group {
    DEFAULT = 1 << 0,      // 1 (二进制: 0000 0001)
    ITEM = 1 << 1,         
    IGNORE_RAY = 1 << 2,      
    KILL_AREA = 1 << 3,      // 16 (二进制: 0001 0000)
    AREA = 1 << 10           // 1024 (二进制: 0100 0000 0000)
}