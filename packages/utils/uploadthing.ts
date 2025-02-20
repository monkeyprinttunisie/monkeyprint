import { OurFileRouter } from '../../apps/web/app/api/uploadthing/core.ts'; // we have to set "no emit" and "allowImportingTsExtensions" options to true in tsconfig
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react"; // we have to add uploadthing/react in packages folder 

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();