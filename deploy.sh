#!/bin/bash

echo "🚀 SRL Chatbot Deployment Script"
echo "================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run 'git init' first."
    exit 1
fi

# Get GitHub username
echo "📝 Please enter your GitHub username:"
read github_username

if [ -z "$github_username" ]; then
    echo "❌ Username cannot be empty."
    exit 1
fi

# Update remote URL
echo "🔗 Updating remote URL..."
git remote set-url origin https://github.com/$github_username/srl-chatbot.git

# Check if remote is set correctly
if git remote get-url origin | grep -q "$github_username"; then
    echo "✅ Remote URL updated successfully"
else
    echo "❌ Failed to update remote URL"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Next Steps:"
    echo "1. Go to https://github.com/$github_username/srl-chatbot"
    echo "2. Verify your code is there"
    echo "3. Go to https://vercel.com"
    echo "4. Import your GitHub repository"
    echo "5. Set environment variable OPENAI_API_KEY"
    echo "6. Deploy!"
    echo ""
    echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your GitHub credentials and try again."
fi
