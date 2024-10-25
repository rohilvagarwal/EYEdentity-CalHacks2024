/**
* {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule/CameraModule-description.md Edit}

* @experimental

* @exposesUserData

* @wearableOnly
*/
interface CameraModule extends Asset {
    /**
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule/methods/CameraModule-requestCamera.md Edit}
    */
    requestCamera(request: CameraModule.CameraRequest): Texture

}
declare namespace CameraModule {
    /**
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule/methods/CameraModule-createCameraRequest.md Edit}
    
    * @experimental
    
    * @exposesUserData
    
    * @wearableOnly
    */
    export function createCameraRequest(): CameraModule.CameraRequest


}

declare namespace CameraModule {
    /**
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule.CameraId/CameraModule.CameraId-description.md Edit}
    
    * @experimental
    
    * @exposesUserData
    
    * @wearableOnly
    */
    enum CameraId {
        /**
        * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule.CameraId/properties/CameraModule.CameraId-Default_Color.md Edit}
        */
        Default_Color,
        /**
        * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule.CameraId/properties/CameraModule.CameraId-Left_Color.md Edit}
        */
        Left_Color,
        /**
        * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule.CameraId/properties/CameraModule.CameraId-Right_Color.md Edit}
        */
        Right_Color
    }

}

declare namespace CameraModule {
    /**
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule.CameraRequest/CameraModule.CameraRequest-description.md Edit}
    
    * @experimental
    
    * @exposesUserData
    
    * @wearableOnly
    */
    interface CameraRequest extends ScriptObject {
        /**
        * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule.CameraRequest/properties/CameraModule.CameraRequest-cameraId.md Edit}
        */
        cameraId: CameraModule.CameraId

        /**
        * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraModule.CameraRequest/properties/CameraModule.CameraRequest-imageSmallerDimension.md Edit}
        */
        imageSmallerDimension?: number

    }

}

/**
* {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraTextureProvider/CameraTextureProvider-description.md Edit}
*/
interface CameraTextureProvider extends TextureProvider {
    /**
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraTextureProvider/properties/CameraTextureProvider-onNewFrame.md Edit}
    
    * @readonly
    
    * @experimental
    
    * @exposesUserData
    
    * @wearableOnly
    */
    onNewFrame: event1<CameraFrame, void>
}

/**
* {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraFrame/CameraFrame-description.md Edit}

* @experimental

* @exposesUserData

* @wearableOnly
*/
interface CameraFrame extends ScriptObject {
    /**
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/CameraFrame/properties/CameraFrame-timestampMillis.md Edit}
    
    * @readonly
    */
    timestampMillis: number

}

interface DeviceInfoSystem extends ScriptObject {
    /**
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/DeviceInfoSystem/methods/DeviceInfoSystem-getTrackingCameraForId.md Edit}
    
    * @experimental
    
    * @wearableOnly
    */
    getTrackingCameraForId(cameraId: CameraModule.CameraId): DeviceCamera
}
