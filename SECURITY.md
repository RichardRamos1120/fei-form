# Security Guidelines - Government Application

## 🔒 Environment Variables Security

### Critical Security Requirements:

1. **Never commit `.env` files to version control**
2. **Firebase credentials must remain confidential**
3. **Production environment variables should be managed by deployment platform**

### Environment Setup:

1. Copy `.env.example` to `.env`
2. Fill in your actual Firebase credentials
3. Ensure `.env` is in `.gitignore` (already configured)

### Production Deployment:

- Use platform-specific environment variable management:
  - **Vercel**: Environment Variables in dashboard
  - **Netlify**: Site settings > Environment variables
  - **Heroku**: Config Vars in dashboard
  - **AWS**: Systems Manager Parameter Store
  - **Azure**: App Settings

### Security Checklist:

- [ ] `.env` file is not committed to git
- [ ] Production uses secure environment variable management
- [ ] Firebase Security Rules are properly configured
- [ ] Regular security audits are performed
- [ ] Access logs are monitored

## 🛡️ Firebase Security

### Required Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access only to authenticated users
    match /equipment-inventories/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Required Storage Security Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /equipment-photos/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ⚠️ Important Notes:

- This application handles government data
- All security protocols must be followed
- Regular security reviews are mandatory
- Report any security concerns immediately