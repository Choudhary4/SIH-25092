# Anonymous Display Name System

## Overview

The Mann-Mitra platform implements an anonymous display name system to protect user privacy while maintaining accountability. This system assigns unique, anonymous identifiers to users instead of displaying their real names in public contexts.

## How it Works

### Anonymous Name Generation

Each user is automatically assigned an anonymous display name when they register or when the migration script is run for existing users. The anonymous name consists of:

- **Adjective**: Positive, calming words (e.g., "Wise", "Calm", "Hope")
- **Noun**: Meaningful, supportive terms (e.g., "Seeker", "Helper", "Guardian")  
- **Number**: 3-digit number (000-999)

**Example**: `WiseSeeker042`, `CalmHelper756`

### Name Consistency

- Anonymous names are **deterministic** - the same user always gets the same anonymous name
- Generated using a hash of the user's MongoDB ObjectId with MD5
- Ensures consistency across all platforms and sessions

### Where Anonymous Names Are Used

#### Public Contexts (Anonymous Names Shown):
- Header display when logged in
- Forum posts and comments
- Public chat messages
- Crisis alerts sent to counsellors (protects identity)
- Student dashboard welcome message
- Peer-to-peer interactions

#### Private/Administrative Contexts (Real Names Shown):
- Admin dashboard
- Counsellor professional interfaces  
- Moderator tools
- Appointment booking systems
- Database records and logs
- Crisis alert admin tracking (for accountability)

## Implementation Details

### Database Schema

```javascript
// User Model Addition
anonymousDisplayName: {
  type: String,
  trim: true,
  maxlength: [30, 'Anonymous display name must not exceed 30 characters']
}
```

### API Response Updates

Authentication endpoints now include the anonymous display name:

```javascript
user: {
  id: user._id,
  email: user.email,
  name: user.name,
  anonymousDisplayName: user.anonymousDisplayName, // Added
  collegeId: user.collegeId,
  role: user.role,
  languagePref: user.languagePref,
  createdAt: user.createdAt
}
```

### Frontend Usage

```jsx
// Use anonymous name for public display
<span>{user?.anonymousDisplayName || 'User'}</span>

// Use real name for admin interfaces (if admin role)
<span>{user?.role === 'admin' ? user?.name : user?.anonymousDisplayName}</span>
```

### Crisis Alerts Enhancement

Crisis alerts now contain both names for proper handling:

```javascript
const alertData = {
  userId: userId,
  userName: anonymousDisplayName,     // Public display
  realName: realName,                // Admin tracking only
  anonymousDisplayName: anonymousDisplayName,
  // ... other fields
};
```

## Privacy Benefits

### 🔒 User Privacy
- **Real names never exposed** in public forums or peer interactions
- **Identity protection** prevents discrimination or bias
- **Consistent anonymity** across all public interactions

### 👥 Safe Peer Support
- Users can share experiences **without fear of identification**
- **Reduces stigma** associated with mental health discussions
- Enables **honest, open communication**

### 🎭 Pseudonymous Identity
- **Consistent anonymous identity** allows relationship building
- **Recognition without revelation** - users can build reputation anonymously
- **Trackable interactions** without compromising privacy

## Administrative Oversight

### 🔍 Admin Visibility
- **Full transparency for admins** - can see real names when needed
- **Crisis intervention capability** - can identify users in emergencies
- **Accountability maintained** - all actions traceable by admins

### 🚨 Crisis Management
- **Anonymous alerts protect privacy** during crisis interventions
- **Real name available to qualified personnel** for follow-up
- **Maintains professional boundaries** while ensuring safety

## Technical Security

### 🔐 Name Generation Security
- Uses **cryptographic hashing** (MD5) for consistency
- **User ID as seed** ensures uniqueness and reproducibility
- **No reverse engineering** possible from anonymous name to real identity

### 🗄️ Data Separation
- **Clear separation** between public and private data contexts
- **Role-based access** controls who sees what information
- **Audit trail** maintains for all access to real names

## Migration for Existing Users

Run the migration script to generate anonymous names for existing users:

```bash
cd server
node scripts/generate-anonymous-names.js
```

This script:
- ✅ Finds users without anonymous display names
- ✅ Generates unique anonymous names using the same algorithm
- ✅ Updates user records safely
- ✅ Provides detailed logging of the process

## Future Considerations

### Customization Options
- Consider allowing users to **regenerate their anonymous name** (limited times)
- Potentially add **custom anonymous name selection** with approval system
- **Theme-based name sets** (nature, space, emotions, etc.)

### Enhanced Privacy Features
- **Time-based name rotation** for ultra-high privacy users
- **Context-specific names** (different names for different areas)
- **Group pseudonyms** for support group interactions

## Best Practices

### For Developers
- ✅ Always use `user.anonymousDisplayName` for public displays
- ✅ Only use `user.name` in admin/professional contexts
- ✅ Include both names in crisis alerts for proper handling
- ✅ Test anonymization in all user-facing features

### For Administrators
- 🔍 Monitor crisis alerts for real name usage appropriateness
- 📊 Regular audits of where real names are displayed
- 🛡️ Ensure staff training on privacy importance
- 📋 Document any real name access for accountability

## Compliance and Ethics

### Privacy Compliance
- ✅ Supports **GDPR right to pseudonymization**
- ✅ Reduces **personal data exposure risk**
- ✅ Maintains **consent-based data sharing**
- ✅ Enables **data minimization principles**

### Ethical Considerations  
- 🤝 **Respects user autonomy** in identity sharing
- 💚 **Reduces mental health stigma** through anonymity
- 🏥 **Maintains care quality** through professional oversight
- ⚖️ **Balances privacy with safety** appropriately

---

This anonymous display name system provides robust privacy protection while maintaining the accountability and safety features necessary for a mental health platform.