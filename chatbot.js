// Chatbot functionality
const chatbot = {
  apiKey:
    "sk-proj-IFkywdSxH4ygwcnN1a--aI-ATrwU0o8y2nf5S461w6aly-TwWFL2-7xfxPKyeT1R39k_gNUBVMT3BlbkFJpiovWzHhKMhEXFJBXSb3mzWIUtAdNjH3JQ4aNCqFPiJj_d7EKR3a5sEDRlKaRvQ9K9RzwYRQ4AAt",
  isOpen: false,
  messages: [],

  // Add knowledge base for common questions
  knowledgeBase: {
    // App information
    "what is luna":
      "Luna is a personal period tracking app that helps you track your menstrual cycle, predict your next period, monitor your mood, and understand your body better.",
    "what does luna do":
      "Luna helps you track your menstrual cycle, predict your next period, monitor your fertile window, track your mood, and provides health insights and home remedies for period symptoms.",
    "how does luna work":
      "Luna works by tracking your period dates and cycle length. You can input your last period date and average cycle length, and Luna will calculate your next period, fertile window, and provide personalized insights.",

    // Features
    "what features does luna have":
      "Luna offers several features including: period tracking, mood tracking, home remedies for period symptoms, health insights and analysis, wellness challenges, and educational resources about menstrual health.",
    "can luna predict my period":
      "Yes! Luna can predict your next period based on your previous cycle data. Just enter your last period date and average cycle length on the home page.",
    "how do i track my mood":
      "You can track your mood by clicking on the 'Mood Tracker' tab. There, you can select your energy level, physical comfort, and emotional state, and Luna will provide personalized recommendations.",

    // Privacy
    "is my data private":
      "Yes, Luna takes privacy seriously. Your health information remains secure and confidential. We believe your data is yours and design our app with privacy as a priority.",

    // Usage
    "how do i calculate my next period":
      "To calculate your next period, go to the Home tab, enter your last period start date and your average cycle length, then click the 'Calculate Next Period' button.",
    "what are the home remedies":
      "Luna provides several home remedies for period symptoms including heat therapy, light exercise, herbal teas, dietary changes, stress reduction techniques, and essential oils. You can find detailed information in the 'Home Remedies' tab.",
    "how do challenges work":
      "The Wellness Challenges feature offers daily health challenges that you can complete to earn points. These challenges are designed to improve your overall health and wellbeing during your cycle.",

    // Help
    help: "I can help you with information about Luna's features, how to track your period, mood tracking, home remedies, and more. What would you like to know about?",
  },

  init() {
    this.createChatbotUI()
    this.setupEventListeners()
  },

  createChatbotUI() {
    // Create chat bubble
    const chatBubble = document.createElement("div")
    chatBubble.id = "chat-bubble"
    chatBubble.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `
    document.body.appendChild(chatBubble)

    // Create chat container
    const chatContainer = document.createElement("div")
    chatContainer.id = "chat-container"
    chatContainer.classList.add("hidden")
    chatContainer.innerHTML = `
      <div class="chat-header">
        <h3>Luna Assistant</h3>
        <button id="close-chat">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-container">
        <input type="text" id="chat-input" placeholder="Ask me anything...">
        <button id="send-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `
    document.body.appendChild(chatContainer)

    // Add welcome message
    this.addMessage(
      "assistant",
      "Hi there! I'm Luna's AI assistant. How can I help you with your period tracking or health questions today? You can ask me about Luna's features, how to track your period, or any other health-related questions.",
    )
  },

  setupEventListeners() {
    // Toggle chat on bubble click
    document.getElementById("chat-bubble").addEventListener("click", () => {
      this.toggleChat()
    })

    // Close chat
    document.getElementById("close-chat").addEventListener("click", () => {
      this.toggleChat(false)
    })

    // Send message on button click
    document.getElementById("send-message").addEventListener("click", () => {
      this.sendMessage()
    })

    // Send message on Enter key
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage()
      }
    })
  },

  toggleChat(forceState) {
    const chatContainer = document.getElementById("chat-container")
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen

    if (this.isOpen) {
      chatContainer.classList.remove("hidden")
      setTimeout(() => {
        chatContainer.classList.add("open")
      }, 10)
    } else {
      chatContainer.classList.remove("open")
      setTimeout(() => {
        chatContainer.classList.add("hidden")
      }, 300)
    }
  },

  addMessage(role, content) {
    const messagesContainer = document.getElementById("chat-messages")
    const messageElement = document.createElement("div")
    messageElement.classList.add("chat-message", role)
    messageElement.innerHTML = `<div class="message-content">${content}</div>`
    messagesContainer.appendChild(messageElement)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Add to messages array
    this.messages.push({ role, content })
  },

  // Check if there's a predefined answer for the question
  checkKnowledgeBase(question) {
    // Convert question to lowercase for case-insensitive matching
    const lowerQuestion = question.toLowerCase().trim()

    // Check for exact matches
    if (this.knowledgeBase[lowerQuestion]) {
      return this.knowledgeBase[lowerQuestion]
    }

    // Check for partial matches
    for (const key in this.knowledgeBase) {
      if (lowerQuestion.includes(key) || key.includes(lowerQuestion)) {
        return this.knowledgeBase[key]
      }
    }

    // Check for keyword matches
    const keywords = {
      period:
        "Luna helps you track your menstrual cycle and predict your next period. You can enter your last period date and cycle length on the Home tab.",
      track:
        "Luna offers tracking for your period, mood, and symptoms. You can access these features from the main navigation menu.",
      calendar:
        "Luna provides a calendar view where you can see your period days and fertile window. You can find this on the Home tab.",
      mood: "The Mood Tracker feature allows you to record your energy level, physical comfort, and emotional state. Luna will provide personalized recommendations based on your inputs.",
      remedy:
        "Luna offers various home remedies for period symptoms including heat therapy, exercise, herbal teas, and more. Check the Home Remedies tab for details.",
      privacy: "Luna takes your privacy seriously. Your health information remains secure and confidential.",
      challenge:
        "Luna's Wellness Challenges feature offers daily health tasks to improve your wellbeing and earn points.",
      fertile: "Luna can calculate your fertile window based on your cycle data to help with family planning.",
    }

    for (const keyword in keywords) {
      if (lowerQuestion.includes(keyword)) {
        return keywords[keyword]
      }
    }

    // No match found
    return null
  },

  async sendMessage() {
    const inputElement = document.getElementById("chat-input")
    const userMessage = inputElement.value.trim()

    if (!userMessage) return

    // Clear input
    inputElement.value = ""

    // Add user message to chat
    this.addMessage("user", userMessage)

    // Add loading indicator
    const messagesContainer = document.getElementById("chat-messages")
    const loadingElement = document.createElement("div")
    loadingElement.classList.add("chat-message", "assistant", "loading")
    loadingElement.innerHTML = `<div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>`
    messagesContainer.appendChild(loadingElement)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Check if we have a predefined answer
    const predefinedAnswer = this.checkKnowledgeBase(userMessage)

    if (predefinedAnswer) {
      // Remove loading indicator
      setTimeout(() => {
        messagesContainer.removeChild(loadingElement)
        this.addMessage("assistant", predefinedAnswer)
      }, 500) // Small delay to make it feel more natural
    } else {
      try {
        // Prepare messages for API with context about Luna
        const contextMessage = {
          role: "system",
          content: `You are Luna's AI assistant for a period tracking app. Luna helps users track their menstrual cycle, predict their next period, monitor their mood, and provides health insights and home remedies. 

          Features of Luna include:
          - Period tracking and prediction
          - Mood tracking
          - Calendar view with period and fertile window
          - Home remedies for period symptoms
          - Health insights and analysis
          - Wellness challenges

          Be helpful, friendly, and informative. If asked about specific medical advice, remind users to consult healthcare professionals.`,
        }

        const apiMessages = [contextMessage]

        // Add the last few messages for context (limit to 5 for efficiency)
        const recentMessages = this.messages.slice(-5).map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        }))

        apiMessages.push(...recentMessages)

        // Call OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: apiMessages,
            max_tokens: 500,
          }),
        })

        const data = await response.json()

        // Remove loading indicator
        messagesContainer.removeChild(loadingElement)

        if (data.choices && data.choices.length > 0) {
          const assistantMessage = data.choices[0].message.content
          this.addMessage("assistant", assistantMessage)
        } else {
          this.addMessage("assistant", "I'm sorry, I couldn't process your request. Please try again.")
        }
      } catch (error) {
        // Remove loading indicator
        messagesContainer.removeChild(loadingElement)
        this.addMessage(
          "assistant",
          "I'm having trouble connecting. Please check your internet connection and try again.",
        )
        console.error("Error:", error)
      }
    }
  },
}

// Initialize chatbot when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  chatbot.init()
})
