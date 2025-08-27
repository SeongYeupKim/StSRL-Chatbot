# SRL Learning Assistant Chatbot

An AI-powered chatbot designed to facilitate students' self-regulated learning (SRL) based on the Success through Self-Regulated Learning (StSRL) framework developed at Penn State University.

## 🎯 Project Overview

This chatbot implements the StSRL framework to provide personalized learning prompts and AI-generated feedback to help students develop better self-regulated learning skills. The system is designed to support students throughout a 12-week semester with targeted prompts for each week.

## 🧠 SRL Framework Components

The chatbot addresses all five components of the StSRL framework:

- **Metacognition**: Self-awareness and reflection on learning processes
- **Strategy**: Effective learning strategies and techniques
- **Motivation**: Intrinsic motivation, self-efficacy, and engagement
- **Content**: Understanding and connecting course material
- **Management**: Time management, study environment, and resource allocation

## ✨ Key Features

### 🗓️ Week-Based Learning
- Students select their current week (1-12)
- Receive contextually relevant prompts based on semester progression
- Progressive skill development throughout the course

### 🤖 AI-Powered Feedback
- Intelligent analysis of student responses
- Personalized feedback based on SRL components
- Constructive suggestions and next steps
- Follow-up questions to deepen learning

### 💬 Interactive Chat Interface
- Natural conversation flow
- Multiple response types (multiple choice, slider, open-ended, yes/no)
- Real-time feedback generation
- Chat history and data archiving

### 📊 Comprehensive Data Collection
- Complete chat logs for research purposes
- Student response tracking
- Progress monitoring across SRL components
- Export capabilities for analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd srl-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Quick Deploy to Vercel

1. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

2. **Follow the prompts** to set up GitHub repository

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variable: `OPENAI_API_KEY`
   - Deploy!

### Manual Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Live Demo

Once deployed, your chatbot will be available at:
`https://your-project-name.vercel.app`

## 📱 How to Use

### For Students

1. **Login**: Enter any student ID (demo mode)
2. **Select Week**: Choose your current week (1-12)
3. **Respond to Prompts**: Answer the SRL-focused questions
4. **Receive Feedback**: Get AI-generated feedback and suggestions
5. **Continue Learning**: Engage in deeper conversations about SRL

### For Instructors/Researchers

1. **Access Data**: All chat logs are archived for analysis
2. **Customize Prompts**: Modify prompts in `data/prompts.ts`
3. **Enhance AI**: Improve feedback generation in `utils/ai-feedback.ts`
4. **Deploy**: Ready for production deployment

## 🏗️ Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive styling
- **Lucide React**: Beautiful icons

### Data Structure
- **22 Pre-built Prompts**: Covering all 12 weeks and SRL components
- **Chat Message System**: Structured conversation tracking
- **User Sessions**: Persistent user data and progress

### AI Feedback System
- **Component-Based Analysis**: Tailored feedback per SRL component
- **Response Analysis**: Simple heuristics for response evaluation
- **Template System**: Consistent, research-based feedback

## 📁 Project Structure

```
srl-chatbot/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ChatInterface.tsx  # Main chat interface
│   ├── ChatBubble.tsx     # Individual message bubbles
│   ├── LoginForm.tsx      # User authentication
│   ├── PromptCard.tsx     # SRL prompt display
│   ├── WeekSelector.tsx   # Week selection interface
│   └── Header.tsx         # Application header
├── data/                  # Data and prompts
│   └── prompts.ts         # 22 SRL prompts
├── types/                 # TypeScript definitions
│   └── srl.ts            # SRL framework types
├── utils/                 # Utility functions
│   └── ai-feedback.ts    # AI feedback generation
└── README.md             # Project documentation
```

## 🔧 Customization

### Adding New Prompts
Edit `data/prompts.ts` to add new prompts:

```typescript
{
  id: 'unique-id',
  week: 1,
  component: 'metacognition',
  title: 'Prompt Title',
  question: 'What is your question?',
  type: 'open-ended',
  description: 'Optional description'
}
```

### Enhancing AI Feedback
Modify `utils/ai-feedback.ts` to:
- Improve response analysis algorithms
- Add new feedback templates
- Implement more sophisticated NLP

### Styling
Customize the appearance by modifying:
- `tailwind.config.js` for theme colors
- `app/globals.css` for custom styles
- Component-specific CSS classes

## 📊 Research Integration

This chatbot is designed to support educational research:

- **Data Export**: All conversations are logged and exportable
- **Component Tracking**: Responses are tagged by SRL component
- **Progress Monitoring**: Track student development over time
- **A/B Testing Ready**: Easy to implement different prompt versions

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Penn State University**: For the StSRL framework research
- **National Science Foundation**: For funding the original research (Award #2337176)
- **Dr. Rayne A. Sperling**: Principal investigator of the StSRL project

## 📞 Support

For questions or support, please contact the development team or refer to the original StSRL research at [https://sites.psu.edu/stsrl/](https://sites.psu.edu/stsrl/).

---

**Note**: This is a research-based application designed to support self-regulated learning. The AI feedback system is currently using simplified heuristics and can be enhanced with more sophisticated natural language processing in future iterations.
