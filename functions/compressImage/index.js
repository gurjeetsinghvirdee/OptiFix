module.exports = async function (req, res) {
  try {
    console.log('Function started - payload:', req.payload);

    const client = new sdk.Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY);

    const storage = new sdk.Storage(client);

    if (!req.payload) {
      throw new Error('No payload provided');
    }

    const { bucketId, fileId } = JSON.parse(req.payload);
    
    if (!bucketId || !fileId) {
      throw new Error('Missing bucketId or fileId in payload');
    }

    console.log(`Received bucketId: ${bucketId}, fileId: ${fileId}`);

    const file = await storage.getFileDownload(bucketId, fileId);
    const buffer = await file.arrayBuffer();

    console.log('File downloaded, size:', buffer.byteLength);

    const optimizedBuffer = await sharp(Buffer.from(buffer))
      .jpeg({ quality: 70 })
      .toBuffer();

    console.log('Image compressed, new size:', optimizedBuffer.length);

    const uploadResp = await storage.createFile(
      bucketId,
      sdk.ID.unique(),
      optimizedBuffer
    );

    console.log('Optimized image uploaded, fileId:', uploadResp.$id);

    res.json({ optimizedFileId: uploadResp.$id });
  } catch (error) {
    console.error('Compression function error:', error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
};
