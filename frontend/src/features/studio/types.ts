export interface TextLayerData {
  id: string;
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
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  src: string;
}

export type Layer = TextLayerData | ImageLayerData;

export type LayerPatch = Partial<Omit<TextLayerData, 'type'> & Omit<ImageLayerData, 'type'>>;
