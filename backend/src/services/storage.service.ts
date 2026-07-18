import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { UploadApiResponse } from 'cloudinary';
import env from '../config/env';
import logger from '../utils/logger';
import cloudinary from '../config/cloudinary';

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

type S3Client = import('@aws-sdk/client-s3').S3Client;
type S3Commands = {
  PutObjectCommand: typeof import('@aws-sdk/client-s3').PutObjectCommand;
  DeleteObjectCommand: typeof import('@aws-sdk/client-s3').DeleteObjectCommand;
};

let s3Client: S3Client | null = null;
let s3Commands: S3Commands | null = null;

const getS3 = (): S3Client | null => {
  if (!env.isS3Configured) return null;
  if (s3Client) return s3Client;
  // eslint-disable-next-line global-require
  const { S3Client: S3ClientCtor, PutObjectCommand, DeleteObjectCommand }: typeof import('@aws-sdk/client-s3') = require('@aws-sdk/client-s3');
  s3Client = new S3ClientCtor({
    region: env.aws.region,
    credentials: { accessKeyId: env.aws.accessKeyId, secretAccessKey: env.aws.secretAccessKey },
  });
  s3Commands = { PutObjectCommand, DeleteObjectCommand };
  return s3Client;
};

const buildKey = (folder: string, originalName?: string): string => {
  const ext = path.extname(originalName || '') || '';
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  return `${folder}/${unique}`;
};

const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => (error ? reject(error) : resolve(result as UploadApiResponse))
    );
    uploadStream.end(buffer);
  });

export interface UploadFileArgs {
  folder: string;
  originalName?: string;
  mimetype?: string;
}

export interface UploadFileResult {
  url: string;
  key: string;
  provider: 'cloudinary' | 's3' | 'local';
}

/**
 * Uploads a buffer to Cloudinary when configured (preferred — persistent,
 * CDN-backed), else S3 when configured, else falls back to local disk under
 * backend/uploads so the app still runs without any cloud credentials (note:
 * local disk is ephemeral on most hosts and not recommended for production).
 */
export const uploadFile = async (buffer: Buffer, { folder, originalName, mimetype }: UploadFileArgs): Promise<UploadFileResult> => {
  if (env.isCloudinaryConfigured) {
    const result = await uploadToCloudinary(buffer, folder);
    return { url: result.secure_url, key: result.public_id, provider: 'cloudinary' };
  }

  const key = buildKey(folder, originalName);
  const client = getS3();

  if (client && s3Commands) {
    const { PutObjectCommand } = s3Commands;
    await client.send(
      new PutObjectCommand({
        Bucket: env.aws.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );
    const domain = env.aws.cloudfrontDomain || `${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com`;
    return { url: `https://${domain}/${key}`, key, provider: 's3' };
  }

  const destDir = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(destDir, { recursive: true });
  const localPath = path.join(destDir, path.basename(key));
  fs.writeFileSync(localPath, buffer);
  logger.debug(`[storage:local] stored ${localPath}`);
  return { url: `${env.apiUrl}/uploads/${folder}/${path.basename(key)}`, key, provider: 'local' };
};

export const deleteFile = async (key?: string): Promise<void> => {
  if (!key) return;

  if (env.isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(key).catch((err: Error) => logger.warn(`Cloudinary delete failed for ${key}: ${err.message}`));
    return;
  }

  const client = getS3();
  if (client && s3Commands) {
    const { DeleteObjectCommand } = s3Commands;
    await client.send(new DeleteObjectCommand({ Bucket: env.aws.bucket, Key: key }));
    return;
  }
  const localPath = path.join(UPLOAD_ROOT, key);
  fs.promises.unlink(localPath).catch(() => {});
};
