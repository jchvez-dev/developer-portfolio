export interface TextLayerData {
  id: string;
  name: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  html: string;
}

export interface ImageLayerData {
  id: string;
  name: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  src: string;
}

export type Layer = TextLayerData | ImageLayerData;
export type LayerType = Layer['type'];
export type LayerPatch = Partial<Omit<TextLayerData, 'type'> & Omit<ImageLayerData, 'type'>>;
