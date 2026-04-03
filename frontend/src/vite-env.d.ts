/// <reference types="vite/client" />

declare module 'three/examples/jsm/loaders/STLLoader.js' {
  import { Loader, LoadingManager, Group } from 'three';
  export class STLLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (geometry: THREE.BufferGeometry) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(data: ArrayBuffer | string): THREE.BufferGeometry;
  }
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { Camera, MOUSE, TOUCH, Vector3 } from 'three';
  export class OrbitControls {
    constructor(object: Camera, domElement?: HTMLElement);
    object: Camera;
    domElement: HTMLElement;
    enabled: boolean;
    target: Vector3;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    update(): boolean;
    dispose(): void;
  }
}