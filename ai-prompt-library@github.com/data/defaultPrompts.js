export class DefaultPrompts {
    static getAll() {
        return [
            // Coding prompts
            {
                id: 'default-code-review',
                title: 'Code Review Assistant',
                description: 'Comprehensive code review with suggestions for improvement',
                content: 'Please review the following code for:\n\n1. Code quality and best practices\n2. Security vulnerabilities\n3. Performance optimizations\n4. Readability and maintainability\n5. Potential bugs or edge cases\n\nProvide specific suggestions for improvement:\n\n```\n[INSERT CODE HERE]\n```',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Coding'
                },
                tags: ['code-review', 'debugging', 'best-practices'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-debug-helper',
                title: 'Debug Helper',
                description: 'Systematic debugging approach for code issues',
                content: 'I\'m experiencing an issue with my code. Help me debug it systematically:\n\n**Problem description:**\n[Describe the issue]\n\n**Expected behavior:**\n[What should happen]\n\n**Actual behavior:**\n[What is happening]\n\n**Code:**\n```\n[INSERT CODE HERE]\n```\n\n**Error messages (if any):**\n[Insert error messages]\n\nPlease provide a step-by-step debugging approach and potential solutions.',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Coding'
                },
                tags: ['debugging', 'troubleshooting', 'error-fixing'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-code-documentation',
                title: 'Code Documentation Generator',
                description: 'Generate comprehensive documentation for code',
                content: 'Generate comprehensive documentation for the following code. Include:\n\n1. Function/class description\n2. Parameter explanations\n3. Return value description\n4. Usage examples\n5. Any important notes or caveats\n\nUse appropriate documentation format for the language:\n\n```\n[INSERT CODE HERE]\n```',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Coding'
                },
                tags: ['documentation', 'comments', 'api-docs'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-refactor-code',
                title: 'Code Refactoring Assistant',
                description: 'Refactor code for better structure and maintainability',
                content: 'Please refactor the following code to improve:\n\n1. Code structure and organization\n2. Readability and clarity\n3. Performance and efficiency\n4. Adherence to design patterns\n5. Maintainability\n\nProvide the refactored code with explanations for the changes:\n\n```\n[INSERT CODE HERE]\n```\n\nLanguage: [SPECIFY LANGUAGE]\nSpecific focus areas: [OPTIONAL - SPECIFY AREAS TO FOCUS ON]',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Coding'
                },
                tags: ['refactoring', 'code-improvement', 'clean-code'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-unit-tests',
                title: 'Unit Test Generator',
                description: 'Generate comprehensive unit tests for code',
                content: 'Generate comprehensive unit tests for the following code. Include:\n\n1. Test cases for normal scenarios\n2. Edge cases and boundary conditions\n3. Error handling tests\n4. Mock objects where necessary\n5. Clear test descriptions\n\nUse appropriate testing framework for the language:\n\n```\n[INSERT CODE HERE]\n```\n\nTesting framework: [SPECIFY FRAMEWORK IF PREFERRED]\nLanguage: [SPECIFY LANGUAGE]',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Coding'
                },
                tags: ['unit-tests', 'testing', 'quality-assurance'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },

            // Writing prompts
            {
                id: 'default-content-writer',
                title: 'Content Writing Assistant',
                description: 'Professional content creation with specific tone and style',
                content: 'Create engaging content on the following topic:\n\n**Topic:** [INSERT TOPIC]\n\n**Target audience:** [DESCRIBE AUDIENCE]\n\n**Tone:** [Professional/Casual/Friendly/Authoritative/etc.]\n\n**Length:** [SPECIFY WORD COUNT OR LENGTH]\n\n**Key points to cover:**\n- [Point 1]\n- [Point 2]\n- [Point 3]\n\n**Call to action:** [SPECIFY DESIRED ACTION]\n\nPlease ensure the content is:\n- Engaging and well-structured\n- SEO-friendly with relevant keywords\n- Appropriate for the target audience\n- Includes compelling headlines/subheadings',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Writing'
                },
                tags: ['content-creation', 'copywriting', 'marketing'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-email-composer',
                title: 'Professional Email Composer',
                description: 'Compose professional emails for various purposes',
                content: 'Compose a professional email with the following details:\n\n**Purpose:** [INSERT PURPOSE - e.g., follow-up, proposal, request, etc.]\n\n**Recipient:** [DESCRIBE RECIPIENT - title, relationship, etc.]\n\n**Key message:** [MAIN POINT TO COMMUNICATE]\n\n**Tone:** [Professional/Formal/Friendly/Urgent/etc.]\n\n**Desired outcome:** [WHAT DO YOU WANT TO ACHIEVE]\n\n**Additional context:** [ANY RELEVANT BACKGROUND INFORMATION]\n\nPlease include:\n- Appropriate subject line\n- Professional greeting\n- Clear and concise body\n- Appropriate closing\n- Call to action if needed',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Writing'
                },
                tags: ['email', 'business-communication', 'professional'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-grammar-check',
                title: 'Grammar and Style Checker',
                description: 'Improve grammar, style, and clarity of writing',
                content: 'Please review and improve the following text for:\n\n1. Grammar and spelling errors\n2. Sentence structure and clarity\n3. Word choice and vocabulary\n4. Overall flow and readability\n5. Consistency in tone and style\n\nProvide the corrected version and explain the key changes made:\n\n**Original text:**\n[INSERT TEXT HERE]\n\n**Target audience:** [SPECIFY IF RELEVANT]\n**Desired tone:** [SPECIFY IF RELEVANT]',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Writing'
                },
                tags: ['grammar', 'editing', 'proofreading'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },

            // Analysis prompts
            {
                id: 'default-data-analysis',
                title: 'Data Analysis Assistant',
                description: 'Analyze data patterns, trends, and insights',
                content: 'Analyze the following data and provide insights:\n\n**Data type:** [DESCRIBE TYPE OF DATA]\n\n**Data:**\n[INSERT DATA OR DESCRIBE DATA SOURCE]\n\n**Analysis objectives:**\n- [What patterns to look for]\n- [What questions to answer]\n- [What insights to derive]\n\n**Context:** [PROVIDE RELEVANT BACKGROUND]\n\nPlease provide:\n1. Key findings and patterns\n2. Statistical insights (if applicable)\n3. Trends and correlations\n4. Actionable recommendations\n5. Visualizations suggestions\n6. Potential limitations or considerations',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Analysis'
                },
                tags: ['data-analysis', 'statistics', 'insights'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-research-assistant',
                title: 'Research Assistant',
                description: 'Comprehensive research and information gathering',
                content: 'Help me research the following topic comprehensively:\n\n**Research topic:** [INSERT TOPIC]\n\n**Research scope:** [SPECIFIC ASPECTS TO FOCUS ON]\n\n**Target depth:** [Surface-level/Moderate/In-depth]\n\n**Intended use:** [PURPOSE OF RESEARCH]\n\n**Preferred sources:** [ACADEMIC/NEWS/INDUSTRY/MIXED]\n\nPlease provide:\n1. Overview of the topic\n2. Key concepts and definitions\n3. Current trends and developments\n4. Different perspectives or viewpoints\n5. Relevant statistics or data\n6. Credible sources and references\n7. Areas for further investigation',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Analysis'
                },
                tags: ['research', 'information-gathering', 'analysis'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-summarizer',
                title: 'Content Summarizer',
                description: 'Create concise summaries of complex content',
                content: 'Summarize the following content:\n\n**Content to summarize:**\n[INSERT CONTENT HERE]\n\n**Summary length:** [SHORT/MEDIUM/DETAILED]\n\n**Target audience:** [WHO WILL READ THE SUMMARY]\n\n**Focus areas:** [SPECIFIC ASPECTS TO EMPHASIZE]\n\nPlease provide:\n1. Executive summary (key points)\n2. Main arguments or findings\n3. Important details and supporting evidence\n4. Conclusions or implications\n5. Action items (if applicable)\n\nFormat the summary with clear headings and bullet points for easy reading.',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Analysis'
                },
                tags: ['summarization', 'content-analysis', 'executive-summary'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },

            // Creative prompts
            {
                id: 'default-brainstorming',
                title: 'Creative Brainstorming',
                description: 'Generate innovative ideas and creative solutions',
                content: 'Help me brainstorm creative ideas for:\n\n**Challenge/Project:** [DESCRIBE THE CHALLENGE]\n\n**Constraints:** [ANY LIMITATIONS OR REQUIREMENTS]\n\n**Target outcome:** [WHAT SUCCESS LOOKS LIKE]\n\n**Resources available:** [BUDGET, TIME, PEOPLE, ETC.]\n\n**Inspiration sources:** [EXISTING EXAMPLES OR PREFERENCES]\n\nPlease generate:\n1. 10-15 diverse creative ideas\n2. Explanation for each idea\n3. Pros and cons analysis\n4. Implementation complexity rating\n5. Most promising ideas with detailed development\n6. Next steps for the top 3 ideas\n\nThink outside the box and consider unconventional approaches!',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Creative'
                },
                tags: ['brainstorming', 'ideation', 'creativity'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-story-generator',
                title: 'Creative Story Generator',
                description: 'Generate engaging stories with specific elements',
                content: 'Create an engaging story with the following elements:\n\n**Genre:** [SPECIFY GENRE]\n\n**Setting:** [TIME AND PLACE]\n\n**Main character:** [DESCRIBE PROTAGONIST]\n\n**Conflict/Challenge:** [CENTRAL PROBLEM]\n\n**Tone:** [SERIOUS/HUMOROUS/MYSTERIOUS/ETC.]\n\n**Length:** [SHORT/MEDIUM/LONG]\n\n**Special elements to include:**\n- [Element 1]\n- [Element 2]\n- [Element 3]\n\n**Target audience:** [WHO WILL READ THIS]\n\nPlease create a compelling narrative with:\n- Strong character development\n- Engaging plot progression\n- Vivid descriptions\n- Satisfying resolution\n- Appropriate pacing for the length',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Creative'
                },
                tags: ['storytelling', 'creative-writing', 'narrative'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },

            // Business prompts
            {
                id: 'default-business-plan',
                title: 'Business Plan Assistant',
                description: 'Create comprehensive business plan sections',
                content: 'Help me develop a business plan section for:\n\n**Business concept:** [DESCRIBE YOUR BUSINESS IDEA]\n\n**Industry:** [SPECIFY INDUSTRY]\n\n**Target market:** [DESCRIBE YOUR CUSTOMERS]\n\n**Section focus:** [WHICH SECTION TO DEVELOP]\n\n**Stage:** [STARTUP/EXPANSION/EXISTING BUSINESS]\n\nPlease create a detailed section covering:\n1. Market analysis and opportunity\n2. Competitive landscape\n3. Business model and revenue streams\n4. Marketing and sales strategy\n5. Operations plan\n6. Financial projections overview\n7. Risk assessment\n8. Implementation timeline\n\nInclude specific, actionable details and realistic assumptions.',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Business'
                },
                tags: ['business-plan', 'strategy', 'entrepreneurship'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },
            {
                id: 'default-meeting-agenda',
                title: 'Meeting Agenda Creator',
                description: 'Create structured and effective meeting agendas',
                content: 'Create a comprehensive meeting agenda for:\n\n**Meeting purpose:** [MAIN OBJECTIVE]\n\n**Meeting type:** [TEAM MEETING/PROJECT REVIEW/PLANNING/ETC.]\n\n**Duration:** [PLANNED LENGTH]\n\n**Attendees:** [NUMBER AND ROLES OF PARTICIPANTS]\n\n**Key topics to cover:**\n- [Topic 1]\n- [Topic 2]\n- [Topic 3]\n\n**Decisions needed:** [WHAT NEEDS TO BE DECIDED]\n\n**Background context:** [RELEVANT INFORMATION]\n\nPlease create an agenda with:\n1. Clear objective statement\n2. Time allocations for each item\n3. Discussion leaders for each topic\n4. Expected outcomes\n5. Action items template\n6. Next steps planning\n7. Pre-meeting preparation requirements',
                category: {
                    aiModel: 'ChatGPT',
                    application: 'Business'
                },
                tags: ['meetings', 'agenda', 'productivity'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },

            // Claude-specific prompts
            {
                id: 'default-claude-analysis',
                title: 'Claude Deep Analysis',
                description: 'Leverage Claude\'s analytical strengths for complex problems',
                content: 'I need you to analyze this complex situation using your analytical capabilities:\n\n**Situation:** [DESCRIBE THE COMPLEX SITUATION]\n\n**Stakeholders involved:** [LIST KEY PARTIES]\n\n**Available information:** [WHAT DATA/FACTS YOU HAVE]\n\n**Missing information:** [WHAT YOU DON\'T KNOW]\n\n**Decision timeframe:** [URGENCY LEVEL]\n\n**Constraints:** [LIMITATIONS OR REQUIREMENTS]\n\nPlease provide:\n1. Structured analysis of the situation\n2. Multiple perspectives and viewpoints\n3. Potential risks and opportunities\n4. Decision framework recommendation\n5. Sensitivity analysis for key variables\n6. Recommended next steps\n7. Potential unintended consequences\n\nBe thorough and consider second and third-order effects.',
                category: {
                    aiModel: 'Claude',
                    application: 'Analysis'
                },
                tags: ['complex-analysis', 'decision-making', 'strategic-thinking'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            },

            // Gemini-specific prompts
            {
                id: 'default-gemini-multimodal',
                title: 'Gemini Multimodal Analysis',
                description: 'Analyze multiple types of content with Gemini\'s capabilities',
                content: 'Analyze the following content using multimodal understanding:\n\n**Content type:** [TEXT/IMAGE/VIDEO/MIXED]\n\n**Analysis goal:** [WHAT YOU WANT TO UNDERSTAND]\n\n**Context:** [RELEVANT BACKGROUND]\n\n**Content:**\n[INSERT OR DESCRIBE CONTENT]\n\n**Specific questions:**\n- [Question 1]\n- [Question 2]\n- [Question 3]\n\nPlease provide:\n1. Comprehensive content analysis\n2. Cross-modal connections and patterns\n3. Contextual interpretation\n4. Insights not immediately obvious\n5. Implications and applications\n6. Recommendations based on analysis\n\nConsider both explicit and implicit information.',
                category: {
                    aiModel: 'Gemini',
                    application: 'Analysis'
                },
                tags: ['multimodal', 'comprehensive-analysis', 'pattern-recognition'],
                isCustom: false,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                usageCount: 0
            }
        ];
    }

    static getByCategory(aiModel, application) {
        return this.getAll().filter(prompt => {
            return (!aiModel || prompt.category.aiModel === aiModel) &&
                   (!application || prompt.category.application === application);
        });
    }

    static getByAIModel(aiModel) {
        return this.getAll().filter(prompt => prompt.category.aiModel === aiModel);
    }

    static getByApplication(application) {
        return this.getAll().filter(prompt => prompt.category.application === application);
    }
} 