import sdk from 'node-appwrite';
import sharp from 'sharp';

module.exports = async function (req, res) {
  try {
    const client = new sdk.Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY);

    const storage = new sdk.Storage(client);

    const { bucketId, fileId } = JSON.parse(req.payload);

    const file = await storage.getFileDownload(bucketId, fileId);

    const buffer = await file.arrayBuffer();

    const optimizedBuffer = await sharp(Buffer.from(buffer))
      .jpeg({ quality: 70 })
      .toBuffer();

    // Upload the optimized image back to storage
    const uploadResp = await storage.createFile(
      bucketId,
      sdk.ID.unique(),
      optimizedBuffer
    );

    res.json({ optimizedFileId: uploadResp.$id });
  } catch (error) {
    console.error('Compression function error:', error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
};