const passwordInput = document.getElementById('passwordInput');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const scoreValue = document.getElementById('scoreValue');
const glowDot = document.getElementById('glowDot');
const toggleBtn = document.getElementById('toggleVisibility');
const suggestionBox = document.getElementById('suggestionBox');
const suggestionList = document.getElementById('suggestionList');
const suggestionIntro = document.getElementById('suggestionIntro');
const ctaBtn = document.getElementById('ctaBtn');

const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'letmein', 'monkey', 'password1', 'iloveyou', 'admin',
  '111111', 'welcome', 'football', 'dragon'
];

const CHECK_LABELS = {
  length: 'At least 8 characters',
  upper: 'Contains uppercase letter',
  lower: 'Contains lowercase letter',
  number: 'Contains number',
  special: 'Contains special character',
  common: 'Not a commonly used password'
};

toggleBtn.addEventListener('click', () => {
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
});

passwordInput.addEventListener('input', () => {
  analyzePassword(passwordInput.value);
});

ctaBtn.addEventListener('click', () => {
  const suggestions = generateSuggestions(passwordInput.value || 'Pass');
  const pick = suggestions[0];
  passwordInput.type = 'text';
  passwordInput.value = pick;
  analyzePassword(pick);
  passwordInput.focus();
});

function analyzePassword(password) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    common: !COMMON_PASSWORDS.includes(password.toLowerCase())
  };

  Object.keys(checks).forEach(key => {
    const li = document.getElementById(`check-${key}`);
    const passed = checks[key];
    li.classList.toggle('valid', passed);
    li.querySelector('.mark').textContent = passed ? '✓' : '✗';
  });

  const score = calculateScore(password, checks);
  updateStrengthBar(score, password);

  if (score < 70 && password.length > 0) {
    showSuggestions(password);
  } else {
    suggestionBox.classList.add('hidden');
    suggestionIntro.textContent = password.length === 0
      ? 'Stronger alternatives will appear here once you start typing.'
      : 'Nice — this password looks strong. No suggestions needed.';
  }
}

function calculateScore(password, checks) {
  if (!password) return 0;

  let score = 0;
  score += Math.min(password.length * 4, 40);

  if (checks.upper) score += 10;
  if (checks.lower) score += 10;
  if (checks.number) score += 10;
  if (checks.special) score += 10;

  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 20);

  if (!checks.common) score = Math.min(score, 20);
  if (/(.)\1{2,}/.test(password)) score -= 15;
  if (hasSequential(password)) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function hasSequential(password) {
  const sequences = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const lower = password.toLowerCase();
  for (let i = 0; i < lower.length - 2; i++) {
    const chunk = lower.slice(i, i + 3);
    if (sequences.includes(chunk)) return true;
  }
  return false;
}

function updateStrengthBar(score, password) {
  strengthBar.style.width = `${score}%`;
  scoreValue.textContent = `${score}/100`;

  let label, color;
  if (!password) {
    label = 'Enter a password to begin';
    color = '#334155';
    strengthBar.style.width = '0%';
    scoreValue.textContent = '0/100';
  } else if (score < 30) {
    label = 'Very Weak'; color = '#ef4444';
  } else if (score < 50) {
    label = 'Weak'; color = '#f97316';
  } else if (score < 70) {
    label = 'Moderate'; color = '#eab308';
  } else if (score < 90) {
    label = 'Strong'; color = '#84cc16';
  } else {
    label = 'Very Strong'; color = '#34e58a';
  }

  strengthBar.style.background = color;
  strengthBar.style.boxShadow = password ? `0 0 14px ${color}` : 'none';
  strengthLabel.textContent = label;
  glowDot.style.boxShadow = password ? `0 0 22px ${color}` : '0 0 22px rgba(52, 229, 138, 0.65)';
  glowDot.style.background = password
    ? `radial-gradient(circle at 35% 30%, #ffffff, ${color} 60%, ${color})`
    : 'radial-gradient(circle at 35% 30%, #bdffde, #34e58a 60%, #1c6b46)';
}

function showSuggestions(password) {
  suggestionBox.classList.remove('hidden');
  suggestionIntro.textContent = 'Here are a few stronger alternatives:';
  suggestionList.innerHTML = '';

  const suggestions = generateSuggestions(password);
  suggestions.forEach(sugg => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = sugg;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(sugg);
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 1200);
    });
    li.appendChild(span);
    li.appendChild(btn);
    suggestionList.appendChild(li);
  });
}

function generateSuggestions(base) {
  const specials = ['!', '@', '#', '$', '%', '&', '*'];
  const cleanedBase = base.replace(/[^A-Za-z0-9]/g, '') || 'Pass';
  const capitalized = cleanedBase.charAt(0).toUpperCase() + cleanedBase.slice(1);

  const results = [];
  for (let i = 0; i < 3; i++) {
    const randomNum = Math.floor(Math.random() * 900 + 100);
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    results.push(`${capitalized}${randomSpecial}${randomNum}`);
  }
  return results;
}