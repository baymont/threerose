import EntityBase from '../core/Component';
import * as BABYLON from 'babylonjs';
import IComponentProps from '../core/common/IComponentProps';

export interface IImageProps extends IComponentProps {
    readonly url: string;
}

/**
 * An image component for 2D images.
 */
export default class ImageScreen extends EntityBase<IImageProps> {
    private _material: BABYLON.StandardMaterial;

    protected onMount(): BABYLON.Mesh {
        const node = BABYLON.MeshBuilder.CreateBox(
            'ImageViewer',
            {
                width: 1,
                height: 1,
                depth: 0.1
            },
            this.context.scene
        );
        const screen = BABYLON.Mesh.CreatePlane(
            'ImageViewerScreen',
            1,
            this.context.scene
        );
        screen.parent = node;
        screen.position.z = -0.0525;
        const material = new BABYLON.StandardMaterial(
            'ImageMaterial',
            this.context.scene
        );
        material.backFaceCulling = false;
        material.specularColor = BABYLON.Color3.Black();
        screen.material = material;
        this._material = material;
        return node;
    }

    protected didMount(): void {
        this.onUpdated();
    }

    protected onUpdated(): void {
        const texture = new BABYLON.Texture(
            this.props.url,
            this.context.scene,
            undefined,
            undefined,
            undefined,
            () => {
                this.node.scaling.x = texture.getSize().width / 100;
                this.node.scaling.y = texture.getSize().height / 100;
            }
        );
        this._material.diffuseTexture = texture;
        this._material.diffuseTexture.hasAlpha = true;
        this._material.emissiveTexture = texture;
        this._material.emissiveTexture.hasAlpha = true;
    }
}
