import BBehavior from "../BBehavior";
import BComponent from "../BComponent";
import Vector3 from "./Vector3";

export default interface IComponentProps {
    behaviors?: BBehavior[];
    position?: Vector3;
    rotation?: Vector3;
}