// import { faker } from '@faker-js/faker';
import { writeFileSync } from 'fs';
import { createBuffer, createDataURL } from './blocky';
import { v4 as uuid } from 'uuid';

const getHtml = (htmlData: { seed: string; data: string }[]) => {
  const imgHtml = htmlData
    .map(({ seed, data }) => {
      return `<div><h4>${seed}</h4><img alt="${seed}" src="${data}" /></div>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Blocky</title>
      </head>
      <body>
        <div style="display:flex;flex-flow:row wrap;justify-content:space-between;">
          ${imgHtml}
        </div>
      </body>
    </html>
  `;
  return html;
};

describe('Blocky', () => {
  it('should be defined', () => {
    const seed = uuid();
    const data = createDataURL({
      // bgColor: [255, 255, 255],
      // fgColor: [123, 53, 0],
      // spotColor: [0, 0, 0],
      // size: 12,
      // scale: 40,
    });

    const html = getHtml([{ data, seed }]);
    writeFileSync('./example/index.html', html);
    expect(data).toBeDefined();
    expect(data.startsWith('data:image/png;base64,')).toBeTruthy();
  });

  it('should be defined', () => {
    const LENGTH = 100;
    const htmlData = Array(LENGTH)
      .fill(null)
      .map(() => uuid())
      .sort()
      .map((seed) => {
        const data = createDataURL({ seed });
        return { seed, data };
      });
    const html = getHtml(htmlData);
    writeFileSync('./example/multi.html', html);
    expect(htmlData.length).toBe(LENGTH);
  });

  // it('should be same', () => {
  //   const seed = uuid();
  //   const data1 = createDataURL({ seed });
  //   const data2 = createDataURL({ seed });
  //   const data3 = createDataURL({ seed });

  //   expect(data1).toBe(data2);
  //   expect(data2).toBe(data3);
  // });

  it('should be defined', () => {
    const data = createBuffer({
      bgColor: [255, 255, 255],
      size: 8,
      scale: 40,
    });

    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
  });
});
