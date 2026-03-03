# Frontend Dashboard Documentation (Admin Panel)

## 1. Overview
The Admin Dashboard is a web-based tool running locally to manage the content of the Utsav Share app. It connects directly to the local MongoDB instance.

### Tech Stack
- **Framework**: Next.js (React) - for fast UI and easy routing.
- **Styling**: Tailwind CSS - for rapid UI development.
- **State Management**: React Query - for easy data fetching and caching.
- **Database Connection**: Mongoose (via Next.js API Routes).

## 2. Project Structure
```
/admin-dashboard
  /pages
    /api          # Internal API routes to talk to MongoDB
      /events.js
      /images.js
    index.js      # Dashboard Home
    events.js     # Event Management List
    upload.js     # Image Upload Page
  /components
    EventCard.js
    ImageUploader.js
    Sidebar.js
  /lib
    dbConnect.js  # MongoDB connection helper
```

## 3. Key Features & UI

### A. Dashboard Home
- **Stats Cards**: Total Events, Total Images, Last Published Date.
- **Quick Actions**: "Add New Event", "Upload Images", "Publish Now".

### B. Event Management (`/events`)
- **List View**: Table showing Event Name, Date, Category, Active Status.
- **Edit Modal**: Form to update Title, Description, Wiki Link, Tags.
- **Date Picker**: Support for recurring dates vs fixed dates.

### C. Image Upload (`/upload`)
- **Drag & Drop Zone**: Accepts multiple files.
- **Preview Grid**: Shows thumbnails of selected images.
- **Bulk Actions**:
    - "Apply Tags to All"
    - "Select Event for All"
- **Progress Bar**: Shows upload/processing status.

### D. The "Publish" Workflow
- A prominent "Publish Changes" button in the sidebar.
- **Status Modal**:
    - "Generating JSON..." (Spinner)
    - "Optimizing Images..." (Progress bar)
    - "Uploading to S3..." (Progress bar)
    - "Done! Live in 5 mins." (Success checkmark)

## 4. Implementation Details

### API Routes
- `GET /api/events`: Returns all events.
- `POST /api/events`: Creates a new event.
- `POST /api/upload`:
    - Receives `multipart/form-data`.
    - Saves file to local `/backend/assets/raw` folder.
    - Creates `Image` record in MongoDB.

### Image Preview
- Since files are local, Next.js can serve them from the `public` folder or via a custom static route mapping to the backend assets folder.

## 5. Running the Dashboard
1.  Start MongoDB: `mongod`
2.  Run Backend Scripts (optional, mostly for the publish step).
3.  Run Next.js: `npm run dev`
4.  Open `http://localhost:3000`
