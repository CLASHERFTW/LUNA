// DOM Elements
const loginPage = document.getElementById("login-page")
const dashboardPage = document.getElementById("dashboard-page")
const loginForm = document.getElementById("login-form-element")
const registerForm = document.getElementById("register-form-element")
const authTabs = document.querySelectorAll(".auth-tab")
const authForms = document.querySelectorAll(".auth-form")
const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
const mobileMenu = document.getElementById("mobile-menu")
const mobileMenuOverlay = document.getElementById("mobile-menu-overlay")
const mobileMenuClose = document.getElementById("mobile-menu-close")
const themeToggle = document.getElementById("theme-toggle")
const navLinks = document.querySelectorAll(".nav-link")
const tabContents = document.querySelectorAll(".tab-content")
const prevMonthBtn = document.getElementById("prev-month")
const nextMonthBtn = document.getElementById("next-month")
const currentMonthDisplay = document.getElementById("current-month-display")
const calendarContainer = document.getElementById("calendar-container")
const feedbackForm = document.getElementById("feedback-form")
const healthForm = document.getElementById("health-form")

// State
let currentMonth = new Date()
let selectedDate = null
let periodDays = []
let fertileWindow = []
let isDarkMode = false
let userPoints = 0
let currentUser = null
const availableChallenges = [
  { id: 1, title: "Drink 8 glasses of water today", points: 10, category: "Hydration" },
  { id: 2, title: "Do a 15-minute yoga session", points: 15, category: "Exercise" },
  { id: 3, title: "Meditate for 10 minutes", points: 10, category: "Mental Health" },
  { id: 4, title: "Eat 5 servings of fruits and vegetables", points: 20, category: "Nutrition" },
  { id: 5, title: "Get 8 hours of sleep tonight", points: 15, category: "Sleep" },
  { id: 6, title: "Take a 20-minute walk", points: 10, category: "Exercise" },
  { id: 7, title: "Write in a gratitude journal", points: 10, category: "Mental Health" },
  { id: 8, title: "Try a new healthy recipe", points: 20, category: "Nutrition" },
  { id: 9, title: "Do a 10-minute stretching routine", points: 10, category: "Exercise" },
  { id: 10, title: "Practice deep breathing for 5 minutes", points: 5, category: "Stress Relief" },
]
let activeChallenges = []

// Add these variables to your existing state variables
let cycleAnalysisChart = null;
let symptomDistributionChart = null;
let cycleLengthChart = null;
let analysisData = {
  cycleLength: 28,
  periodDuration: 5,
  painLevel: 5,
  symptoms: {},
  cycleLengths: []
};

// Initialize the app
function init() {
  // Set up event listeners
  setupEventListeners()

  // Initialize the calendar
  updateCalendarDisplay()

  // Animate staggered items
  animateStaggeredItems()

  // Initialize challenges
  refreshChallenges()
  
  // Initialize charts
  initializeCharts();

  // Check if user is already logged in
  checkAuthState()
}

// Add the functions that were missing or incomplete

// Function to set up all event listeners
function setupEventListeners() {
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }

  // Auth tabs
  authTabs.forEach(tab => {
    tab.addEventListener("click", function() {
      const tabName = this.getAttribute("data-tab")
      authTabs.forEach(t => t.classList.remove("active"))
      this.classList.add("active")
      authForms.forEach(form => form.classList.remove("active"))
      document.getElementById(`${tabName}-form`).classList.add("active")
    })
  })

  // Login and Register Forms
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }
  
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }

  // Google sign-in buttons
  const googleSignIn = document.getElementById("google-signin")
  const googleSignUp = document.getElementById("google-signup")
  
  if (googleSignIn) {
    googleSignIn.addEventListener("click", signInWithGoogle)
  }
  
  if (googleSignUp) {
    googleSignUp.addEventListener("click", signInWithGoogle)
  }

  // Mobile menu
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", openMobileMenu)
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMobileMenu)
  }
  
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener("click", closeMobileMenu)
  }

  // Calendar navigation
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentMonth.setMonth(currentMonth.getMonth() - 1)
      updateCalendarDisplay()
    })
  }
  
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentMonth.setMonth(currentMonth.getMonth() + 1)
      updateCalendarDisplay()
    })
  }

  // Forms
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", handleFeedbackSubmit)
  }
  
  if (healthForm) {
    healthForm.addEventListener("submit", handleHealthFormSubmit)
  }
}

// Authentication Functions
function handleLogin(e) {
  e.preventDefault()
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value
  const errorElement = document.getElementById("login-error")
  
  if (!email || !password) {
    showError(errorElement, "Please enter both email and password")
    return
  }
  
  // Use Firebase auth
  window.firebaseFunctions.signIn(window.firebaseAuth, email, password)
    .then((userCredential) => {
      // Signed in successfully
      currentUser = userCredential.user
      showDashboard()
    })
    .catch((error) => {
      showError(errorElement, `Login failed: ${error.message}`)
    })
}

function handleRegister(e) {
  e.preventDefault()
  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const confirmPassword = document.getElementById("register-confirm-password").value
  const errorElement = document.getElementById("register-error")
  
  if (!name || !email || !password || !confirmPassword) {
    showError(errorElement, "Please fill in all fields")
    return
  }
  
  if (password !== confirmPassword) {
    showError(errorElement, "Passwords do not match")
    return
  }
  
  // Use Firebase auth
  window.firebaseFunctions.createUser(window.firebaseAuth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      currentUser = userCredential.user
      
      // Save additional user data to Firestore
      const userDocRef = window.firebaseFunctions.doc(window.firebaseDb, "users", currentUser.uid)
      return window.firebaseFunctions.setDocument(userDocRef, {
        name: name,
        email: email,
        createdAt: new Date(),
        points: 0,
        cycleData: {
          cycleLength: 28,
          periodDuration: 5
        }
      })
    })
    .then(() => {
      showDashboard()
    })
    .catch((error) => {
      showError(errorElement, `Registration failed: ${error.message}`)
    })
}

function signInWithGoogle() {
  window.firebaseFunctions.signInWithGoogle(window.firebaseAuth, window.googleProvider)
    .then((result) => {
      // Google sign-in successful
      currentUser = result.user
      
      // Check if this is a new user
      const userDocRef = window.firebaseFunctions.doc(window.firebaseDb, "users", currentUser.uid)
      return window.firebaseFunctions.getDocument(userDocRef)
        .then((docSnap) => {
          if (!docSnap.exists()) {
            // New user, create a document for them
            return window.firebaseFunctions.setDocument(userDocRef, {
              name: currentUser.displayName,
              email: currentUser.email,
              createdAt: new Date(),
              points: 0,
              cycleData: {
                cycleLength: 28,
                periodDuration: 5
              }
            })
          }
        })
    })
    .then(() => {
      showDashboard()
    })
    .catch((error) => {
      console.error("Google sign-in failed:", error)
    })
}

function checkAuthState() {
  window.firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      currentUser = user
      loadUserData()
      showDashboard()
    } else {
      // User is signed out
      showLoginPage()
    }
  })
}

function logout() {
  window.firebaseFunctions.signOut(window.firebaseAuth)
    .then(() => {
      // Sign-out successful
      currentUser = null
      showLoginPage()
    })
    .catch((error) => {
      console.error("Logout failed:", error)
    })
}

// UI Functions
function showLoginPage() {
  loginPage.classList.remove("hidden")
  dashboardPage.classList.add("hidden")
}

function showDashboard() {
  loginPage.classList.add("hidden")
  dashboardPage.classList.remove("hidden")
}

function showError(element, message) {
  element.textContent = message
  element.classList.remove("hidden")
  
  // Hide the error after 4 seconds
  setTimeout(() => {
    element.classList.add("hidden")
  }, 4000)
}

function openMobileMenu() {
  mobileMenu.classList.add("open")
  mobileMenuOverlay.classList.add("open")
}

function closeMobileMenu() {
  mobileMenu.classList.remove("open")
  mobileMenuOverlay.classList.remove("open")
}

function toggleTheme() {
  isDarkMode = !isDarkMode
  
  if (isDarkMode) {
    document.body.classList.add("dark")
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    `
  } else {
    document.body.classList.remove("dark")
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    `
  }
  
  // Save preference to localStorage
  localStorage.setItem("luna-theme", isDarkMode ? "dark" : "light")
  
  // Update charts if they exist
  updateChartsTheme()
}

function showTab(tabName) {
  // Update nav links
  navLinks.forEach(link => {
    if (link.getAttribute("onclick").includes(`showTab('${tabName}')`)) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
  
  // Show the selected tab content and hide others
  tabContents.forEach(content => {
    if (content.id === tabName) {
      content.classList.add("active")
    } else {
      content.classList.remove("active")
    }
  })
}

// Animation Function
function animateStaggeredItems() {
  const staggeredItems = document.querySelectorAll(".staggered-item")
  
  staggeredItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.animation = `fadeIn 0.5s ease-in-out forwards`
      item.style.opacity = 1
    }, 100 * index)
  })
}

// Calendar Functions
function updateCalendarDisplay() {
  if (!currentMonthDisplay || !calendarContainer) return
  
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // Update the month/year display
  currentMonthDisplay.textContent = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Clear previous calendar days (but keep the weekday headers)
  const dayElements = calendarContainer.querySelectorAll(".calendar-day")
  dayElements.forEach(day => day.remove())
  
  // Get the first day of the month and the number of days in the month
  const firstDay = new Date(year, month, 1).getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div")
    calendarContainer.appendChild(emptyDay)
  }
  
  // Add cells for all days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div")
    dayElement.classList.add("calendar-day")
    dayElement.textContent = day
    
    // Check if this day is in the period or fertile window
    const currentDate = new Date(year, month, day)
    
    if (isPeriodDay(currentDate)) {
      dayElement.classList.add("period")
    } else if (isFertileDay(currentDate)) {
      dayElement.classList.add("fertile")
    }
    
    // Check if this is the selected day
    if (selectedDate && 
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year) {
      dayElement.classList.add("selected")
    }
    
    // Add click event to select day
    dayElement.addEventListener("click", () => {
      selectedDate = new Date(year, month, day)
      updateCalendarDisplay() // Refresh to show the selection
    })
    
    calendarContainer.appendChild(dayElement)
  }
}

function isPeriodDay(date) {
  return periodDays.some(periodDate => 
    periodDate.getDate() === date.getDate() &&
    periodDate.getMonth() === date.getMonth() &&
    periodDate.getFullYear() === date.getFullYear()
  )
}

function isFertileDay(date) {
  return fertileWindow.some(fertileDate => 
    fertileDate.getDate() === date.getDate() &&
    fertileDate.getMonth() === date.getMonth() &&
    fertileDate.getFullYear() === date.getFullYear()
  )
}

function calculateNextPeriod() {
  const lastPeriodInput = document.getElementById("lastPeriod")
  const cycleDurationInput = document.getElementById("cycleDuration")
  const periodResultDiv = document.getElementById("period-result")
  
  if (!lastPeriodInput || !cycleDurationInput || !periodResultDiv) return
  
  const lastPeriodDate = new Date(lastPeriodInput.value)
  const cycleLength = parseInt(cycleDurationInput.value)
  
  if (isNaN(lastPeriodDate.getTime()) || isNaN(cycleLength)) {
    alert("Please enter a valid date and cycle length")
    return
  }
  
  // Calculate next period
  const nextPeriodDate = new Date(lastPeriodDate)
  nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength)
  
  // Calculate fertile window (typically 12-16 days before next period)
  const fertileStart = new Date(nextPeriodDate)
  fertileStart.setDate(nextPeriodDate.getDate() - 16)
  const fertileEnd = new Date(nextPeriodDate)
  fertileEnd.setDate(nextPeriodDate.getDate() - 12)
  
  // Calculate days until next period
  const today = new Date()
  const daysUntil = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24))
  
  // Update display
  document.getElementById("next-period-date").textContent = nextPeriodDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  document.getElementById("fertile-window").textContent = `${fertileStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${fertileEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  document.getElementById("days-until").textContent = `${daysUntil} days`
  document.getElementById("cycle-length").textContent = `${cycleLength} days`
  
  // Update the summary displays
  document.getElementById("last-period-display").textContent = lastPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  document.getElementById("next-period-display").textContent = nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  
  // Show the result
  periodResultDiv.classList.remove("hidden")
  
  // Update period days and fertile window for calendar
  periodDays = []
  fertileWindow = []
  
  // Add current period days (assume 5 days)
  for (let i = 0; i < 5; i++) {
    const periodDay = new Date(lastPeriodDate)
    periodDay.setDate(lastPeriodDate.getDate() + i)
    periodDays.push(periodDay)
  }
  
  // Add next period days (assume 5 days)
  for (let i = 0; i < 5; i++) {
    const periodDay = new Date(nextPeriodDate)
    periodDay.setDate(nextPeriodDate.getDate() + i)
    periodDays.push(periodDay)
  }
  
  // Add fertile window days
  let fertileDay = new Date(fertileStart)
  while (fertileDay <= fertileEnd) {
    fertileWindow.push(new Date(fertileDay))
    fertileDay.setDate(fertileDay.getDate() + 1)
  }
  
  // Save to user data if signed in
  if (currentUser) {
    saveUserCycleData(lastPeriodDate, cycleLength)
  }
  
  // Refresh calendar display
  updateCalendarDisplay()
}

// Mood Tracker Functions
function analyzeMood() {
  const energy = document.getElementById("energy").value
  const comfort = document.getElementById("comfort").value
  const emotion = document.getElementById("emotion").value
  const moodResultDiv = document.getElementById("mood-result")
  
  if (!energy || !comfort || !emotion) {
    alert("Please select all mood options")
    return
  }
  
  // Determine overall mood
  let moodTitle, moodEmoji, recommendation, foodRec, spotifyLink
  
  if (emotion === "happy" && energy === "high" && comfort === "good") {
    moodTitle = "You're Feeling Great!"
    moodEmoji = "😊"
    recommendation = "Enjoy this positive energy! It's a good day to be productive and social."
    foodRec = "Treat yourself to something nutritious and delicious, like a colorful Buddha bowl or fresh fruit smoothie."
    spotifyLink = "https://open.spotify.com/playlist/37i9dQZF1DX1g0iEXLFycr" // Happy Hits playlist
  } else if (comfort === "pain") {
    moodTitle = "You're Experiencing Discomfort"
    moodEmoji = "😣"
    recommendation = "Take it easy today. Try a warm bath, gentle stretching, or a heating pad for relief."
    foodRec = "Anti-inflammatory foods like turmeric tea, ginger, dark chocolate, and berries can help reduce inflammation and pain."
    spotifyLink = "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u" // Peaceful Piano playlist
  } else if (energy === "low") {
    moodTitle = "You're Feeling Low Energy"
    moodEmoji = "😴"
    recommendation = "Listen to your body and rest if needed. Light exercise like walking can also help boost energy."
    foodRec = "Focus on iron-rich foods like spinach, lentils, and lean proteins to combat fatigue."
    spotifyLink = "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY" // Ambient Chill playlist
  } else if (emotion === "anxious") {
    moodTitle = "You're Feeling Anxious"
    moodEmoji = "😰"
    recommendation = "Practice deep breathing or meditation. Remember this feeling is temporary and connected to your cycle."
    foodRec = "Magnesium-rich foods like dark chocolate, nuts, and avocados can help reduce anxiety."
    spotifyLink = "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn" // Calming Acoustic playlist
  } else if (emotion === "irritated") {
    moodTitle = "You're Feeling Irritated"
    moodEmoji = "😠"
    recommendation = "Take some time for yourself. Self-care activities like reading or taking a walk can help reset your mood."
    foodRec = "Complex carbs like whole grains can boost serotonin levels and improve mood."
    spotifyLink = "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634" // Chill Tracks playlist
  } else {
    moodTitle = "Your Mood is Mixed"
    moodEmoji = "😐"
    recommendation = "Self-care is important. Listen to your body and give yourself what you need today."
    foodRec = "Focus on balanced meals with protein, complex carbs, and healthy fats to stabilize your mood."
    spotifyLink = "https://open.spotify.com/playlist/37i9dQZF1DX6VdMW310YC7" // Mood Booster playlist
  }
  
  // Update the mood result
  document.getElementById("mood-emoji").textContent = moodEmoji
  document.getElementById("mood-title").textContent = moodTitle
  document.getElementById("mood-recommendation").textContent = recommendation
  document.getElementById("food-recommendation").textContent = foodRec
  document.getElementById("spotify-link").href = spotifyLink
  
  // Show the result
  moodResultDiv.classList.remove("hidden")
  
  // Save mood data if signed in
  if (currentUser) {
    saveMoodData(energy, comfort, emotion, moodTitle)
  }
}

// Challenge Functions
function refreshChallenges() {
  const challengesContainer = document.getElementById("challenges-list")
  
  if (!challengesContainer) return
  
  // Clear previous challenges
  challengesContainer.innerHTML = ""
  
  // Select 3 random challenges
  activeChallenges = []
  const allChallenges = [...availableChallenges]
  
  for (let i = 0; i < 3; i++) {
    if (allChallenges.length === 0) break
    
    const randomIndex = Math.floor(Math.random() * allChallenges.length)
    const challenge = allChallenges.splice(randomIndex, 1)[0]
    activeChallenges.push(challenge)
    
    const challengeEl = document.createElement("div")
    challengeEl.className = "bg-white p-4 rounded-lg shadow-sm hover:shadow transition-all duration-300"
    challengeEl.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <span class="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">${challenge.category}</span>
          <h3 class="font-medium mt-1">${challenge.title}</h3>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500 mb-1">${challenge.points} points</p>
          <button onclick="completeChallenge(${challenge.id})" class="btn btn-primary text-xs">Complete</button>
        </div>
      </div>
    `
    
    challengesContainer.appendChild(challengeEl)
  }
}

function completeChallenge(challengeId) {
  const challenge = activeChallenges.find(c => c.id === challengeId)
  
  if (!challenge) return
  
  // Add points
  userPoints += challenge.points
  document.getElementById("user-points").textContent = userPoints
  
  // Show success message
  alert(`Congratulations! You earned ${challenge.points} points by completing "${challenge.title}".`)
  
  // Remove the completed challenge
  activeChallenges = activeChallenges.filter(c => c.id !== challengeId)
  
  // Add a new challenge
  const remainingChallenges = availableChallenges.filter(c => 
    !activeChallenges.some(ac => ac.id === c.id)
  )
  
  if (remainingChallenges.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingChallenges.length)
    const newChallenge = remainingChallenges[randomIndex]
    activeChallenges.push(newChallenge)
  }
  
  // Save user data if signed in
  if (currentUser) {
    saveUserPoints(userPoints)
  }
  
  // Refresh challenges display
  refreshChallenges()
}

// Charts Functions
function initializeCharts() {
  const symptomChartCtx = document.getElementById('symptomChart')
  
  if (symptomChartCtx) {
    // Create symptom distribution chart
    symptomDistributionChart = new Chart(symptomChartCtx, {
      type: 'doughnut',
      data: {
        labels: ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Mood Swings', 'Acne'],
        datasets: [{
          data: [25, 15, 20, 18, 12, 10],
          backgroundColor: [
            '#e9a8a6',
            '#c28cad',
            '#a7beea',
            '#a4c5c6',
            '#ffb6c1',
            '#b19cd9'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12
              },
              color: isDarkMode ? '#f9f1f9' : '#4a4a4a'
            }
          },
          title: {
            display: false
          }
        }
      }
    })
  }
}

function updateChartsTheme() {
  // Update chart colors based on theme
  if (symptomDistributionChart) {
    symptomDistributionChart.options.plugins.legend.labels.color = isDarkMode ? '#f9f1f9' : '#4a4a4a'
    symptomDistributionChart.update()
  }
  
  if (cycleAnalysisChart) {
    cycleAnalysisChart.options.plugins.legend.labels.color = isDarkMode ? '#f9f1f9' : '#4a4a4a'
    cycleAnalysisChart.update()
  }
  
  if (cycleLengthChart) {
    cycleLengthChart.options.scales.x.ticks.color = isDarkMode ? '#f9f1f9' : '#4a4a4a'
    cycleLengthChart.options.scales.y.ticks.color = isDarkMode ? '#f9f1f9' : '#4a4a4a'
    cycleLengthChart.update()
  }
}

// Form submission handlers
function handleFeedbackSubmit(e) {
  e.preventDefault()
  
  const name = document.getElementById("name").value
  const email = document.getElementById("email").value
  const rating = document.getElementById("rating").value
  const message = document.getElementById("message").value
  
  if (!name || !email || !rating || !message) {
    alert("Please fill in all fields")
    return
  }
  
  // Save feedback to Firestore if signed in
  if (currentUser) {
    const feedbackData = {
      name,
      email,
      rating: parseInt(rating),
      message,
      userId: currentUser.uid,
      createdAt: new Date()
    }
    
    const feedbackCollection = window.firebaseFunctions.collection(window.firebaseDb, "feedback")
    window.firebaseFunctions.addDocument(feedbackCollection, feedbackData)
      .then(() => {
        alert("Thank you for your feedback!")
        e.target.reset()
      })
      .catch((error) => {
        console.error("Error saving feedback:", error)
        alert("There was an error saving your feedback. Please try again.")
      })
  } else {
    // Not signed in - just show success message
    alert("Thank you for your feedback!")
    e.target.reset()
  }
}

function handleHealthFormSubmit(e) {
  e.preventDefault()
  
  const age = document.getElementById("age").value
  const regularity = document.getElementById("regularity").value
  const symptoms = document.getElementById("symptoms").value
  const symptomDuration = document.getElementById("symptomDuration").value
  const painLevel = document.getElementById("painLevel").value
  
  if (!age || !regularity || !symptoms) {
    alert("Please fill in all required fields")
    return
  }
  
  // Collect selected symptoms
  const selectedSymptoms = []
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
    selectedSymptoms.push(checkbox.value)
  })
  
  // Update the analysis data
  analysisData.painLevel = parseInt(painLevel)
  analysisData.symptoms = {}
  
  // Count occurrences of each symptom
  selectedSymptoms.forEach(symptom => {
    if (!analysisData.symptoms[symptom]) {
      analysisData.symptoms[symptom] = 1
    } else {
      analysisData.symptoms[symptom]++
    }
  })
  
  // Update symptom chart if it exists
  updateSymptomChart()
  
  // Generate personalized recommendations
  let recommendations = "Based on your data: "
  
  if (painLevel > 7) {
    recommendations += "Your pain level is quite high. Consider consulting with a healthcare provider. "
  }
  
  if (selectedSymptoms.includes("cramps") && selectedSymptoms.includes("headache")) {
    recommendations += "For cramps and headaches, try magnesium-rich foods, gentle yoga, and staying hydrated. "
  }
  
  if (regularity === "irregular") {
    recommendations += "Tracking your cycle regularly can help identify patterns in irregular periods. "
  }
  
  // Update recommendations display
  document.getElementById("personalized-recommendations").textContent = recommendations
  
  // Save health data if signed in
  if (currentUser) {
    saveHealthData({
      age: parseInt(age),
      regularity,
      primarySymptom: symptoms,
      symptomDuration: parseInt(symptomDuration),
      painLevel: parseInt(painLevel),
      selectedSymptoms
    })
  }
  
  alert("Your health data has been analyzed!")
}

function updateSymptomChart() {
  if (symptomDistributionChart) {
    // Convert symptoms object to arrays for the chart
    const labels = []
    const data = []
    
    // If we have user-reported symptoms, use those
    if (Object.keys(analysisData.symptoms).length > 0) {
      for (const [symptom, count] of Object.entries(analysisData.symptoms)) {
        labels.push(symptom.charAt(0).toUpperCase() + symptom.slice(1))
        data.push(count)
      }
    } else {
      // Otherwise use default data
      labels.push('Cramps', 'Headache', 'Bloating', 'Fatigue', 'Mood Swings', 'Acne')
      data.push(25, 15, 20, 18, 12, 10)
    }
    
    // Update chart data
    symptomDistributionChart.data.labels = labels
    symptomDistributionChart.data.datasets[0].data = data
    symptomDistributionChart.update()
  }
}

// Data persistence functions
function loadUserData() {
  if (!currentUser) return
  
  const userDocRef = window.firebaseFunctions.doc(window.firebaseDb, "users", currentUser.uid)
  window.firebaseFunctions.getDocument(userDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data()
        
        // Load user points
        if (userData.points) {
          userPoints = userData.points
          document.getElementById("user-points").textContent = userPoints
        }
        
        // Load cycle data
        if (userData.cycleData) {
          const { lastPeriod, cycleLength } = userData.cycleData
          
          if (lastPeriod && cycleLength) {
            // Fill in the form with saved data
            const lastPeriodInput = document.getElementById("lastPeriod")
            const cycleDurationInput = document.getElementById("cycleDuration")
            
            if (lastPeriodInput && cycleDurationInput) {
              lastPeriodInput.value = new Date(lastPeriod.toDate()).toISOString().slice(0, 10)
              cycleDurationInput.value = cycleLength
              
              // Calculate the next period
              calculateNextPeriod()
            }
          }
        }
        
        // Load health data for analysis
        if (userData.healthData) {
          analysisData = { ...analysisData, ...userData.healthData }
          updateSymptomChart()
        }
      }
    })
    .catch((error) => {
      console.error("Error loading user data:", error)
    })
}

function saveUserCycleData(lastPeriodDate, cycleLength) {
  if (!currentUser) return
  
  const userDocRef = window.firebaseFunctions.doc(window.firebaseDb, "users", currentUser.uid)
  window.firebaseFunctions.setDocument(userDocRef, {
    cycleData: {
      lastPeriod: lastPeriodDate,
      cycleLength: cycleLength
    }
  }, { merge: true })
    .catch((error) => {
      console.error("Error saving cycle data:", error)
    })
}

function saveMoodData(energy, comfort, emotion, moodTitle) {
  if (!currentUser) return
  
  const moodData = {
    date: new Date(),
    energy,
    comfort,
    emotion,
    moodTitle
  }
  
  const moodCollection = window.firebaseFunctions.collection(window.firebaseDb, "users", currentUser.uid, "moods")
  window.firebaseFunctions.addDocument(moodCollection, moodData)
    .catch((error) => {
      console.error("Error saving mood data:", error)
    })
}

function saveUserPoints(points) {
  if (!currentUser) return
  
  const userDocRef = window.firebaseFunctions.doc(window.firebaseDb, "users", currentUser.uid)
  window.firebaseFunctions.setDocument(userDocRef, {
    points: points
  }, { merge: true })
    .catch((error) => {
      console.error("Error saving points:", error)
    })
}

function saveHealthData(healthData) {
  if (!currentUser) return
  
  const userDocRef = window.firebaseFunctions.doc(window.firebaseDb, "users", currentUser.uid)
  window.firebaseFunctions.setDocument(userDocRef, {
    healthData: healthData
  }, { merge: true })
    .catch((error) => {
      console.error("Error saving health data:", error)
    })
}

// Initialize the app
document.addEventListener("DOMContentLoaded", init)

// Check for saved theme preference
if (localStorage.getItem("luna-theme") === "dark") {
  isDarkMode = true
  document.body.classList.add("dark")
}
