# 🚀 Deployment Guide: GitHub + Vercel

## Step 1: Create GitHub Repository

1. **Go to [GitHub.com](https://github.com)** and sign in
2. **Click "New repository"** (green button)
3. **Repository name**: `srl-chatbot` (or your preferred name)
4. **Description**: `Self-Regulated Learning Chatbot for Students`
5. **Make it Public** (free hosting)
6. **Don't initialize** with README (we already have one)
7. **Click "Create repository"**

## Step 2: Push Code to GitHub

Replace `yourusername` with your actual GitHub username in these commands:

```bash
# Update the remote URL with your actual username
git remote set-url origin ho
https://github.com/YOUR_USERNAME/srl-chatbot.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your GitHub repository** (`srl-chatbot`)
4. **Configure project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

## Step 4: Set Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables**:

```
Name: OPENAI_API_KEY
Value: [YOUR_OPENAI_API_KEY_HERE]
Environment: Production, Preview, Development
```

## Step 5: Deploy

1. **Click "Deploy"**
2. **Wait for build** (2-3 minutes)
3. **Your app will be live** at: `https://your-project-name.vercel.app`

## 🎯 What You'll Get

✅ **Public URL**: `https://your-project-name.vercel.app`  
✅ **Automatic deployments** when you push to GitHub  
✅ **Free hosting** with generous limits  
✅ **Custom domain** option (optional)  

## 🔧 Post-Deployment

### Update README with Live URL
Once deployed, update your README.md with the live URL.

### Test Your Deployment
1. Visit your live URL
2. Test the chatbot functionality
3. Verify data archiving works
4. Check the data viewer at `/data`

## 🚨 Important Notes

- **Data Archives**: Will be stored locally on Vercel's servers (not persistent across deployments)
- **Environment Variables**: Keep your OpenAI API key secure
- **Free Tier Limits**: 
  - 100GB bandwidth/month
  - 100 serverless function executions/day
  - 10GB storage

## 🔄 Continuous Deployment

After setup, every time you push to GitHub:
1. Vercel automatically detects changes
2. Builds and deploys your app
3. Updates your live URL

## 🆘 Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### API Errors
- Check OpenAI API key is correct
- Verify API routes are working
- Check function timeout limits

### Need Help?
- Vercel documentation: https://vercel.com/docs
- GitHub issues: Create an issue in your repository
