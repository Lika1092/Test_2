let currentQuestionIndex = 0
let score = 0
let questions = []
let answered = {}

// ================== СОХРАНЕНИЕ / ЗАГРУЗКА ==================

function saveProgress() {
	localStorage.setItem('answered', JSON.stringify(answered))
	localStorage.setItem('score', score)
}

function loadProgress() {
	answered = JSON.parse(localStorage.getItem('answered') || '{}')
	score = Number(localStorage.getItem('score') || 0)
	updateResult()
}

// Кнопка сброса
function resetProgress() {
	if (!confirm('Вы уверены, что хотите сбросить все ответы?')) return

	localStorage.removeItem('answered')
	localStorage.removeItem('score')
	answered = {}
	score = 0
	showQuestion(0)
	renderNav()
	updateResult()
}

// ================== ОТОБРАЖЕНИЕ ВОПРОСА ==================

function showQuestion(index) {
	currentQuestionIndex = index
	const root = document.getElementById('questions')
	root.innerHTML = ''
	const q = questions[index]

	const div = document.createElement('div')
	div.className = 'question active'
	div.id = q.id

	div.innerHTML = `<h3>${q.question}</h3>`

	// Подсказка
	if (q.hint) {
		div.innerHTML += `<button class="hint-btn" onclick="toggleHint('${q.id}')">?</button>
		<div class="hint-text" id="hint-${q.id}">${q.hint}</div>`
	}

	// TEXT
	if (q.type === 'text') {
		div.innerHTML += `
			<input id="input-${q.id}" placeholder="Введите ответ" class="text-input">
			<button class="check-btn" onclick="checkText('${q.id}', '${q.answer}')">Проверить</button>
		`
	}

	// RADIO
	if (q.type === 'radio') {
		q.options.forEach((opt, i) => {
			div.innerHTML += `<label class="option">
				<input type="radio" name="${q.id}" value="${i + 1}"> ${opt}
			</label>`
		})
		div.innerHTML += `<button class="check-btn" onclick='checkRadio("${q.id}", ${q.correct[0]})'>Проверить</button>`
	}

	// CHECKBOX
	if (q.type === 'checkbox') {
		q.options.forEach((opt, i) => {
			div.innerHTML += `<label class="option">
				<input type="checkbox" value="${i + 1}"> ${opt}
			</label>`
		})
		div.innerHTML += `<button class="check-btn" onclick='checkCheckbox("${
			q.id
		}", ${JSON.stringify(q.correct)})'>Проверить</button>`
	}

	// MATCH
	if (q.type === 'match') {
		const cleanOptions = q.options.map(o => o.trim()).filter(o => o !== '')
		const leftItems = cleanOptions.filter(o => /^[А-ЯA-Z]/.test(o))
		const rightItems = cleanOptions.filter(o => /^[0-9]/.test(o))

		const listContainer = document.createElement('div')
		listContainer.style.display = 'flex'
		listContainer.style.justifyContent = 'space-between'
		listContainer.style.gap = '20px'
		listContainer.style.marginBottom = '15px'

		const left = document.createElement('div')
		const right = document.createElement('div')

		leftItems.forEach(item => {
			const p = document.createElement('p')
			p.textContent = `${item[0]} ${item.slice(1).trim()}`
			left.appendChild(p)
		})

		rightItems.forEach(item => {
			const p = document.createElement('p')
			p.textContent = `${item[0]} ${item.slice(1).trim()}`
			right.appendChild(p)
		})

		listContainer.appendChild(left)
		listContainer.appendChild(right)
		div.appendChild(listContainer)

		const table = document.createElement('table')
		table.className = 'match-table'

		leftItems.forEach((item, i) => {
			const row = document.createElement('tr')
			row.innerHTML = `
				<td style="padding-right:10px">${item[0]}</td>
				<td>
					<input type="text" id="input-${q.id}-${i}" maxlength="1" placeholder="№">
				</td>
			`
			table.appendChild(row)
		})

		div.appendChild(table)

		div.innerHTML += `<button class="check-btn" onclick="checkMatch('${q.id}')">Проверить</button>`
	}

	root.appendChild(div)
	restoreState(q)
	highlightNavButton(index)
}

// ================== ПОДСКАЗКА ==================
function toggleHint(id) {
	const h = document.getElementById('hint-' + id)
	h.style.display = h.style.display === 'block' ? 'none' : 'block'
}

// ================== НАВИГАЦИЯ ==================
function renderNav() {
	const nav = document.getElementById('question-nav')
	nav.innerHTML = ''

	questions.forEach((q, i) => {
		const btn = document.createElement('button')
		btn.textContent = i + 1
		btn.className = 'nav-btn'
		btn.onclick = () => showQuestion(i)
		btn.id = 'btn-' + q.id

		if (answered[q.id] === 'correct') btn.classList.add('answered')

		nav.appendChild(btn)
	})
}


function highlightNavButton(index) {
	questions.forEach((q, i) => {
		const btn = document.getElementById('btn-' + q.id)
		btn.classList.remove('active')
		if (i === index) btn.classList.add('active')
	})
}

// ================== ПРОВЕРКИ ==================

function checkText(qid, correct) {
	if (answered[qid]) return

	const input = document.getElementById('input-' + qid)
	const val = input.value.trim().toLowerCase()

	if (val === correct.toLowerCase()) {
		input.style.backgroundColor = '#2ecc71'
		score++
		answered[qid] = 'correct'
	} else {
		input.style.backgroundColor = '#e74c3c'
		answered[qid] = 'wrong'
	}

	saveProgress()
	markAnswered(qid)
	updateResult()
	setTimeout(nextQuestion, 800)
}


function checkRadio(qid, correct) {
	if (answered[qid]) return

	const radios = document.querySelectorAll(`input[name="${qid}"]`)
	let isCorrect = false

	radios.forEach(r => {
		r.disabled = true
		const value = Number(r.value)

		if (value === correct) {
			r.parentElement.style.backgroundColor = '#2ecc71'
			if (r.checked) isCorrect = true
		} else if (r.checked) {
			r.parentElement.style.backgroundColor = '#e74c3c'
		}
	})

	if (isCorrect) {
		score++
		answered[qid] = 'correct'
	} else {
		answered[qid] = 'wrong'
	}

	saveProgress()
	markAnswered(qid)
	updateResult()
	setTimeout(nextQuestion, 800)
}


// ✔ CHECKBOX — ТОЛЬКО ЕСЛИ ВЫБРАНЫ ВСЕ И ТОЛЬКО ПРАВИЛЬНЫЕ
function checkCheckbox(qid, correct) {
	if (answered[qid]) return

	const container = document.getElementById(qid)
	const checks = container.querySelectorAll('input[type="checkbox"]')

	let user = []

	checks.forEach(c => {
		c.disabled = true
		const value = Number(c.value)
		if (c.checked) user.push(value)
	})

	const isCorrectAnswer =
		user.length === correct.length && user.every(v => correct.includes(v))

	checks.forEach(c => {
		const value = Number(c.value)
		if (correct.includes(value)) {
			c.parentElement.style.backgroundColor = '#2ecc71'
		} else if (c.checked) {
			c.parentElement.style.backgroundColor = '#e74c3c'
		}
	})

	if (isCorrectAnswer) {
		score++
		answered[qid] = 'correct'
	} else {
		answered[qid] = 'wrong'
	}

	saveProgress()
	markAnswered(qid)
	updateResult()
	setTimeout(nextQuestion, 800)
}

function checkMatch(qid) {
	if (answered[qid]) return

	const q = questions.find(x => x.id === qid)
	const correct = q.answer.split('')

	let allCorrect = true

	correct.forEach((val, i) => {
		const input = document.getElementById(`input-${qid}-${i}`)
		input.disabled = true

		if (input.value.trim() === val) {
			input.style.backgroundColor = '#2ecc71'
		} else {
			input.style.backgroundColor = '#e74c3c'
			allCorrect = false
		}
	})

	if (allCorrect) {
		score++
		answered[qid] = 'correct'
	} else {
		answered[qid] = 'wrong'
	}

	saveProgress()
	markAnswered(qid)
	updateResult()
	setTimeout(nextQuestion, 800)
}


// ================== ВОССТАНОВЛЕНИЕ СОСТОЯНИЯ ==================

function restoreState(q) {
	if (!answered[q.id]) return
	const inputs = document.querySelectorAll(`#${q.id} input`)
	inputs.forEach(i => (i.disabled = true))
	markAnswered(q.id)
}

// ================== ВСПОМОГАТЕЛЬНЫЕ ==================

function markAnswered(qid) {
	const btn = document.getElementById('btn-' + qid)
	if (!btn) return

	btn.classList.remove('answered')

	if (answered[qid] === 'correct') {
		btn.classList.add('answered')
	}
}


function nextQuestion() {
	const next = currentQuestionIndex + 1
	if (next < questions.length) {
		showQuestion(next)
	}
}

function updateResult() {
	document.getElementById(
		'result'
	).textContent = `Правильных: ${score} из ${questions.length}`
}

// ================== ЗАГРУЗКА JSON ==================

fetch('data/questions.json')
	.then(res => res.json())
	.then(data => {
		questions = data
		loadProgress()
		renderNav()
		showQuestion(0)
	})
