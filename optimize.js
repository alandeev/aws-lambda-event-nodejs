'use strict';

const AWS = require('aws-sdk');
const sharp = require('sharp');
const { basename, extname } = require('path'); 

const S3 = new AWS.S3();

module.exports.handle = async ({ Records: records }, context) => {
    try {
      await Promise.all(records.map(async record => {
        const { key } = record.s3.object;

        const image = await S3.getObject({
          Bucket: proccess.env.bucket,
          Key: key
        }).promise();

        const optimized = await sharp(image.Body)
        .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg', { progressive: true })
        .toBuffer()

        await S3.putObject({
          Body: optimized,
          Bucket: proccess.env.bucket,
          ContentType: 'image/jpeg',
          Key: `compressed/${basename(key, extname(key))}.jpg`
        }).promise()
      }));

      return {
        statusCode: 301,
        body: { status: "success" }
      }
    } catch (err) {
      return err;
    }
};