import { base64encode } from "./Base64";
import { Fetch } from "./Fetch_Declaration";

let frameCounter = 0;

@component
export class CameraImage extends BaseScriptComponent {
  private cameraModule = require("LensStudio:CameraModule") as CameraModule;
  @input("Component.ScriptComponent")
  fetchScript: Fetch;

  @input
  nameText: Text;

  @input
  description: Text;

  captureFrame() {
    print("capturing frame");

    const request = CameraModule.createCameraRequest();
    request.cameraId = CameraModule.CameraId.Default_Color;
    request.imageSmallerDimension = 300;

    const cameraTexture = this.cameraModule.requestCamera(request);
    const provider = cameraTexture.control as CameraTextureProvider;

    print("waiting for callback");

    const eventRegistration = provider.onNewFrame.add(() => {
      provider.onNewFrame.remove(eventRegistration);

      print("Before getting camera dimensions");
      const width = cameraTexture.getWidth();
      const height = cameraTexture.getHeight();
      print("After getting camera dimensions");

      print("width");
      print(width);
      print(height);

      print("Before creating readable texture");
      const readableTexture =
        ProceduralTextureProvider.createFromTexture(cameraTexture);
      const readableProvider =
        readableTexture.control as ProceduralTextureProvider;
      print("After creating readable texture");

      // Calculate the center 500x500 region
      const centerX = Math.floor((width - 300) / 2);
      const centerY = Math.floor((height - 300) / 2);
      const cropWidth = 300;
      const cropHeight = 300;

      print("Before creating data array");
      const data = new Uint8Array(cropWidth * cropHeight * 4);
      print("After creating data array");

      print("Before getting pixels");
      readableProvider.getPixels(centerX, centerY, cropWidth, cropHeight, data);
      print("After getting pixels");

      print("Before encoding image");
      this.encodeImage(data, cropWidth, cropHeight);
      print("After encoding image");
    });
  }

  encodeImage(data: Uint8Array, width: number, height: number) {
    //        const str = base64encode(data)
    const str = String(data);

    print("before fetch");
    const raw = this.fetchScript.fetch(str, width, height, (text) => {
      print("after fetch");
      print(text);
      const obj = JSON.parse(text);
      if (obj.name) {
        this.nameText.text = obj.name;
      } else if (obj.message) {
        this.nameText.text = obj.message;
      } else {
        this.nameText.text = "Error";
      }

      if (obj.description) {
        this.description.text = obj.description;
      } else {
        this.description.text = "\nLocation unknown";
      }
    });

    // instantiate prefab
    //        var textobj = textprefab.instantiate()
    //        textobj.text = mynewdatafromserver
  }
}
