import { PNG } from 'pngjs';

type RGB = [number, number, number];
type RandSeed = [number, number, number, number];
type Options = {
  size?: number;
  scale?: number;
  seed?: string;
  fgColor?: RGB;
  bgColor?: RGB;
  spotColor?: RGB;
};

const hslToRgb = (
  h: number,
  s: number,
  l: number
): [number, number, number] => {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// The random number is a js implementation of the Xorshift PRNG
// Xorshift: [x, y, z, w] 32 bit values
const randseed: RandSeed = [0, 0, 0, 0];

const createRandSeed = (seed: string) => {
  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] =
      (randseed[i % 4] << 5) - randseed[i % 4] + seed.charCodeAt(i);
  }

  return randseed;
};

const rand = () => {
  // based on Java's String.hashCode(), expanded to 4 32bit values
  const t = randseed[0] ^ (randseed[0] << 11);

  randseed[0] = randseed[1];
  randseed[1] = randseed[2];
  randseed[2] = randseed[3];
  randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8);

  return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
};

const createHSL = () => {
  // hue is the whole color spectrum
  const h = rand();

  // saturation goes from 0.4 to 1, it avoids greyish colors
  const s = rand() * 0.6 + 0.4;

  // lightness can be anything from 0 to 1, but probabilities are a bell curve around 0.5
  const l = (rand() + rand() + rand() + rand()) / 4;

  return [h, s, l];
};

// FIXME: only support square icons for now
const createImageData = (width: number, height: number) => {
  const dataWidth = Math.ceil(width / 2);
  const mirrorWidth = width - dataWidth;

  const data = Array(height)
    .fill([])
    .flatMap(() => {
      const row = [];
      for (let x = 0; x < dataWidth; x++) {
        // this makes foreground and background color to have a 43% (1/2.3) probability
        // spot color has 13% chance
        row[x] = Math.floor(rand() * 2.3);
      }
      const reversed = row.slice(0, mirrorWidth).reverse();
      return row.concat(reversed);
    });

  return data;
};

const defaultOptions = {
  scale: 24,
  size: 7,
  seed: '',
  fgColor: [0, 0, 0],
  bgColor: [255, 255, 255],
  spotColor: [0, 0, 0],
};

export const createBuffer = (optsParam: Options) => {
  const options = defaultOptions;
  options.scale = optsParam.scale ?? options.scale;
  options.size = optsParam.size ?? options.size;
  options.seed =
    optsParam.seed ?? Math.floor(Math.random() * 10 ** 16).toString(16);

  createRandSeed(options.seed);

  const [h, s, l] = createHSL();
  const rgb = hslToRgb(h, s, l);
  options.fgColor = optsParam.fgColor ?? rgb;
  options.bgColor = optsParam.bgColor ?? options.bgColor;
  options.spotColor = optsParam.spotColor ?? rgb;

  const imageData = createImageData(options.size, options.size);

  const imageWidth = options.size * options.scale;

  const png = new PNG({
    width: imageWidth,
    height: imageWidth,
    colorType: 2,
  });

  const width = Math.sqrt(imageData.length);

  for (let i = 0; i < imageData.length; i++) {
    // if data is 0, leave the background
    const row = Math.floor(i / width);
    const col = i % width;
    const idx = (row * options.size * options.scale + col) * options.scale * 4;

    let color;
    switch (imageData[i]) {
      case 0:
        color = options.bgColor;
        break;
      case 1:
        color = options.fgColor;
        break;
      default:
        color = options.spotColor;
    }

    // scaling
    for (let y = 0; y < options.scale; y++) {
      for (let x = 0; x < options.scale; x++) {
        const [r, g, b] = color;
        const o = idx + (x + y * options.size * options.scale) * 4;
        png.data[o] = r;
        png.data[o + 1] = g;
        png.data[o + 2] = b;
        png.data[o + 3] = 255;
      }
    }
  }

  return PNG.sync.write(png, {});
};

// create icon as data URL
export const createDataURL = (opts: Options = {}) => {
  const buf = createBuffer(opts);
  return 'data:image/png;base64,' + buf.toString('base64');
};
