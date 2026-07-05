Functional Design Document (FDD)
Property Rental and Sale Listing Application for Chhattisgarh using Supabase

Version: 1.0
Date: 2026-06-28
Prepared by: Codex

1. Purpose

This Functional Design Document describes the expected behavior, user flows, data model, validation rules, and Supabase-backed architecture for a Chhattisgarh-focused property rental and sale listing application.

The application allows users to register, log in with their phone number and OTP, post Chhattisgarh property listings with videos, submit listings for backend approval, search approved properties, and contact property owners after entering a phone number.

2. Scope

In scope:

- User registration with first name, last name, email ID, and phone number.
- Saving registered user details in Supabase.
- Login using phone number and a default OTP of 1234.
- Displaying user details after successful login.
- Property listing submission for rent or sale.
- Chhattisgarh-only property listing scope for MVP.
- Database-driven Chhattisgarh city selection, with Raipur seeded as the primary major city for MVP launch.
- Mandatory property video upload.
- Optional reel ID capture.
- Backend/admin approval before a property goes live.
- Public property search and filtering.
- Public video availability for searchable approved listings.
- Lead capture when a visitor wants to contact a property owner.

Out of scope for the first release:

- Payment collection.
- Legal document verification workflow.
- Real-time chat between owner and buyer/tenant.
- AI-generated price recommendation.
- Automated fraud detection.
- Production SMS OTP delivery.
- Property listings outside Chhattisgarh.

3. Key Assumptions

- Supabase will be used for database, file storage, authentication/session support, and backend functions.
- Default OTP 1234 is intended for MVP/testing only. For production, this should be replaced with Supabase Phone Auth OTP or an SMS provider.
- A user can post multiple properties.
- A property can be listed either for rent or for sale.
- Property videos are mandatory for listing submission.
- Reel ID is optional and can reference Instagram, YouTube Shorts, or another short-video platform.
- Only backend-approved properties are visible to public users.
- A visitor must provide a phone number before viewing owner contact details or sending an enquiry.
- The MVP launch state is Chhattisgarh, India.
- Raipur is seeded in the database as the primary major city for the first release.
- Additional Chhattisgarh cities such as Bhilai, Bilaspur, Durg, and Korba can be enabled through database master data.

4. User Roles

4.1 Guest User

A guest user can:

- View approved property listings.
- Search and filter properties.
- Watch property videos.
- Submit their phone number to contact a property owner.
- Sign up or log in.

4.2 Registered User / Property Owner

A registered user can:

- Sign up.
- Log in using phone number and OTP.
- View their profile details on the landing page.
- Add property details for rent or sale.
- Upload property video.
- Add optional reel ID.
- View status of submitted properties.
- Edit rejected or draft property listings.

4.3 Admin / Backend Approver

An admin can:

- View submitted properties.
- Review property details and uploaded video.
- Approve property listings.
- Reject property listings with reason.
- Mark listings inactive if needed.
- Monitor user enquiries.

5. High-Level Architecture

5.1 Application Components

- Frontend App: Mobile app or web app used by guests, registered users, and admins.
- Backend Layer: Supabase Edge Functions or server API for custom validation, login checks, approval actions, and secure operations.
- Supabase Postgres: Stores users, properties, videos, approvals, and leads.
- Supabase Storage: Stores uploaded property videos and generated thumbnails.
- Supabase Auth / Session Layer: Manages authenticated user sessions.
- Supabase Row Level Security: Protects private data and restricts owner/admin actions.

5.2 Supabase Services

- Database: PostgreSQL tables for users, listings, media, leads, and approval audit.
- Storage: Bucket for property videos and thumbnails.
- Edge Functions:
  - register_user
  - login_with_phone_otp
  - create_property_listing
  - submit_property_for_review
  - approve_property
  - reject_property
  - create_property_lead
  - search_properties

6. Functional Requirements

6.1 User Signup

Requirement:
The user should be able to sign up using first name, last name, email ID, and phone number.

Input fields:

- First Name: Required.
- Last Name: Required.
- Email ID: Required, valid email format.
- Phone Number: Required, valid phone format, unique.

Behavior:

- User enters registration details.
- Frontend validates mandatory fields.
- Backend checks whether email ID or phone number already exists.
- If phone number or email already exists, the system shows a clear error message.
- If details are valid, the user record is created in Supabase.
- User profile status is set to active.
- User is redirected to the login page or automatically logged in based on implementation preference.

Validation:

- First name and last name should contain alphabetic characters and common name characters.
- Email must be unique and valid.
- Phone number must be unique and normalized before saving.
- Phone number should include country code or be normalized to a configured default country.

Success message:

- Registration completed successfully. Please log in with your phone number.

Error messages:

- Phone number already registered.
- Email ID already registered.
- Please enter a valid phone number.
- Please enter a valid email ID.

6.2 User Login

Requirement:
When a user tries to log in, the user should enter phone number and default OTP 1234. The backend should check whether the phone number is present in the database. If yes, login should be successful and user details should be shown on the landing page.

Input fields:

- Phone Number: Required.
- OTP: Required. Default OTP is 1234 for MVP/testing.

Behavior:

- User enters phone number and OTP.
- Backend checks whether the phone number exists in the users table.
- Backend checks whether OTP equals 1234.
- If phone exists and OTP is correct, the system creates an authenticated session.
- User is redirected to the landing page.
- Landing page displays registered user details.

Negative scenarios:

- If phone number is not found, show: Phone number is not registered.
- If OTP is incorrect, show: Invalid OTP.
- If user is inactive or blocked, show: Account is not active. Please contact support.

Security note:

- The fixed OTP 1234 must only be used for development or MVP testing.
- For production, replace this with real OTP delivery using Supabase Phone Auth, Twilio, MSG91, Firebase Auth, or another SMS provider.
- OTP attempts should be rate-limited.

6.3 Landing Page After Login

Requirement:
After login, the user should see their details and property-related actions.

Displayed user details:

- First Name.
- Last Name.
- Email ID.
- Phone Number.

Available actions:

- Add Property.
- View My Properties.
- View Pending Approval Properties.
- Edit Draft or Rejected Properties.
- Logout.

6.4 Add Property for Rent or Sale

Requirement:
After signing in, the user should be able to post property details for rent or sale by entering standard property details. The system should allow optional reel ID and must require property video upload.

Property fields:

- Listing Type: Required. Values: Rent, Sale.
- Property Title: Required.
- Property Type: Required. Values: Apartment, Independent House, Villa, Plot, Commercial Office, Shop, Warehouse, Other.
- Address Line 1: Required.
- Address Line 2: Optional.
- City: Required. Loaded from active Chhattisgarh city records in the database.
- State: Required. Loaded from active state records in the database; MVP state is Chhattisgarh.
- Pincode: Required.
- Locality / Area: Required.
- Landmark: Optional.
- Latitude and Longitude: Optional but recommended.
- BHK: Required for residential properties.
- Bedrooms: Optional if BHK is selected.
- Bathrooms: Required for residential properties.
- Balconies: Optional.
- Built-up Area: Required.
- Carpet Area: Optional.
- Area Unit: Required. Values: Sq Ft, Sq Meter, Sq Yard.
- Floor Number: Optional.
- Total Floors: Optional.
- Furnishing Status: Required. Values: Unfurnished, Semi Furnished, Fully Furnished.
- Parking Available: Required. Values: Yes, No.
- Available From: Required for rent.
- Price: Required for sale.
- Monthly Rent: Required for rent.
- Security Deposit: Optional for rent.
- Maintenance Charges: Optional.
- Negotiable: Optional.
- Amenities: Optional multi-select.
- Property Description: Required.
- Owner Contact Preference: Required. Values: Call, WhatsApp, Both.
- Reel ID / Reel URL: Optional.
- Property Video: Required.

Amenities:

- Lift.
- Power Backup.
- Security.
- CCTV.
- Gym.
- Swimming Pool.
- Clubhouse.
- Garden.
- Children Play Area.
- Parking.
- Water Supply.
- Gas Pipeline.
- Pet Friendly.
- Furnished Kitchen.

Behavior:

- User fills property form.
- User uploads property video.
- Frontend validates mandatory fields.
- Backend creates property listing with status DRAFT or PENDING_REVIEW.
- After submission, property status becomes PENDING_REVIEW.
- Property is not visible publicly until approved by admin/backend.

6.5 Property Video Upload

Requirement:
The user must upload a property video.

Supported file types:

- MP4.
- MOV.
- WEBM.

Recommended constraints:

- Maximum file size: 250 MB for MVP.
- Recommended video duration: 15 seconds to 3 minutes.
- Minimum resolution: 720p recommended.
- Video must be related to the property.

Behavior:

- Video is uploaded to Supabase Storage.
- A media record is created in the database.
- Video is linked to the property listing.
- Backend generates a unique video reference name/code for every uploaded video.
- Backend stores the original uploaded file name separately from the generated unique video name.
- The generated video name must be unique across the application, even when multiple videos belong to the same city, locality, or property.
- The unique video reference should be used later for backend verification, moderation, audit, search diagnostics, and support checks.
- Video remains private or non-public until property approval.
- Once property is approved, the video becomes available in search/discovery.

Unique video naming rule:

- The system must not rely only on city, locality, property title, or original file name to identify a video.
- The backend should generate a unique name using a readable location/property slug plus a unique identifier.
- Recommended format: {city_slug}-{locality_slug}-{property_type}-{property_id_short}-{media_id_short}-{upload_timestamp}.{extension}
- Example: raipur-shankar-nagar-apartment-a13f92-b81c04-20260628143022.mp4.
- The generated name should be stored as video_reference_name and should be searchable in admin/backend tools.

Storage path example:

- property-videos/{user_id}/{property_id}/{video_reference_name}

6.6 Reel ID / Reel URL

Requirement:
The user can optionally add reel ID if present.

Accepted values:

- Instagram Reel URL.
- YouTube Shorts URL.
- Platform-specific reel ID.

Behavior:

- Reel ID is saved with the property listing.
- Reel ID is optional and does not replace mandatory property video upload.
- If reel URL is valid, the frontend may display a link or embedded preview.

6.7 Backend Approval Workflow

Requirement:
Once uploaded, the backend/admin should approve the property. Only approved properties should go live.

Property statuses:

- DRAFT: User has saved but not submitted.
- PENDING_REVIEW: User submitted for approval.
- APPROVED: Admin approved; listing is live.
- REJECTED: Admin rejected; listing is not live.
- INACTIVE: Listing disabled by owner or admin.

Admin review checks:

- Property details are complete.
- Video is uploaded and viewable.
- Video appears related to the property.
- Address and price are reasonable.
- Listing does not contain offensive, misleading, or prohibited content.
- Contact information follows platform policy.

Behavior:

- Admin opens pending property queue.
- Admin reviews property details and video.
- Admin clicks Approve or Reject.
- If approved, status changes to APPROVED and listing becomes searchable.
- If rejected, status changes to REJECTED and rejection reason is saved.
- Owner can edit rejected listing and resubmit.

6.8 Public Property Search

Requirement:
Approved property videos should be available for search by other people in the app.

Searchable content:

- Property title.
- Description.
- City.
- State.
- Locality.
- Property type.
- Listing type.
- Price or rent.
- Amenities.
- Video/reel availability.

Search behavior:

- Only APPROVED listings are returned.
- Public search defaults to the active Chhattisgarh state record from the database, with Raipur seeded as the primary MVP city.
- Listings can be sorted by newest, price low to high, price high to low, and relevance.
- Search results should include property summary, price/rent, location, main video thumbnail, and listing type.

6.9 Property Filters

Requirement:
User should be able to filter property based on standard filters.

Standard filters:

- Listing Type: Rent, Sale.
- Property Type: Apartment, House, Villa, Plot, Commercial, Shop, Warehouse.
- Location: Chhattisgarh city, locality, pincode.
- Budget Range: Minimum and maximum price/rent.
- BHK: 1 RK, 1 BHK, 2 BHK, 3 BHK, 4+ BHK.
- Area Range: Minimum and maximum built-up/carpet area.
- Furnishing: Unfurnished, Semi Furnished, Fully Furnished.
- Availability: Immediate, within 15 days, within 30 days, custom date.
- Amenities.
- Parking Available.
- Verified/Approved listings.
- Posted Date.
- Has Video.
- Has Reel.

6.10 Contact Owner / Lead Capture

Requirement:
Anyone who wants to reach out to the property owner must enter their phone number.

Input fields:

- Visitor Phone Number: Required.
- Visitor Name: Optional.
- Message: Optional.

Behavior:

- Guest or logged-in user clicks Contact Owner.
- System asks for phone number.
- Phone number is validated.
- Backend creates a lead/enquiry record.
- Owner is notified or the contact request is made available in owner dashboard.
- Depending on business policy, owner contact details may be displayed only after phone submission.

Recommended flow:

- Visitor enters phone number.
- System saves enquiry.
- System shows masked owner contact or triggers owner notification.
- Owner can call or message the visitor.

Lead data captured:

- Property ID.
- Owner User ID.
- Visitor phone number.
- Visitor name if provided.
- Message if provided.
- Enquiry source.
- Created date/time.

7. Data Model

7.0 Location Master Data

Stores the active states and cities available for property listing and search.

location_states fields:

- id: UUID, primary key.
- code: Text, unique. Example: CG.
- name: Text, unique. Example: Chhattisgarh.
- country_code: Text. Example: IN.
- is_active: Boolean.
- is_mvp_default: Boolean.
- created_at: Timestamp.
- updated_at: Timestamp.

location_cities fields:

- id: UUID, primary key.
- state_id: UUID, references location_states.id.
- name: Text. Example: Raipur.
- slug: Text. Example: raipur.
- is_major: Boolean.
- is_active: Boolean.
- sort_order: Integer.
- created_at: Timestamp.
- updated_at: Timestamp.

MVP seed data:

- State: Chhattisgarh.
- Cities: Raipur, Bhilai, Bilaspur, Durg, Korba.

7.1 users / profiles

Stores registered user details.

Fields:

- id: UUID, primary key.
- first_name: Text, required.
- last_name: Text, required.
- email: Text, required, unique.
- phone_number: Text, required, unique.
- phone_number_normalized: Text, required, unique.
- status: Text. Values: ACTIVE, INACTIVE, BLOCKED.
- created_at: Timestamp.
- updated_at: Timestamp.

7.2 properties

Stores property listing information.

Fields:

- id: UUID, primary key.
- owner_id: UUID, references users.id.
- listing_type: Text. Values: RENT, SALE.
- property_title: Text.
- property_type: Text.
- address_line_1: Text.
- address_line_2: Text.
- city: Text. Selected from active location_cities database records.
- state: Text. Selected from active location_states database records.
- pincode: Text.
- locality: Text.
- landmark: Text.
- latitude: Numeric.
- longitude: Numeric.
- bhk: Text.
- bedrooms: Integer.
- bathrooms: Integer.
- balconies: Integer.
- built_up_area: Numeric.
- carpet_area: Numeric.
- area_unit: Text.
- floor_number: Integer.
- total_floors: Integer.
- furnishing_status: Text.
- parking_available: Boolean.
- available_from: Date.
- sale_price: Numeric.
- monthly_rent: Numeric.
- security_deposit: Numeric.
- maintenance_charges: Numeric.
- negotiable: Boolean.
- description: Text.
- amenities: Text array or JSONB.
- owner_contact_preference: Text.
- reel_id: Text.
- reel_url: Text.
- status: Text. Values: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, INACTIVE.
- rejection_reason: Text.
- approved_by: UUID.
- approved_at: Timestamp.
- created_at: Timestamp.
- updated_at: Timestamp.

7.3 property_media

Stores property video and media references.

Fields:

- id: UUID, primary key.
- property_id: UUID, references properties.id.
- media_type: Text. Values: VIDEO, THUMBNAIL, IMAGE.
- storage_bucket: Text.
- storage_path: Text.
- public_url: Text.
- original_file_name: Text.
- video_reference_name: Text, required for videos, unique.
- video_reference_code: Text, required for videos, unique.
- file_size: Numeric.
- mime_type: Text.
- duration_seconds: Numeric.
- is_primary: Boolean.
- created_at: Timestamp.

7.4 property_approval_history

Stores approval audit trail.

Fields:

- id: UUID, primary key.
- property_id: UUID, references properties.id.
- previous_status: Text.
- new_status: Text.
- action_by: UUID.
- action_note: Text.
- created_at: Timestamp.

7.5 property_leads

Stores contact owner requests.

Fields:

- id: UUID, primary key.
- property_id: UUID, references properties.id.
- owner_id: UUID, references users.id.
- visitor_user_id: UUID, nullable.
- visitor_name: Text.
- visitor_phone_number: Text, required.
- visitor_message: Text.
- lead_status: Text. Values: NEW, CONTACTED, CLOSED, SPAM.
- created_at: Timestamp.
- updated_at: Timestamp.

8. Supabase Storage Design

Buckets:

- property-videos
- property-thumbnails

Recommended bucket access:

- Property videos remain private while property status is DRAFT, PENDING_REVIEW, or REJECTED.
- Approved property videos can be served through public URLs or signed URLs.
- Upload access is restricted to authenticated users.
- Users can upload only to their own user folder path.
- Admins can access all submitted property videos for approval.

9. Supabase Row Level Security

Recommended RLS rules:

- Users can read and update their own profile.
- Users cannot read private profile data of other users unless required by approved contact flow.
- Property owners can create and update their own DRAFT or REJECTED listings.
- Property owners can view all of their own listings.
- Public users can read only APPROVED properties.
- Public users can read only approved property media.
- Admin users can read, approve, reject, or deactivate all listings.
- Leads can be created by guests or registered users.
- Owners can read leads for their own properties.
- Admins can read all leads.

10. API / Backend Function Design

10.1 register_user

Purpose:
Create a new user profile.

Input:

- first_name.
- last_name.
- email.
- phone_number.

Output:

- success flag.
- user ID.
- message.

Validation:

- Required fields.
- Unique phone number.
- Unique email.

10.2 login_with_phone_otp

Purpose:
Validate phone number and OTP.

Input:

- phone_number.
- otp.

Output:

- success flag.
- session/token.
- user profile.
- message.

Logic:

- Normalize phone number.
- Check user exists.
- Check user status is ACTIVE.
- Check OTP equals 1234 for MVP.
- Create session.
- Return profile details.

10.3 create_property_listing

Purpose:
Create or save property listing.

Input:

- Property fields.
- Optional reel ID/reel URL.

Output:

- property ID.
- status.
- upload instructions if needed.

10.4 upload_property_video

Purpose:
Upload and link video file to property.

Input:

- property ID.
- video file.

Output:

- media ID.
- video reference name.
- video reference code.
- storage path.
- upload status.

Logic:

- Validate video file type and size.
- Generate a unique video_reference_name and video_reference_code.
- Preserve the original uploaded file name for audit only.
- Upload the file to Supabase Storage using video_reference_name.
- Save media metadata in property_media.

10.5 submit_property_for_review

Purpose:
Submit completed listing for admin/backend approval.

Logic:

- Check required property fields.
- Check video exists.
- Set status to PENDING_REVIEW.
- Create approval history entry.

10.6 approve_property

Purpose:
Approve listing and make it live.

Admin only.

Logic:

- Set property status to APPROVED.
- Save approved_by and approved_at.
- Create approval history entry.
- Make property searchable.

10.7 reject_property

Purpose:
Reject listing with reason.

Admin only.

Logic:

- Set property status to REJECTED.
- Save rejection reason.
- Create approval history entry.

10.8 search_properties

Purpose:
Search and filter approved properties.

Input:

- Search text.
- Chhattisgarh location.
- Listing type.
- Property type.
- Budget range.
- BHK.
- Area range.
- Amenities.
- Availability.
- Sort option.

Output:

- List of approved properties.
- Video thumbnail/video URL.
- Pagination metadata.

10.9 create_property_lead

Purpose:
Capture visitor phone number when contacting owner.

Input:

- property ID.
- visitor phone number.
- visitor name optional.
- visitor message optional.

Output:

- lead ID.
- success message.

11. User Flows

11.1 Signup Flow

1. User opens signup screen.
2. User enters first name, last name, email ID, and phone number.
3. User submits form.
4. Backend validates details.
5. Backend saves user in Supabase.
6. System shows registration success.
7. User proceeds to login.

11.2 Login Flow

1. User opens login screen.
2. User enters phone number.
3. User enters OTP 1234.
4. Backend checks phone number exists.
5. Backend validates OTP.
6. System creates session.
7. User lands on landing page.
8. Landing page displays user details.

11.3 Add Property Flow

1. User logs in.
2. User clicks Add Property.
3. User enters property details.
4. User enters optional reel ID or reel URL.
5. User uploads property video.
6. User submits listing.
7. Backend validates details and video.
8. Listing status becomes PENDING_REVIEW.
9. User sees submission confirmation.

11.4 Approval Flow

1. Admin opens pending listing queue.
2. Admin reviews property details.
3. Admin watches uploaded video.
4. Admin approves or rejects listing.
5. Approved listing becomes visible in search.
6. Rejected listing is returned to owner with reason.

11.5 Search Flow

1. Guest or user opens property search.
2. User enters a Chhattisgarh city, locality, pincode, or other filters.
3. Backend returns approved listings only.
4. User watches property video and views listing details.
5. User clicks Contact Owner if interested.

11.6 Contact Owner Flow

1. Visitor clicks Contact Owner.
2. System asks for visitor phone number.
3. Visitor submits phone number.
4. Backend validates phone number.
5. Backend saves lead record.
6. Owner is notified or lead appears in owner dashboard.
7. Visitor receives confirmation.

12. Screen Requirements

12.1 Signup Screen

Fields:

- First Name.
- Last Name.
- Email ID.
- Phone Number.
- Signup button.

12.2 Login Screen

Fields:

- Phone Number.
- OTP.
- Login button.

12.3 User Landing Page

Sections:

- User profile summary.
- Add Property action.
- My Properties.
- Pending Approval properties.
- Rejected properties requiring action.

12.4 Add Property Screen

Sections:

- Listing type.
- Basic property information.
- Location.
- Size and layout.
- Price/rent details.
- Amenities.
- Description.
- Reel ID / Reel URL.
- Video upload.
- Submit for Review.

12.5 Admin Approval Screen

Sections:

- Pending listings table.
- Property detail view.
- Video preview.
- Approve button.
- Reject button.
- Rejection reason field.

12.6 Public Search Screen

Sections:

- Search bar.
- Filters.
- Property cards.
- Video thumbnail.
- Sort options.
- Pagination or infinite scroll.

12.7 Property Detail Screen

Sections:

- Property video.
- Basic property details.
- Price/rent.
- Location.
- Amenities.
- Description.
- Contact Owner button.

13. Business Rules

- A phone number can belong to only one user.
- Email ID should be unique.
- A property cannot be submitted for approval without a video.
- Every uploaded property video must have a backend-generated unique video reference name/code.
- Original video file names must not be used as the primary identifier because many users may upload files with duplicate names or from the same city/location.
- MVP listings must belong to Chhattisgarh.
- City and state choices must come from location master tables in the database.
- Raipur is seeded as the primary MVP city; additional Chhattisgarh cities must be active database records before they appear in public filters.
- A property cannot go live unless approved.
- Rejected property listings are visible only to owner and admin.
- Public users can only see approved listings.
- A visitor must provide phone number before contacting owner.
- Owners cannot approve their own listings.
- Admin actions must be logged.
- Default OTP 1234 must not be used in production.

14. Notification Requirements

Recommended MVP notifications:

- Registration success.
- Property submitted for review.
- Property approved.
- Property rejected with reason.
- New enquiry received by owner.

Possible channels:

- In-app notification.
- Email.
- SMS/WhatsApp in future releases.

15. Search and Discovery Requirements

Recommended search implementation:

- Use indexed database columns for filters like state, city, locality, listing type, property type, price, rent, BHK, and status.
- Use full-text search on property title, description, state, city, locality, and amenities.
- Default public search to the active Chhattisgarh state record from the database.
- Only APPROVED listings should be indexed for public search.
- Video thumbnails should be shown in search cards.

Recommended sorting:

- Newest first.
- Price low to high.
- Price high to low.
- Rent low to high.
- Rent high to low.
- Most relevant.

16. Non-Functional Requirements

16.1 Security

- Use Supabase RLS for table-level access control.
- Use signed URLs or private buckets for non-approved videos.
- Restrict admin APIs to admin role only.
- Validate all inputs on backend.
- Rate-limit login attempts.
- Store normalized phone numbers.
- Do not expose owner phone number unless business policy allows it after lead capture.

16.2 Performance

- Search results should load within 2 seconds under normal conditions.
- Property video should use optimized streaming or compressed format.
- Use pagination or infinite scroll for search results.
- Add indexes on high-use filter columns.

16.3 Reliability

- Property submission should not complete unless property data and video upload are both successful.
- Failed upload should show retry option.
- Approval status changes should be auditable.

16.4 Scalability

- Supabase Storage should support growing property video volume.
- Search indexes should be optimized as listing count increases.
- Video processing or thumbnail generation can be moved to background jobs later.

17. Recommended Database Indexes

- users.phone_number_normalized.
- users.email.
- properties.owner_id.
- properties.status.
- properties.listing_type.
- properties.property_type.
- location_states.code.
- location_states.name.
- location_cities.state_id.
- location_cities.slug.
- properties.state.
- properties.city.
- properties.locality.
- properties.pincode.
- properties.sale_price.
- properties.monthly_rent.
- properties.bhk.
- properties.created_at.
- property_leads.property_id.
- property_leads.owner_id.

18. Acceptance Criteria

18.1 Signup

- User can register with first name, last name, email ID, and phone number.
- User details are saved in Supabase.
- Duplicate phone number is not allowed.
- Duplicate email ID is not allowed.

18.2 Login

- User can log in with registered phone number and OTP 1234.
- Login fails for unregistered phone number.
- Login fails for wrong OTP.
- Successful login displays user details on landing page.

18.3 Property Submission

- Logged-in user can add property for rent or sale.
- Mandatory fields are validated.
- State and city options are loaded from database master tables.
- State is locked to Chhattisgarh for MVP.
- Raipur is available because it is seeded as an active city record.
- Property video upload is mandatory.
- Each uploaded video receives a unique video reference name/code.
- The unique video reference can be used later by backend/admin for verification.
- Optional reel ID can be saved.
- Submitted property status is PENDING_REVIEW.
- Pending property is not visible in public search.

18.4 Approval

- Admin can approve submitted property.
- Approved property becomes visible in public search.
- Admin can reject submitted property with reason.
- Rejected property is not visible publicly.

18.5 Search and Filter

- Public users can search only approved properties.
- Public users can filter by standard property filters.
- Public users can filter Chhattisgarh listings by active database city records, locality, and pincode.
- Approved property videos are available in search and detail pages.

18.6 Contact Owner

- Visitor must enter phone number before contacting owner.
- Phone number is validated.
- Enquiry is saved in Supabase.
- Owner can view enquiries for their properties.

19. Future Enhancements

- Production OTP through SMS provider.
- WhatsApp login or WhatsApp enquiry.
- AI-based property description generation.
- AI-based video quality moderation.
- AI-based duplicate listing detection.
- Map-based search.
- Saved searches and alerts.
- Favorites / wishlist.
- Owner verification.
- Paid listing promotion.
- Chat between buyer/tenant and owner.
- Appointment scheduling.
- Property document upload and verification.

20. Open Questions

- Should the application be mobile-only, web-only, or both?
- Should guests be allowed to view owner phone number after submitting their phone number, or should the system notify the owner instead?
- Should admin approval be manual only, or should AI moderation assist admin review?
- Which Chhattisgarh cities should be activated in database master data after Raipur?
- Should phone numbers be restricted to India +91 format for MVP?
- What is the maximum allowed property video size and duration?
- Should property videos be publicly accessible URLs or signed URLs?
- Should the owner be able to deactivate an approved property?

21. Summary

The application will use Supabase as the primary backend platform for user data, Chhattisgarh property listings, location master data, media storage, approval workflows, and enquiries. Users will register with personal details, log in using phone number and default OTP 1234 for MVP, post rent/sale properties with mandatory video upload, and wait for backend approval before listings go live. Raipur is seeded as the primary MVP city, approved property videos and details will be searchable by other users, and interested visitors must submit their phone number before contacting the owner.
