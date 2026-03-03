# User Stories Repository (Target: 500 Scenarios)

This document outlines the user stories for the "Utsav Share" ecosystem.

## Epic 1: The First Time User (Onboarding) - Stories 1-50
1.  As a user, I want to open the app and see content immediately so that I don't waste time signing up.
2.  As a user, I want to select my preferred language (Hindi) so that I see relevant content.
3.  As a user, I want to select my State so that I see regional festivals (e.g., Pongal for Tamil Nadu).
4.  As a user, I want to see a "How to Share" tooltip so I know how to send images to WhatsApp.
5.  As a user, I want to see a welcome message appropriate for the time of day (e.g., "Good Morning").
...

## Epic 2: Content Discovery (Home Feed & Views) - Stories 51-150
51. As a user, I want to see a "Mic" icon so I can search for "Shiva" by speaking instead of typing.
52. As a user, I want to click on "❤️" or "🇮🇳" pills to quickly filter for Romantic or Patriotic images.
53. As a user, I want the app to show me "Good Night" images automatically when I open it at 10 PM.
54. As a user, I want to see a "Double Tick" icon on images I have already shared so I don't repeat them.
55. As a user, I want the app to learn that I like "Hanuman" images and show me more of them tomorrow.
56. As a user, I want to see a "History" tab to find the image I sent to my mom last week.
57. As a user, I want to switch to a "Timeline View" to see past, current, and upcoming events in a linear list.
58. As a user, I want to switch to a "Calendar View" to see a monthly grid of festivals.
...

## Epic 3: Event Details & Interaction - Stories 151-250
151. As a user, I want to tap an event to see a detailed page with a description and multiple images.
152. As a user, I want to click a "Read More" button to open a Wiki page about the festival.
153. As a user, I want to see multiple images for a single event (e.g., 10 different Diwali wishes).
154. As a user, I want to click the WhatsApp icon to instantly open WhatsApp with the image attached.
155. As a user, I want the shared image to have a caption "Sent via Utsav App" automatically.
156. As a user, I want to download the image to my gallery to use it later.
157. As a user, I want to "Like" an image and find it in my "Favorites" tab.
158. As a user, I want to report an image if I find it offensive.
...

## Epic 4: Personalization & Settings - Stories 251-300
251. As a user, I want to switch my language preference later in settings.
252. As a user, I want to clear the cache to free up space on my phone.
253. As a user, I want to turn off notifications if they are annoying.
254. As a user, I want to rate the app on the Play Store.
...

## Epic 5: Admin Dashboard (Content Management) - Stories 301-400
301. As an admin, I want to login to the local dashboard securely.
302. As an admin, I want to create a new category "Republic Day".
303. As an admin, I want to upload 50 images at once via drag-and-drop.
304. As an admin, I want to crop an image before uploading.
305. As an admin, I want to add tags "India", "Flag", "Patriotic" to an image.
306. As an admin, I want to schedule a category to appear on Jan 24th automatically.
307. As an admin, I want to see how many images are in each category.
...

## Epic 6: Backend & Infrastructure - Stories 401-450
401. As a developer, I want the "Export" script to generate a `home.json` file.
402. As a developer, I want the script to optimize all PNGs to WebP before upload.
403. As a developer, I want the script to upload only new files to S3 to save bandwidth.
404. As a developer, I want to configure AWS Lambda to serve a random "Quote of the Day".
405. As a developer, I want to set up CloudFront caching rules to cache JSON for 1 hour and Images for 1 year.
...

## Epic 7: Edge Cases & Errors - Stories 451-500
451. As a user, I want to see a "No Internet" screen with a "Retry" button if I'm offline.
452. As a user, I want to see my cached/offline images even if I have no data.
453. As a user, I want the app to handle "Out of Memory" gracefully on low-end devices.
454. As an admin, I want to be warned if I try to upload a duplicate image.
...
