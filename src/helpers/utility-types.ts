type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type IsAny<T> = IfAny<T, true, never>;

export type badany = any;
