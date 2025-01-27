

import { URL } from "url";

import { getVideoService, videoIdProcessors } from "./config";
import { IEmbedVideoOptions, IVideoId, IVideoService } from "./interfaces";


export function embedVideoHTML(type: string, id: string, options: IEmbedVideoOptions): string {
  try {
    const videoId: IVideoId = readVideoId(type, id);

    const videoService = getVideoService(videoId.service, options);
    const url = createUrl(id, videoService, options);
    let iframe = createIframe(url, videoService, options);
    return iframe;

  } catch (e) {
    return `<p style="color: red">Error: ${e.message}</p>`;
  }
}

function readVideoId(type: string, id: string): IVideoId {

  let videoId;
  for (let processor of videoIdProcessors) {
    try{
      videoId = processor(id);
    } catch (e){
      videoId = {};
    }

    if (Object.keys(videoId).length !== 0) {
      return videoId as IVideoId;
    }
  }

  if (type === 'video') {
    throw new TypeError('Id could not be processed');
  }

  return {
    id: id,
    service: type.toLowerCase()
  }
}

function createUrl(id: string, videoService:IVideoService, options: IEmbedVideoOptions): string {
  const videoId: IVideoId = readVideoId(videoService.id, id);
  const videoUrl = videoService.embedUrl(videoId.id);
  let url = new URL(videoUrl);

  if (videoService.urlProcessing) {
    url = videoService.urlProcessing(id, url, options);
  }

  return url.toString();
}

function createIframe(url: string, videoService:IVideoService, options: IEmbedVideoOptions) {
  let iframeNode = `
        <div class="embedVideo-container">
            <iframe
              width="${options.width}"
              height="${options.height}"
              src="${url}"
              class="embedVideo-iframe"
              ${options.noIframeBorder ? 'style="border:0"' : ''}
              allowfullscreen
            ></iframe>
        </div>`

  if (videoService.additionalHTML) {
    iframeNode += videoService.additionalHTML;
  }

  return iframeNode;
}
