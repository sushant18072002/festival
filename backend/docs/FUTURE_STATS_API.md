# Future Stats API Reference

The Stats API was removed to minimize server hits and costs. However, if you decide to re-enable it in the future, here is the reference implementation.

## Implementation Details

### 1. API Endpoint (`/api/public/stats.ts`)
This endpoint would increment counters in the MongoDB database.

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../backend/src/config/db';
import Image from '../../../backend/src/models/Image';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();
    await connectDB();

    const { imageId, type } = req.body; // type: 'download', 'share', 'like'
    
    try {
        const updateField = type === 'download' ? 'downloads_count' : 
                          type === 'share' ? 'shares_count' : 'likes_count';
        
        await Image.findByIdAndUpdate(imageId, { $inc: { [updateField]: 1 } });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
}
```

### 2. Mobile App Integration
The mobile app would call this API whenever a user interacts with an image.

### 3. Trade-offs
- **Pros**: Real-time "Trending Now" section based on actual usage.
- **Cons**: Increased server costs, potential for spam/bot hits, requires a live backend connection.

## Current Alternative
The "Trending Now" section is currently updated manually by the admin or based on `priority` fields in the database, served via static JSON files.
