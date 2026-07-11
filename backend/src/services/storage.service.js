const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');
const cloudinary = require('../config/cloudinary');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

let s3Client = null;
let s3Commands = null;

const getS3 = () => {
  if (!env.isS3Configured) return null;
  if (s3Client) return s3Client;
  // eslint-disable-next-line global-require
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
  s3Client = new S3Client({
    region: env.aws.region,
    credentials: { accessKeyId: env.aws.accessKeyId, secretAccessKey: env.aws.secretAccessKey },
  });
  s3Commands = { PutObjectCommand, DeleteObjectCommand };
  return s3Client;
};

const buildKey = (folder, originalName) => {
  const ext = path.extname(originalName || '') || '';
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  return `${folder}/${unique}`;
};

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    uploadStream.end(buffer);
  });

/**
 * Uploads a buffer to Cloudinary when configured (preferred — persistent,
 * CDN-backed), else S3 when configured, else falls back to local disk under
 * backend/uploads so the app still runs without any cloud credentials (note:
 * local disk is ephemeral on most hosts and not recommended for production).
 */
const uploadFile = async (buffer, { folder, originalName, mimetype }) => {
  if (env.isCloudinaryConfigured) {
    const result = await uploadToCloudinary(buffer, folder);
    return { url: result.secure_url, key: result.public_id, provider: 'cloudinary' };
  }

  const key = buildKey(folder, originalName);
  const client = getS3();

  if (client) {
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

const deleteFile = async (key) => {
  if (!key) return;

  if (env.isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(key).catch((err) => logger.warn(`Cloudinary delete failed for ${key}: ${err.message}`));
    return;
  }

  const client = getS3();
  if (client) {
    const { DeleteObjectCommand } = s3Commands;
    await client.send(new DeleteObjectCommand({ Bucket: env.aws.bucket, Key: key }));
    return;
  }
  const localPath = path.join(UPLOAD_ROOT, key);
  fs.promises.unlink(localPath).catch(() => {});
};

module.exports = { uploadFile, deleteFile };
