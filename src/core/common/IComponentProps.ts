import BBehavior from "../BBehavior";
import BComponent from "../BComponent";
import Vector3 from "./Vector3";

export default interface IComponentProps {
    readonly behaviors?: BBehavior[];
    readonly position?: Vector3;
    readonly rotation?: Vector3;
}