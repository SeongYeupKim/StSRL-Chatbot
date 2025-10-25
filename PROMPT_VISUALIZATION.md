# SRL Prompt Pipeline Visualization

## Overview
Your Nudge Chatbot implements a 12-week Self-Regulated Learning (SRL) program with prompts organized across 5 key components:

## SRL Components
- **🧠 Metacognition**: Self-awareness and reflection on learning
- **📚 Strategy**: Study methods and learning techniques  
- **💪 Motivation**: Confidence, interest, and self-efficacy
- **📖 Content**: Understanding and connecting course material
- **⏰ Management**: Time, environment, and resource management

## Weekly Prompt Flow

### Week 1: Introduction to SRL
```
w1-meta-1: Learning Goals Assessment (open-ended)
w1-strategy-1: Study Strategy Awareness (multiple-choice)
```

### Week 2: Metacognition Focus
```
w2-meta-1: Self-Monitoring Check (slider: 1-10)
w2-motivation-1: Confidence Level (slider: 1-10)
```

### Week 3: Strategy Development
```
w3-strategy-1: Active Learning Strategies (yes-no)
w3-management-1: Time Management (open-ended)
```

### Week 4: Motivation and Engagement
```
w4-motivation-1: Interest Level (slider: 1-10)
w4-content-1: Content Connection (open-ended)
```

### Week 5: Deep Learning
```
w5-strategy-1: Elaboration Strategy (open-ended)
w5-meta-1: Learning Process Reflection (open-ended)
```

### Week 6: Assessment Preparation
```
w6-management-1: Exam Preparation (multiple-choice)
w6-motivation-1: Stress Level (slider: 1-10)
```

### Week 7: Mid-semester Reflection
```
w7-meta-1: Mid-semester Assessment (slider: 1-10)
w7-strategy-1: Strategy Effectiveness (open-ended)
```

### Week 8: Adaptation and Growth
```
w8-motivation-1: Growth Mindset (yes-no)
w8-management-1: Study Environment (multiple-choice)
```

### Week 9: Advanced Strategies
```
w9-strategy-1: Interleaving Practice (yes-no)
w9-content-1: Concept Integration (open-ended)
```

### Week 10: Self-Efficacy
```
w10-motivation-1: Self-Efficacy Check (slider: 1-10)
w10-meta-1: Learning Transfer (open-ended)
```

### Week 11: Final Preparation
```
w11-management-1: Final Exam Preparation (open-ended)
w11-strategy-1: Review Strategy (multiple-choice)
```

### Week 12: Course Reflection
```
w12-meta-1: Overall Learning Reflection (open-ended)
w12-motivation-1: Future Learning Goals (open-ended)
```

## Prompt Types Distribution

### By Question Type:
- **Open-ended**: 10 prompts (42%)
- **Multiple-choice**: 5 prompts (21%)
- **Slider**: 6 prompts (25%)
- **Yes-no**: 3 prompts (12%)

### By SRL Component:
- **Metacognition**: 6 prompts (25%)
- **Strategy**: 6 prompts (25%)
- **Motivation**: 6 prompts (25%)
- **Management**: 4 prompts (17%)
- **Content**: 2 prompts (8%)

## Prompt Pipeline Flow

```
User Session Start
       ↓
Week Selection (1-12)
       ↓
Get Prompts by Week
       ↓
Present Prompt to User
       ↓
Collect Response
       ↓
Generate AI Feedback
       ↓
Store in Session Data
       ↓
Archive Session (if complete)
```

## Key Features

### Progressive Learning Design:
- **Weeks 1-3**: Foundation building (goals, strategies, monitoring)
- **Weeks 4-6**: Engagement and assessment prep
- **Weeks 7-9**: Mid-semester reflection and advanced strategies
- **Weeks 10-12**: Self-efficacy and final preparation

### Adaptive Feedback:
- Each prompt triggers AI-generated feedback
- Responses stored for progress tracking
- Session data archived for analysis

### Multi-modal Interaction:
- Slider inputs for quantitative self-assessment
- Multiple choice for strategy selection
- Open-ended for deep reflection
- Yes-no for quick check-ins

## Data Flow Architecture

```
Prompts (prompts.ts) → Chat Interface → AI Feedback → Session Storage → Archive
```

This creates a comprehensive learning journey that builds self-regulated learning skills progressively over 12 weeks!

